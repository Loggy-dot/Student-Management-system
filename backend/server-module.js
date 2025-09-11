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
    // Database initialization code from server.js
    // (This would be the same code as in your original server.js)
    db.serialize(() => {
        // Create your tables here
        console.log('Database initialized');
    });
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

// Example students route
router.get('/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Export the router and database for use in the main server
module.exports = router;