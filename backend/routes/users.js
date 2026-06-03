import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.UserID, u.UserName, u.EmpID, e.EmpFirstName, e.EmpLastName, e.EmpEmail 
       FROM Users u JOIN Employee e ON u.EmpID = e.EmpID ORDER BY u.UserName`
    );
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { EmpID, UserName, Password, securityQuestion, securityAnswer } = req.body;
    if (!EmpID || !UserName || !Password) {
      return res.status(400).json({ error: 'Employee, Username and Password are required.' });
    }
    const [existing] = await pool.execute('SELECT UserID FROM Users WHERE UserName = ?', [UserName]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username already taken.' });

    const hash = bcrypt.hashSync(Password, 10);
    const [userResult] = await pool.execute('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)', [Number(EmpID), UserName, hash]);

    if (securityQuestion && securityAnswer) {
      const ansHash = bcrypt.hashSync(securityAnswer, 10);
      await pool.execute('INSERT INTO Security (UserID, UserName, question, answer) VALUES (?, ?, ?, ?)', [userResult.insertId, UserName, securityQuestion, ansHash]);
    }
    return res.status(201).json({ message: 'User created.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { EmpID, UserName, Password } = req.body;
    if (Password) {
      const hash = bcrypt.hashSync(Password, 10);
      await pool.execute('UPDATE Users SET EmpID=?, UserName=?, Password=? WHERE UserID=?', [Number(EmpID), UserName, hash, req.params.id]);
    } else {
      await pool.execute('UPDATE Users SET EmpID=?, UserName=? WHERE UserID=?', [Number(EmpID), UserName, req.params.id]);
    }
    return res.json({ message: 'User updated.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM Users WHERE UserID = ?', [req.params.id]);
    return res.json({ message: 'User deleted.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

export default router;
