@echo off
echo 🚀 TESTING STUDENT MANAGEMENT APIS
echo =====================================

echo.
echo 🧪 Testing Health Check...
curl -s http://localhost:10000/api/health
echo.

echo.
echo 🧪 Testing Get Departments...
curl -s http://localhost:10000/api/departments
echo.

echo.
echo 🧪 Testing Get Students Report...
curl -s http://localhost:10000/api/students-report
echo.

echo.
echo 🧪 Testing Get Teachers...
curl -s http://localhost:10000/api/teachers
echo.

echo.
echo 🧪 Testing Student Login...
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"john.doe@student.edu\",\"password\":\"password123\"}" http://localhost:10000/api/student-login
echo.

echo.
echo 🧪 Testing Admin Login...
curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://localhost:10000/api/auth/login
echo.

echo.
echo ✅ API Testing Complete!
pause
