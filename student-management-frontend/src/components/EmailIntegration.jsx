import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Filter, Calendar, Bell } from 'lucide-react';
import axios from 'axios';

const EmailIntegration = () => {
  const [emailData, setEmailData] = useState({
    recipients: [],
    subject: '',
    message: '',
    recipientType: 'students' // 'students', 'teachers', 'parents', 'custom'
  });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTemplates] = useState([
    {
      id: 'welcome',
      name: 'Welcome Message',
      subject: 'Welcome to Our Institution',
      template: 'Dear {name},\n\nWelcome to our institution! We are excited to have you join our academic community.\n\nBest regards,\nAcademic Administration'
    },
    {
      id: 'grade_notification',
      name: 'Grade Notification',
      subject: 'Grade Update - {course}',
      template: 'Dear {name},\n\nYour grade for {course} has been updated. Please log in to the student portal to view your latest grades.\n\nBest regards,\nAcademic Administration'
    },
    {
      id: 'announcement',
      name: 'General Announcement',
      subject: 'Important Announcement',
      template: 'Dear {name},\n\nWe have an important announcement to share with you.\n\n{announcement}\n\nBest regards,\nAcademic Administration'
    },
    {
      id: 'reminder',
      name: 'Assignment Reminder',
      subject: 'Assignment Due Reminder',
      template: 'Dear {name},\n\nThis is a friendly reminder that your assignment for {course} is due on {due_date}.\n\nBest regards,\nAcademic Administration'
    }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, departmentsRes] = await Promise.all([
        axios.get('http://localhost:10000/api/students/enhanced'),
        axios.get('http://localhost:10000/api/teachers'),
        axios.get('http://localhost:10000/api/departments')
      ]);
      
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      message: template.template
    });
  };

  const getRecipients = () => {
    let recipients = [];
    
    switch (emailData.recipientType) {
      case 'students':
        recipients = students
          .filter(student => !selectedDepartment || student.DepartmentId == selectedDepartment)
          .map(student => ({
            id: student.StudentId,
            name: student.StudentName || `${student.FirstName} ${student.LastName}`,
            email: student.Email,
            type: 'student'
          }));
        break;
      case 'teachers':
        recipients = teachers
          .filter(teacher => !selectedDepartment || teacher.DepartmentId == selectedDepartment)
          .map(teacher => ({
            id: teacher.TeacherId,
            name: `${teacher.FirstName} ${teacher.LastName}`,
            email: teacher.Email,
            type: 'teacher'
          }));
        break;
      default:
        recipients = [];
    }
    
    return recipients.filter(recipient => recipient.email);
  };

  const handleSendEmail = async () => {
    const recipients = getRecipients();
    
    if (recipients.length === 0) {
      alert('No recipients selected or no email addresses available');
      return;
    }

    if (!emailData.subject || !emailData.message) {
      alert('Please fill in both subject and message');
      return;
    }

    setLoading(true);
    
    try {
      const emailPayload = {
        recipients: recipients.map(r => r.email),
        subject: emailData.subject,
        message: emailData.message,
        recipientType: emailData.recipientType,
        departmentId: selectedDepartment
      };

      const response = await axios.post('http://localhost:10000/api/send-bulk-email', emailPayload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert(`Email sent successfully to ${response.data.sentCount} recipients!`);
      } else {
        throw new Error('Failed to send email');
      }
      
      // Reset form
      setEmailData({
        recipients: [],
        subject: '',
        message: '',
        recipientType: 'students'
      });
      
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recipients = getRecipients();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Integration</h1>
            <p className="text-gray-600">Send emails to students, teachers, and parents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Templates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emailTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Email Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Compose Email</h2>
            
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message here..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  You can use placeholders like {'{name}'}, {'{course}'}, {'{due_date}'} in your message
                </p>
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendEmail}
                  disabled={loading || recipients.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Email ({recipients.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients Panel */}
        <div className="space-y-6">
          {/* Recipient Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recipients</h2>
            
            <div className="space-y-4">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to
                </label>
                <select
                  value={emailData.recipientType}
                  onChange={(e) => setEmailData({...emailData, recipientType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="students">All Students</option>
                  <option value="teachers">All Teachers</option>
                  <option value="parents">All Parents</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.DepartmentId} value={dept.DepartmentId}>
                      {dept.DepartmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipients Count */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Recipients</span>
                  <span className="text-lg font-bold text-blue-600">{recipients.length}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {emailData.recipientType === 'students' ? 'Students' : 'Teachers'} with valid email addresses
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Send Announcement</p>
                  <p className="text-sm text-gray-500">Broadcast important news</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Schedule Email</p>
                  <p className="text-sm text-gray-500">Send at specific time</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Bulk Import</p>
                  <p className="text-sm text-gray-500">Import email list</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailIntegration;
