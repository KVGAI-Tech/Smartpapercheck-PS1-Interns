import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line
} from 'recharts';
import { 
  Download, Filter, Search, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, Award, BookOpen,
  FileSpreadsheet, Upload, Edit2, Trash2,
  Users, GraduationCap, X, Save, Plus
} from 'lucide-react';


const GRADE_WEIGHTS = {
  midterm: 0.30,
  finals: 0.40,
  assignments: 0.30
};

const GRADE_RANGES = {
  'A+': { min: 97, max: 100 },
  'A': { min: 93, max: 96.99 },
  'A-': { min: 90, max: 92.99 },
  'B+': { min: 87, max: 89.99 },
  'B': { min: 83, max: 86.99 },
  'B-': { min: 80, max: 82.99 },
  'C+': { min: 77, max: 79.99 },
  'C': { min: 73, max: 76.99 },
  'C-': { min: 70, max: 72.99 },
  'D': { min: 60, max: 69.99 },
  'E': { min: 50, max: 59.99 },
  'NC': { min: 0, max: 49.99 }
};

const GRADE_COLORS = {
  'A+': '#15803d', 'A': '#16a34a', 'A-': '#22c55e',
  'B+': '#4ade80', 'B': '#86efac', 'B-': '#bbf7d0',
  'C+': '#fde047', 'C': '#facc15', 'C-': '#eab308',
  'D': '#f87171', 'E': '#ef4444', 'NC': '#dc2626'
};


const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
          {footer && (
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const Toast = ({ message, type = 'success', show, onClose }) => {
  if (!show) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      <p>{message}</p>
    </div>
  );
};

const GradeManagement = () => {
  
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  
  const courses = [
    { id: 'CS F111', name: 'Computer Programming', students: 512, avgGrade: 'A-' },
    { id: 'CS F212', name: 'Data Structures', students: 428, avgGrade: 'B+' },
    { id: 'CS F320', name: 'Machine Learning', students: 356, avgGrade: 'A' },
    { id: 'CS F342', name: 'Operating Systems', students: 298, avgGrade: 'B' },
  ];

  const [students, setStudents] = useState([
    { 
      id: '2023001', 
      name: 'Alice Johnson', 
      course: 'CS F111', 
      midterm: 88, 
      finals: 92, 
      assignments: 90, 
      total: 90.5,
      grade: 'A',
      status: 'submitted'
    },
    { 
      id: '2023002', 
      name: 'Bob Smith', 
      course: 'CS F212', 
      midterm: 85, 
      finals: 88, 
      assignments: 87, 
      total: 86.9,
      grade: 'B+',
      status: 'submitted'
    },
    { 
      id: '2023003', 
      name: 'Charlie Brown', 
      course: 'CS F111', 
      midterm: 92, 
      finals: 95, 
      assignments: 94, 
      total: 93.8,
      grade: 'A',
      status: 'pending'
    },
    
  ]);
  
  const calculateTotal = useCallback((midterm, finals, assignments) => {
    return (
      midterm * GRADE_WEIGHTS.midterm +
      finals * GRADE_WEIGHTS.finals +
      assignments * GRADE_WEIGHTS.assignments
    ).toFixed(1);
  }, []);

  const calculateGrade = useCallback((total) => {
    const numTotal = parseFloat(total);
    for (const [grade, range] of Object.entries(GRADE_RANGES)) {
      if (numTotal >= range.min && numTotal <= range.max) {
        return grade;
      }
    }
    return 'NC';
  }, []);

  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAddGrade = (formData) => {
    const total = calculateTotal(
      parseFloat(formData.midterm),
      parseFloat(formData.finals),
      parseFloat(formData.assignments)
    );
    const grade = calculateGrade(total);

    const newStudent = {
      id: `2023${(students.length + 1).toString().padStart(3, '0')}`,
      ...formData,
      total,
      grade,
      status: 'submitted'
    };

    setStudents(prev => [...prev, newStudent]);
    setShowAddModal(false);
    setToast({
      show: true,
      message: 'Grade added successfully',
      type: 'success'
    });
  };

  const handleEditGrade = (formData) => {
    const total = calculateTotal(
      parseFloat(formData.midterm),
      parseFloat(formData.finals),
      parseFloat(formData.assignments)
    );
    const grade = calculateGrade(total);

    setStudents(prev => prev.map(student => 
      student.id === selectedStudent.id
        ? { ...student, ...formData, total, grade, status: 'submitted' }
        : student
    ));
    setShowEditModal(false);
    setToast({
      show: true,
      message: 'Grade updated successfully',
      type: 'success'
    });
  };

  const handleDeleteGrade = () => {
    setStudents(prev => prev.filter(student => student.id !== selectedStudent.id));
    setShowDeleteModal(false);
    setToast({
      show: true,
      message: 'Grade deleted successfully',
      type: 'success'
    });
  };

  const handleImportGrades = (file) => {
    
    setShowImportModal(false);
    setToast({
      show: true,
      message: 'Grades imported successfully',
      type: 'success'
    });
  };

  const handleExportGrades = () => {
    
    setToast({
      show: true,
      message: 'Grades exported successfully',
      type: 'success'
    });
  };

  
  const filteredStudents = useMemo(() => {
    let result = [...students];

    
    if (selectedCourse !== 'all') {
      result = result.filter(student => student.course === selectedCourse);
    }

    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query)
      );
    }

    
    result.sort((a, b) => {
      let comparison = 0;
      if (a[sortConfig.key] < b[sortConfig.key]) comparison = -1;
      if (a[sortConfig.key] > b[sortConfig.key]) comparison = 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, selectedCourse, searchQuery, sortConfig]);

  
  const GradeForm = ({ initialData, onSubmit }) => {
    const [formData, setFormData] = useState(initialData || {
      name: '',
      course: selectedCourse === 'all' ? courses[0].id : selectedCourse,
      midterm: '',
      finals: '',
      assignments: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <select
            value={formData.course}
            onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.id})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Midterm ({GRADE_WEIGHTS.midterm * 100}%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.midterm}
              onChange={(e) => setFormData(prev => ({ ...prev, midterm: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finals ({GRADE_WEIGHTS.finals * 100}%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.finals}
              onChange={(e) => setFormData(prev => ({ ...prev, finals: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignments ({GRADE_WEIGHTS.assignments * 100}%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.assignments}
              onChange={(e) => setFormData(prev => ({ ...prev, assignments: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {initialData ? 'Update Grade' : 'Add Grade'}
          </button>
        </div>
      </form>
    );
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const GradeTable = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Grade Sheet</h2>
            <p className="text-sm text-gray-500">Manage and update student grades</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportGrades}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              <Upload className="w-4 h-4" />
              <span>Import Grades</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Grade</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="current">Current Semester</option>
              <option value="previous">Previous Semester</option>
              <option value="all">All Semesters</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'name', label: 'Student' },
                { key: 'course', label: 'Course' },
                { key: 'midterm', label: 'Midterm' },
                { key: 'finals', label: 'Finals' },
                { key: 'assignments', label: 'Assignments' },
                { key: 'total', label: 'Total' },
                { key: 'grade', label: 'Grade' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
              ].map(column => (
                <th 
                  key={column.key}
                  onClick={() => column.key !== 'actions' && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none
                    ${column.key === sortConfig.key ? 'text-blue-600' : ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.key === sortConfig.key && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src="/api/placeholder/32/32"
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.course}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.midterm}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.finals}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.assignments}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.total}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                    student.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                    student.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'submitted' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowEditModal(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDeleteModal(true);
                      }}
                      className="p-1 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
          <p className="text-gray-500">Manage and analyze student grades across courses</p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-6 border-b border-gray-200 w-full">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'grades', label: 'Grade Sheet', icon: FileSpreadsheet },
                { id: 'analytics', label: 'Analytics', icon: GraduationCap }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className={`flex items-center gap-2 pb-4 transition-colors ${
                    activeView === id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={students.length}
              subtitle="Across all courses"
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Average Grade"
              value={calculateGrade(
                students.reduce((acc, curr) => acc + parseFloat(curr.total), 0) / students.length
              )}
              subtitle="Class average"
              icon={Award}
              color="bg-green-500"
            />
            <StatCard
              title="Grading Progress"
              value={`${Math.round(
                (students.filter(s => s.status === 'submitted').length / students.length) * 100
              )}%`}
              subtitle="Completion rate"
              icon={CheckCircle}
              color="bg-purple-500"
            />
            <StatCard
              title="Pending Grades"
              value={students.filter(s => s.status === 'pending').length}
              subtitle="Require attention"
              icon={AlertCircle}
              color="bg-orange-500"
            />
          </div>

          {activeView === 'grades' && <GradeTable />}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Grade"
      >
        <GradeForm onSubmit={handleAddGrade} />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        title="Edit Grade"
      >
        <GradeForm 
          initialData={selectedStudent} 
          onSubmit={handleEditGrade} 
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStudent(null);
        }}
        title="Delete Grade"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Delete Grade Entry
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete this grade entry? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteGrade}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Grades"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop your CSV or Excel file here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                browse
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={(e) => handleImportGrades(e.target.files[0])} />
              </label>
            </p>
            <p className="text-xs text-gray-400 mt-1">Supported formats: CSV, XLSX, XLS</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Import
            </button>
          </div>
        </div>
      </Modal>

      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Grade Distribution</h2>
                <p className="text-sm text-gray-500">Overall grade breakdown</p>
              </div>
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(gradeDistribution).map(([grade, count]) => ({
                    grade,
                    students: count
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3B82F6">
                    {Object.keys(gradeDistribution).map((grade, index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[grade]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Course Performance</h2>
                <p className="text-sm text-gray-500">Average grades by course</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={courses.map(course => {
                    const courseStudents = students.filter(s => s.course === course.id);
                    const avgTotal = courseStudents.reduce((acc, curr) => acc + parseFloat(curr.total), 0) / courseStudents.length;
                    return {
                      name: course.id,
                      average: avgTotal
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="average" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
                <p className="text-sm text-gray-500">Key statistics and insights</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Class Average', value: `${
                  (students.reduce((acc, curr) => acc + parseFloat(curr.total), 0) / students.length).toFixed(1)
                }%` },
                { label: 'Highest Grade', value: `${
                  Math.max(...students.map(s => parseFloat(s.total))).toFixed(1)
                }%` },
                { label: 'Lowest Grade', value: `${
                  Math.min(...students.map(s => parseFloat(s.total))).toFixed(1)
                }%` },
                { label: 'Standard Deviation', value: `${
                  calculateStandardDeviation(students.map(s => parseFloat(s.total))).toFixed(1)
                }` },
              ].map((metric, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Grade Progression</h2>
                <p className="text-sm text-gray-500">Student performance over time</p>
              </div>
            </div>
            <div className="space-y-4">
              {['Midterm', 'Finals', 'Assignments'].map((assessment, index) => {
                const avg = students.reduce((acc, curr) => acc + parseFloat(curr[assessment.toLowerCase()]), 0) / students.length;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">{assessment}</p>
                      <p className="text-sm font-medium text-gray-900">{avg.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};


const calculateStandardDeviation = (values) => {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

export default GradeManagement;