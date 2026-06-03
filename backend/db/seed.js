import 'dotenv/config';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'hrms.db');

async function seed() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);
  db.run('PRAGMA foreign_keys = ON');

  const hash = bcrypt.hashSync('Admin@123', 10);

  db.run('UPDATE Users SET Password = ?', [hash]);
  console.log('All user passwords updated to Admin@123');

  const extraDepts = ['IT Support', 'Marketing', 'Procurement', 'Research & Development', 'Quality Assurance'];
  for (const name of extraDepts) {
    const exists = db.exec(`SELECT DepartID FROM Department WHERE DepartName = '${name}'`);
    if (!exists[0]?.values?.length) {
      db.run('INSERT INTO Department (DepartName) VALUES (?)', [name]);
      console.log(`  Department added: ${name}`);
    }
  }

  const extraPositions = [
    ['Software Developer', 'Bachelor in Computer Science'],
    ['IT Technician', 'Diploma in IT'],
    ['Marketing Officer', 'Bachelor in Marketing'],
    ['Logistics Officer', 'Diploma in Logistics'],
    ['Quality Analyst', 'Bachelor in Quality Management'],
    ['Receptionist', 'High School Diploma'],
    ['Security Guard', 'High School Diploma'],
    ['Cleaner', 'Primary Certificate']
  ];
  for (const [name, qual] of extraPositions) {
    const exists = db.exec(`SELECT PosID FROM Position WHERE PosName = '${name}'`);
    if (!exists[0]?.values?.length) {
      db.run('INSERT INTO Position (PosName, RequiredQualification) VALUES (?, ?)', [name, qual]);
      console.log(`  Position added: ${name}`);
    }
  }

  const extraEmployees = [
    ['Peter', 'Kamali', 'Male', '1991-03-12', 'peter@hrms.com', '0788444111', 'Kigali', '2024-05-01', 'On mission', 6, 6],
    ['Grace', 'Uwimana', 'Female', '1993-07-22', 'grace@hrms.com', '0788444222', 'Kigali', '2024-06-01', 'On mission', 7, 8],
    ['David', 'Habimana', 'Male', '1987-11-05', 'david@hrms.com', '0788444333', 'Kigali', '2024-06-15', 'On leave', 8, 9],
    ['Sarah', 'Mutesi', 'Female', '1990-09-18', 'sarah@hrms.com', '0788444444', 'Kigali', '2024-07-01', 'On mission', 5, 4],
    ['James', 'Baguma', 'Male', '1985-02-28', 'james@hrms.com', '0788444555', 'Kigali', '2024-07-15', 'Left', 4, 3],
    ['Olivier', 'Niyonzima', 'Male', '1994-12-01', 'olivier@hrms.com', '0788444666', 'Kigali', '2024-08-01', 'On mission', 9, 10],
    ['Diane', 'Ishimwe', 'Female', '1992-04-14', 'diane@hrms.com', '0788444777', 'Kigali', '2024-08-15', 'On leave', 2, 2],
    ['Eric', 'Mugisha', 'Male', '1996-08-30', 'eric@hrms.com', '0788444888', 'Kigali', '2024-09-01', 'Blacklisted', 3, 5],
    ['Betty', 'Nyiramana', 'Female', '1989-06-25', 'betty@hrms.com', '0788444999', 'Kigali', '2024-09-15', 'Deceased', 1, 1],
    ['Patrick', 'Nziza', 'Male', '1995-10-10', 'patrick@hrms.com', '0788444000', 'Kigali', '2024-10-01', 'On mission', 10, 7]
  ];

  for (const e of extraEmployees) {
    const exists = db.exec(`SELECT EmpID FROM Employee WHERE EmpEmail = '${e[4]}'`);
    if (!exists[0]?.values?.length) {
      const empStmt = db.prepare(`INSERT INTO Employee 
        (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      empStmt.bind(e);
      empStmt.step();
      empStmt.free();
      console.log(`  Employee added: ${e[0]} ${e[1]}`);
    }
  }

  const newEmps = db.exec(`
    SELECT e.EmpID, e.EmpFirstName, e.EmpEmail FROM Employee e 
    WHERE e.EmpID NOT IN (SELECT EmpID FROM Users)
  `);

  if (newEmps[0]?.values) {
    const questions = [
      'What is your favorite color?',
      'What city were you born in?',
      'What is your pet name?',
      'What is your mother maiden name?',
      'What was your first car?'
    ];
    const ansHash = bcrypt.hashSync('answer123', 10);

    for (const row of newEmps[0].values) {
      const [empId, firstName, email] = row;
      const username = email.split('@')[0];
      const userStmt = db.prepare('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)');
      userStmt.bind([empId, username, hash]);
      userStmt.step();
      userStmt.free();
      console.log(`  User created: ${username} / Admin@123`);

      const q = questions[Math.floor(Math.random() * questions.length)];
      const secStmt = db.prepare('INSERT INTO Security (UserName, question, answer) VALUES (?, ?, ?)');
      secStmt.bind([username, q, ansHash]);
      secStmt.step();
      secStmt.free();
      console.log(`  Security Q added for ${username}: ${q}`);
    }
  }

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  db.close();
  console.log('\nSeed completed successfully!');
  console.log('All user passwords: Admin@123');
}

seed().catch(console.error);
