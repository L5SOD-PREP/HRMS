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
const PORT = process.env.PORT || 3300;

app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

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
