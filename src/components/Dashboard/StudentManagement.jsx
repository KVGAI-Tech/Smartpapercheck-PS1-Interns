import React, { useState, useEffect } from 'react';
import { 
  Users, Search, FileSpreadsheet, Plus, Filter,
  ChevronDown, ChevronUp, Edit, Trash, X, Upload,
  Download, CheckCircle, AlertCircle
} from 'lucide-react';

const StudentPage = () => {
  
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    year: 'all'
  });
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    course: '',
    year: '',
    status: 'active'
  });

  
  useEffect(() => {
    
    const mockStudents = [
      {
        id: 1,
        name: "Alex Johnson",
        studentId: "2023CS001",
        email: "alex.j@university.edu",
        course: "Computer Science",
        year: "2023",
        status: "active",
        joinDate: "2023-09-01"
      },
      {
        id: 2,
        name: "Sarah Williams",
        studentId: "2023CS002",
        email: "sarah.w@university.edu",
        course: "Data Science",
        year: "2023",
        status: "inactive",
        joinDate: "2023-09-01"
      },
      
    ];
    setStudents(mockStudents);
  }, []);

  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedStudents(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.studentId || !formData.email) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    
    const newStudent = {
      id: students.length + 1,
      ...formData,
      joinDate: new Date().toISOString().split('T')[0]
    };

    setStudents(prev => [...prev, newStudent]);
    setIsAddModalOpen(false);
    showToastMessage('Student added successfully', 'success');
    resetForm();
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      showToastMessage('Student deleted successfully', 'success');
    }
  };

  const handleImport = async (file) => {
    
    setIsImportModalOpen(false);
    showToastMessage('Students imported successfully', 'success');
  };

  const handleExport = () => {
    
    showToastMessage('Data exported successfully', 'success');
  };

  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = (filters.status === 'all' || student.status === filters.status) &&
                          (filters.course === 'all' || student.course === filters.course) &&
                          (filters.year === 'all' || student.year === filters.year);
    
    return matchesSearch && matchesFilters;
  }).sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  
  const showToastMessage = (message, type = 'success') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
  };

  
  const resetForm = () => {
    setFormData({
      name: '',
      studentId: '',
      email: '',
      course: '',
      year: '',
      status: 'active'
    });
  };

  
  const AddModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Student</h2>
          <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAddStudent} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="Enter student's full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Student ID *</label>
            <input
              type="text"
              value={formData.studentId}
              onChange={e => setFormData({...formData, studentId: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="Enter student ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <select
              value={formData.course}
              onChange={e => setFormData({...formData, course: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={formData.year}
              onChange={e => setFormData({...formData, year: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Year</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ImportModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Import Students</h2>
          <button onClick={() => setIsImportModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload size={32} className="mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your CSV file here, or click to browse
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleImport(e.target.files[0])}
          />
          <button className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm">
            Browse Files
          </button>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setIsImportModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => handleImport()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );

  const Toast = () => (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
      showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white flex items-center space-x-2 ${
      showToast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    }`}>
      {showToast.type === 'success' ? (
        <CheckCircle size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span>{showToast.message}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-500 mt-1">Manage and track student information</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload size={16} className="mr-2" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add Student
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filters.course}
                onChange={e => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Engineering">Engineering</option>
              </select>

              <select
                value={filters.year}
                onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'studentId', label: 'Student ID' },
                    { key: 'email', label: 'Email' },
                    { key: 'course', label: 'Course' },
                    { key: 'status', label: 'Status' },
                    { key: 'joinDate', label: 'Join Date' },
                    { key: 'actions', label: 'Actions' }
                  ].map(column => (
                    <th
                      key={column.key}
                      onClick={() => column.key !== 'actions' && handleSort(column.key)}
                      className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.key !== 'actions' ? 'cursor-pointer hover:text-gray-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.key !== 'actions' && sortConfig.key === column.key && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp size={14} /> : 
                            <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectOne(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.course}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.studentId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.course}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.joinDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of{' '}
                  {filteredStudents.length} entries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isAddModalOpen && <AddModal />}
      {isImportModalOpen && <ImportModal />}
      <Toast />
    </div>
  );
};

export default StudentPage;