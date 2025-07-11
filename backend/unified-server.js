const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

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

// Database setup - DELETE OLD DATABASE AND START FRESH
const dbPath = 'students.db';
if (fs.existsSync(dbPath)) {
  console.log('🗑️ Deleting old database...');
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
  } else {
    console.log('✅ Connected to fresh SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  console.log('🔧 Initializing database tables...');
  
  db.serialize(() => {
    // Enhanced students table (matches existing schema but works with both)
    db.run(`CREATE TABLE IF NOT EXISTS students (
      StudentId INTEGER PRIMARY KEY AUTOINCREMENT,
      StudentName VARCHAR(100),
      FirstName VARCHAR(50) NOT NULL,
      LastName VARCHAR(50) NOT NULL,
      Email VARCHAR(100) UNIQUE,
      Phone VARCHAR(20),
      DateOfBirth DATE,
      Address TEXT,
      EmergencyContact VARCHAR(100),
      EmergencyPhone VARCHAR(20),
      ProfilePicture TEXT,
      EnrollmentDate DATE DEFAULT CURRENT_DATE,
      Status VARCHAR(20) DEFAULT 'Active',
      DepartmentId INTEGER,
      AcademicYear VARCHAR(10),
      Semester VARCHAR(20),
      Department VARCHAR(100)
    )`, (err) => {
      if (err) console.log('❌ Students table error:', err.message);
      else console.log('✅ Students table ready');
    });

    // Teachers table
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
      TeacherId INTEGER PRIMARY KEY AUTOINCREMENT,
      EmployeeId VARCHAR(20) UNIQUE,
      FirstName VARCHAR(50) NOT NULL,
      LastName VARCHAR(50) NOT NULL,
      Email VARCHAR(100) UNIQUE,
      Phone VARCHAR(20),
      DateOfBirth DATE,
      HireDate DATE DEFAULT CURRENT_DATE,
      Qualification VARCHAR(100),
      Specialization VARCHAR(100),
      DepartmentId INTEGER,
      Position VARCHAR(50),
      Salary DECIMAL(10,2),
      Status VARCHAR(20) DEFAULT 'Active',
      ProfilePicture TEXT,
      Department VARCHAR(100)
    )`, (err) => {
      if (err) console.log('❌ Teachers table error:', err.message);
      else console.log('✅ Teachers table ready');
    });

    // Departments table
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      DepartmentId INTEGER PRIMARY KEY AUTOINCREMENT,
      DepartmentName VARCHAR(100) UNIQUE NOT NULL,
      DepartmentCode VARCHAR(10),
      Head VARCHAR(100),
      Description TEXT
    )`, (err) => {
      if (err) console.log('❌ Departments table error:', err.message);
      else console.log('✅ Departments table ready');
    });

    // Simple login for admin
    db.run(`CREATE TABLE IF NOT EXISTS login_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL
    )`, (err) => {
      if (err) console.log('❌ Login table error:', err.message);
      else console.log('✅ Login table ready');
    });

    // Student credentials
    db.run(`CREATE TABLE IF NOT EXISTS student_credentials (
      StudentId INTEGER PRIMARY KEY,
      Email VARCHAR(100) UNIQUE NOT NULL,
      PasswordHash VARCHAR(255) NOT NULL,
      LastLogin DATETIME,
      IsActive BOOLEAN DEFAULT 1
    )`, (err) => {
      if (err) console.log('❌ Student credentials table error:', err.message);
      else console.log('✅ Student credentials table ready');
    });

    // Insert sample data
    setTimeout(insertSampleData, 1000);
  });
}

function insertSampleData() {
  console.log('📝 Inserting sample data...');
  
  // Insert admin user
  db.run(`INSERT OR IGNORE INTO login_users (username, password, role) VALUES (?, ?, ?)`,
    ['admin', 'admin123', 'admin'], (err) => {
      if (err) console.log('❌ Admin user error:', err.message);
      else console.log('✅ Admin user created');
    });

  // Insert departments
  const departments = [
    ['Computer Science', 'CS'],
    ['Mathematics', 'MATH'],
    ['Physics', 'PHYS'],
    ['Chemistry', 'CHEM'],
    ['Information Technology', 'IT'],
    ['Arts', 'ARTS']
  ];

  departments.forEach(([name, code]) => {
    db.run(`INSERT OR IGNORE INTO departments (DepartmentName, DepartmentCode) VALUES (?, ?)`,
      [name, code], (err) => {
        if (err) console.log('❌ Department error:', err.message);
      });
  });

  // Insert sample students with BOTH StudentName and FirstName/LastName
  const students = [
    ['John Doe', 'John', 'Doe', 'john.doe@student.edu', '555-0101', 1],
    ['Jane Smith', 'Jane', 'Smith', 'jane.smith@student.edu', '555-0102', 2],
    ['Bob Johnson', 'Bob', 'Johnson', 'bob.johnson@student.edu', '555-0103', 3],
    ['Alice Brown', 'Alice', 'Brown', 'alice.brown@student.edu', '555-0104', 1],
    ['Charlie Wilson', 'Charlie', 'Wilson', 'charlie.wilson@student.edu', '555-0105', 2]
  ];

  students.forEach(([fullName, firstName, lastName, email, phone, deptId]) => {
    db.run(`INSERT OR IGNORE INTO students 
      (StudentName, FirstName, LastName, Email, Phone, DepartmentId, AcademicYear, Semester) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, firstName, lastName, email, phone, deptId, '2024-2025', 'Fall'], (err) => {
        if (err) console.log('❌ Student error:', err.message);
      });
  });

  console.log('✅ Sample data insertion completed');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Unified Students Database Backend is running' });
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
        token: 'unified-token-' + Date.now()
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get all students (enhanced endpoint)
app.get('/api/students/enhanced', (req, res) => {
  db.all(`SELECT s.*, d.DepartmentName 
          FROM students s 
          LEFT JOIN departments d ON s.DepartmentId = d.DepartmentId 
          ORDER BY s.StudentId DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add new student (enhanced)
app.post('/api/students/enhanced', upload.single('profilePicture'), (req, res) => {
  const { FirstName, LastName, Email, Phone, DepartmentId, AcademicYear, Semester, DateOfBirth, Address, EmergencyContact, EmergencyPhone } = req.body;
  const StudentName = `${FirstName} ${LastName}`;
  const ProfilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`INSERT INTO students 
    (StudentName, FirstName, LastName, Email, Phone, DepartmentId, AcademicYear, Semester, DateOfBirth, Address, EmergencyContact, EmergencyPhone, ProfilePicture) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [StudentName, FirstName, LastName, Email, Phone, DepartmentId, AcademicYear, Semester, DateOfBirth, Address, EmergencyContact, EmergencyPhone, ProfilePicture],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Create student credentials
      const defaultPassword = 'password123';
      db.run('INSERT OR IGNORE INTO student_credentials (StudentId, Email, PasswordHash) VALUES (?, ?, ?)',
        [this.lastID, Email, defaultPassword], (credErr) => {
          if (credErr) {
            console.warn('Warning: Could not create student credentials:', credErr.message);
          }
        });
      
      res.json({ 
        success: true, 
        studentId: this.lastID,
        message: 'Student added successfully',
        credentials: { email: Email, password: defaultPassword }
      });
    });
});

// Get all teachers
app.get('/api/teachers', (req, res) => {
  db.all(`SELECT t.*, d.DepartmentName 
          FROM teachers t 
          LEFT JOIN departments d ON t.DepartmentId = d.DepartmentId 
          ORDER BY t.TeacherId DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add new teacher
app.post('/api/teachers', upload.single('profilePicture'), (req, res) => {
  const { EmployeeId, FirstName, LastName, Email, Phone, DepartmentId, Position, Qualification, Specialization, Salary } = req.body;
  const ProfilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`INSERT INTO teachers 
    (EmployeeId, FirstName, LastName, Email, Phone, DepartmentId, Position, Qualification, Specialization, Salary, ProfilePicture) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [EmployeeId, FirstName, LastName, Email, Phone, DepartmentId, Position, Qualification, Specialization, Salary, ProfilePicture],
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
  console.log(`🚀 Unified server running on port ${PORT}`);
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
