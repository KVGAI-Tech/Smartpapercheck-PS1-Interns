import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    MoreVertical,
    Download,
    Users,
    Pencil,
    Trash2,
    School,
    Calendar,
    X,
    CheckCircle,
    BookOpen,
    GraduationCap,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const sampleCourses = [
    {
        id: 1,
        code: 'CS F111',
        name: 'Computer Programming',
        institution: 'Birla Institute of Technology & Science, Pilani',
        duration: '06 Jan, 2025 - 12 May, 2025',
        tas: 12,
        students: 512,
        status: 'ongoing',
        description: 'Introduction to programming concepts using Python and C++',
        progressPercentage: 45,
    },
    {
        id: 2,
        code: 'CS F212',
        name: 'Data Structures & Algorithms',
        institution: 'Birla Institute of Technology & Science, Pilani',
        duration: '06 Jan, 2025 - 12 May, 2025',
        tas: 8,
        students: 425,
        status: 'ongoing',
        description: 'Advanced data structures and algorithm design',
        progressPercentage: 60,
    },
    {
        id: 3,
        code: 'CS F213',
        name: 'Object Oriented Programming',
        institution: 'Birla Institute of Technology & Science, Pilani',
        duration: '15 Jan, 2025 - 20 May, 2025',
        tas: 6,
        students: 380,
        status: 'ongoing',
        description: 'OOP concepts using Java and design patterns',
        progressPercentage: 30,
    },
    {
        id: 4,
        code: 'CS F241',
        name: 'Database Systems',
        institution: 'Birla Institute of Technology & Science, Pilani',
        duration: '01 Aug, 2024 - 30 Nov, 2024',
        tas: 10,
        students: 445,
        status: 'completed',
        description: 'Relational databases and SQL',
        progressPercentage: 100,
    },
    {
        id: 5,
        code: 'CS F342',
        name: 'Computer Networks',
        institution: 'Birla Institute of Technology & Science, Pilani',
        duration: '01 Aug, 2024 - 30 Nov, 2024',
        tas: 7,
        students: 390,
        status: 'completed',
        description: 'Network protocols and architecture',
        progressPercentage: 100,
    }
];

const CourseCard = ({ course, onEdit, onRemove }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isHovered, setIsHovered] = useState(false);


    return (
        <div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowDropdown(false);
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
                        {course.status === 'ongoing' ? (
                            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                                Ongoing
                            </span>
                        ) : (
                            <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full">
                                Completed
                            </span>
                        )}
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                    {course.status === 'ongoing' && (
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${course.progressPercentage}%` }}
                            />
                        </div>
                    )}
                </div>
                <div className="relative ml-4">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
                            <button
                                onClick={() => {
                                    onEdit(course);
                                    setShowDropdown(false);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Pencil className="w-4 h-4" />
                                <span>Edit Course</span>
                            </button>
                            <button
                                onClick={() => {
                                    onRemove(course);
                                    setShowDropdown(false);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove Course</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                    <School className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{course.institution}</span>
                </div>
                <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{course.duration}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(3, course.tas))].map((_, i) => (
                            <img
                                key={i}
                                src="/api/placeholder/32/32"
                                alt="TA"
                                className="w-8 h-8 rounded-full border-2 border-white"
                            />
                        ))}
                        {course.tas > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{course.tas - 3}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{course.students} Students</span>
                    </div>
                </div>
                {isHovered && course.status === 'ongoing' && (
                    <button
                        onClick={() => {
                            const encodedCode = encodeURIComponent(course.code);
                            console.log('Navigating to course:', course.code);
                            console.log('Encoded URL:', `/courses/${encodedCode}`);
                            navigate(`/courses/${encodedCode}`);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View Details →
                    </button>
                )}


            </div>
        </div>
    );
};

const Modal = ({ title, children, onClose, footer }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        
        return () => { };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="fixed inset-0 bg-black opacity-50" />

            <div
                className="relative w-full max-w-lg bg-white rounded-lg shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};


const CourseForm = ({ course, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Course Code
                    </label>
                    <input
                        type="text"
                        defaultValue={course?.code}
                        placeholder="e.g., CS F111"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        defaultValue={course?.status || 'ongoing'}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Course Name
                    </label>
                    <input
                        type="text"
                        defaultValue={course?.name}
                        placeholder="Enter course name"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        rows="3"
                        defaultValue={course?.description}
                        placeholder="Brief description of the course"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Institution
                    </label>
                    <input
                        type="text"
                        defaultValue={course?.institution}
                        placeholder="Enter institution name"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Start Date
                    </label>
                    <input
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                        End Date
                    </label>
                    <input
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Number of TAs
                    </label>
                    <input
                        type="number"
                        min="0"
                        defaultValue={course?.tas}
                        placeholder="0"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Number of Students
                    </label>
                    <input
                        type="number"
                        min="0"
                        defaultValue={course?.students}
                        placeholder="0"
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>
            </div>
        </form>
    );
};


const Toast = ({ show, message, type = 'success' }) => {
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const Icon = type === 'success' ? CheckCircle : X;

    return (
        <div
            className={`fixed bottom-4 right-4 transform transition-all duration-300 ease-in-out
                ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}
        >
            <div
                className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2`}
            >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
};

const Courses = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTab, setCurrentTab] = useState('ongoing');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState(sampleCourses);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setShowAddModal(true);
    };

    const handleRemove = (course) => {
        setSelectedCourse(course);
        setShowRemoveModal(true);
    };

    const filteredCourses = courses.filter(course =>
        course.status === currentTab &&
        (searchQuery === '' ||
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSuccessToast = () => {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Courses</h1>
                        <p className="text-gray-500">Manage your courses and teaching assistants</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.location.href = '/export'}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export</span>
                        </button>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Course</span>
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setCurrentTab('ongoing')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${currentTab === 'ongoing'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Ongoing
                        </button>
                        <button
                            onClick={() => setCurrentTab('completed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${currentTab === 'completed'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Completed
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all duration-200"
                        />
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEdit={handleEdit}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No {currentTab} courses found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? "Try adjusting your search terms"
                                : "Get started by adding your first course"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Course</span>
                            </button>
                        )}
                    </div>
                )}

                {showAddModal && (
                    <Modal
                        title={selectedCourse ? "Edit Course" : "Add New Course"}
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedCourse(null);
                        }}
                        footer={
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        handleSuccessToast();
                                        setSelectedCourse(null);
                                    }}
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {selectedCourse ? 'Save Changes' : 'Add Course'}
                                </button>
                            </>
                        }
                    >
                        <CourseForm course={selectedCourse} />
                    </Modal>
                )}

                {showRemoveModal && selectedCourse && (
                    <Modal
                        title="Remove Course"
                        onClose={() => {
                            setShowRemoveModal(false);
                            setSelectedCourse(null);
                        }}
                        footer={
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowRemoveModal(false)}
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRemoveModal(false);
                                        handleSuccessToast();
                                        setSelectedCourse(null);
                                    }}
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Remove Course
                                </button>
                            </>
                        }
                    >
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-5">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    Remove "{selectedCourse.name}"?
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to remove this course? This action cannot be undone
                                        and all associated data will be permanently deleted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                <Toast
                    show={showSuccessToast}
                    message={`Course successfully ${selectedCourse ? 'updated' : 'added'}!`}
                />
            </div>
        </div>
    );
};

export default Courses;
