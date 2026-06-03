import { Router } from 'express';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, (SELECT COUNT(*) FROM Employee e WHERE e.PosID = p.PosID) as EmpCount 
       FROM \`Position\` p ORDER BY p.PosName`
    );
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { PosName, RequiredQualification } = req.body;
    if (!PosName) return res.status(400).json({ error: 'Position name is required.' });
    const [result] = await pool.execute('INSERT INTO \`Position\` (PosName, RequiredQualification) VALUES (?, ?)', [PosName, RequiredQualification || null]);
    return res.status(201).json({ PosID: result.insertId, message: 'Position created.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { PosName, RequiredQualification } = req.body;
    if (!PosName) return res.status(400).json({ error: 'Position name is required.' });
    await pool.execute('UPDATE \`Position\` SET PosName = ?, RequiredQualification = ? WHERE PosID = ?', [PosName, RequiredQualification || null, req.params.id]);
    return res.json({ message: 'Position updated.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM \`Position\` WHERE PosID = ?', [req.params.id]);
    return res.json({ message: 'Position deleted.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

export default router;
