import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const dbName = process.env.DB_NAME || 'HRMS';
const adminPw = process.env.ADMIN_PASSWORD || 'Admin@123';
const adminSecAnswer = process.env.ADMIN_SECURITY_ANSWER || 'blue';

async function initDb() {
  const conn = await mysql.createConnection(config);

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Department (
      DepartID INT PRIMARY KEY AUTO_INCREMENT,
      DepartName VARCHAR(100) NOT NULL UNIQUE
    )
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`Position\` (
      PosID INT PRIMARY KEY AUTO_INCREMENT,
      PosName VARCHAR(100) NOT NULL,
      RequiredQualification VARCHAR(200)
    )
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Employee (
      EmpID INT PRIMARY KEY AUTO_INCREMENT,
      EmpFirstName VARCHAR(50) NOT NULL,
      EmpLastName VARCHAR(50) NOT NULL,
      EmpGender VARCHAR(10),
      EmpDateOfBirth DATE,
      EmpEmail VARCHAR(100),
      EmpTelephone VARCHAR(20),
      EmpAddress VARCHAR(200),
      EmpHireDate DATE,
      EmpStatus VARCHAR(20) DEFAULT 'On mission',
      DepartID INT,
      PosID INT,
      FOREIGN KEY (DepartID) REFERENCES Department(DepartID) ON DELETE SET NULL,
      FOREIGN KEY (PosID) REFERENCES \`Position\`(PosID) ON DELETE SET NULL
    )
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID INT PRIMARY KEY AUTO_INCREMENT,
      EmpID INT NOT NULL UNIQUE,
      UserName VARCHAR(50) NOT NULL UNIQUE,
      Password VARCHAR(200) NOT NULL,
      FOREIGN KEY (EmpID) REFERENCES Employee(EmpID) ON DELETE CASCADE
    )
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Security (
      secID INT PRIMARY KEY AUTO_INCREMENT,
      UserID INT NOT NULL,
      UserName VARCHAR(50) NOT NULL,
      question VARCHAR(200) NOT NULL,
      answer VARCHAR(200) NOT NULL,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `);

  const [rows] = await conn.execute('SELECT COUNT(*) as c FROM Department');
  if (rows[0].c === 0) {
    const depts = ['Administration', 'Human Resources', 'Finance', 'Sales', 'Logistics'];
    for (const d of depts) await conn.execute('INSERT INTO Department (DepartName) VALUES (?)', [d]);

    const positions = [
      ['Manager', 'Bachelor Degree'],
      ['Accountant', 'Bachelor Degree in Accounting'],
      ['Sales Representative', 'Diploma in Sales'],
      ['Driver', 'Driving License'],
      ['Clerk', 'High School Diploma']
    ];
    for (const [name, qual] of positions) await conn.execute('INSERT INTO \`Position\` (PosName, RequiredQualification) VALUES (?, ?)', [name, qual]);

    const employees = [
      ['Admin', 'User', 'Male', '1990-01-01', 'admin@hrms.com', '0788000000', 'Kigali', '2024-01-01', 'On mission', 1, 1],
      ['Jane', 'Doe', 'Female', '1992-05-15', 'jane@hrms.com', '0788111111', 'Kigali', '2024-02-01', 'On leave', 2, 2],
      ['John', 'Smith', 'Male', '1988-08-20', 'john@hrms.com', '0788222222', 'Kigali', '2024-03-01', 'On leave', 4, 3],
      ['Alice', 'Mutoni', 'Female', '1995-12-10', 'alice@hrms.com', '0788333333', 'Kigali', '2024-04-01', 'On mission', 3, 5]
    ];
    for (const e of employees) {
      await conn.execute(`INSERT INTO Employee
        (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, e);
    }

    const hash = await bcrypt.hash(adminPw, 10);
    await conn.execute('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)', [1, 'admin', hash]);

    const secHash = await bcrypt.hash(adminSecAnswer, 10);
    await conn.execute('INSERT INTO Security (UserID, UserName, question, answer) VALUES (?, ?, ?, ?)', [1, 'admin', 'What is your favorite color?', secHash]);

    console.log('Base data seeded.');
  }

  await conn.end();
  console.log('Database initialized successfully.');
}

initDb().catch(console.error);
