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
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch positions.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { PosName, RequiredQualification } = req.body;
    if (!PosName) return res.status(400).json({ error: 'Position name is required.' });
    if (PosName.length > 100) return res.status(400).json({ error: 'Position name is too long.' });
    const [result] = await pool.execute('INSERT INTO \`Position\` (PosName, RequiredQualification) VALUES (?, ?)', [PosName, RequiredQualification || null]);
    return res.status(201).json({ PosID: result.insertId, message: 'Position created.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to create position.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { PosName, RequiredQualification } = req.body;
    if (!PosName) return res.status(400).json({ error: 'Position name is required.' });
    if (PosName.length > 100) return res.status(400).json({ error: 'Position name is too long.' });
    const [existing] = await pool.execute('SELECT PosID FROM \`Position\` WHERE PosID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Position not found.' });
    await pool.execute('UPDATE \`Position\` SET PosName = ?, RequiredQualification = ? WHERE PosID = ?', [PosName, RequiredQualification || null, req.params.id]);
    return res.json({ message: 'Position updated.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to update position.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT PosID FROM \`Position\` WHERE PosID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Position not found.' });
    await pool.execute('DELETE FROM \`Position\` WHERE PosID = ?', [req.params.id]);
    return res.json({ message: 'Position deleted.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to delete position.' }); }
});

export default router;
