const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Database setup
const db = new sqlite3.Database('students.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Simple students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    StudentId INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(20),
    Department VARCHAR(100),
    ProfilePicture VARCHAR(255)
  )`);

  // Simple teachers table
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    TeacherId INTEGER PRIMARY KEY AUTOINCREMENT,
    EmployeeId VARCHAR(20) UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(20),
    Department VARCHAR(100),
    Position VARCHAR(50),
    ProfilePicture VARCHAR(255)
  )`);

  // Simple departments table
  db.run(`CREATE TABLE IF NOT EXISTS departments (
    DepartmentId INTEGER PRIMARY KEY AUTOINCREMENT,
    DepartmentName VARCHAR(100) UNIQUE NOT NULL
  )`);

  // Simple login credentials
  db.run(`CREATE TABLE IF NOT EXISTS login_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
  )`);

  // Insert sample data
  insertSampleData();
}

function insertSampleData() {
  // Insert admin user
  db.run(`INSERT OR IGNORE INTO login_users (username, password, role) VALUES (?, ?, ?)`,
    ['admin', 'admin123', 'admin']);

  // Insert sample departments
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'];
  departments.forEach(dept => {
    db.run(`INSERT OR IGNORE INTO departments (DepartmentName) VALUES (?)`, [dept]);
  });

  // Insert sample students
  const students = [
    ['John', 'Doe', 'john.doe@student.edu', '555-0101', 'Computer Science'],
    ['Jane', 'Smith', 'jane.smith@student.edu', '555-0102', 'Mathematics'],
    ['Bob', 'Johnson', 'bob.johnson@student.edu', '555-0103', 'Physics']
  ];

  students.forEach(student => {
    db.run(`INSERT OR IGNORE INTO students (FirstName, LastName, Email, Phone, Department) VALUES (?, ?, ?, ?, ?)`,
      student);
  });

  console.log('Sample data inserted successfully');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Students Database Backend is running' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM login_users WHERE username = ? AND password = ?',
    [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      res.json({
        success: true,
        user: {
          id: row.id,
          username: row.username,
          role: row.role
        },
        token: 'simple-token-' + Date.now()
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get all students
app.get('/api/students/enhanced', (req, res) => {
  db.all('SELECT * FROM students ORDER BY StudentId DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add new student
app.post('/api/students/enhanced', upload.single('profilePicture'), (req, res) => {
  const { FirstName, LastName, Email, Phone, Department } = req.body;
  const ProfilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`INSERT INTO students (FirstName, LastName, Email, Phone, Department, ProfilePicture) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    [FirstName, LastName, Email, Phone, Department, ProfilePicture],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        studentId: this.lastID,
        message: 'Student added successfully' 
      });
    });
});

// Get all teachers
app.get('/api/teachers', (req, res) => {
  db.all('SELECT * FROM teachers ORDER BY TeacherId DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add new teacher
app.post('/api/teachers', upload.single('profilePicture'), (req, res) => {
  const { EmployeeId, FirstName, LastName, Email, Phone, Department, Position } = req.body;
  const ProfilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`INSERT INTO teachers (EmployeeId, FirstName, LastName, Email, Phone, Department, Position, ProfilePicture) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [EmployeeId, FirstName, LastName, Email, Phone, Department, Position, ProfilePicture],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        teacherId: this.lastID,
        message: 'Teacher added successfully' 
      });
    });
});

// Get all departments
app.get('/api/departments', (req, res) => {
  db.all('SELECT * FROM departments ORDER BY DepartmentName', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
