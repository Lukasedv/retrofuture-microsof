import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const db_sqlite3 = sqlite3.verbose();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new db_sqlite3.Database(dbPath);

// Create tables and seed data
db.serialize(() => {
  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Employees table for search functionality
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    salary INTEGER,
    social_security TEXT,
    phone TEXT,
    address TEXT,
    hire_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sensitive data table
  db.run(`CREATE TABLE IF NOT EXISTS user_system_data (
    userid INTEGER PRIMARY KEY,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL,
    cookie TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert seed data for users
  const users = [
    ['admin', 'admin123', 'admin@msug.fi', 'admin'],
    ['jsmith', 'password123', 'john.smith@msug.fi', 'user'],
    ['mwilson', 'welcome2023', 'mary.wilson@msug.fi', 'user'],
    ['bjenkins', 'qwerty456', 'bob.jenkins@msug.fi', 'manager']
  ];

  const userStmt = db.prepare("INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
  users.forEach(user => userStmt.run(user));
  userStmt.finalize();

  // Insert seed data for employees
  const employees = [
    ['John', 'Smith', 'john.smith@msug.fi', 'Security', 75000, '123-45-6789', '+358-40-1234567', 'Helsinki, Finland', '2022-01-15'],
    ['Mary', 'Wilson', 'mary.wilson@msug.fi', 'IT', 68000, '987-65-4321', '+358-40-7654321', 'Tampere, Finland', '2021-08-20'],
    ['Bob', 'Jenkins', 'bob.jenkins@msug.fi', 'Management', 95000, '456-78-9123', '+358-40-9876543', 'Turku, Finland', '2020-03-10'],
    ['Sarah', 'Davis', 'sarah.davis@msug.fi', 'Security', 72000, '789-12-3456', '+358-40-2468135', 'Oulu, Finland', '2023-02-01'],
    ['Michael', 'Brown', 'michael.brown@msug.fi', 'IT', 65000, '321-54-9876', '+358-40-1357924', 'Vantaa, Finland', '2022-11-30']
  ];

  const empStmt = db.prepare("INSERT OR IGNORE INTO employees (first_name, last_name, email, department, salary, social_security, phone, address, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  employees.forEach(emp => empStmt.run(emp));
  empStmt.finalize();

  // Insert system user data
  const systemUsers = [
    [1, 'admin', 'secret_admin_pwd_2023', 'admin_session_xyz789'],
    [2, 'jsmith', 'my_secret_password', 'user_session_abc123'],
    [3, 'mwilson', 'confidential_pwd', 'user_session_def456'],
    [4, 'bjenkins', 'manager_access_key', 'mgr_session_ghi789']
  ];

  const sysStmt = db.prepare("INSERT OR IGNORE INTO user_system_data (userid, user_name, password, cookie) VALUES (?, ?, ?, ?)");
  systemUsers.forEach(user => sysStmt.run(user));
  sysStmt.finalize();
});

// VULNERABLE API ENDPOINTS - Intentionally vulnerable for security testing

// Vulnerable employee search endpoint - Basic SQL Injection
app.get('/api/employees/search', (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' });
  }

  // VULNERABLE: Direct string concatenation without sanitization
  const query = `SELECT * FROM employees WHERE first_name LIKE '%${name}%' OR last_name LIKE '%${name}%'`;
  
  console.log('Executing query:', query); // For debugging
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({
      success: true,
      employees: rows,
      query: query // Exposing query for educational purposes
    });
  });
});

// Vulnerable login endpoint - Authentication Bypass via SQL Injection
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // VULNERABLE: Direct string concatenation allowing SQL injection
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Login query:', query); // For debugging
  
  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (row) {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: row.id,
          username: row.username,
          email: row.email,
          role: row.role
        },
        query: query // Exposing query for educational purposes
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        query: query // Exposing query for educational purposes
      });
    }
  });
});

// Advanced vulnerable endpoint - Union-based SQL injection
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  
  // VULNERABLE: Direct parameter injection
  const query = `SELECT id, first_name, last_name, email, department FROM employees WHERE id = ${id}`;
  
  console.log('Employee detail query:', query);
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({
      success: true,
      employee: rows,
      query: query
    });
  });
});

// Get all employees (for reference)
app.get('/api/employees', (req, res) => {
  db.all("SELECT id, first_name, last_name, email, department FROM employees", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ employees: rows });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Vulnerable API server running on port ${PORT}`);
  console.log(`⚠️  WARNING: This server contains intentional SQL injection vulnerabilities for security testing purposes only!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});