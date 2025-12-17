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
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import { StudentImportModal, InstructorImportModal } from './modals/ImportModal';
import GradingTab from './tabs/GradingTab';

import {
    fetchApi,
    getCourseDetails,
    getCourseTAs,
    addTA,
    removeTA,
    uploadTAs,
    getCourseStudents,
    addStudent,
    updateStudent,
    removeStudent,
    uploadStudents,
    getCourseExams,
    createExam,
    uploadCourseHandout,
    pollUploadStatus
} from './api';


const addInstructor = async (courseId, data) => {
    try {
        const response = await fetchApi(`/professors/courses/${courseId}/co-instructors`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        throw new Error(error.message || 'Failed to add instructor');
    }
};

const getCourseInstructors = async (courseId) => {
    try {
        const response = await fetchApi(`/professors/courses/${courseId}/co-instructors`);
        return response;
    } catch (error) {
        throw new Error(error.message || 'Failed to get instructors');
    }
};

const uploadInstructors = async (courseId, file) => {
    try {
        const formData = new FormData();
        formData.append('co_instructor_list', file);

        const response = await fetchApi(`/professors/courses/${courseId}/co-instructors/upload`, {
            method: 'POST',
            formData: true,
            body: formData
        });
        return response;
    } catch (error) {
        throw new Error(error.message || 'Failed to upload instructors');
    }
};


const MOCK_COURSE = {
    course_name: "Computer Programming",
    course_code: "CS F111",
    sections: ["A1", "A2", "A3", "B1", "B2"],
    description: "Introduction to Programming Concepts",
    status: "active",
    start_date: "2024-01-01",
    end_date: "2024-05-31"
};

const CourseDetails = () => {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('students');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState('All sections');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStudentImportModal, setShowStudentImportModal] = useState(false);
    const [showInstructorImportModal, setShowInstructorImportModal] = useState(false);
    const [showTAImportModal, setShowTAImportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);
    const [exams, setExams] = useState([]);
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleCreateExam = async (formData) => {
        try {
            const response = await fetchApi(`/professors/courses/${courseId}/exams/`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        } catch (error) {
        }
    };

    const handleUpdateExam = async (examId, formData) => {
        try {
            const response = await fetchApi(`/professors/courses/${courseId}/exams/${examId}/`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
        } catch (error) {
        }
    };

    const handleDeleteExam = async (exam) => {
        try {
            await fetchApi(`/professors/courses/${courseId}/exams/${exam.id}`, {
                method: 'DELETE'
            });
            showToast('Exam deleted successfully');
            // Refresh exams list after successful deletion
            const examsResponse = await getCourseExams(courseId);
            setExams(examsResponse?.data || []);
        } catch (error) {
            if (error.message.includes('NotFoundError')) {
                showToast('Exam not found or already deleted', 'error');
            } else {
                showToast(`Error deleting exam: ${error.message}`, 'error');
            }
        }
    };

    useEffect(() => {
        const loadCourseData = async () => {
            if (!courseId) {
                setError('Invalid course ID');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const courseResponse = await getCourseDetails(courseId);

                if (!courseResponse || !courseResponse.data) {
                    console.warn('Using mock data as fallback');
                    setCourseDetails(MOCK_COURSE);
                } else {
                    setCourseDetails(courseResponse.data);
                }

                try {
                    const [studentsResp, instructorsResp, tasResp, examsResp] = await Promise.all([
                        getCourseStudents(courseId),
                        getCourseInstructors(courseId),
                        getCourseTAs(courseId),
                        getCourseExams(courseId)
                    ]);

                    setStudents(studentsResp?.data || []);
                    setInstructors(instructorsResp?.data || []);
                    setTeachingAssistants(tasResp || []);
                    setExams(examsResp?.data || []);
                } catch (error) {
                    console.error('Error loading related data:', error);
                    showToast('Some course data could not be loaded', 'warning');
                }
            } catch (error) {
                console.error('Error loading course:', error);
                setError(error.message || 'Failed to load course details');
                if (error.message !== 'Course not found') {
                    setCourseDetails(MOCK_COURSE);
                }
                showToast(error.message || 'Error loading course details', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadCourseData();
    }, [courseId]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    const handleEdit = (item, type) => {
        setSelectedItem(item);
        setShowAddModal(true);
    };

    const handleEvaluate = (exam) => {
        setSelectedItem(exam);
        setShowEvaluationModal(true);
    };

    const handleAdd = async (type, data) => {
        try {
            let response;
            switch (type) {
                case 'student':
                    if (data.id) {
                        response = await updateStudent(data);
                        setStudents(prev => prev.map(s => s.id === data.id ? response.data : s));
                        showToast(`Student updated successfully`);
                    } else {
                        response = await addStudent({ ...data, courseId });
                        setStudents(prev => [...prev, response.data]);
                        showToast(`Student added successfully`);
                    }
                    break;
                case 'instructor':
                    response = await addInstructor(courseId, data);
                    setInstructors(prev => [...prev, response.data]);
                    showToast(`Instructor added successfully`);
                    break;
                case 'ta':
                    response = await addTA(courseId, data);
                    setTeachingAssistants(prev => [...prev, response.data]);
                    showToast(`Teaching Assistant added successfully`);
                    break;
                case 'exam':
                    response = await createExam(courseId, data);
                    setExams(prev => [...prev, response.data]);
                    showToast(`Exam added successfully`);
                    break;
                default:
                    throw new Error(`Invalid type: ${type}`);
            }
            setShowAddModal(false);
        } catch (error) {
            showToast(`Error ${data.id ? 'updating' : 'adding'} ${type}: ${error.message}`, 'error');
        }
    };

    const handleImportStudents = async (file) => {
        try {
            setUploadStatus('uploading');
            const response = await uploadStudents(courseId, file);

            const uploadId = response.data.upload_id;
            setUploadStatus('processing');

            pollUploadStatus(
                uploadId,
                null,
                async (data) => {
                    setUploadStatus('completed');
                    const studentsResponse = await getCourseStudents(courseId);
                    setStudents(studentsResponse.data || []);
                    showToast('Students imported successfully');

                    setTimeout(() => {
                        setShowStudentImportModal(false);
                        setUploadStatus(null);
                    }, 2000);
                },
                (error) => {
                    setUploadStatus('failed');
                    showToast(`Error importing students: ${error}`, 'error');
                }
            );
        } catch (error) {
            setUploadStatus('failed');
            showToast(`Error initiating student import: ${error.message}`, 'error');
        }
    };

    const handleImportInstructors = async (file) => {
        try {
            setUploadStatus('uploading');
            const response = await uploadInstructors(courseId, file);

            const uploadId = response.data.upload_id;
            setUploadStatus('processing');

            pollUploadStatus(
                uploadId,
                null,
                async (data) => {
                    setUploadStatus('completed');
                    const instructorsResponse = await getCourseInstructors(courseId);
                    setInstructors(instructorsResponse.data || []);
                    showToast('Instructors imported successfully');

                    setTimeout(() => {
                        setShowInstructorImportModal(false);
                        setUploadStatus(null);
                    }, 2000);
                },
                (error) => {
                    setUploadStatus('failed');
                    showToast(`Error importing instructors: ${error}`, 'error');
                }
            );
        } catch (error) {
            setUploadStatus('failed');
            showToast(`Error initiating instructor import: ${error.message}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            const { type, id } = itemToDelete;
            switch (type) {
                case 'student':
                    await removeStudent(courseId, id);
                    setStudents(prev => prev.filter(item => item.id !== id));
                    break;
                case 'instructor':
                    setInstructors(prev => prev.filter(item => item.id !== id));
                    break;
                case 'ta':
                    await removeTA(courseId, id);
                    setTeachingAssistants(prev => prev.filter(item => item.id !== id));
                    break;
                default:
                    throw new Error(`Invalid delete type: ${type}`);
            }
            setShowDeleteModal(false);
            setItemToDelete(null);
            showToast(`${type} deleted successfully`);
        } catch (error) {
            showToast(`Error deleting ${itemToDelete.type}: ${error.message}`, 'error');
        }
    };

    const getFilteredItems = (items = [], type) => {
        if (!Array.isArray(items)) return [];

        return items.filter(item => {
            const searchFields = [
                item.user_name,
                item.user_email,
                item.roll_number,
                item.id,
                item.name,
                item.email
            ].filter(Boolean);

            return searchFields.some(field =>
                field.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (error && !courseDetails) {
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
                        className="inline-flex items-center text-accent hover:text-accent"
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
                        courseId={courseId}
                        students={getFilteredItems(students, 'student')}
                        sections={courseDetails?.tut_sections || ''}
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
                        onImport={() => setShowStudentImportModal(true)}
                    />
                );

            case 'instructors':
                return (
                    <InstructorsTab
                        courseId={courseId}
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
                        onImport={() => setShowInstructorImportModal(true)}
                    />
                );

            case 'tas':
                return (
                    <TATab
                        courseId={courseId}
                    />
                );

            case 'exams':
                return (
                    <ExamsTab
                        exams={getFilteredItems(exams, 'exam')}
                        courseId={courseId}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onAdd={() => {
                            setSelectedItem(null);
                            setShowAddModal(true);
                        }}
                        onEdit={(exam) => handleEdit(exam, 'exam')}
                        onDelete={handleDeleteExam}
                        onEvaluate={handleEvaluate}
                    />
                );

            case 'grading':
                return <GradingTab maxMarks={100} />;

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
                            <div className="flex items-center gap-3 mb-1">
                                <Link
                                    to="/courses"
                                    className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    aria-label="Back to courses"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                        {courseDetails.course_name}
                                    </h1>
                                    <p className="text-sm text-gray-500">{courseDetails.course_code}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 -mb-px">
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 max-w-full px-4 sm:px-0 sm:flex-nowrap sm:overflow-x-auto sm:whitespace-nowrap">
                            {[
                                { id: 'students', label: 'Students' },
                                { id: 'instructors', label: 'Instructors' },
                                { id: 'tas', label: 'Teaching Assistants' },
                                { id: 'exams', label: 'Exams' },
                                { id: 'grading', label: 'Grading' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSearchQuery('');
                                        setSelectedSection('All sections');
                                    }}
                                    className={`relative -mb-px px-3 py-2 text-sm font-medium rounded-t-lg transition-colors flex-1 basis-1/3 sm:flex-none sm:basis-auto sm:shrink-0
                                        ${activeTab === tab.id
                                            ? 'text-accent border-b-2 border-accent bg-accent/5'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
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
                        courseId={courseId}  
                        onSubmit={(data) => handleAdd('student', data)}
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedItem(null);
                        }}
                        sections={courseDetails.sections}
                    />
                )}                {activeTab === 'instructors' && (
                    <InstructorForm
                        initialData={selectedItem}
                        onSubmit={(data) => handleAdd('instructor', data)}
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedItem(null);
                        }}
                    />
                )}
                {activeTab === 'tas' && (
                    <TAForm
                        initialData={selectedItem}
                        onSubmit={(data) => handleAdd('ta', data)}
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedItem(null);
                        }}
                        sections={courseDetails?.sections}
                    />
                )}
                {activeTab === 'exams' && (
                    <ExamForm
                        initialData={selectedItem}
                        onSubmit={(data) => handleAdd('exam', data)}
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedItem(null);
                        }}
                        instructors={instructors}
                        teachingAssistants={teachingAssistants}
                    />
                )}
            </Modal>

            <StudentImportModal
                isOpen={showStudentImportModal}
                onClose={() => {
                    setShowStudentImportModal(false);
                    setUploadStatus(null);
                }}
                onImport={handleImportStudents}
                courseId={courseId}
                uploadStatus={uploadStatus}
            />

            <InstructorImportModal
                isOpen={showInstructorImportModal}
                onClose={() => {
                    setShowInstructorImportModal(false);
                    setUploadStatus(null);
                }}
                onImport={handleImportInstructors}
                courseId={courseId}
                uploadStatus={uploadStatus}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleDelete}
                itemType={itemToDelete?.type}
                itemName={itemToDelete?.name || itemToDelete?.user_name || `${itemToDelete?.type || 'item'}`}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ show: false, message: '', type: toast.type })}
            />
        </div>
    );
};

export default CourseDetails;