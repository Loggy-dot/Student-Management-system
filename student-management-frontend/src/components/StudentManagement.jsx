import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import StudentModal from './StudentModal';
import LoadingSpinner from './LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, studentId: null, studentName: '' });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/students-report`);
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error fetching students. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/departments`);
      const departmentNames = response.data.map(dept => dept.DepartmentName);
      setDepartments(departmentNames);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.StudentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.StudentId.toString().includes(searchTerm)
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(student => student.Department === selectedDepartment);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedDepartment]);

  const handleAddStudent = () => {
    console.log('Add student button clicked');
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    console.log('Edit student:', student);
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = (student) => {
    setConfirmDialog({
      isOpen: true,
      studentId: student.StudentId,
      studentName: student.StudentName
    });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/students-report/${confirmDialog.studentId}`);
      fetchStudents();
      window.showToast && window.showToast(`Student ${confirmDialog.studentName} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting student:', error);
      window.showToast && window.showToast('Failed to delete student', 'error');
    } finally {
      setConfirmDialog({ isOpen: false, studentId: null, studentName: '' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleSaveStudent = () => {
    fetchStudents();
    handleCloseModal();
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading students..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
            <p className="text-gray-600">Manage and track student records</p>
          </div>

          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{filteredStudents.length}</p>
            <p className="text-sm text-gray-500">of {students.length} students</p>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course 2
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.StudentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.StudentName}</div>
                      <div className="text-sm text-gray-500">ID: {student.StudentId}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.Department}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.Course1}</div>
                    <div className="text-sm text-gray-500">Grade: {student.Grade1}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.Course2}</div>
                    <div className="text-sm text-gray-500">Grade: {student.Grade2}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="text-red-600 hover:text-red-900"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">No students found</p>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        student={selectedStudent}
        onSave={handleSaveStudent}
        departments={departments}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Student"
        message={`Are you sure you want to delete ${confirmDialog.studentName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, studentId: null, studentName: '' })}
      />
    </div>
  );
};

export default StudentManagement;