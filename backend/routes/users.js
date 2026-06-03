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
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch users.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { EmpID, UserName, Password, securityQuestion, securityAnswer } = req.body;
    if (!EmpID || !UserName || !Password) {
      return res.status(400).json({ error: 'Employee, Username and Password are required.' });
    }
    if (Password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const empIdNum = Number(EmpID);
    if (!Number.isInteger(empIdNum) || empIdNum <= 0) {
      return res.status(400).json({ error: 'Invalid employee ID.' });
    }
    const [empCheck] = await pool.execute('SELECT EmpID FROM Employee WHERE EmpID = ?', [empIdNum]);
    if (empCheck.length === 0) {
      return res.status(400).json({ error: 'Employee does not exist.' });
    }
    const [existing] = await pool.execute('SELECT UserID FROM Users WHERE UserName = ? OR EmpID = ?', [UserName, empIdNum]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username or employee already has an account.' });

    const hash = await bcrypt.hash(Password, 10);
    const [userResult] = await pool.execute('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)', [empIdNum, UserName, hash]);

    if (securityQuestion && securityAnswer) {
      const ansHash = await bcrypt.hash(securityAnswer, 10);
      await pool.execute('INSERT INTO Security (UserID, UserName, question, answer) VALUES (?, ?, ?, ?)', [userResult.insertId, UserName, securityQuestion, ansHash]);
    }
    return res.status(201).json({ message: 'User created.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to create user.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { EmpID, UserName, Password, securityQuestion, securityAnswer } = req.body;
    const [existing] = await pool.execute('SELECT UserID FROM Users WHERE UserID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found.' });

    const empIdNum = Number(EmpID);
    if (!Number.isInteger(empIdNum) || empIdNum <= 0) {
      return res.status(400).json({ error: 'Invalid employee ID.' });
    }
    const [empCheck] = await pool.execute('SELECT EmpID FROM Employee WHERE EmpID = ?', [empIdNum]);
    if (empCheck.length === 0) {
      return res.status(400).json({ error: 'Employee does not exist.' });
    }

    if (Password) {
      if (Password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      const hash = await bcrypt.hash(Password, 10);
      await pool.execute('UPDATE Users SET EmpID=?, UserName=?, Password=? WHERE UserID=?', [empIdNum, UserName, hash, req.params.id]);
    } else {
      await pool.execute('UPDATE Users SET EmpID=?, UserName=? WHERE UserID=?', [empIdNum, UserName, req.params.id]);
    }

    if (securityQuestion && securityAnswer) {
      const [secCheck] = await pool.execute('SELECT secID FROM Security WHERE UserID = ?', [req.params.id]);
      const ansHash = await bcrypt.hash(securityAnswer, 10);
      if (secCheck.length > 0) {
        await pool.execute('UPDATE Security SET question=?, answer=? WHERE UserID=?', [securityQuestion, ansHash, req.params.id]);
      } else {
        await pool.execute('INSERT INTO Security (UserID, UserName, question, answer) VALUES (?, ?, ?, ?)', [req.params.id, UserName, securityQuestion, ansHash]);
      }
    }

    return res.json({ message: 'User updated.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to update user.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT UserID FROM Users WHERE UserID = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found.' });
    await pool.execute('DELETE FROM Users WHERE UserID = ?', [req.params.id]);
    return res.json({ message: 'User deleted.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to delete user.' }); }
});

export default router;
