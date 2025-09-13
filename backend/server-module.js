const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Create router instead of app
const router = express.Router();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const UPLOAD_PATH = path.join(__dirname, 'uploads');

// Middleware - Allow multiple frontend ports for development
router.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://student-management-system-p1sf.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Serve uploaded files
router.use('/uploads', express.static(UPLOAD_PATH));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile pictures'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ============ UTILITY FUNCTIONS ============

// Send welcome email to new students
const sendWelcomeEmail = async (email, studentName, password) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to Student Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Our Student Management System!</h2>
          <p>Dear ${studentName},</p>
          <p>Your student account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in to the student portal to view your grades and academic information.</p>
          <p><strong>Important:</strong> Please change your password after your first login for security.</p>
          <p>Best regards,<br>Academic Administration</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Database setup
const dbPath = path.join(__dirname, 'students.db');
const shouldResetDb = (process.env.NODE_ENV || 'development') === 'development' && process.env.RESET_DB === 'true';

if (shouldResetDb && fs.existsSync(dbPath)) {
    console.log('🗑️ Resetting local database (development mode)...');
    try {
        fs.unlinkSync(dbPath);
        console.log('✅ Local database reset successfully');
    } catch (err) {
        console.log('⚠️ Could not reset local database:', err.message);
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database with schema
function initializeDatabase() {
    console.log('🔧 Initializing database tables...');
    
    db.serialize(() => {
        // Enhanced students table
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

    // Insert sample students
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

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Students Management API is running' });
});

// ============ AUTHENTICATION ROUTES ============

// Admin/Teacher Login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // For demo purposes, using hardcoded credentials
    // In production, these should be stored in the database with hashed passwords
    const validCredentials = {
      'admin': { password: 'admin123', role: 'admin', name: 'System Administrator' },
      'teacher': { password: 'teacher123', role: 'teacher', name: 'John Doe' }
    };

    if (!validCredentials[username] || validCredentials[username].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = validCredentials[username];
    const token = jwt.sign(
      { username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student Login
router.post('/auth/student-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For demo purposes, using simple password check
    // In production, use proper password hashing
    if (password === 'password123') {
      const token = jwt.sign(
        { email, role: 'student' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        token,
        user: {
          email,
          role: 'student'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students (enhanced endpoint)
router.get('/students/enhanced', (req, res) => {
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

// Get all students (reports endpoint for backward compatibility)
router.get('/students-report', (req, res) => {
  db.all(`SELECT s.*, d.DepartmentName as Department
          FROM students s 
          LEFT JOIN departments d ON s.DepartmentId = d.DepartmentId 
          ORDER BY s.StudentId DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all students (basic endpoint)
router.get('/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all departments
router.get('/departments', (req, res) => {
  db.all('SELECT * FROM departments ORDER BY DepartmentName', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all teachers
router.get('/teachers', (req, res) => {
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

// Add new student (enhanced)
router.post('/students/enhanced', upload.single('profilePicture'), (req, res) => {
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
      
      res.json({ 
        success: true, 
        studentId: this.lastID,
        message: 'Student added successfully'
      });
    });
});

// Export the router and database for use in the main server
module.exports = router;