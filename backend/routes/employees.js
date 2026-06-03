import { Router } from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { search, status, departID } = req.query;
    let sql = `SELECT e.*, d.DepartName, p.PosName 
      FROM Employee e 
      LEFT JOIN Department d ON e.DepartID = d.DepartID 
      LEFT JOIN \`Position\` p ON e.PosID = p.PosID`;
    const conditions = [];
    const params = [];
    if (search) {
      conditions.push(`(e.EmpFirstName LIKE ? OR e.EmpLastName LIKE ? OR e.EmpEmail LIKE ? OR e.EmpTelephone LIKE ?)`);
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status) {
      conditions.push(`e.EmpStatus = ?`);
      params.push(status);
    }
    if (departID) {
      conditions.push(`e.DepartID = ?`);
      params.push(departID);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY e.EmpID DESC';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    if (limit > 0) {
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM Employee e${conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''}`,
        params
      );
      const total = countRows[0].total;
      sql += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
      const [rows] = await pool.execute(sql, params);
      return res.json({ employees: rows, total, page, limit });
    }
    const [rows] = await pool.execute(sql, params);
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const [empCount] = await pool.execute('SELECT COUNT(*) as total FROM Employee');
    const [deptCount] = await pool.execute('SELECT COUNT(*) as total FROM Department');
    const [statusRows] = await pool.execute('SELECT EmpStatus, COUNT(*) as count FROM Employee GROUP BY EmpStatus');
    const statusCounts = {};
    for (const r of statusRows) statusCounts[r.EmpStatus] = r.count;
    return res.json({ totalEmployees: empCount[0].total, totalDepartments: deptCount[0].total, statusCounts });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.*, d.DepartName, p.PosName 
       FROM Employee e LEFT JOIN Department d ON e.DepartID = d.DepartID 
       LEFT JOIN \`Position\` p ON e.PosID = p.PosID WHERE e.EmpID = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DeptID, PosID } = req.body;
    if (!EmpFirstName || !EmpLastName) return res.status(400).json({ error: 'First and last name are required.' });
    if (/\d/.test(EmpFirstName) || /\d/.test(EmpLastName)) {
      return res.status(400).json({ error: 'Name cannot contain numbers.' });
    }
    if (EmpEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmpEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (EmpDateOfBirth) {
      const dob = new Date(EmpDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) return res.status(400).json({ error: 'Employee must be at least 18 years old.' });
    }
    if (EmpHireDate && new Date(EmpHireDate) > new Date()) {
      return res.status(400).json({ error: 'Hire date cannot be in the future.' });
    }

    const validStatuses = ['On leave', 'Left', 'Blacklisted', 'Deceased', 'On mission'];
    const status = validStatuses.includes(EmpStatus) ? EmpStatus : 'On mission';

    const [result] = await pool.execute(
      `INSERT INTO Employee (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [EmpFirstName, EmpLastName, EmpGender || null, EmpDateOfBirth || null, EmpEmail || null, EmpTelephone || null, EmpAddress || null, EmpHireDate || null, status, DeptID || null, PosID || null]
    );
    return res.status(201).json({ EmpID: result.insertId, message: 'Employee created.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to create employee.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT EmpID FROM Employee WHERE EmpID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Employee not found.' });

    const { EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DeptID, PosID } = req.body;
    if (/\d/.test(EmpFirstName) || /\d/.test(EmpLastName)) {
      return res.status(400).json({ error: 'Name cannot contain numbers.' });
    }
    if (EmpEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmpEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (EmpDateOfBirth) {
      const dob = new Date(EmpDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) return res.status(400).json({ error: 'Employee must be at least 18 years old.' });
    }
    if (EmpHireDate && new Date(EmpHireDate) > new Date()) {
      return res.status(400).json({ error: 'Hire date cannot be in the future.' });
    }
    const validStatuses = ['On leave', 'Left', 'Blacklisted', 'Deceased', 'On mission'];
    const status = validStatuses.includes(EmpStatus) ? EmpStatus : 'On mission';

    await pool.execute(
      `UPDATE Employee SET EmpFirstName=?, EmpLastName=?, EmpGender=?, EmpDateOfBirth=?, EmpEmail=?, EmpTelephone=?, EmpAddress=?, EmpHireDate=?, EmpStatus=?, DepartID=?, PosID=? WHERE EmpID=?`,
      [EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, status, DeptID || null, PosID || null, req.params.id]
    );
    return res.json({ message: 'Employee updated.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to update employee.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT EmpID FROM Employee WHERE EmpID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    await pool.execute('DELETE FROM Employee WHERE EmpID = ?', [req.params.id]);
    return res.json({ message: 'Employee deleted.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to delete employee.' }); }
});

export default router;
