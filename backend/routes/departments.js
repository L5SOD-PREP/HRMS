import { Router } from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.*, (SELECT COUNT(*) FROM Employee e WHERE e.DepartID = d.DepartID) as EmpCount 
       FROM Department d ORDER BY d.DepartName`
    );
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { DepartName } = req.body;
    if (!DepartName) return res.status(400).json({ error: 'Department name is required.' });
    const [result] = await pool.execute('INSERT INTO Department (DepartName) VALUES (?)', [DepartName]);
    return res.status(201).json({ DepartID: result.insertId, message: 'Department created.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Department name already exists.' });
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { DepartName } = req.body;
    if (!DepartName) return res.status(400).json({ error: 'Department name is required.' });
    if (DepartName.length > 100) return res.status(400).json({ error: 'Department name is too long.' });
    const [existing] = await pool.execute('SELECT DepartID FROM Department WHERE DepartID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Department not found.' });
    await pool.execute('UPDATE Department SET DepartName = ? WHERE DepartID = ?', [DepartName, req.params.id]);
    return res.json({ message: 'Department updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Department name already exists.' });
    return res.status(500).json({ error: 'Failed to update department.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT DepartID FROM Department WHERE DepartID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Department not found.' });
    await pool.execute('DELETE FROM Department WHERE DepartID = ?', [req.params.id]);
    return res.json({ message: 'Department deleted.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to delete department.' }); }
});

export default router;
