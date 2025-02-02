import React, { useState, useEffect } from 'react';
import { 
  Users, Search, FileText, Plus, Filter,
  ChevronDown, ChevronUp, Edit, Trash, X,
  Download, CheckCircle, AlertCircle, Upload,
  Calendar, Mail, BookOpen, Clock
} from 'lucide-react';

const TeachingAssistantsPage = () => {
  
  const [tas, setTAs] = useState([]);
  const [selectedTAs, setSelectedTAs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [selectedTA, setSelectedTA] = useState(null);
  const [filters, setFilters] = useState({
    course: 'all',
    taskType: 'all',
    status: 'all'
  });
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    taskType: '',
    availability: '',
    experience: ''
  });

  
  useEffect(() => {
    
    const mockTAs = [
      {
        id: 1,
        name: "David Kumar",
        email: "david.k@university.edu",
        course: "Computer Science",
        taskType: "Lab Assistant",
        assignedWork: "Data Structures Lab",
        availability: "20 hrs/week",
        experience: "2 years",
        status: "active",
        startDate: "2023-09-01",
        completedTasks: 15,
        rating: 4.8
      },
      {
        id: 2,
        name: "Priya Shah",
        email: "priya.s@university.edu",
        course: "Data Science",
        taskType: "Grader",
        assignedWork: "ML Assignments",
        availability: "15 hrs/week",
        experience: "1 year",
        status: "active",
        startDate: "2023-09-01",
        completedTasks: 12,
        rating: 4.5
      }
    ];
    setTAs(mockTAs);
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
      setSelectedTAs(filteredTAs.map(ta => ta.id));
    } else {
      setSelectedTAs([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedTAs(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleAddTA = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.course) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    const newTA = {
      id: tas.length + 1,
      ...formData,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      completedTasks: 0,
      rating: 0
    };

    setTAs(prev => [...prev, newTA]);
    setIsAddModalOpen(false);
    showToastMessage('Teaching Assistant added successfully', 'success');
    resetForm();
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    
    setIsAssignTaskModalOpen(false);
    showToastMessage('Task assigned successfully', 'success');
  };

  const handleDeleteTA = (id) => {
    if (window.confirm('Are you sure you want to remove this Teaching Assistant?')) {
      setTAs(prev => prev.filter(ta => ta.id !== id));
      showToastMessage('Teaching Assistant removed successfully', 'success');
    }
  };

  
  const handleExport = () => {
    try {
      
      const headers = ['Name', 'Email', 'Course', 'Task Type', 'Availability', 'Experience', 'Status'];
      const csvContent = [
        headers.join(','),
        ...tas.map(ta => [
          ta.name,
          ta.email,
          ta.course,
          ta.taskType,
          ta.availability,
          ta.experience,
          ta.status
        ].join(','))
      ].join('\n');

      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'teaching_assistants.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      showToastMessage('Data exported successfully', 'success');
    } catch (error) {
      showToastMessage('Failed to export data', 'error');
    }
  };

  
  const filteredTAs = tas.filter(ta => {
    const matchesSearch = ta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ta.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = (filters.course === 'all' || ta.course === filters.course) &&
                          (filters.taskType === 'all' || ta.taskType === filters.taskType) &&
                          (filters.status === 'all' || ta.status === filters.status);
    
    return matchesSearch && matchesFilters;
  }).sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredTAs.length / ITEMS_PER_PAGE);
  const paginatedTAs = filteredTAs.slice(
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
      email: '',
      course: '',
      taskType: '',
      availability: '',
      experience: ''
    });
  };


  
  const AddModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Teaching Assistant</h2>
          <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAddTA} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="Enter TA's full name"
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
            <label className="block text-sm font-medium mb-2">Course *</label>
            <select
              value={formData.course}
              onChange={e => setFormData({...formData, course: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Course</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Task Type</label>
            <select
              value={formData.taskType}
              onChange={e => setFormData({...formData, taskType: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Task Type</option>
              <option value="Lab Assistant">Lab Assistant</option>
              <option value="Grader">Grader</option>
              <option value="Tutor">Tutor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <input
              type="text"
              value={formData.availability}
              onChange={e => setFormData({...formData, availability: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 20 hrs/week"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <input
              type="text"
              value={formData.experience}
              onChange={e => setFormData({...formData, experience: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2 years"
            />
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
              Add TA
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AssignTaskModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Assign Task</h2>
          <button onClick={() => setIsAssignTaskModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAssignTask} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Task Type *</label>
            <select
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Task Type</option>
              <option value="grading">Assignment Grading</option>
              <option value="lab">Lab Assistance</option>
              <option value="tutoring">Tutoring Session</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date *</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter task description..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsAssignTaskModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Assign
            </button>
          </div>
        </form>
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

  
  const StatsCard = ({ icon: Icon, title, value, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-sm mt-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teaching Assistants</h1>
            <p className="text-gray-500 mt-1">Manage and coordinate teaching assistants</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Add TA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Users}
            title="Active TAs"
            value={tas.filter(ta => ta.status === 'active').length}
            trend={5.2}
          />
          <StatsCard
            icon={Clock}
            title="Total Hours/Week"
            value={`${tas.reduce((acc, ta) => acc + parseInt(ta.availability), 0)} hrs`}
            trend={-2.1}
          />
          <StatsCard
            icon={BookOpen}
            title="Courses Covered"
            value={new Set(tas.map(ta => ta.course)).size}
            trend={8.5}
          />
          <StatsCard
            icon={CheckCircle}
            title="Avg Rating"
            value={(tas.reduce((acc, ta) => acc + ta.rating, 0) / tas.length || 0).toFixed(1)}
            trend={3.2}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search TAs by name or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.course}
                onChange={e => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Engineering">Engineering</option>
              </select>

              <select
                value={filters.taskType}
                onChange={e => setFilters(prev => ({ ...prev, taskType: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Grader">Grader</option>
                <option value="Tutor">Tutor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTAs.map(ta => (
            <div key={ta.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {ta.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{ta.name}</h3>
                    <p className="text-sm text-gray-500">{ta.taskType}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ta.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ta.status.charAt(0).toUpperCase() + ta.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  {ta.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {ta.course}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {ta.availability}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Rating</div>
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-medium text-gray-900 mr-2">
                        {ta.rating.toFixed(1)}
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(ta.rating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTA(ta);
                        setIsAssignTaskModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Assign Task"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTA(ta.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Remove TA"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min(((currentPage - 1) * ITEMS_PER_PAGE) + 1, filteredTAs.length)}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTAs.length)}</span> of{' '}
                  <span className="font-medium">{filteredTAs.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && <AddModal />}
      {isAssignTaskModalOpen && selectedTA && <AssignTaskModal />}

      <Toast />
    </div>
  );
};

export default TeachingAssistantsPage;