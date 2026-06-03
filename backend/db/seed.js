import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'HRMS'
  });

  const hash = bcrypt.hashSync('Admin@123', 10);

  await conn.execute('UPDATE Users SET Password = ?', [hash]);
  console.log('All user passwords updated to Admin@123');

  const extraDepts = ['IT Support', 'Marketing', 'Procurement', 'Research & Development', 'Quality Assurance'];
  for (const name of extraDepts) {
    const [rows] = await conn.execute('SELECT DepartID FROM Department WHERE DepartName = ?', [name]);
    if (rows.length === 0) {
      await conn.execute('INSERT INTO Department (DepartName) VALUES (?)', [name]);
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
    const [rows] = await conn.execute('SELECT PosID FROM \`Position\` WHERE PosName = ?', [name]);
    if (rows.length === 0) {
      await conn.execute('INSERT INTO \`Position\` (PosName, RequiredQualification) VALUES (?, ?)', [name, qual]);
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
    const [rows] = await conn.execute('SELECT EmpID FROM Employee WHERE EmpEmail = ?', [e[4]]);
    if (rows.length === 0) {
      await conn.execute(`INSERT INTO Employee 
        (EmpFirstName, EmpLastName, EmpGender, EmpDateOfBirth, EmpEmail, EmpTelephone, EmpAddress, EmpHireDate, EmpStatus, DepartID, PosID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, e);
      console.log(`  Employee added: ${e[0]} ${e[1]}`);
    }
  }

  const [newEmps] = await conn.execute(`
    SELECT e.EmpID, e.EmpFirstName, e.EmpEmail FROM Employee e 
    WHERE e.EmpID NOT IN (SELECT EmpID FROM Users)
  `);

  if (newEmps.length > 0) {
    const questions = [
      'What is your favorite color?',
      'What city were you born in?',
      'What is your pet name?',
      'What is your mother maiden name?',
      'What was your first car?'
    ];
    const ansHash = bcrypt.hashSync('answer123', 10);

    for (const row of newEmps) {
      const username = row.EmpEmail.split('@')[0];
      const [userResult] = await conn.execute('INSERT INTO Users (EmpID, UserName, Password) VALUES (?, ?, ?)', [row.EmpID, username, hash]);
      const userId = userResult.insertId;
      console.log(`  User created: ${username} / Admin@123`);

      const q = questions[Math.floor(Math.random() * questions.length)];
      await conn.execute('INSERT INTO Security (UserID, UserName, question, answer) VALUES (?, ?, ?, ?)', [userId, username, q, ansHash]);
      console.log(`  Security Q added for ${username}: ${q}`);
    }
  }

  await conn.end();
  console.log('\nSeed completed successfully!');
  console.log('All user passwords: Admin@123');
}

seed().catch(console.error);
