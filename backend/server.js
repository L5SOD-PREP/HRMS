import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pool from './config/database.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import positionRoutes from './routes/positions.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Verify DB connection on startup
pool.getConnection().then(conn => {
  console.log('Connected to MySQL database');
  conn.release();
  app.listen(PORT, () => {
    console.log(`HRMS Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
