


const generateId = () => Math.random().toString(36).substr(2, 9);


const generateStudents = (count, sections) => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateId(),
    studentId: `2021A7PS${String(index + 1).padStart(4, '0')}`,
    name: `Student ${index + 1}`,
    email: `student${index + 1}@pilani.bits-pilani.ac.in`,
    section: sections[index % sections.length],
    rollNumber: `BTECH/2021/A7PS${String(index + 1).padStart(4, '0')}`,
    cgpa: (Math.random() * 2 + 8).toFixed(2), 
    attendance: Math.floor(Math.random() * 20 + 80), 
    phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    status: Math.random() > 0.1 ? 'active' : 'inactive'
  }));
};


const generateInstructors = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateId(),
    name: `Dr. Professor ${index + 1}`,
    email: `professor${index + 1}@pilani.bits-pilani.ac.in`,
    department: 'Computer Science',
    designation: index === 0 ? 'Professor & Head' : 'Associate Professor',
    employeeId: `EMP${String(index + 1).padStart(4, '0')}`,
    phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    office: `A-${Math.floor(Math.random() * 500) + 1}`,
    specialization: ['Algorithms', 'Machine Learning', 'Computer Networks', 'Database Systems'][index % 4],
    status: 'active'
  }));
};


const generateTAs = (count, sections) => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateId(),
    name: `TA ${index + 1}`,
    email: `ta${index + 1}@pilani.bits-pilani.ac.in`,
    studentId: `2020A7PS${String(index + 1).padStart(4, '0')}`,
    sections: sections.slice(index % 2, index % 2 + 2), 
    cgpa: (Math.random() * 1 + 9).toFixed(2), 
    phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    department: 'Computer Science',
    experience: Math.floor(Math.random() * 3) + 1, 
    status: 'active',
    availableHours: Math.floor(Math.random() * 10) + 10 
  }));
};


const generateExams = (instructors, tas) => {
  const examTypes = ['Mid Semester', 'End Semester', 'Quiz 1', 'Quiz 2', 'Lab Exam'];
  return examTypes.map((type, index) => ({
    id: generateId(),
    name: type,
    date: new Date(2025, 0, 15 + index * 20).toISOString(), 
    duration: type.includes('Semester') ? 180 : 60, 
    maxMarks: type.includes('Semester') ? 100 : 20,
    weightage: type.includes('Semester') ? 30 : 10,
    venue: `LT-${index + 1}`,
    status: new Date(2025, 0, 15 + index * 20) < new Date() ? 'completed' : 'upcoming',
    invigilators: [
      instructors[index % instructors.length],
      ...tas.slice(index * 2, index * 2 + 2)
    ],
    submissionDeadline: new Date(2025, 0, 22 + index * 20).toISOString(),
    evaluationStatus: {
      total: 512,
      evaluated: Math.floor(Math.random() * 512),
      pending: 0
    }
  }));
};

export const mockCourses = {
  'CS F111': {
    code: 'CS F111',
    name: 'Computer Programming',
    sections: ['A1', 'A2', 'A3', 'B1', 'B2'],
    description: 'Introduction to programming concepts using Python and C++',
    institution: 'Birla Institute of Technology & Science, Pilani',
    duration: '06 Jan, 2025 - 12 May, 2025',
    status: 'ongoing',
    progressPercentage: 45,
    students: generateStudents(512, ['A1', 'A2', 'A3', 'B1', 'B2']),
    instructors: generateInstructors(3),
    teachingAssistants: generateTAs(12, ['A1', 'A2', 'A3', 'B1', 'B2']),
    syllabus: [
      'Introduction to Programming',
      'Variables and Data Types',
      'Control Structures',
      'Functions and Modules',
      'Object-Oriented Programming',
      'File Handling and Exceptions',
      'Data Structures Basics',
      'Algorithm Design'
    ],
    evaluationScheme: {
      midsem: 30,
      endsem: 40,
      quizzes: 20,
      labs: 10
    }
  },
  'CS F212': {
    code: 'CS F212',
    name: 'Data Structures & Algorithms',
    sections: ['A1', 'A2', 'B1', 'B2'],
    description: 'Advanced data structures and algorithm design',
    institution: 'Birla Institute of Technology & Science, Pilani',
    duration: '06 Jan, 2025 - 12 May, 2025',
    status: 'ongoing',
    progressPercentage: 60,
    students: generateStudents(425, ['A1', 'A2', 'B1', 'B2']),
    instructors: generateInstructors(2),
    teachingAssistants: generateTAs(8, ['A1', 'A2', 'B1', 'B2']),
    syllabus: [
      'Algorithm Analysis',
      'Arrays and Linked Lists',
      'Stacks and Queues',
      'Trees and Graphs',
      'Searching and Sorting',
      'Dynamic Programming',
      'Graph Algorithms',
      'Advanced Data Structures'
    ],
    evaluationScheme: {
      midsem: 25,
      endsem: 40,
      quizzes: 25,
      labs: 10
    }
  }
};


export const findCourse = (courseCode) => {
  if (!courseCode) return null;
  
  
  const normalizedCode = courseCode.trim();
  
  
  if (mockCourses[normalizedCode]) {
    return mockCourses[normalizedCode];
  }
  
  
  const decodedCode = decodeURIComponent(normalizedCode);
  if (mockCourses[decodedCode]) {
    return mockCourses[decodedCode];
  }
  
  return null;
};


Object.keys(mockCourses).forEach(courseCode => {
  const course = mockCourses[courseCode];
  course.exams = generateExams(course.instructors, course.teachingAssistants);
});