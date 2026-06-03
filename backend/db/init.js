import 'dotenv/config';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'hrms.db');

async function initDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS Department (
      DepartID INTEGER PRIMARY KEY AUTOINCREMENT,
      DepartName TEXT NOT NULL UNIQUE
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Position (
      PosID INTEGER PRIMARY KEY AUTOINCREMENT,
      PosName TEXT NOT NULL,
      RequiredQualification TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Employee (
      EmpID INTEGER PRIMARY KEY AUTOINCREMENT,
      EmpFirstName TEXT NOT NULL,
      EmpLastName TEXT NOT NULL,
      EmpGender TEXT,
      EmpDateOfBirth TEXT,
      EmpEmail TEXT,
      EmpTelephone TEXT,
      EmpAddress TEXT,
      EmpHireDate TEXT,
      EmpStatus TEXT DEFAULT 'On mission' CHECK(EmpStatus IN ('On leave','Left','Blacklisted','Deceased','On mission')),
      DepartID INTEGER,
      PosID INTEGER,
      FOREIGN KEY (DepartID) REFERENCES Department(DepartID) ON DELETE SET NULL,
      FOREIGN KEY (PosID) REFERENCES Position(PosID) ON DELETE SET NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      EmpID INTEGER NOT NULL UNIQUE,
      UserName TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      FOREIGN KEY (EmpID) REFERENCES Employee(EmpID) ON DELETE CASCADE
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS Security (
      secID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserName TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `);

  const count = db.exec('SELECT COUNT(*) as c FROM Department');
  const row = count[0]?.values[0]?.[0] || 0;

  if (row === 0) {
    const deptStmt = db.prepare('INSERT INTO Department (DepartName) VALUES (?)');
    deptStmt.bind(['Administration']); deptStmt.step(); deptStmt.free();
    const d2 = db.prepare('INSERT INTO Department (DepartName) VALUES (?)');
    d2.bind(['Human Resources']); d2.step(); d2.free();
    const d3 = db.prepare('INSERT INTO Department (DepartName) VALUES (?)');
    d3.bind(['Finance']); d3.step(); d3.free();
    const d4 = db.prepare('INSERT INTO Department (DepartName) VALUES (?)');
    d4.bind(['Sales']); d4.step(); d4.free();
    const d5 = db.prepare('INSERT INTO Department (DepartName) VALUES (?)');
    d5.bind(['Logistics']); d5.step(); d5.free();

    const p1 = db.prepare('INSERT INTO Position (PosName, RequiredQualification) VALUES (?, ?)');
    p1.bind(['Manager', 'Bachelor Degree']); p1.step(); p1.free();
    const p2 = db.prepare('INSERT INTO Position (PosName, RequiredQualification) VALUES (?, ?)');
    p2.bind(['Accountant', 'Bachelor Degree in Accounting']); p2.step(); p2.free();
    const p3 = db.prepare('INSERT INTO Position (PosName, RequiredQualification) VALUES (?, ?)');
    p3.bind(['Sales Representative', 'Diploma in Sales']); p3.step(); p3.free();
    const p4 = db.prepare('INSERT INTO Position (PosName, RequiredQualification) VALUES (?, ?)');
    p4.bind(['Driver', 'Driving License']); p4.step(); p4.free();
    const p5 = db.prepare('INSERT INTO Position (PosName, RequiredQualification) VALUES (?, ?)');
    p5.bind(['Clerk', 'High School Diploma']); p5.step(); p5.free();

    const eStmt = db.prepare(`INSERT INTO Employee 
      (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    eStmt.bind(['Admin', 'User', 'Male', '1990-01-01', 'admin@hrms.com', '0788000000', 'Kigali', '2024-01-01', 'On mission', 1, 1]);
    eStmt.step(); eStmt.free();
    const e2 = db.prepare(`INSERT INTO Employee VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    e2.bind([null, 'Jane', 'Doe', 'Female', '1992-05-15', 'jane@hrms.com', '0788111111', 'Kigali', '2024-02-01', 'On leave', 2, 2]);
    e2.step(); e2.free();
    const e3 = db.prepare(`INSERT INTO Employee VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    e3.bind([null, 'John', 'Smith', 'Male', '1988-08-20', 'john@hrms.com', '0788222222', 'Kigali', '2024-03-01', 'On leave', 4, 3]);
    e3.step(); e3.free();
    const e4 = db.prepare(`INSERT INTO Employee VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    e4.bind([null, 'Alice', 'Mutoni', 'Female', '1995-12-10', 'alice@hrms.com', '0788333333', 'Kigali', '2024-04-01', 'On mission', 3, 5]);
    e4.step(); e4.free();

    const hash = bcrypt.hashSync('Admin@123', 10);
    const uStmt = db.prepare('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)');
    uStmt.bind([1, 'admin', hash]); uStmt.step(); uStmt.free();

    const secHash = bcrypt.hashSync('blue', 10);
    const sStmt = db.prepare('INSERT INTO Security (UserName, question, answer) VALUES (?, ?, ?)');
    sStmt.bind(['admin', 'What is your favorite color?', secHash]); sStmt.step(); sStmt.free();
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, buffer);
  db.close();
  console.log('Database initialized successfully at', dbPath);
}

initDb().catch(console.error);
