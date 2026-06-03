import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { all, get, run, save } from '../config/database.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const user = get(
    `SELECT u.*, e.EmpFirstName, e.EmpLastName, e.EmpEmail 
     FROM Users u JOIN Employee e ON u.EmpID = e.EmpID WHERE u.UserName = ?`,
    [username]
  );
  if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

  if (!bcrypt.compareSync(password, user.Password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.userId = user.UserID;
  req.session.userName = user.UserName;
  req.session.empName = `${user.EmpFirstName} ${user.EmpLastName}`;

  return res.json({
    message: 'Login successful',
    user: {
      id: user.UserID,
      username: user.UserName,
      name: `${user.EmpFirstName} ${user.EmpLastName}`,
      email: user.EmpEmail
    }
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logout successful' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = get(
    `SELECT u.UserID, u.UserName, e.EmpFirstName, e.EmpLastName, e.EmpEmail 
     FROM Users u JOIN Employee e ON u.EmpID = e.EmpID WHERE u.UserID = ?`,
    [req.session.userId]
  );
  return res.json({ user: { ...user, name: `${user.EmpFirstName} ${user.EmpLastName}` } });
});

router.get('/security-question/:username', (req, res) => {
  const user = get('SELECT UserName FROM Users WHERE UserName = ?', [req.params.username]);
  if (!user) return res.status(404).json({ error: 'Username not found.' });

  const sec = get('SELECT secID, question FROM Security WHERE UserName = ?', [req.params.username]);
  if (!sec) return res.status(404).json({ error: 'No security question set for this user.' });

  return res.json({ secId: sec.secID, question: sec.question });
});

router.post('/verify-answer', (req, res) => {
  const { secId, answer } = req.body;
  const sec = get('SELECT * FROM Security WHERE secID = ?', [secId]);
  if (!sec) return res.status(404).json({ error: 'Security question not found.' });

  if (!bcrypt.compareSync(answer, sec.answer)) {
    return res.status(401).json({ error: 'Incorrect answer.' });
  }

  const user = get('SELECT UserID, UserName FROM Users WHERE UserName = ?', [sec.UserName]);
  return res.json({ message: 'Answer verified', userId: user.UserID, username: user.UserName });
});

router.post('/reset-password', (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  run('UPDATE Users SET Password = ? WHERE UserID = ?', [hash, userId]);
  save();
  return res.json({ message: 'Password reset successful.' });
});

export default router;
