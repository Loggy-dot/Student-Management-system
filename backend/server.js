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

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const UPLOAD_PATH = path.join(__dirname, 'uploads');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_PATH));

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

// Send grade notification email
const sendGradeNotification = async (email, studentName, courseName, grade) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'New Grade Posted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Grade Notification</h2>
          <p>Dear ${studentName},</p>
          <p>A new grade has been posted for your course:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Grade:</strong> ${grade}</p>
          </div>
          <p>Please log in to the student portal to view your complete academic record.</p>
          <p>Best regards,<br>Academic Administration</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Grade notification sent to ${email}`);
  } catch (error) {
    console.error('Error sending grade notification:', error);
  }
};

// Database setup
const dbPath = path.join(__dirname, 'students.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database with enhanced schema
function initializeDatabase() {
    db.serialize(() => {
        // Enhanced students table with personal information
        db.run(`CREATE TABLE IF NOT EXISTS students (
            StudentId INTEGER PRIMARY KEY,
            StudentName VARCHAR(100) NOT NULL,
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
            GraduationDate DATE,
            Status VARCHAR(20) DEFAULT 'Active',
            DepartmentId INTEGER,
            AcademicYear VARCHAR(10),
            Semester VARCHAR(20),
            FOREIGN KEY(DepartmentId) REFERENCES departments(DepartmentId)
        )`);

        // Enhanced departments table
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            DepartmentId INTEGER PRIMARY KEY,
            DepartmentName VARCHAR(100) NOT NULL,
            DepartmentCode VARCHAR(10) UNIQUE,
            Head VARCHAR(100),
            Description TEXT,
            EstablishedYear INTEGER,
            Building VARCHAR(50),
            Phone VARCHAR(20),
            Email VARCHAR(100)
        )`);

        // Enhanced courses table
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            CourseId INTEGER PRIMARY KEY,
            CourseCode VARCHAR(20) UNIQUE NOT NULL,
            CourseName VARCHAR(100) NOT NULL,
            Description TEXT,
            Credits INTEGER DEFAULT 3,
            Prerequisites TEXT,
            DepartmentId INTEGER,
            Duration VARCHAR(20),
            Status VARCHAR(20) DEFAULT 'Active',
            FOREIGN KEY(DepartmentId) REFERENCES departments(DepartmentId)
        )`);

        // Teachers/Faculty table
        db.run(`CREATE TABLE IF NOT EXISTS teachers (
            TeacherId INTEGER PRIMARY KEY,
            EmployeeId VARCHAR(20) UNIQUE,
            FirstName VARCHAR(50) NOT NULL,
            LastName VARCHAR(50) NOT NULL,
            Email VARCHAR(100) UNIQUE NOT NULL,
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
            FOREIGN KEY(DepartmentId) REFERENCES departments(DepartmentId)
        )`);

        // Course assignments (which teacher teaches which course)
        db.run(`CREATE TABLE IF NOT EXISTS course_assignments (
            AssignmentId INTEGER PRIMARY KEY,
            TeacherId INTEGER,
            CourseId INTEGER,
            Semester VARCHAR(20),
            AcademicYear VARCHAR(10),
            ClassTime VARCHAR(50),
            ClassRoom VARCHAR(20),
            FOREIGN KEY(TeacherId) REFERENCES teachers(TeacherId),
            FOREIGN KEY(CourseId) REFERENCES courses(CourseId)
        )`);

        // Enhanced enrollments table (replaces registrations)
        db.run(`CREATE TABLE IF NOT EXISTS enrollments (
            EnrollmentId INTEGER PRIMARY KEY,
            StudentId INTEGER,
            CourseId INTEGER,
            TeacherId INTEGER,
            Semester VARCHAR(20),
            AcademicYear VARCHAR(10),
            EnrollmentDate DATE DEFAULT CURRENT_DATE,
            Status VARCHAR(20) DEFAULT 'Enrolled',
            FOREIGN KEY(StudentId) REFERENCES students(StudentId),
            FOREIGN KEY(CourseId) REFERENCES courses(CourseId),
            FOREIGN KEY(TeacherId) REFERENCES teachers(TeacherId)
        )`);

        // Enhanced grading system
        db.run(`CREATE TABLE IF NOT EXISTS assessments (
            AssessmentId INTEGER PRIMARY KEY,
            CourseId INTEGER,
            AssessmentType VARCHAR(50),
            AssessmentName VARCHAR(100),
            MaxPoints DECIMAL(5,2),
            Weight DECIMAL(5,2),
            DueDate DATE,
            Description TEXT,
            FOREIGN KEY(CourseId) REFERENCES courses(CourseId)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS grades (
            GradeId INTEGER PRIMARY KEY,
            StudentId INTEGER,
            AssessmentId INTEGER,
            PointsEarned DECIMAL(5,2),
            LetterGrade VARCHAR(2),
            GradeDate DATE DEFAULT CURRENT_DATE,
            Comments TEXT,
            FOREIGN KEY(StudentId) REFERENCES students(StudentId),
            FOREIGN KEY(AssessmentId) REFERENCES assessments(AssessmentId)
        )`);

        // Attendance tracking
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            AttendanceId INTEGER PRIMARY KEY,
            StudentId INTEGER,
            CourseId INTEGER,
            AttendanceDate DATE,
            Status VARCHAR(20),
            Remarks TEXT,
            FOREIGN KEY(StudentId) REFERENCES students(StudentId),
            FOREIGN KEY(CourseId) REFERENCES courses(CourseId)
        )`);

        // Enhanced authentication with JWT support
        db.run(`CREATE TABLE IF NOT EXISTS users (
            UserId INTEGER PRIMARY KEY,
            Username VARCHAR(50) UNIQUE NOT NULL,
            Email VARCHAR(100) UNIQUE NOT NULL,
            PasswordHash VARCHAR(255) NOT NULL,
            Role VARCHAR(20) NOT NULL,
            RefreshToken TEXT,
            LastLogin DATETIME,
            IsActive BOOLEAN DEFAULT 1,
            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Student credentials (enhanced)
        db.run(`CREATE TABLE IF NOT EXISTS student_credentials (
            StudentId INTEGER PRIMARY KEY,
            UserId INTEGER UNIQUE,
            Email VARCHAR(100) UNIQUE NOT NULL,
            PasswordHash VARCHAR(255) NOT NULL,
            LastLogin DATETIME,
            IsActive BOOLEAN DEFAULT 1,
            FOREIGN KEY(StudentId) REFERENCES students(StudentId),
            FOREIGN KEY(UserId) REFERENCES users(UserId)
        )`);

        // Keep legacy tables for backward compatibility
        db.run(`CREATE TABLE IF NOT EXISTS students_report (
            StudentId INTEGER PRIMARY KEY,
            StudentName VARCHAR(100) NOT NULL,
            Course1 VARCHAR(100) NOT NULL,
            Grade1 VARCHAR(2) NOT NULL,
            Course2 VARCHAR(100) NOT NULL,
            Grade2 VARCHAR(2) NOT NULL,
            Department VARCHAR(100) NOT NULL
        )`);

        // Insert initial data after tables are created
        insertInitialData();
    });
}

function insertInitialData() {
    db.serialize(() => {
        // Insert data into students_report
        const studentsReportData = [
            [175207889, 'Akwesi Bonsu', 'Mathematics I', 'A', 'Physics I', 'B', 'Science'],
            [172056781, 'Baena Mensah', 'Biology I', 'C', 'Chemistry I', 'B', 'Science'],
            [175032146, 'Kojo Antwi', 'English Literature', 'A', 'History', 'A', 'Arts'],
            [172568404, 'Abiew Lawrence', 'Computer Science', 'B', 'Data Structures', 'B', 'Engineering'],
            [173501479, 'Efua Asante', 'Accounting', 'A', 'Economics', 'A', 'Business'],
            [170231458, 'Johnson Kissi', 'Mechanics', 'C', 'Calculus', 'D', 'Engineering'],
            [172135870, 'Farouk Mustapha', 'Programming I', 'B', 'Web Development', 'B', 'Computer Science'],
            [172451478, 'Obeng Derrick', 'Marketing', 'A', 'Finance', 'A', 'Business'],
            [172310264, 'Akosua Osei', 'Geography', 'B', 'Government', 'A', 'Arts'],
            [178521468, 'Kofi Amoah', 'Digital Electronics', 'C', 'Circuits', 'C', 'Engineering'],
            [171235871, 'Afia Manu', 'French', 'B', 'Spanish', 'C', 'Arts'],
            [172534783, 'Fred Owusu', 'Linear Algebra', 'B', 'Discrete Math', 'B', 'Science'],
            [172351478, 'Daniel Owusu', 'Introduction to AI', 'A', 'Python Programming', 'A', 'Computer Science'],
            [177523150, 'Kwame Boateng', 'Statistics I', 'B', 'Operations Research', 'B', 'Science'],
            [1785320147, 'Mawusi Tetteh', 'Macroeconomics', 'A', 'Management', 'A', 'Business'],
            [1751230241, 'Ernest Kwame', 'Database Systems', 'B', 'Operating Systems', 'C', 'Computer Science'],
            [1723014572, 'Benjamin Danso', 'Anatomy', 'C', 'Physiology', 'C', 'Science'],
            [1781236214, 'Justice Ofori', 'Java Programming', 'A', 'Software Engineering', 'A', 'Computer Science'],
            [1785231478, 'Stephen Appiah', 'World Religions', 'A', 'Philosophy', 'B', 'Arts'],
            [1785213512, 'George Krampah', 'Network Fundamentals', 'B', 'Cybersecurity Basics', 'B', 'Computer Science']
        ];

        const insertStudentReport = db.prepare(`INSERT OR IGNORE INTO students_report 
            (StudentId, StudentName, Course1, Grade1, Course2, Grade2, Department) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`);

        studentsReportData.forEach(row => {
            insertStudentReport.run(row);
        });
        insertStudentReport.finalize();

        // Insert data into students_report_update
        const studentsReportUpdateData = [
            [173024258, 'Emmanuel Samu', 'DBMS', 'B+', 'Information Technology'],
            [175025256, 'Nadia Ofori', 'DBMS', 'A-', 'Computer Science'],
            [175024658, 'James Tah', 'DBMS', 'B', 'Information Technology'],
            [175827698, 'Nana Owusu', 'Cloud Computing', 'A', 'Computer Science'],
            [165084765, 'Eric Gyamfi', 'Cloud Computing', 'A-', 'Computer Science']
        ];

        const insertStudentReportUpdate = db.prepare(`INSERT OR IGNORE INTO students_report_update 
            (StudentId, StudentName, Course, Grade, Department) 
            VALUES (?, ?, ?, ?, ?)`);

        studentsReportUpdateData.forEach(row => {
            insertStudentReportUpdate.run(row);
        });
        insertStudentReportUpdate.finalize();

        // Insert sample student credentials
        const studentCredentialsData = [
            [175207889, 'akwesi.bonsu@student.edu', 'password123'],
            [172056781, 'baena.mensah@student.edu', 'password123'],
            [175032146, 'kojo.antwi@student.edu', 'password123'],
            [172568404, 'abiew.lawrence@student.edu', 'password123'],
            [173501479, 'efua.asante@student.edu', 'password123'],
            [170231458, 'johnson.kissi@student.edu', 'password123'],
            [172135870, 'farouk.mustapha@student.edu', 'password123'],
            [172451478, 'obeng.derrick@student.edu', 'password123'],
            [172310264, 'akosua.osei@student.edu', 'password123'],
            [178521468, 'kofi.amoah@student.edu', 'password123'],
            [173024258, 'emmanuel.samu@student.edu', 'password123'],
            [175025256, 'nadia.ofori@student.edu', 'password123'],
            [175024658, 'james.tah@student.edu', 'password123'],
            [175827698, 'nana.owusu@student.edu', 'password123'],
            [165084765, 'eric.gyamfi@student.edu', 'password123']
        ];

        const insertCredentials = db.prepare(`INSERT OR IGNORE INTO student_credentials 
            (StudentId, Email, Password) VALUES (?, ?, ?)`);

        studentCredentialsData.forEach(row => {
            insertCredentials.run(row);
        });
        insertCredentials.finalize();

        // Insert sample departments
        const departmentsData = [
            [1, 'Science', 'Dr. Smith'],
            [2, 'Arts', 'Dr. Johnson'],
            [3, 'Engineering', 'Dr. Brown'],
            [4, 'Computer Science', 'Dr. Davis'],
            [5, 'Business', 'Dr. Wilson'],
            [6, 'Information Technology', 'Dr. Miller']
        ];

        const insertDepartments = db.prepare(`INSERT OR IGNORE INTO departments 
            (DepartmentId, DepartmentName, Head) VALUES (?, ?, ?)`);

        departmentsData.forEach(row => {
            insertDepartments.run(row);
        });
        insertDepartments.finalize();

        // Insert students into the students table based on students_report data
        const studentsData = [
            [175207889, 'Akwesi Bonsu', 1], // Science
            [172056781, 'Baena Mensah', 1], // Science
            [175032146, 'Kojo Antwi', 2], // Arts
            [172568404, 'Abiew Lawrence', 3], // Engineering
            [173501479, 'Efua Asante', 5], // Business
            [170231458, 'Johnson Kissi', 3], // Engineering
            [172135870, 'Farouk Mustapha', 4], // Computer Science
            [172451478, 'Obeng Derrick', 5], // Business
            [172310264, 'Akosua Osei', 2], // Arts
            [178521468, 'Kofi Amoah', 3], // Engineering
            [171235871, 'Afia Manu', 2], // Arts
            [172534783, 'Fred Owusu', 1], // Science
            [172351478, 'Daniel Owusu', 4], // Computer Science
            [177523150, 'Kwame Boateng', 1], // Science
            [1785320147, 'Mawusi Tetteh', 5], // Business
            [1751230241, 'Ernest Kwame', 4], // Computer Science
            [1723014572, 'Benjamin Danso', 1], // Science
            [1781236214, 'Justice Ofori', 4], // Computer Science
            [1785231478, 'Stephen Appiah', 2], // Arts
            [1785213512, 'George Krampah', 4], // Computer Science
            [173024258, 'Emmanuel Samu', 6], // Information Technology
            [175025256, 'Nadia Ofori', 4], // Computer Science
            [175024658, 'James Tah', 6], // Information Technology
            [175827698, 'Nana Owusu', 4], // Computer Science
            [165084765, 'Eric Gyamfi', 4] // Computer Science
        ];

        const insertStudents = db.prepare(`INSERT OR IGNORE INTO students 
            (StudentId, StudentName, DepartmentId) VALUES (?, ?, ?)`);

        studentsData.forEach(row => {
            insertStudents.run(row);
        });
        insertStudents.finalize();
        
        console.log('Database initialized with sample data, student credentials, departments, and students');
    });
}

// API Routes

// ============ AUTHENTICATION ROUTES ============

// Admin/Teacher Login
app.post('/api/auth/login', async (req, res) => {
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

// Student Login (Enhanced)
app.post('/api/auth/student-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get student credentials
    db.get('SELECT sc.*, s.StudentName, s.FirstName, s.LastName FROM student_credentials sc JOIN students s ON sc.StudentId = s.StudentId WHERE sc.Email = ?',
      [email], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row || row.Password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { studentId: row.StudentId, email: row.Email, role: 'student' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        token,
        student: {
          StudentId: row.StudentId,
          StudentName: row.StudentName,
          FirstName: row.FirstName,
          LastName: row.LastName,
          Email: row.Email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ENHANCED STUDENT ROUTES ============

// Get all students (Enhanced)
app.get('/api/students/enhanced', authenticateToken, (req, res) => {
  const query = `
    SELECT s.*, d.DepartmentName, d.DepartmentCode
    FROM students s
    LEFT JOIN departments d ON s.DepartmentId = d.DepartmentId
    ORDER BY s.StudentName
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new student (Enhanced)
app.post('/api/students/enhanced', authenticateToken, authorizeRole(['admin', 'teacher']), upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      StudentId, FirstName, LastName, Email, Phone, DateOfBirth,
      Address, EmergencyContact, EmergencyPhone, DepartmentId,
      AcademicYear, Semester
    } = req.body;

    // Validation
    if (!StudentId || !FirstName || !LastName || !Email) {
      return res.status(400).json({ error: 'StudentId, FirstName, LastName, and Email are required' });
    }

    if (!validator.isEmail(Email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const StudentName = `${FirstName} ${LastName}`;
    const ProfilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO students (
        StudentId, StudentName, FirstName, LastName, Email, Phone, DateOfBirth,
        Address, EmergencyContact, EmergencyPhone, ProfilePicture,
        DepartmentId, AcademicYear, Semester
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      StudentId, StudentName, FirstName, LastName, Email, Phone, DateOfBirth,
      Address, EmergencyContact, EmergencyPhone, ProfilePicture,
      DepartmentId, AcademicYear, Semester
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Create student credentials
      const studentEmail = Email;
      const defaultPassword = 'password123';

      db.run('INSERT OR IGNORE INTO student_credentials (StudentId, Email, Password) VALUES (?, ?, ?)',
        [StudentId, studentEmail, defaultPassword], (credErr) => {
        if (credErr) {
          console.warn('Warning: Could not create student credentials:', credErr.message);
        }

        // Send welcome email
        sendWelcomeEmail(studentEmail, StudentName, defaultPassword);

        res.json({
          id: this.lastID,
          StudentId,
          StudentName,
          credentials: { email: studentEmail, password: defaultPassword }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEACHER MANAGEMENT ROUTES ============

// Get all teachers
app.get('/api/teachers', authenticateToken, (req, res) => {
  const query = `
    SELECT t.*, d.DepartmentName
    FROM teachers t
    LEFT JOIN departments d ON t.DepartmentId = d.DepartmentId
    WHERE t.Status = 'Active'
    ORDER BY t.LastName, t.FirstName
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new teacher
app.post('/api/teachers', authenticateToken, authorizeRole(['admin']), upload.single('profilePicture'), (req, res) => {
  const {
    EmployeeId, FirstName, LastName, Email, Phone, DateOfBirth,
    Qualification, Specialization, DepartmentId, Position, Salary
  } = req.body;

  if (!EmployeeId || !FirstName || !LastName || !Email) {
    return res.status(400).json({ error: 'EmployeeId, FirstName, LastName, and Email are required' });
  }

  if (!validator.isEmail(Email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const ProfilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO teachers (
      EmployeeId, FirstName, LastName, Email, Phone, DateOfBirth,
      Qualification, Specialization, DepartmentId, Position, Salary, ProfilePicture
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    EmployeeId, FirstName, LastName, Email, Phone, DateOfBirth,
    Qualification, Specialization, DepartmentId, Position, Salary, ProfilePicture
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      id: this.lastID,
      TeacherId: this.lastID,
      EmployeeId,
      FirstName,
      LastName,
      Email
    });
  });
});

// ============ ENHANCED GRADING SYSTEM ============

// Get assessments for a course
app.get('/api/courses/:courseId/assessments', authenticateToken, (req, res) => {
  const { courseId } = req.params;

  db.all('SELECT * FROM assessments WHERE CourseId = ? ORDER BY DueDate', [courseId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new assessment
app.post('/api/assessments', authenticateToken, authorizeRole(['admin', 'teacher']), (req, res) => {
  const {
    CourseId, AssessmentType, AssessmentName, MaxPoints, Weight, DueDate, Description
  } = req.body;

  if (!CourseId || !AssessmentType || !AssessmentName || !MaxPoints) {
    return res.status(400).json({ error: 'CourseId, AssessmentType, AssessmentName, and MaxPoints are required' });
  }

  const query = `
    INSERT INTO assessments (CourseId, AssessmentType, AssessmentName, MaxPoints, Weight, DueDate, Description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [CourseId, AssessmentType, AssessmentName, MaxPoints, Weight, DueDate, Description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      id: this.lastID,
      AssessmentId: this.lastID,
      CourseId,
      AssessmentName
    });
  });
});

// Get grades for a student
app.get('/api/students/:studentId/grades', authenticateToken, (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT g.*, a.AssessmentName, a.AssessmentType, a.MaxPoints, c.CourseName, c.CourseCode
    FROM grades g
    JOIN assessments a ON g.AssessmentId = a.AssessmentId
    JOIN courses c ON a.CourseId = c.CourseId
    WHERE g.StudentId = ?
    ORDER BY g.GradeDate DESC
  `;

  db.all(query, [studentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add/Update grade
app.post('/api/grades', authenticateToken, authorizeRole(['admin', 'teacher']), async (req, res) => {
  const { StudentId, AssessmentId, PointsEarned, LetterGrade, Comments } = req.body;

  if (!StudentId || !AssessmentId || PointsEarned === undefined) {
    return res.status(400).json({ error: 'StudentId, AssessmentId, and PointsEarned are required' });
  }

  const query = `
    INSERT OR REPLACE INTO grades (StudentId, AssessmentId, PointsEarned, LetterGrade, Comments)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [StudentId, AssessmentId, PointsEarned, LetterGrade, Comments], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get student and course info for notification
    const notificationQuery = `
      SELECT s.Email, s.StudentName, c.CourseName
      FROM students s, courses c, assessments a
      WHERE s.StudentId = ? AND a.AssessmentId = ? AND c.CourseId = a.CourseId
    `;

    db.get(notificationQuery, [StudentId, AssessmentId], (notifErr, row) => {
      if (!notifErr && row) {
        sendGradeNotification(row.Email, row.StudentName, row.CourseName, LetterGrade);
      }
    });

    res.json({
      id: this.lastID,
      StudentId,
      AssessmentId,
      PointsEarned,
      LetterGrade
    });
  });
});

// ============ LEGACY ROUTES (for backward compatibility) ============

// Get all students from students_report
app.get('/api/students-report', (req, res) => {
    db.all('SELECT * FROM students_report', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all students from students_report_update
app.get('/api/students-report-update', (req, res) => {
    db.all('SELECT * FROM students_report_update', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all students
app.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all courses
app.get('/api/courses', (req, res) => {
    db.all('SELECT * FROM courses', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all departments
app.get('/api/departments', (req, res) => {
    db.all('SELECT * FROM departments', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all registrations
app.get('/api/registrations', (req, res) => {
    db.all('SELECT * FROM registrations', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM students WHERE StudentId = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    });
});

// Add new student
app.post('/api/students', (req, res) => {
    const { StudentId, StudentName, DepartmentId } = req.body;
    db.run('INSERT INTO students (StudentId, StudentName, DepartmentId) VALUES (?, ?, ?)',
        [StudentId, StudentName, DepartmentId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, StudentId, StudentName, DepartmentId });
    });
});

// Add new course
app.post('/api/courses', (req, res) => {
    const { CourseId, CourseName } = req.body;
    db.run('INSERT INTO courses (CourseId, CourseName) VALUES (?, ?)',
        [CourseId, CourseName], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, CourseId, CourseName });
    });
});

// Add new department
app.post('/api/departments', (req, res) => {
    const { DepartmentId, DepartmentName, Head } = req.body;
    db.run('INSERT INTO departments (DepartmentId, DepartmentName, Head) VALUES (?, ?, ?)',
        [DepartmentId, DepartmentName, Head], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, DepartmentId, DepartmentName, Head });
    });
});

// Add new registration
app.post('/api/registrations', (req, res) => {
    const { StudentId, CourseId, Grade } = req.body;
    db.run('INSERT INTO registrations (StudentId, CourseId, Grade) VALUES (?, ?, ?)',
        [StudentId, CourseId, Grade], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ StudentId, CourseId, Grade });
    });
});

// Update student
app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const { StudentName, DepartmentId } = req.body;
    db.run('UPDATE students SET StudentName = ?, DepartmentId = ? WHERE StudentId = ?',
        [StudentName, DepartmentId, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM students WHERE StudentId = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Add new student to students_report
app.post('/api/students-report', (req, res) => {
    const { StudentId, StudentName, Course1, Grade1, Course2, Grade2, Department } = req.body;

    console.log('Received request to add student:', req.body);

    // Validate required fields
    if (!StudentId || !StudentName || !Course1 || !Grade1 || !Course2 || !Grade2 || !Department) {
        console.log('Missing required fields');
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    
    // Start a transaction to ensure data consistency
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // First, find or create the department
        db.get('SELECT DepartmentId FROM departments WHERE DepartmentName = ?', [Department], (err, deptRow) => {
            if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
            }
            
            let departmentId = deptRow ? deptRow.DepartmentId : null;
            
            const insertStudentReport = () => {
                // Insert into students_report
                db.run('INSERT INTO students_report (StudentId, StudentName, Course1, Grade1, Course2, Grade2, Department) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [StudentId, StudentName, Course1, Grade1, Course2, Grade2, Department], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    // Also insert into students table if departmentId exists
                    if (departmentId) {
                        db.run('INSERT OR IGNORE INTO students (StudentId, StudentName, DepartmentId) VALUES (?, ?, ?)',
                            [StudentId, StudentName, departmentId], function(err) {
                            if (err) {
                                console.warn('Warning: Could not insert into students table:', err.message);
                            }
                            
                            // Generate default email and password for student credentials
                            const email = `${StudentName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
                            const password = 'password123';
                            
                            db.run('INSERT OR IGNORE INTO student_credentials (StudentId, Email, Password) VALUES (?, ?, ?)',
                                [StudentId, email, password], function(err) {
                                if (err) {
                                    console.warn('Warning: Could not create student credentials:', err.message);
                                }
                                
                                db.run('COMMIT');
                                res.json({ 
                                    id: this.lastID, 
                                    StudentId, 
                                    StudentName, 
                                    Course1, 
                                    Grade1, 
                                    Course2, 
                                    Grade2, 
                                    Department,
                                    credentials: { email, password }
                                });
                            });
                        });
                    } else {
                        db.run('COMMIT');
                        res.json({ id: this.lastID, StudentId, StudentName, Course1, Grade1, Course2, Grade2, Department });
                    }
                });
            };
            
            if (!departmentId) {
                // Create new department if it doesn't exist
                db.run('INSERT INTO departments (DepartmentName, Head) VALUES (?, ?)',
                    [Department, 'TBD'], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    departmentId = this.lastID;
                    insertStudentReport();
                });
            } else {
                insertStudentReport();
            }
        });
    });
});

// Update student in students_report
app.put('/api/students-report/:id', (req, res) => {
    const { id } = req.params;
    const { StudentName, Course1, Grade1, Course2, Grade2, Department } = req.body;
    db.run('UPDATE students_report SET StudentName = ?, Course1 = ?, Grade1 = ?, Course2 = ?, Grade2 = ?, Department = ? WHERE StudentId = ?',
        [StudentName, Course1, Grade1, Course2, Grade2, Department, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Delete student from students_report
app.delete('/api/students-report/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM students_report WHERE StudentId = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Delete department
app.delete('/api/departments/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM departments WHERE DepartmentId = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Delete course
app.delete('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM courses WHERE CourseId = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Get students with their departments (JOIN query)
app.get('/api/students-with-departments', (req, res) => {
    const query = `
        SELECT s.StudentId, s.StudentName, d.DepartmentName, d.Head
        FROM students s
        LEFT JOIN departments d ON s.DepartmentId = d.DepartmentId
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get student registrations with course details
app.get('/api/student-registrations/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = `
        SELECT s.StudentName, c.CourseName, r.Grade
        FROM registrations r
        JOIN students s ON r.StudentId = s.StudentId
        JOIN courses c ON r.CourseId = c.CourseId
        WHERE r.StudentId = ?
    `;
    db.all(query, [studentId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Student Authentication Routes

// Student login
app.post('/api/student-login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const query = `
        SELECT sc.StudentId, sc.Email, s.StudentName, d.DepartmentName
        FROM student_credentials sc
        JOIN students s ON sc.StudentId = s.StudentId
        LEFT JOIN departments d ON s.DepartmentId = d.DepartmentId
        WHERE sc.Email = ? AND sc.Password = ?
    `;
    
    db.get(query, [email, password], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json({
                success: true,
                student: {
                    StudentId: row.StudentId,
                    StudentName: row.StudentName,
                    Email: row.Email,
                    DepartmentName: row.DepartmentName
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    });
});

// Get student grades and results
app.get('/api/student-grades/:studentId', (req, res) => {
    const { studentId } = req.params;
    
    // First check if student exists in students_report
    const reportQuery = `
        SELECT StudentId, StudentName, Course1, Grade1, Course2, Grade2, Department
        FROM students_report 
        WHERE StudentId = ?
    `;
    
    db.get(reportQuery, [studentId], (err, reportRow) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Also check students_report_update table
        const updateQuery = `
            SELECT StudentId, StudentName, Course, Grade, Department
            FROM students_report_update 
            WHERE StudentId = ?
        `;
        
        db.all(updateQuery, [studentId], (err, updateRows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Also get registrations data
            const registrationQuery = `
                SELECT s.StudentName, c.CourseName, r.Grade, d.DepartmentName
                FROM registrations r
                JOIN students s ON r.StudentId = s.StudentId
                JOIN courses c ON r.CourseId = c.CourseId
                LEFT JOIN departments d ON s.DepartmentId = d.DepartmentId
                WHERE r.StudentId = ?
            `;
            
            db.all(registrationQuery, [studentId], (err, registrationRows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                const result = {
                    studentId: studentId,
                    studentName: reportRow?.StudentName || updateRows[0]?.StudentName || registrationRows[0]?.StudentName || 'Unknown',
                    department: reportRow?.Department || updateRows[0]?.Department || registrationRows[0]?.DepartmentName || 'Unknown',
                    grades: []
                };
                
                // Add grades from students_report
                if (reportRow) {
                    result.grades.push(
                        { course: reportRow.Course1, grade: reportRow.Grade1, source: 'Main Report' },
                        { course: reportRow.Course2, grade: reportRow.Grade2, source: 'Main Report' }
                    );
                }
                
                // Add grades from students_report_update
                updateRows.forEach(row => {
                    result.grades.push({
                        course: row.Course,
                        grade: row.Grade,
                        source: 'Updated Report'
                    });
                });
                
                // Add grades from registrations
                registrationRows.forEach(row => {
                    result.grades.push({
                        course: row.CourseName,
                        grade: row.Grade,
                        source: 'Registration'
                    });
                });
                
                if (result.grades.length === 0) {
                    res.status(404).json({ error: 'No grades found for this student' });
                } else {
                    res.json(result);
                }
            });
        });
    });
});

// Create student credentials (for admin use)
app.post('/api/student-credentials', (req, res) => {
    const { StudentId, Email, Password } = req.body;
    
    if (!StudentId || !Email || !Password) {
        return res.status(400).json({ error: 'StudentId, Email, and Password are required' });
    }
    
    db.run('INSERT INTO student_credentials (StudentId, Email, Password) VALUES (?, ?, ?)',
        [StudentId, Email, Password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Email already exists' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.json({ success: true, message: 'Student credentials created successfully' });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Students Database Backend is running' });
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