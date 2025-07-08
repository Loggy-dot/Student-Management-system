import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/students-report-update');
      setReports(res.data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const header = ['StudentId,StudentName,Course,Grade,Department'];
    const rows = reports.map(r => [r.StudentId, r.StudentName, r.Course, r.Grade, r.Department].join(','));
    const csv = [...header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_reports.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <AlertCircle className="h-6 w-6 text-red-500 mr-2 animate-pulse-slow" />
        <span className="text-red-600 font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="h-8 w-8 text-indigo-600 mr-3" />
          Reports
        </h1>
        <button
          onClick={downloadCSV}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Download className="h-5 w-5" />
          <span>Download CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Student ID','Name','Course','Grade','Department'].map(title => (
                <th
                  key={title}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((r, idx) => (
              <tr key={`${r.StudentId}-${r.Course}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.StudentId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.StudentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.Course}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.Grade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.Department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!reports.length && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No reports available</p>
          <p className="text-sm text-gray-500">Check back later or refresh the page</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
