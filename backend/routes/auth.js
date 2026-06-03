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

    const match = await bcrypt.compare(password, users[0].Password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error.' });
      req.session.userId = users[0].UserID;
      req.session.userName = users[0].UserName;
      req.session.empName = `${users[0].EmpFirstName} ${users[0].EmpLastName}`;
      return res.json({
        message: 'Login successful',
        user: { id: users[0].UserID, username: users[0].UserName, name: `${users[0].EmpFirstName} ${users[0].EmpLastName}`, email: users[0].EmpEmail }
      });
    });
  } catch (err) { return res.status(500).json({ error: 'Login failed.' }); }
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
    if (users.length === 0) {
      req.session.destroy();
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    return res.json({ user: { ...users[0], name: `${users[0].EmpFirstName} ${users[0].EmpLastName}` } });
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch user.' }); }
});

router.post('/security-question', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required.' });
    const [users] = await pool.execute('SELECT UserID FROM Users WHERE UserName = ?', [username]);
    if (users.length === 0) return res.status(404).json({ error: 'Username not found.' });

    const [secs] = await pool.execute('SELECT secID, question FROM Security WHERE UserID = ?', [users[0].UserID]);
    if (secs.length === 0) return res.status(404).json({ error: 'No security question set for this user.' });

    return res.json({ secId: secs[0].secID, question: secs[0].question });
  } catch (err) { return res.status(500).json({ error: 'Failed to retrieve security question.' }); }
});

router.post('/verify-answer', async (req, res) => {
  try {
    const { username, answer } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required.' });
    if (!answer) return res.status(400).json({ error: 'Answer is required.' });

    const [users] = await pool.execute('SELECT UserID FROM Users WHERE UserName = ?', [username]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const [secs] = await pool.execute('SELECT * FROM Security WHERE UserID = ?', [users[0].UserID]);
    if (secs.length === 0) return res.status(404).json({ error: 'Security question not found.' });

    const match = await bcrypt.compare(answer, secs[0].answer);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect answer.' });
    }

    return res.json({ message: 'Answer verified', userId: users[0].UserID, username: users[0].UserName });
  } catch (err) { return res.status(500).json({ error: 'Verification failed.' }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { username, answer, newPassword } = req.body;
    if (!username || !answer || !newPassword) {
      return res.status(400).json({ error: 'Username, answer, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const [users] = await pool.execute('SELECT UserID FROM Users WHERE UserName = ?', [username]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const [secs] = await pool.execute('SELECT * FROM Security WHERE UserID = ?', [users[0].UserID]);
    if (secs.length === 0) return res.status(404).json({ error: 'Security question not found.' });

    const match = await bcrypt.compare(answer, secs[0].answer);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect answer.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE Users SET Password = ? WHERE UserID = ?', [hash, users[0].UserID]);
    return res.json({ message: 'Password reset successful.' });
  } catch (err) { return res.status(500).json({ error: 'Password reset failed.' }); }
});

router.post('/change-password', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const [users] = await pool.execute('SELECT Password FROM Users WHERE UserID = ?', [req.session.userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, users[0].Password);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE Users SET Password = ? WHERE UserID = ?', [hash, req.session.userId]);
    return res.json({ message: 'Password changed successfully.' });
  } catch (err) { return res.status(500).json({ error: 'Failed to change password.' }); }
});

export default router;
