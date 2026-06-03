import { Router } from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const validStatuses = ['Active', 'On leave', 'Left', 'Blacklisted', 'Deceased', 'On mission'];

router.get('/employees-on-leave', async (req, res) => {
  try {
    const { status } = req.query;
    const statuses = status ? status.split(',').filter(s => validStatuses.includes(s)) : ['On leave'];
    if (statuses.length === 0) return res.status(400).json({ error: 'No valid statuses provided.' });
    const placeholders = statuses.map(() => '?').join(',');
    const [rows] = await pool.execute(
      `SELECT e.*, d.DepartName, p.PosName
       FROM Employee e
       LEFT JOIN Department d ON e.DepartID = d.DepartID
       LEFT JOIN \`Position\` p ON e.PosID = p.PosID
       WHERE e.EmpStatus IN (${placeholders})
       ORDER BY d.DepartName, e.EmpLastName`,
      statuses
    );
    const departments = {};
    for (const emp of rows) {
      const dept = emp.DepartName || 'Unassigned';
      if (!departments[dept]) departments[dept] = [];
      departments[dept].push(emp);
    }
    return res.json({ departments, total: rows.length, statuses });
  } catch (err) { return res.status(500).json({ error: 'Failed to generate report.' }); }
});

router.get('/employee-count-by-status', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT EmpStatus, COUNT(*) as count FROM Employee GROUP BY EmpStatus');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch counts.' }); }
});

router.get('/employee-count-by-department', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.DepartName, COUNT(e.EmpID) as count
       FROM Department d LEFT JOIN Employee e ON d.DepartID = e.DepartID
       GROUP BY d.DepartID ORDER BY d.DepartName`
    );
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch counts.' }); }
});

export default router;
