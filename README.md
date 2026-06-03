# DAB HRMS — Human Resource Management System

A full-stack HR management application for **DAB Enterprise LTD** built with Node.js, Express, React, and MySQL.

---

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 18, Vite, React Router 6, Axios       |
| Backend   | Node.js, Express.js, express-session        |
| Database  | MySQL (mysql2 driver)                       |
| Auth      | bcryptjs (password hashing), session-based  |
| Icons     | lucide-react                                |
| PDF       | jsPDF + jspdf-autotable                     |
| Styling   | Bootstrap 5, Custom CSS (Inter font)        |

---

## Features

- **Employee Management** — Full CRUD with search, status filter, and department filter
- **Department Management** — CRUD with inline employee count
- **Position Management** — CRUD with required qualifications
- **User Accounts** — System user management with security Q&A
- **Session Authentication** — Login/logout with persistent sessions
- **Password Recovery** — 3-step flow: username → security question → reset password
- **Change Password** — Authenticated users can update their password
- **Dashboard** — Stats cards, employee status breakdown, recent employees
- **Reports** — Filterable status reports grouped by department with PDF export
- **Landing Page** — Company hero with feature showcase

---

## Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐
│  Department  │       │   Position   │
├──────────────┤       ├──────────────┤
│  DepartID(PK)│       │  PosID(PK)   │
│  DepartName  │       │  PosName     │
└──────┬───────┘       │  Required    │
       │               │  Qualificatio│
       │ 1             └──────┬───────┘
       │                      │ 1
       │ ┌────────────────────┴──────┐
       ├─│        Employee           │
       │ │  EmpID(PK)               │
       │ │  EmpFirstName             │
       │ │  EmpLastName              │
       │ │  EmpGender                │
       │ │  EmpDateOfBirth           │
       │ │  EmpEmail                 │
       │ │  EmpTelephone             │
       │ │  EmpAddress               │
       │ │  EmpHireDate              │
       │ │  EmpStatus                │
       │ │  DepartID(FK)→Department  │
       │ │  PosID(FK)→Position       │
       │ └───────────┬───────────────┘
       │             │ 1
       │             │
       │    ┌────────┴────────┐
       │    │     Users       │
       │    ├─────────────────┤
       │    │  UserID(PK)     │
       │    │  EmpID(FK)→Emp  │ (unique)
       │    │  UserName       │ (unique)
       │    │  Password       │ (bcrypt hash)
       │    └────────┬────────┘
       │             │ 1
       │             │
       │    ┌────────┴────────┐
       │    │    Security     │
       │    ├─────────────────┤
       │    │  secID(PK)      │
       │    │  UserID(FK)→Usr │
       │    │  UserName       │
       │    │  question       │
       │    │  answer         │ (bcrypt hash)
       │    └─────────────────┘
```

### Key Relationships

| Relationship | Type        | Constraint                   |
|-------------|-------------|------------------------------|
| Department → Employee | One-to-Many | FK: Employee.DepartID → Department.DepartID |
| Position → Employee | One-to-One   | FK: Employee.PosID → Position.PosID |
| Employee → Users | One-to-One   | FK: Users.EmpID → Employee.EmpID (UNIQUE) |
| Users → Security | One-to-Many  | FK: Security.UserID → Users.UserID |

### Employee Statuses

`Active`, `On leave`, `Left`, `Blacklisted`, `Deceased`, `On mission`

---

## Data Flow Diagram — Level 0 (DFD L0)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DAB HRMS SYSTEM                              │
│                                                                     │
│  ┌──────────┐   ┌───────────────────┐   ┌──────────────────────┐   │
│  │          │   │                   │   │                      │   │
│  │  Guest   │──▶│   Landing Page    │   │   Login / Session    │   │
│  │ (Visitor)│   │   /               │   │   /login, /auth/*    │   │
│  │          │   │                   │   │                      │   │
│  └──────────┘   └───────────────────┘   └──────────┬───────────┘   │
│                                                     │               │
│  ┌──────────┐                                      ▼               │
│  │          │   ┌───────────────────┐   ┌──────────────────────┐   │
│  │  Admin   │──▶│  Dashboard /      │   │  Auth Middleware     │   │
│  │ (Auth'd) │   │  dashboard        │   │  (session check)    │   │
│  │          │   └───────────────────┘   └──────────────────────┘   │
│  └──────────┘                                                     │
│        │                                                          │
│        ├────▶ Employees (CRUD) ◀─────── /api/employees/*          │
│        ├────▶ Departments (CRUD) ◀───── /api/departments/*        │
│        ├────▶ Positions (CRUD) ◀─────── /api/positions/*          │
│        ├────▶ Users (CRUD) ◀─────────── /api/users/*              │
│        ├────▶ Reports & Analytics ◀──── /api/reports/*            │
│        └────▶ PDF Export ◀───────────── jsPDF (client-side)       │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     External Entities                          │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  • Administrator — Full system access (all CRUD, reports)     │ │
│  │  • Database (MySQL) — Persistent storage for all entities      │ │
│  │  • Browser — PDF download via jsPDF (client-side generation)   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Major Data Flows

| Flow # | From → To              | Data                         | Description                   |
|--------|------------------------|------------------------------|-------------------------------|
| 1      | Guest → Login          | username, password           | Authentication request        |
| 2      | Login → Session        | session cookie (connect.sid) | Successful login response     |
| 3      | Admin → Employees      | CRUD operations              | Employee data management      |
| 4      | Admin → Reports        | status filter params         | Generate filtered reports     |
| 5      | Reports → Browser     | employee data (JSON)         | Report data for display/PDF   |
| 6      | Admin → Forgot Password | username → Q&A → new password  | Password recovery flow      |
| 7      | All flows              | Query/response               | Database read/write via mysql2|
| 8      | Reports → PDF         | jsPDF document                | Client-side PDF file download |

---

## Setup & Installation

### Prerequisites

- **Node.js** >= 18
- **MySQL** (or MariaDB via XAMPP) running on `localhost:3306`
- **npm**

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env` if needed:

```env
PORT=3300
SESSION_SECRET=HRMS_Secret_Key_2026
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=HRMS
```

### 3. Initialize Database

```bash
cd backend
npm run init-db    # Creates HRMS database, tables, and seed data
npm run seed       # (Optional) Adds more employees, resets passwords
```

### 4. Start the Application

```bash
# Terminal 1 — Backend (http://localhost:3300)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Default Credentials

| Role     | Username | Password   | Security Q                 | Answer   |
|----------|----------|------------|----------------------------|----------|
| Admin    | admin    | Admin@123  | What is your favorite color? | blue     |
| Employee | (varies) | Admin@123  | (varies per seed)          | answer123|

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/api/auth/login`     | No   | Login, creates session   |
| POST   | `/api/auth/logout`    | No   | Destroy session          |
| GET    | `/api/auth/me`        | No   | Get current user info    |
| POST   | `/api/auth/change-password` | Yes | Update password     |
| POST   | `/api/auth/security-question` | No | Get security Q     |
| POST   | `/api/auth/verify-answer` | No   | Verify security answer   |
| POST   | `/api/auth/reset-password` | No  | Reset forgotten password |

### Employees (`/api/employees`)

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | `/api/employees`            | Yes  | List (search, status, department filters) |
| GET    | `/api/employees/stats`      | Yes  | Dashboard statistics     |
| GET    | `/api/employees/:id`        | Yes  | Get single employee      |
| POST   | `/api/employees`            | Yes  | Create employee          |
| PUT    | `/api/employees/:id`        | Yes  | Update employee          |
| DELETE | `/api/employees/:id`        | Yes  | Delete employee          |

### Departments (`/api/departments`)

| Method | Endpoint                | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| GET    | `/api/departments`      | Yes  | List all                 |
| POST   | `/api/departments`      | Yes  | Create                   |
| PUT    | `/api/departments/:id`  | Yes  | Update                   |
| DELETE | `/api/departments/:id`  | Yes  | Delete                   |

### Positions (`/api/positions`)

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/api/positions`      | Yes  | List all                 |
| POST   | `/api/positions`      | Yes  | Create                   |
| PUT    | `/api/positions/:id`  | Yes  | Update                   |
| DELETE | `/api/positions/:id`  | Yes  | Delete                   |

### Users (`/api/users`)

| Method | Endpoint          | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | `/api/users`      | Yes  | List all users           |
| POST   | `/api/users`      | Yes  | Create user              |
| PUT    | `/api/users/:id`  | Yes  | Update user              |
| DELETE | `/api/users/:id`  | Yes  | Delete user              |

### Reports (`/api/reports`)

| Method | Endpoint                                    | Auth | Description              |
|--------|---------------------------------------------|------|--------------------------|
| GET    | `/api/reports/employees-on-leave?status=`   | Yes  | Employees grouped by department, filterable by comma-separated statuses |
| GET    | `/api/reports/employee-count-by-status`     | Yes  | Count per status         |
| GET    | `/api/reports/employee-count-by-department` | Yes  | Count per department     |

---

## Database Scripts

| Script         | Command              | Description                        |
|----------------|----------------------|------------------------------------|
| Database init  | `npm run init-db`    | Creates DB, tables, base seed data |
| Extended seed  | `npm run seed`       | Adds more data, resets passwords   |

---

## Project Structure

```
HRMS/
├── backend/
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── db/
│   │   ├── init.js            # Schema + base seed
│   │   └── seed.js            # Extended seed data
│   ├── middleware/
│   │   └── auth.js            # Session auth middleware
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── employees.js       # Employee CRUD
│   │   ├── departments.js     # Department CRUD
│   │   ├── positions.js       # Position CRUD
│   │   ├── users.js           # User management
│   │   └── reports.js         # Reports & analytics
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # Axios instance
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── EmployeeForm.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── Positions.jsx
│   │   │   ├── Users.jsx
│   │   │   └── Report.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## License

&copy; 2026 DAB Enterprise LTD — All rights reserved.
