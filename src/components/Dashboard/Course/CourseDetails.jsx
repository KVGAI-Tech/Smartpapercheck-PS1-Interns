import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';


import StudentsTab from './tabs/StudentsTab';
import InstructorsTab from './tabs/InstructorsTab';
import TATab from './tabs/TATab';
import ExamsTab from './tabs/ExamsTab';


import StudentForm from './forms/StudentForm';
import InstructorForm from './forms/InstructorForm';
import TAForm from './forms/TAForm';
import ExamForm from './forms/ExamForm';


import { Modal } from './shared/Modal';  
import Toast from './shared/Toast';
import ImportModal from './modals/ImportModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import EvaluationModal from './modals/EvaluationModal';


import { mockCourses } from './mockData';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All sections');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [exams, setExams] = useState([]);

  
  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const course = mockCourses[courseId];
        if (course) {
          setCourseDetails(course);
          setStudents(course.students || []);
          setInstructors(course.instructors || []);
          setTeachingAssistants(course.teachingAssistants || []);
          setExams(course.exams || []);
        }
      } catch (error) {
        showToast('Error loading course details', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  
  const handleAdd = (type, data) => {
    try {
      const newId = Date.now();
      switch (type) {
        case 'student':
          setStudents(prev => [...prev, { ...data, id: newId }]);
          break;
        case 'instructor':
          setInstructors(prev => [...prev, { ...data, id: newId }]);
          break;
        case 'ta':
          setTeachingAssistants(prev => [...prev, { ...data, id: newId }]);
          break;
        case 'exam':
          setExams(prev => [...prev, { ...data, id: newId }]);
          break;
        default:
          throw new Error(`Invalid type: ${type}`);
      }
      setShowAddModal(false);
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
    } catch (error) {
      showToast(`Error adding ${type}: ${error.message}`, 'error');
    }
  };

  const handleImport = (type, data) => {
    const newItems = data.map((item, index) => ({
      ...item,
      id: Date.now() + index
    }));

    switch (type) {
      case 'student':
        setStudents(prev => [...prev, ...newItems]);
        break;
      case 'instructor':
        setInstructors(prev => [...prev, ...newItems]);
        break;
      case 'ta':
        setTeachingAssistants(prev => [...prev, ...newItems]);
        break;
      default:
        break;
    }
    setShowImportModal(false);
    showToast(`${type}s imported successfully`);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    const { type, id } = itemToDelete;
    switch (type) {
      case 'student':
        setStudents(prev => prev.filter(item => item.id !== id));
        break;
      case 'instructor':
        setInstructors(prev => prev.filter(item => item.id !== id));
        break;
      case 'ta':
        setTeachingAssistants(prev => prev.filter(item => item.id !== id));
        break;
      case 'exam':
        setExams(prev => prev.filter(item => item.id !== id));
        break;
      default:
        break;
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
    showToast(`${type} deleted successfully`);
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setShowAddModal(true);
  };

  const handleEvaluate = (exam) => {
    setSelectedItem(exam);
    setShowEvaluationModal(true);
  };

  
  const getFilteredItems = (items = [], type) => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      const matchesSearch = 
        (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (item.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesSection = selectedSection === 'All sections' || 
        (type === 'student' ? item.section === selectedSection :
         type === 'ta' ? (item.sections?.includes(selectedSection) ?? false) : true);
      
      return matchesSearch && matchesSection;
    });
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  
  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-600 rounded-full p-4 mb-4 inline-block">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-500 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <StudentsTab
            students={getFilteredItems(students, 'student')}
            sections={courseDetails.sections}
            searchQuery={searchQuery}
            selectedSection={selectedSection}
            onSearchChange={setSearchQuery}
            onSectionChange={setSelectedSection}
            onAdd={() => {
              setSelectedItem(null);
              setShowAddModal(true);
            }}
            onEdit={(student) => handleEdit(student, 'student')}
            onDelete={(student) => {
              setItemToDelete({ type: 'student', id: student.id });
              setShowDeleteModal(true);
            }}
            onImport={() => setShowImportModal(true)}
          />
        );

      case 'instructors':
        return (
          <InstructorsTab
            instructors={getFilteredItems(instructors, 'instructor')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={() => {
              setSelectedItem(null);
              setShowAddModal(true);
            }}
            onEdit={(instructor) => handleEdit(instructor, 'instructor')}
            onDelete={(instructor) => {
              setItemToDelete({ type: 'instructor', id: instructor.id });
              setShowDeleteModal(true);
            }}
            onImport={() => setShowImportModal(true)}
          />
        );

      case 'tas':
        return (
          <TATab
            teachingAssistants={getFilteredItems(teachingAssistants, 'ta')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={() => {
              setSelectedItem(null);
              setShowAddModal(true);
            }}
            onEdit={(ta) => handleEdit(ta, 'ta')}
            onDelete={(ta) => {
              setItemToDelete({ type: 'ta', id: ta.id });
              setShowDeleteModal(true);
            }}
            onImport={() => setShowImportModal(true)}
          />
        );

      case 'exams':
        return (
          <ExamsTab
            exams={getFilteredItems(exams, 'exam')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={() => {
              setSelectedItem(null);
              setShowAddModal(true);
            }}
            onEdit={(exam) => handleEdit(exam, 'exam')}
            onDelete={(exam) => {
              setItemToDelete({ type: 'exam', id: exam.id });
              setShowDeleteModal(true);
            }}
            onEvaluate={handleEvaluate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to="/courses"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{courseDetails.name}</h1>
              </div>
              <p className="text-sm text-gray-500">{courseDetails.code}</p>
            </div>
          </div>

          <div className="flex space-x-6 mt-6">
            {[
              { id: 'students', label: 'Students' },
              { id: 'instructors', label: 'Instructors' },
              { id: 'tas', label: 'Teaching Assistants' },
              { id: 'exams', label: 'Exams' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  setSelectedSection('All sections');
                }}
                className={`pb-4 text-sm font-medium transition-colors relative
                  ${activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedItem(null);
        }}
        title={`${selectedItem ? 'Edit' : 'Add'} ${activeTab.slice(0, -1)}`}
      >
        {activeTab === 'students' && (
          <StudentForm
            initialData={selectedItem}
            onSubmit={(data) => handleAdd('student', data)}
            sections={courseDetails.sections}
          />
        )}
        {activeTab === 'instructors' && (
          <InstructorForm
            initialData={selectedItem}
            onSubmit={(data) => handleAdd('instructor', data)}
          />
        )}
        {activeTab === 'tas' && (
          <TAForm
            initialData={selectedItem}
            onSubmit={(data) => handleAdd('ta', data)}
            sections={courseDetails.sections}
          />
        )}
        {activeTab === 'exams' && (
          <ExamForm
            initialData={selectedItem}
            onSubmit={(data) => handleAdd('exam', data)}
            instructors={instructors}
            teachingAssistants={teachingAssistants}
          />
        )}
      </Modal>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(data) => handleImport(activeTab.slice(0, -1), data)}
        type={activeTab}
      />

      <DeleteConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }}
  onConfirm={handleDelete}
  itemType={itemToDelete?.type}
  itemName={itemToDelete?.name || `${itemToDelete?.type || 'item'}`}
/>

<EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        exam={selectedItem}
        instructors={instructors}
        teachingAssistants={teachingAssistants}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default CourseDetails;