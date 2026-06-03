import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

    const [users] = await pool.execute(
      `SELECT u.*, e.EmpFirstName, e.EmpLastName, e.EmpEmail 
       FROM Users u JOIN Employee e ON u.EmpID = e.EmpID WHERE u.UserName = ?`, [username]
    );
    if (users.length === 0) return res.status(401).json({ error: 'Invalid username or password.' });

    if (!bcrypt.compareSync(password, users[0].Password)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    req.session.userId = users[0].UserID;
    req.session.userName = users[0].UserName;
    req.session.empName = `${users[0].EmpFirstName} ${users[0].EmpLastName}`;

    return res.json({
      message: 'Login successful',
      user: { id: users[0].UserID, username: users[0].UserName, name: `${users[0].EmpFirstName} ${users[0].EmpLastName}`, email: users[0].EmpEmail }
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logout successful' });
  });
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    const [users] = await pool.execute(
      `SELECT u.UserID, u.UserName, e.EmpFirstName, e.EmpLastName, e.EmpEmail 
       FROM Users u JOIN Employee e ON u.EmpID = e.EmpID WHERE u.UserID = ?`, [req.session.userId]
    );
    return res.json({ user: { ...users[0], name: `${users[0].EmpFirstName} ${users[0].EmpLastName}` } });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/security-question/:username', async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT UserID FROM Users WHERE UserName = ?', [req.params.username]);
    if (users.length === 0) return res.status(404).json({ error: 'Username not found.' });

    const [secs] = await pool.execute('SELECT secID, question FROM Security WHERE UserID = ?', [users[0].UserID]);
    if (secs.length === 0) return res.status(404).json({ error: 'No security question set for this user.' });

    return res.json({ secId: secs[0].secID, question: secs[0].question });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/verify-answer', async (req, res) => {
  try {
    const { secId, answer } = req.body;
    const [secs] = await pool.execute('SELECT * FROM Security WHERE secID = ?', [secId]);
    if (secs.length === 0) return res.status(404).json({ error: 'Security question not found.' });

    if (!bcrypt.compareSync(answer, secs[0].answer)) {
      return res.status(401).json({ error: 'Incorrect answer.' });
    }

    const [users] = await pool.execute('SELECT UserID, UserName FROM Users WHERE UserID = ?', [secs[0].UserID]);
    return res.json({ message: 'Answer verified', userId: users[0].UserID, username: users[0].UserName });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    await pool.execute('UPDATE Users SET Password = ? WHERE UserID = ?', [hash, userId]);
    return res.json({ message: 'Password reset successful.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

export default router;
