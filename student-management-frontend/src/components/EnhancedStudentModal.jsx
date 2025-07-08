import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Upload, Camera } from 'lucide-react';
import axios from 'axios';

const EnhancedStudentModal = ({ isOpen, onClose, student, onSave, departments }) => {
  const [formData, setFormData] = useState({
    StudentId: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    DateOfBirth: '',
    Address: '',
    EmergencyContact: '',
    EmergencyPhone: '',
    DepartmentId: '',
    AcademicYear: '',
    Semester: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        StudentId: student.StudentId || '',
        FirstName: student.FirstName || '',
        LastName: student.LastName || '',
        Email: student.Email || '',
        Phone: student.Phone || '',
        DateOfBirth: student.DateOfBirth || '',
        Address: student.Address || '',
        EmergencyContact: student.EmergencyContact || '',
        EmergencyPhone: student.EmergencyPhone || '',
        DepartmentId: student.DepartmentId || '',
        AcademicYear: student.AcademicYear || '',
        Semester: student.Semester || ''
      });
      setPreviewUrl(student.ProfilePicture ? `http://localhost:5000${student.ProfilePicture}` : null);
    } else {
      setFormData({
        StudentId: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: '',
        DateOfBirth: '',
        Address: '',
        EmergencyContact: '',
        EmergencyPhone: '',
        DepartmentId: '',
        AcademicYear: new Date().getFullYear().toString(),
        Semester: 'Fall'
      });
      setPreviewUrl(null);
    }
    setError('');
    setProfilePicture(null);
  }, [student, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Add profile picture if selected
      if (profilePicture) {
        submitData.append('profilePicture', profilePicture);
      }

      if (student) {
        // Update existing student
        await axios.put(`http://localhost:5000/api/students/enhanced/${student.StudentId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Add new student
        await axios.post('http://localhost:5000/api/students/enhanced', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving student:', err);
      setError(err.response?.data?.error || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              {student ? 'Edit Student' : 'Add New Student'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Upload className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-500">Upload a profile picture (optional)</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="StudentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="text"
                id="StudentId"
                name="StudentId"
                value={formData.StudentId}
                onChange={handleChange}
                disabled={!!student}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="FirstName"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="LastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="LastName"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="Email" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4" />
                <span>Email *</span>
              </label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="Phone" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                id="Phone"
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="DateOfBirth" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                id="DateOfBirth"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="Address" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              <span>Address</span>
            </label>
            <textarea
              id="Address"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="EmergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="EmergencyContact"
                name="EmergencyContact"
                value={formData.EmergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="EmergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                id="EmergencyPhone"
                name="EmergencyPhone"
                value={formData.EmergencyPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="DepartmentId" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="DepartmentId"
                name="DepartmentId"
                value={formData.DepartmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.DepartmentId} value={dept.DepartmentId}>
                    {dept.DepartmentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="AcademicYear" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                id="AcademicYear"
                name="AcademicYear"
                value={formData.AcademicYear}
                onChange={handleChange}
                placeholder="2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="Semester" className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                id="Semester"
                name="Semester"
                value={formData.Semester}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Semester</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                student ? 'Update Student' : 'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedStudentModal;
