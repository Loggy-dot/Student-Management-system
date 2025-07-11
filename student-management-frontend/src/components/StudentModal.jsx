import React, { useState, useEffect } from 'react';
import { X, User, Building, BookOpen, Award } from 'lucide-react';
import axios from 'axios';

const StudentModal = ({ isOpen, onClose, student, onSave, departments }) => {
  const [formData, setFormData] = useState({
    StudentId: '',
    StudentName: '',
    Course1: '',
    Grade1: '',
    Course2: '',
    Grade2: '',
    Department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        StudentId: student.StudentId || '',
        StudentName: student.StudentName || '',
        Course1: student.Course1 || '',
        Grade1: student.Grade1 || '',
        Course2: student.Course2 || '',
        Grade2: student.Grade2 || '',
        Department: student.Department || ''
      });
    } else {
      setFormData({
        StudentId: '',
        StudentName: '',
        Course1: '',
        Grade1: '',
        Course2: '',
        Grade2: '',
        Department: ''
      });
    }
    setError('');
  }, [student, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting form data:', formData);

    try {
      if (student) {
        console.log('Updating student:', student.StudentId);
        await axios.put(`http://localhost:10000/api/students-report/${student.StudentId}`, formData);
      } else {
        console.log('Adding new student');
        const response = await axios.post('http://localhost:10000/api/students-report', formData);
        console.log('Student added successfully:', response.data);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving student:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div>
              <label htmlFor="StudentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="number"
                id="StudentId"
                name="StudentId"
                value={formData.StudentId}
                onChange={handleChange}
                disabled={!!student}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>

            {/* Student Name */}
            <div>
              <label htmlFor="StudentName" className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                id="StudentName"
                name="StudentName"
                value={formData.StudentName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Department */}
            <div className="md:col-span-2">
              <label htmlFor="Department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                id="Department"
                name="Department"
                value={formData.Department}
                onChange={handleChange}
                list="departments-list"
                placeholder="Select or type department name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <datalist id="departments-list">
                {departments.map(dept => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>

            {/* Course 1 */}
            <div>
              <label htmlFor="Course1" className="block text-sm font-medium text-gray-700 mb-2">
                Course 1
              </label>
              <input
                type="text"
                id="Course1"
                name="Course1"
                value={formData.Course1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Grade 1 */}
            <div>
              <label htmlFor="Grade1" className="block text-sm font-medium text-gray-700 mb-2">
                Grade 1
              </label>
              <select
                id="Grade1"
                name="Grade1"
                value={formData.Grade1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            {/* Course 2 */}
            <div>
              <label htmlFor="Course2" className="block text-sm font-medium text-gray-700 mb-2">
                Course 2
              </label>
              <input
                type="text"
                id="Course2"
                name="Course2"
                value={formData.Course2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Grade 2 */}
            <div>
              <label htmlFor="Grade2" className="block text-sm font-medium text-gray-700 mb-2">
                Grade 2
              </label>
              <select
                id="Grade2"
                name="Grade2"
                value={formData.Grade2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
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

export default StudentModal;