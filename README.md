# 🎓 Enhanced Student Management System

A comprehensive, enterprise-grade web application for managing educational institutions, built with modern technologies including React, Node.js, SQLite, and advanced integrations.

## ✨ Key Features

### 🔐 **Advanced Security & Authentication**
- **JWT Token-based Authentication**: Secure login with role-based access control
- **Password Hashing**: bcrypt encryption for secure password storage
- **Multi-role Support**: Admin, Teacher, and Student access levels
- **Session Management**: Secure login/logout with token refresh

### 👥 **Enhanced Student Management**
- **Comprehensive Profiles**: Personal details, emergency contacts, profile pictures
- **Academic Tracking**: Enrollment dates, academic year, semester management
- **Advanced Search & Filtering**: Multi-criteria search with department filters
- **Profile Picture Upload**: Drag-and-drop image upload with preview
- **Bulk Operations**: Import/export student data

### 👨‍🏫 **Teacher Management System** ⭐ NEW!
- **Faculty Profiles**: Complete teacher information with qualifications
- **Department Assignments**: Link teachers to specific departments
- **Position Tracking**: Academic positions, specializations, and salary management
- **Profile Pictures**: Teacher photo uploads and management
- **Contact Management**: Email, phone, and emergency contact information

### 📧 **Email Integration System** ⭐ NEW!
- **Automated Notifications**: Welcome emails, grade alerts, announcements
- **Bulk Email System**: Send to students, teachers, or specific departments
- **Email Templates**: Pre-built templates for common communications
- **Grade Notifications**: Automatic email alerts when grades are posted
- **Department Filtering**: Target specific groups with precision

### 📊 **Advanced Grading System**
- **Multiple Assessments**: Assignments, quizzes, midterms, finals
- **Weighted Grading**: Configurable grade categories and weights
- **GPA Calculation**: Proper credit-hour weighted GPA computation
- **Grade History**: Complete academic record tracking
- **Performance Analytics**: Grade trends and statistics

### 📱 **Modern User Interface**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Professional UI**: Clean, modern design with Tailwind CSS
- **Interactive Components**: Modals, dropdowns, and dynamic forms
- **File Upload**: Drag-and-drop file uploads with preview
- **Real-time Updates**: Live data updates and notifications

## 🛠️ Tech Stack

### Frontend
- **React 19**: Latest React with modern hooks and features
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
- **React Router DOM**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Lucide React**: Beautiful, customizable icons
- **Vite**: Fast build tool and development server

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, unopinionated web framework
- **SQLite3**: Lightweight, file-based database
- **JWT (jsonwebtoken)**: Secure token-based authentication
- **bcryptjs**: Password hashing and encryption
- **Multer**: File upload middleware for profile pictures
- **Nodemailer**: Email sending capabilities
- **Validator**: Data validation and sanitization
- **CORS**: Cross-origin resource sharing enabled

### Database Schema
- **Enhanced Student Records**: 15+ fields including personal, academic, and contact information
- **Teacher Management**: Complete faculty database with qualifications and assignments
- **Advanced Grading**: Multiple assessment types with weighted calculations
- **Attendance Tracking**: Daily attendance records and analytics
- **Course Management**: Comprehensive course information with prerequisites

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd students-management
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../student-management-frontend
   npm install
   ```

4. **Create uploads directory** (for profile pictures)
   ```bash
   cd ../backend
   mkdir uploads
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   node server.js
   ```
   ✅ Backend will run on `http://localhost:5000`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd student-management-frontend
   npm run dev
   ```
   ✅ Frontend will run on `http://localhost:5173`

3. **Access the application**
   - **Admin Portal**: `http://localhost:5173`
   - **Student Portal**: `http://localhost:5173/student-portal`

### 🔑 Default Login Credentials

**Admin Portal** (`http://localhost:5173`):
- **Admin**: username: `admin`, password: `admin123`
- **Teacher**: username: `teacher`, password: `teacher123`

**Student Portal** (`http://localhost:5173/student-portal`):
- **Email**: `akwesi.bonsu@student.edu`, **Password**: `password123`
- **Email**: `baena.mensah@student.edu`, **Password**: `password123`
- Or any student email from the system with password: `password123`

> 💡 **Note**: New students automatically receive login credentials via email when added to the system.

## Project Structure

```
students-management/
├── backend/
│   ├── server.js              # Express server with enhanced API routes
│   ├── uploads/               # Profile picture storage
│   ├── students.db            # SQLite database (auto-generated)
│   └── package.json           # Backend dependencies
├── student-management-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx           # Admin dashboard
│   │   │   ├── StudentManagement.jsx  # Enhanced student management
│   │   │   ├── TeacherManagement.jsx  # NEW: Teacher management
│   │   │   ├── EmailIntegration.jsx   # NEW: Email system
│   │   │   ├── EnhancedStudentModal.jsx # Enhanced student form
│   │   │   ├── TeacherModal.jsx       # NEW: Teacher form
│   │   │   ├── StudentPortal.jsx      # Student login portal
│   │   │   ├── Login.jsx              # Admin/teacher login
│   │   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   │   └── ...                    # Other components
│   │   ├── App.jsx            # Main app with routing
│   │   ├── App.css            # Custom styles and animations
│   │   └── index.css          # Tailwind CSS imports
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # This documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin/Teacher login with JWT tokens
- `POST /api/auth/student-login` - Student login authentication

### Enhanced Students
- `GET /api/students/enhanced` - Get all students with comprehensive details
- `POST /api/students/enhanced` - Add new student with profile picture upload
- `PUT /api/students/enhanced/:id` - Update student information
- `DELETE /api/students/enhanced/:id` - Delete student
- `GET /api/students/:studentId/grades` - Get student grades and assessments

### Teachers ⭐ NEW!
- `GET /api/teachers` - Get all teachers with department information
- `POST /api/teachers` - Add new teacher with profile picture upload
- `PUT /api/teachers/:id` - Update teacher information
- `DELETE /api/teachers/:id` - Delete teacher

### Enhanced Grading System
- `GET /api/courses/:courseId/assessments` - Get assessments for a course
- `POST /api/assessments` - Create new assessment
- `POST /api/grades` - Add/update grades with email notifications
- `GET /api/students/:studentId/grades` - Get comprehensive grade history

### Departments
- `GET /api/departments` - Get all departments with enhanced details
- `POST /api/departments` - Add new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Courses
- `GET /api/courses` - Get all courses with prerequisites and credits
- `POST /api/courses` - Add new course with detailed information
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### File Upload
- `POST /uploads` - Profile picture upload endpoint
- `GET /uploads/:filename` - Serve uploaded files

### Legacy Endpoints (Backward Compatibility)
- `GET /api/students-report` - Original student data format
- `POST /api/students-report` - Original student creation
- `GET /api/students-report-update` - Student reports for export

## 🎯 Features Overview

### 📊 Dashboard
- **Real-time Statistics**: Total students, teachers, courses, departments
- **Performance Analytics**: Average GPA, grade distributions, trends
- **Recent Activity**: Latest student additions and updates
- **Quick Actions**: Fast access to common tasks
- **Visual Charts**: Grade performance and enrollment statistics

### 👥 Enhanced Student Management
- **Comprehensive Profiles**: 15+ fields including personal, academic, and emergency contacts
- **Profile Pictures**: Upload and display student photos
- **Advanced Search**: Multi-criteria filtering by name, ID, department, academic year
- **Bulk Operations**: Import/export student data
- **Automatic Credentials**: Email login credentials to new students
- **Grade Integration**: View student grades and GPA calculations
- **Mobile Responsive**: Optimized for all devices

### 👨‍🏫 Teacher Management ⭐ NEW!
- **Faculty Profiles**: Complete teacher information with qualifications and specializations
- **Department Assignments**: Link teachers to specific departments
- **Position Tracking**: Academic ranks, hire dates, and salary management
- **Profile Pictures**: Teacher photo uploads and management
- **Contact Management**: Email, phone, and professional information
- **Course Assignments**: Track which teachers teach which courses

### 📧 Email Integration ⭐ NEW!
- **Automated Notifications**: Welcome emails, grade alerts, announcements
- **Bulk Communication**: Send emails to students, teachers, or departments
- **Email Templates**: Pre-built templates for common scenarios
- **Grade Notifications**: Automatic alerts when grades are posted
- **Department Filtering**: Target specific groups with precision
- **Professional Templates**: Branded email communications

### 📚 Advanced Grading System
- **Multiple Assessments**: Support for assignments, quizzes, midterms, finals
- **Weighted Grading**: Configurable grade categories and weights
- **Grade History**: Complete academic record tracking over time
- **GPA Calculation**: Proper credit-hour weighted calculations
- **Performance Analytics**: Grade trends and statistical analysis
- **Email Notifications**: Automatic grade posting alerts

### 🎓 Student Portal
- **Secure Authentication**: Email-based login with password protection
- **Personal Dashboard**: Student information and academic overview
- **Grade Viewing**: Detailed course grades and GPA tracking
- **Performance Summary**: Academic progress and analytics
- **Mobile Optimized**: Full functionality on mobile devices
- **Real-time Updates**: Live grade and announcement updates

### 🏢 Department Management
- **Enhanced Departments**: Detailed department information and management
- **Faculty Assignment**: Link teachers to departments
- **Student Enrollment**: Track department-wise student distribution
- **Department Analytics**: Performance metrics and statistics

### 📖 Course Management
- **Comprehensive Courses**: Course codes, descriptions, credits, prerequisites
- **Teacher Assignments**: Link courses to faculty members
- **Enrollment Tracking**: Monitor student course registrations
- **Academic Planning**: Course scheduling and room assignments

### 📈 Reports & Analytics
- **Detailed Reports**: Comprehensive student and teacher reports
- **Export Functionality**: CSV and Excel export capabilities
- **Performance Analytics**: Grade distributions and trends
- **Custom Filters**: Advanced filtering and sorting options
- **Visual Dashboards**: Charts and graphs for data visualization

## 🎨 Customization

The application is built with modern, customizable technologies:

### Styling
- **Tailwind CSS 4**: Utility-first CSS framework for rapid customization
- **Custom Themes**: Modify colors and themes in `tailwind.config.js`
- **Animations**: Custom animations defined in `App.css`
- **Responsive Design**: Mobile-first approach with breakpoint utilities

### Configuration
- **Email Settings**: Configure SMTP settings in environment variables
- **Database**: SQLite for development, easily switchable to PostgreSQL/MySQL
- **File Upload**: Configurable upload limits and file types
- **JWT Tokens**: Customizable token expiration and secret keys

### Environment Variables
Create a `.env` file in the backend directory:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-super-secret-key
PORT=5000
```

## 🚀 Deployment

### Production Deployment
1. **Build the frontend**:
   ```bash
   cd student-management-frontend
   npm run build
   ```

2. **Configure environment variables** for production

3. **Deploy backend** to your preferred hosting service (Heroku, DigitalOcean, AWS)

4. **Deploy frontend** to static hosting (Netlify, Vercel, GitHub Pages)

### Docker Deployment (Optional)
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd student-management-frontend
npm test

# Backend tests (if implemented)
cd backend
npm test
```

### Manual Testing Checklist
- [ ] Admin login and dashboard access
- [ ] Student creation with profile picture upload
- [ ] Teacher management functionality
- [ ] Email notifications working
- [ ] Student portal login and grade viewing
- [ ] File upload and download
- [ ] Responsive design on mobile devices

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation
4. **Add tests** for new functionality
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues
1. **Server won't start**: Check if port 5000 is available
2. **Email not sending**: Verify SMTP credentials in environment variables
3. **File upload fails**: Ensure uploads directory exists and has write permissions
4. **Database errors**: Delete `students.db` to reset database

### Getting Help
- 📧 **Email Support**: Open an issue in the repository
- 📚 **Documentation**: Check this README for detailed information
- 🐛 **Bug Reports**: Use GitHub issues with detailed reproduction steps
- 💡 **Feature Requests**: Submit enhancement requests via GitHub issues

## 🎉 What's Next?

### Planned Features
- [ ] **Calendar Integration**: Google Calendar sync for course schedules
- [ ] **LMS Integration**: Connect with popular learning management systems
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning-powered insights
- [ ] **Parent Portal**: Dedicated portal for parents to track student progress
- [ ] **Attendance QR Codes**: QR code-based attendance tracking
- [ ] **Grade Import**: Bulk grade import from Excel/CSV files

### Recent Updates
- ✅ **Enhanced Student Management**: Comprehensive student profiles
- ✅ **Teacher Management**: Complete faculty management system
- ✅ **Email Integration**: Automated notifications and bulk communication
- ✅ **Advanced Security**: JWT authentication and password hashing
- ✅ **File Upload**: Profile picture upload functionality

---

**Built with ❤️ for educational institutions worldwide**

*This system is designed to scale from small schools to large universities, providing enterprise-grade functionality with an intuitive user experience.*#   s t u d e n t s - m a n a g e m e n t  
 