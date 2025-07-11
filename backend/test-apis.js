const http = require('http');

const BASE_URL = 'http://localhost:10000';

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  total: 0
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed.push(testName);
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.response?.status} ${error.response?.statusText}`);
    console.log(`   Details: ${error.response?.data?.error || error.message}`);
    testResults.failed.push({ name: testName, error: error.message });
  }
}

// Test functions
async function testHealthCheck() {
  const response = await axios.get(`${BASE_URL}/api/health`);
  if (response.status !== 200) throw new Error('Health check failed');
}

async function testGetDepartments() {
  const response = await axios.get(`${BASE_URL}/api/departments`);
  if (response.status !== 200) throw new Error('Get departments failed');
  console.log(`   Found ${response.data.length} departments`);
}

async function testGetStudentsReport() {
  const response = await axios.get(`${BASE_URL}/api/students-report`);
  if (response.status !== 200) throw new Error('Get students report failed');
  console.log(`   Found ${response.data.length} students in report`);
}

async function testGetStudentsEnhanced() {
  const response = await axios.get(`${BASE_URL}/api/students/enhanced`);
  if (response.status !== 200) throw new Error('Get enhanced students failed');
  console.log(`   Found ${response.data.length} enhanced students`);
}

async function testGetTeachers() {
  const response = await axios.get(`${BASE_URL}/api/teachers`);
  if (response.status !== 200) throw new Error('Get teachers failed');
  console.log(`   Found ${response.data.length} teachers`);
}

async function testStudentLogin() {
  const response = await axios.post(`${BASE_URL}/api/student-login`, {
    email: 'john.doe@student.edu',
    password: 'password123'
  });
  if (response.status !== 200) throw new Error('Student login failed');
  console.log(`   Student logged in: ${response.data.student?.StudentName}`);
}

async function testAdminLogin() {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  if (response.status !== 200) throw new Error('Admin login failed');
  console.log(`   Admin logged in successfully`);
}

async function testAddDepartment() {
  const response = await axios.post(`${BASE_URL}/api/departments`, {
    DepartmentName: 'Test Department',
    Head: 'Test Head'
  });
  if (response.status !== 200) throw new Error('Add department failed');
  console.log(`   Department added with ID: ${response.data.id}`);
}

async function testAddStudent() {
  const response = await axios.post(`${BASE_URL}/api/students-report`, {
    StudentId: 999999,
    StudentName: 'Test Student',
    Course1: 'Test Course 1',
    Grade1: 'A',
    Course2: 'Test Course 2',
    Grade2: 'B',
    Department: 'Test Department'
  });
  if (response.status !== 200) throw new Error('Add student failed');
  console.log(`   Student added successfully`);
}

async function testAddTeacher() {
  const formData = new FormData();
  formData.append('EmployeeId', 'TEST001');
  formData.append('FirstName', 'Test');
  formData.append('LastName', 'Teacher');
  formData.append('Email', 'test.teacher@school.edu');
  formData.append('Phone', '555-0123');
  formData.append('DepartmentId', '1');
  formData.append('Position', 'Professor');
  formData.append('Qualification', 'PhD');
  formData.append('Specialization', 'Testing');
  formData.append('Salary', '50000');

  const response = await axios.post(`${BASE_URL}/api/teachers`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  if (response.status !== 200) throw new Error('Add teacher failed');
  console.log(`   Teacher added with ID: ${response.data.teacherId || response.data.id}`);
}

async function testAddEnhancedStudent() {
  const formData = new FormData();
  formData.append('StudentId', '888888');
  formData.append('FirstName', 'Enhanced');
  formData.append('LastName', 'Student');
  formData.append('Email', 'enhanced.student@school.edu');
  formData.append('Phone', '555-0124');
  formData.append('DepartmentId', '1');
  formData.append('AcademicYear', '2024-2025');
  formData.append('Semester', 'Fall');

  const response = await axios.post(`${BASE_URL}/api/students/enhanced`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  if (response.status !== 200) throw new Error('Add enhanced student failed');
  console.log(`   Enhanced student added with ID: ${response.data.studentId || response.data.id}`);
}

async function testEmailTemplates() {
  const response = await axios.get(`${BASE_URL}/api/email-templates`);
  if (response.status !== 200) throw new Error('Get email templates failed');
  console.log(`   Found ${response.data.length} email templates`);
}

async function testSendBulkEmail() {
  const response = await axios.post(`${BASE_URL}/api/send-bulk-email`, {
    recipients: ['test@example.com'],
    subject: 'Test Email',
    message: 'This is a test email from API testing.',
    recipientType: 'custom'
  });
  if (response.status !== 200) throw new Error('Send bulk email failed');
  console.log(`   Bulk email sent to ${response.data.sentCount} recipients`);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE API TESTING\n');
  console.log('=' .repeat(50));

  // Basic endpoints
  await runTest('Health Check', testHealthCheck);
  await runTest('Get Departments', testGetDepartments);
  await runTest('Get Students Report', testGetStudentsReport);
  await runTest('Get Enhanced Students', testGetStudentsEnhanced);
  await runTest('Get Teachers', testGetTeachers);

  // Authentication
  await runTest('Student Login', testStudentLogin);
  await runTest('Admin Login', testAdminLogin);

  // Create operations
  await runTest('Add Department', testAddDepartment);
  await runTest('Add Student (Report)', testAddStudent);
  await runTest('Add Teacher', testAddTeacher);
  await runTest('Add Enhanced Student', testAddEnhancedStudent);

  // Email system
  await runTest('Get Email Templates', testEmailTemplates);
  await runTest('Send Bulk Email', testSendBulkEmail);

  // Print results
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ PASSED: ${testResults.passed.length}/${testResults.total}`);
  console.log(`❌ FAILED: ${testResults.failed.length}/${testResults.total}`);
  
  if (testResults.passed.length > 0) {
    console.log('\n✅ WORKING APIS:');
    testResults.passed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ BROKEN APIS:');
    testResults.failed.forEach(test => console.log(`   - ${test.name}: ${test.error}`));
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run tests
runAllTests().catch(console.error);
