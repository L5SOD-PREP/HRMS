import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { all, get, run, save } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const users = all(
    `SELECT u.UserID, u.UserName, u.EmpID, e.EmpFirstName, e.EmpLastName, e.EmpEmail 
     FROM Users u JOIN Employee e ON u.EmpID = e.EmpID ORDER BY u.UserName`
  );
  return res.json(users);
});

router.post('/', (req, res) => {
  const { EmpID, UserName, Password, securityQuestion, securityAnswer } = req.body;
  if (!EmpID || !UserName || !Password) {
    return res.status(400).json({ error: 'Employee, Username and Password are required.' });
  }
  const existing = get('SELECT UserID FROM Users WHERE UserName = ?', [UserName]);
  if (existing) return res.status(400).json({ error: 'Username already taken.' });

  const hash = bcrypt.hashSync(Password, 10);
  run('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)', [Number(EmpID), UserName, hash]);
  save();

  if (securityQuestion && securityAnswer) {
    const ansHash = bcrypt.hashSync(securityAnswer, 10);
    run('INSERT INTO Security (UserName, question, answer) VALUES (?, ?, ?)', [UserName, securityQuestion, ansHash]);
    save();
  }

  return res.status(201).json({ message: 'User created.' });
});

router.put('/:id', (req, res) => {
  const { EmpID, UserName, Password } = req.body;
  if (Password) {
    const hash = bcrypt.hashSync(Password, 10);
    run('UPDATE Users SET EmpID=?, UserName=?, Password=? WHERE UserID=?', [Number(EmpID), UserName, hash, req.params.id]);
  } else {
    run('UPDATE Users SET EmpID=?, UserName=? WHERE UserID=?', [Number(EmpID), UserName, req.params.id]);
  }
  save();
  return res.json({ message: 'User updated.' });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM Users WHERE UserID = ?', [req.params.id]);
  save();
  return res.json({ message: 'User deleted.' });
});

export default router;
