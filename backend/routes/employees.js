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
      conditions.push(`e.DeptID = ?`);
      params.push(departID);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY e.EmpID DESC';
    const [rows] = await pool.execute(sql, params);
    return res.json(rows);
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
    const { EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID } = req.body;
    if (!EmpFirstName || !EmpLastName) return res.status(400).json({ error: 'First and last name are required.' });

    const validStatuses = ['On leave', 'Left', 'Blacklisted', 'Deceased', 'On mission'];
    const status = validStatuses.includes(EmpStatus) ? EmpStatus : 'On mission';

    const [result] = await pool.execute(
      `INSERT INTO Employee (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [EmpFirstName, EmpLastName, EmpGender || null, EmpDateOfBirth || null, EmpEmail || null, EmpTelephone || null, EmpAddress || null, EmpHireDate || null, status, DepartID || null, PosID || null]
    );
    return res.status(201).json({ EmpID: result.insertId, message: 'Employee created.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID } = req.body;
    const validStatuses = ['On leave', 'Left', 'Blacklisted', 'Deceased', 'On mission'];
    const status = validStatuses.includes(EmpStatus) ? EmpStatus : 'On mission';

    await pool.execute(
      `UPDATE Employee SET EmpFirstName=?, EmpLastName=?, EmpGender=?, EmpDateOfBirth=?, EmpEmail=?, EmpTelephone=?, EmpAddress=?, EmpHireDate=?, EmpStatus=?, DepartID=?, PosID=? WHERE EmpID=?`,
      [EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, status, DepartID, PosID, req.params.id]
    );
    return res.json({ message: 'Employee updated.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM Employee WHERE EmpID = ?', [req.params.id]);
    return res.json({ message: 'Employee deleted.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

export default router;
