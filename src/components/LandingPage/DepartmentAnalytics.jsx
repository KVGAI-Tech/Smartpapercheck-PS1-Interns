import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineAcademicCap, 
  HiOutlineChartBar, 
  HiOutlineChevronDown, 
  HiOutlineChartPie, 
  HiOutlineOfficeBuilding,
  HiOutlineArrowSmUp,
  HiOutlineRefresh,
  HiOutlineBookOpen,
  HiOutlineBeaker,
  HiOutlineLightBulb
} from 'react-icons/hi';

// Enhanced data structure with real institutions and departments
const institutions = [
  { name: 'BITS Pilani', icon: <HiOutlineOfficeBuilding className="w-5 h-5 text-accent" />, color: 'accent' },
  { name: 'IIT Delhi', icon: <HiOutlineOfficeBuilding className="w-5 h-5 text-accent" />, color: 'accent' },
  { name: 'ISB', icon: <HiOutlineOfficeBuilding className="w-5 h-5 text-accent" />, color: 'accent' },
  { name: 'IIM Bangalore', icon: <HiOutlineOfficeBuilding className="w-5 h-5 text-accent" />, color: 'accent' },
];

// Define departments with better icons and metadata
const departmentsByInstitution = {
  'BITS Pilani': [
    { name: 'Computer Science', icon: <HiOutlineAcademicCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Humanities', icon: <HiOutlineBookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Science', icon: <HiOutlineBeaker className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Electrical', icon: <HiOutlineLightBulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ],
  'IIT Delhi': [
    { name: 'Computer Science', icon: <HiOutlineAcademicCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Humanities', icon: <HiOutlineBookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Science', icon: <HiOutlineBeaker className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Electrical', icon: <HiOutlineLightBulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ],
  'ISB': [
    { name: 'Finance', icon: <HiOutlineAcademicCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Marketing', icon: <HiOutlineBookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Operations', icon: <HiOutlineBeaker className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Strategy', icon: <HiOutlineLightBulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ],
  'IIM Bangalore': [
    { name: 'Economics', icon: <HiOutlineAcademicCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Organizational Behavior', icon: <HiOutlineBookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Statistics', icon: <HiOutlineBeaker className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Information Systems', icon: <HiOutlineLightBulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ]
};

// Define courses for each department
const coursesByDepartment = {
  'Computer Science': ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems'],
  'Humanities': ['Technical Writing', 'Professional Ethics', 'Communication Skills', 'History of Technology'],
  'Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  'Electrical': ['Circuit Theory', 'Digital Systems', 'Power Systems', 'Control Systems'],
  'Finance': ['Financial Accounting', 'Corporate Finance', 'Investment Analysis', 'Financial Markets'],
  'Marketing': ['Market Research', 'Consumer Behavior', 'Brand Management', 'Digital Marketing'],
  'Operations': ['Supply Chain Management', 'Project Management', 'Quality Control', 'Operations Research'],
  'Strategy': ['Strategic Management', 'Business Policy', 'Competitive Analysis', 'Corporate Strategy'],
  'Economics': ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics'],
  'Organizational Behavior': ['Leadership', 'Team Management', 'Organizational Theory', 'Change Management'],
  'Statistics': ['Probability Theory', 'Statistical Inference', 'Data Analysis', 'Regression Analysis'],
  'Information Systems': ['Database Management', 'Systems Analysis', 'IT Strategy', 'Business Intelligence']
};

// --- MOCK DATA OVERRIDE START ---
const bitsPilaniCSMockData = {
  'Data Structures': { 
    smartQnA: 76.2, 
    ta: 78.5, 
    students: 145,
    totalAssignments: 8,
    avgGradingTime: '2.3 min'
  },
  'Algorithms': { 
    smartQnA: 81.0, 
    ta: 83.2, 
    students: 132,
    totalAssignments: 6,
    avgGradingTime: '1.8 min'
  },
  'Database Systems': { 
    smartQnA: 74.5, 
    ta: 76.0, 
    students: 118,
    totalAssignments: 5,
    avgGradingTime: '2.1 min'
  },
  'Operating Systems': { 
    smartQnA: 79.8, 
    ta: 81.1,
    students: 156,
    totalAssignments: 7,
    avgGradingTime: '2.7 min'
  }
};

// Complete mock data for all institutions and departments
const completeMockData = {
  'BITS Pilani': {
    'Computer Science': bitsPilaniCSMockData,
    'Humanities': {
      'Technical Writing': { smartQnA: 82.1, ta: 85.3, students: 89, totalAssignments: 4, avgGradingTime: '1.2 min' },
      'Professional Ethics': { smartQnA: 88.2, ta: 90.1, students: 156, totalAssignments: 3, avgGradingTime: '0.9 min' },
      'Communication Skills': { smartQnA: 85.7, ta: 88.4, students: 134, totalAssignments: 5, avgGradingTime: '1.5 min' },
      'History of Technology': { smartQnA: 79.3, ta: 82.8, students: 67, totalAssignments: 4, avgGradingTime: '1.1 min' }
    },
    'Science': {
      'Physics': { smartQnA: 77.8, ta: 80.2, students: 198, totalAssignments: 6, avgGradingTime: '2.4 min' },
      'Chemistry': { smartQnA: 75.4, ta: 78.9, students: 176, totalAssignments: 7, avgGradingTime: '2.8 min' },
      'Mathematics': { smartQnA: 83.2, ta: 86.1, students: 203, totalAssignments: 8, avgGradingTime: '2.1 min' },
      'Biology': { smartQnA: 80.6, ta: 83.7, students: 87, totalAssignments: 5, avgGradingTime: '1.9 min' }
    },
    'Electrical': {
      'Circuit Theory': { smartQnA: 78.9, ta: 82.4, students: 167, totalAssignments: 6, avgGradingTime: '2.5 min' },
      'Digital Systems': { smartQnA: 81.3, ta: 84.1, students: 145, totalAssignments: 7, avgGradingTime: '2.2 min' },
      'Power Systems': { smartQnA: 76.2, ta: 79.8, students: 123, totalAssignments: 5, avgGradingTime: '2.6 min' },
      'Control Systems': { smartQnA: 79.7, ta: 82.9, students: 134, totalAssignments: 6, avgGradingTime: '2.3 min' }
    }
  },
  'IIT Delhi': {
    'Computer Science': {
      'Data Structures': { smartQnA: 85.3, ta: 88.1, students: 234, totalAssignments: 8, avgGradingTime: '1.9 min' },
      'Algorithms': { smartQnA: 87.2, ta: 90.4, students: 218, totalAssignments: 7, avgGradingTime: '2.1 min' },
      'Database Systems': { smartQnA: 83.8, ta: 86.7, students: 198, totalAssignments: 6, avgGradingTime: '2.3 min' },
      'Operating Systems': { smartQnA: 86.1, ta: 89.2, students: 245, totalAssignments: 8, avgGradingTime: '2.0 min' }
    },
    'Humanities': {
      'Technical Writing': { smartQnA: 88.7, ta: 91.2, students: 156, totalAssignments: 4, avgGradingTime: '1.1 min' },
      'Professional Ethics': { smartQnA: 91.3, ta: 94.1, students: 189, totalAssignments: 3, avgGradingTime: '0.8 min' },
      'Communication Skills': { smartQnA: 89.4, ta: 92.6, students: 167, totalAssignments: 5, avgGradingTime: '1.3 min' },
      'History of Technology': { smartQnA: 85.8, ta: 88.9, students: 98, totalAssignments: 4, avgGradingTime: '1.0 min' }
    },
    'Science': {
      'Physics': { smartQnA: 84.2, ta: 87.3, students: 267, totalAssignments: 7, avgGradingTime: '2.2 min' },
      'Chemistry': { smartQnA: 82.1, ta: 85.4, students: 234, totalAssignments: 8, avgGradingTime: '2.5 min' },
      'Mathematics': { smartQnA: 88.9, ta: 91.7, students: 289, totalAssignments: 9, avgGradingTime: '1.8 min' },
      'Biology': { smartQnA: 86.3, ta: 89.1, students: 123, totalAssignments: 6, avgGradingTime: '1.7 min' }
    },
    'Electrical': {
      'Circuit Theory': { smartQnA: 85.4, ta: 88.2, students: 201, totalAssignments: 7, avgGradingTime: '2.1 min' },
      'Digital Systems': { smartQnA: 87.8, ta: 90.6, students: 178, totalAssignments: 8, avgGradingTime: '1.9 min' },
      'Power Systems': { smartQnA: 83.7, ta: 86.9, students: 156, totalAssignments: 6, avgGradingTime: '2.4 min' },
      'Control Systems': { smartQnA: 86.2, ta: 89.1, students: 167, totalAssignments: 7, avgGradingTime: '2.0 min' }
    }
  },
  'ISB': {
    'Finance': {
      'Financial Accounting': { smartQnA: 89.2, ta: 92.1, students: 87, totalAssignments: 5, avgGradingTime: '1.4 min' },
      'Corporate Finance': { smartQnA: 91.3, ta: 94.8, students: 94, totalAssignments: 6, avgGradingTime: '1.6 min' },
      'Investment Analysis': { smartQnA: 87.6, ta: 90.3, students: 76, totalAssignments: 4, avgGradingTime: '1.3 min' },
      'Financial Markets': { smartQnA: 88.9, ta: 91.7, students: 89, totalAssignments: 5, avgGradingTime: '1.5 min' }
    },
    'Marketing': {
      'Market Research': { smartQnA: 86.4, ta: 89.1, students: 67, totalAssignments: 4, avgGradingTime: '1.2 min' },
      'Consumer Behavior': { smartQnA: 88.7, ta: 91.4, students: 78, totalAssignments: 5, avgGradingTime: '1.1 min' },
      'Brand Management': { smartQnA: 90.1, ta: 93.2, students: 72, totalAssignments: 4, avgGradingTime: '1.3 min' },
      'Digital Marketing': { smartQnA: 87.8, ta: 90.6, students: 85, totalAssignments: 6, avgGradingTime: '1.0 min' }
    },
    'Operations': {
      'Supply Chain Management': { smartQnA: 85.9, ta: 88.7, students: 91, totalAssignments: 5, avgGradingTime: '1.8 min' },
      'Project Management': { smartQnA: 89.3, ta: 92.1, students: 98, totalAssignments: 6, avgGradingTime: '1.5 min' },
      'Quality Control': { smartQnA: 87.2, ta: 90.0, students: 67, totalAssignments: 4, avgGradingTime: '1.7 min' },
      'Operations Research': { smartQnA: 83.8, ta: 86.9, students: 78, totalAssignments: 5, avgGradingTime: '2.1 min' }
    },
    'Strategy': {
      'Strategic Management': { smartQnA: 91.7, ta: 94.2, students: 89, totalAssignments: 4, avgGradingTime: '1.2 min' },
      'Business Policy': { smartQnA: 89.4, ta: 92.6, students: 94, totalAssignments: 5, avgGradingTime: '1.4 min' },
      'Competitive Analysis': { smartQnA: 88.1, ta: 90.8, students: 76, totalAssignments: 3, avgGradingTime: '1.1 min' },
      'Corporate Strategy': { smartQnA: 90.6, ta: 93.4, students: 81, totalAssignments: 4, avgGradingTime: '1.3 min' }
    }
  },
  'IIM Bangalore': {
    'Economics': {
      'Microeconomics': { smartQnA: 86.8, ta: 89.4, students: 134, totalAssignments: 6, avgGradingTime: '1.6 min' },
      'Macroeconomics': { smartQnA: 88.2, ta: 91.1, students: 142, totalAssignments: 7, avgGradingTime: '1.8 min' },
      'Econometrics': { smartQnA: 84.7, ta: 87.9, students: 98, totalAssignments: 5, avgGradingTime: '2.2 min' },
      'Development Economics': { smartQnA: 87.3, ta: 90.0, students: 76, totalAssignments: 4, avgGradingTime: '1.4 min' }
    },
    'Organizational Behavior': {
      'Leadership': { smartQnA: 89.1, ta: 91.8, students: 89, totalAssignments: 4, avgGradingTime: '1.0 min' },
      'Team Management': { smartQnA: 87.6, ta: 90.2, students: 94, totalAssignments: 5, avgGradingTime: '1.2 min' },
      'Organizational Theory': { smartQnA: 85.9, ta: 88.7, students: 76, totalAssignments: 3, avgGradingTime: '1.1 min' },
      'Change Management': { smartQnA: 88.4, ta: 91.0, students: 87, totalAssignments: 4, avgGradingTime: '1.3 min' }
    },
    'Statistics': {
      'Probability Theory': { smartQnA: 82.3, ta: 85.8, students: 156, totalAssignments: 7, avgGradingTime: '2.4 min' },
      'Statistical Inference': { smartQnA: 84.9, ta: 87.6, students: 134, totalAssignments: 6, avgGradingTime: '2.1 min' },
      'Data Analysis': { smartQnA: 86.7, ta: 89.2, students: 178, totalAssignments: 8, avgGradingTime: '1.9 min' },
      'Regression Analysis': { smartQnA: 83.1, ta: 86.4, students: 123, totalAssignments: 5, avgGradingTime: '2.3 min' }
    },
    'Information Systems': {
      'Database Management': { smartQnA: 85.2, ta: 88.1, students: 98, totalAssignments: 6, avgGradingTime: '1.8 min' },
      'Systems Analysis': { smartQnA: 87.4, ta: 90.0, students: 87, totalAssignments: 5, avgGradingTime: '1.6 min' },
      'IT Strategy': { smartQnA: 89.8, ta: 92.3, students: 76, totalAssignments: 4, avgGradingTime: '1.2 min' },
      'Business Intelligence': { smartQnA: 86.9, ta: 89.7, students: 94, totalAssignments: 5, avgGradingTime: '1.7 min' }
    }
  }
};
// --- MOCK DATA OVERRIDE END ---

// Enhanced data generation with more realistic patterns and institution/department differences
const generateCourseData = (institution, department, course) => {
  // Check if we have complete mock data for this combination
  const mockData = completeMockData[institution]?.[department]?.[course];
  if (mockData) {
    return mockData;
  }
  
  // Base averages for each institution (TA scores higher, SmartQnA undergrades by 1-5%)
  const institutionBaselines = {
    'BITS Pilani': { ta: 85, smartQnA: 82 },
    'IIT Delhi': { ta: 88, smartQnA: 85 },
    'ISB': { ta: 91, smartQnA: 88 },
    'IIM Bangalore': { ta: 87, smartQnA: 84 }
  };
  
  // Department variations
  const departmentModifiers = {
    'Computer Science': { ta: 2, smartQnA: 1 },
    'Humanities': { ta: 3, smartQnA: 2 },
    'Science': { ta: 1, smartQnA: 0.5 },
    'Electrical': { ta: 2.5, smartQnA: 1.5 },
    'Finance': { ta: 4, smartQnA: 3 },
    'Marketing': { ta: 3.5, smartQnA: 2.5 },
    'Operations': { ta: 2, smartQnA: 1 },
    'Strategy': { ta: 4.5, smartQnA: 3.5 },
    'Economics': { ta: 2.5, smartQnA: 1.5 },
    'Organizational Behavior': { ta: 3, smartQnA: 2 },
    'Statistics': { ta: 1.5, smartQnA: 0.5 },
    'Information Systems': { ta: 2, smartQnA: 1 }
  };
  
  // Course-specific variations
  const courseRandom = {
    ta: (Math.random() * 4) - 2, // -2 to +2 variation
    smartQnA: (Math.random() * 3) - 1.5 // -1.5 to +1.5 variation
  };
  
  // Get institution baseline
  const baseline = institutionBaselines[institution] || { ta: 85, smartQnA: 82 };
  
  // Get department modifier
  const deptMod = departmentModifiers[department] || { ta: 2, smartQnA: 1 };
  
  // Calculate final scores (TA higher than SmartQnA by 1-5%)
  let ta = Math.min(98, Math.max(75, baseline.ta + deptMod.ta + courseRandom.ta));
  let smartQnA = Math.min(95, Math.max(70, baseline.smartQnA + deptMod.smartQnA + courseRandom.smartQnA));
  
  // Ensure TA is higher than SmartQnA (SmartQnA undergrades by 1-5%)
  if (smartQnA >= ta) {
    smartQnA = ta - (1 + Math.random() * 4); // 1-5% lower
  }
  
  // Round to 1 decimal place
  ta = Math.round(ta * 10) / 10;
  smartQnA = Math.round(smartQnA * 10) / 10;
  
  // Generate student data
  const students = Math.floor(Math.random() * 150) + 50; // 50-200 students
  const totalAssignments = Math.floor(Math.random() * 6) + 3; // 3-8 assignments
  const avgGradingTime = (Math.random() * 2 + 0.5).toFixed(1) + ' min'; // 0.5-2.5 min
  
  return { 
    smartQnA, 
    ta, 
    students, 
    totalAssignments, 
    avgGradingTime 
  };
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const selectVariants = {
  initial: { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
  focus: { 
    scale: 1.03,
    boxShadow: '0 4px 20px 0 rgba(0, 200, 255, 0.15)',
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 4px 15px 0 rgba(0, 200, 255, 0.1)',
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
};

const backgroundPulse = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.02, 1],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
  }
};

const barAnimation = {
  initial: { height: 0, opacity: 0.4 },
  animate: (height) => ({
    height: `${height}%`,
    opacity: 1,
    transition: { 
      height: { duration: 1.2, type: 'spring', bounce: 0.3 },
      opacity: { duration: 0.3 }
    }
  })
};

// Enhanced dropdown component with better styling and animations
const CustomSelect = ({ options, value, onChange, icon, label, disabled }) => {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  
  // Get the selected option's icon if available
  const selectedIcon = Array.isArray(options) && options.length > 0 && 
    typeof options[0] !== 'string' && 
    options.find(opt => opt.name === value)?.icon;
  
  return (
    <motion.div
      className="relative w-full"
      variants={fadeInUp}
      animate={focus ? 'focus' : hover ? 'hover' : 'initial'}
      initial="initial"
      onHoverStart={() => !disabled && setHover(true)}
      onHoverEnd={() => !disabled && setHover(false)}
    >
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      <div className={`flex items-center bg-white rounded-2xl border-2 border-gray-100 shadow-lg px-6 py-4 transition-all duration-300 hover:border-accent/30 hover:shadow-xl focus-within:border-accent/40 focus-within:shadow-xl focus-within:ring-4 focus-within:ring-accent/10 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50/50'}`}>
        {(icon || selectedIcon) && <span className="mr-4 flex-shrink-0">{selectedIcon || icon}</span>}
        <select
          className="appearance-none bg-transparent outline-none w-full text-lg font-medium text-gray-800 pr-4 cursor-pointer disabled:cursor-not-allowed"
          value={value}
          onChange={onChange}
          onFocus={() => !disabled && setFocus(true)}
          onBlur={() => !disabled && setFocus(false)}
          disabled={disabled}
        >
          {options.map((opt, idx) => (
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>{opt}</option>
            ) : (
              <option key={opt.name} value={opt.name}>{opt.name}</option>
            )
          ))}
        </select>
        <motion.div 
          className="absolute right-6 text-gray-400 pointer-events-none flex-shrink-0"
          animate={{ rotate: focus ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        >
          <HiOutlineChevronDown className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Animated floating particles background
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-accent/10"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%", 
            opacity: Math.random() * 0.3 + 0.1,
            scale: Math.random() * 1.5 + 0.5
          }}
          animate={{ 
            y: [
              Math.random() * 100 + "%", 
              Math.random() * 100 + "%", 
              Math.random() * 100 + "%"
            ],
            x: [
              Math.random() * 100 + "%", 
              Math.random() * 100 + "%", 
              Math.random() * 100 + "%"
            ],
            opacity: [0.2, 0.5, 0.2],
            scale: [
              Math.random() * 1.5 + 0.5, 
              Math.random() * 2 + 1, 
              Math.random() * 1.5 + 0.5
            ]
          }}
          transition={{ 
            duration: 20 + Math.random() * 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const SingleCourseChart = ({ data, label }) => {
  const smartQnAValue = typeof data?.smartQnA === 'number' ? data.smartQnA : 0;
  const taValue = typeof data?.ta === 'number' ? data.ta : 0;
  const max = Math.max(1, smartQnAValue, taValue);

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-2xl p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500 mt-1">SmartQnA vs TA grading comparison</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-accent" /> SmartQnA
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> TA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">SmartQnA Score</p>
            <p className="text-2xl font-bold text-accent">{smartQnAValue}%</p>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((smartQnAValue / max) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <p className="text-gray-500">Students</p>
              <p className="font-semibold text-gray-800">{data?.students ?? '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <p className="text-gray-500">Assignments</p>
              <p className="font-semibold text-gray-800">{data?.totalAssignments ?? '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <p className="text-gray-500">Avg Time</p>
              <p className="font-semibold text-gray-800">{data?.avgGradingTime ?? '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">TA Score</p>
            <p className="text-2xl font-bold text-gray-700">{taValue}%</p>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((taValue / max) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between bg-accent/5 border border-accent/20 rounded-2xl p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Difference</p>
              <p className="text-sm text-gray-600 mt-1">TA - SmartQnA</p>
            </div>
            <p className={`text-xl font-bold ${taValue - smartQnAValue >= 0 ? 'text-gray-700' : 'text-accent'}`}>
              {(taValue - smartQnAValue > 0 ? '+' : '') + (Math.round((taValue - smartQnAValue) * 10) / 10)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
const DepartmentAnalytics = () => {
  // States for filters and UI
  const [selectedInstitution, setSelectedInstitution] = useState(institutions[0].name);
  const [selectedDepartment, setSelectedDepartment] = useState(departmentsByInstitution[institutions[0].name][0].name);
  const [selectedCourse, setSelectedCourse] = useState(coursesByDepartment[departmentsByInstitution[institutions[0].name][0].name][0]);
  const [isLoading, setIsLoading] = useState(true);
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  
  // Get the current departments based on selected institution
  const currentDepartments = departmentsByInstitution[selectedInstitution] || [];
  
  // Get the current courses based on selected department
  const currentCourses = coursesByDepartment[selectedDepartment] || [];
  
  // Generate data for all courses in the selected department
  const generateAllCoursesData = useCallback(() => {
    // Use mock data for BITS Pilani, Computer Science
    if (
      selectedInstitution === 'BITS Pilani' &&
      selectedDepartment === 'Computer Science'
    ) {
      return currentCourses.map(course => ({
        name: course,
        data: bitsPilaniCSMockData[course] || { smartQnA: 0, ta: 0 },
        isActive: course === selectedCourse
      }));
    }
    // Default: use generated data
    return currentCourses.map(course => ({
      name: course,
      data: generateCourseData(selectedInstitution, selectedDepartment, course),
      isActive: course === selectedCourse
    }));
  }, [selectedInstitution, selectedDepartment, selectedCourse, currentCourses]);
  
  // Get the data for the currently selected course
  const getSelectedCourseData = useCallback(() => {
    return allCoursesData.find(course => course.name === selectedCourse) || {
      name: selectedCourse,
      data: { smartQnA: 0, ta: 0 },
      isActive: true
    };
  }, [allCoursesData, selectedCourse]);
  
  // Load initial data and handle filter changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call with a small delay
    const timer = setTimeout(() => {
      setAllCoursesData(generateAllCoursesData());
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedInstitution, selectedDepartment, selectedCourse, refreshKey, generateAllCoursesData]);
  
  // Update department when institution changes
  useEffect(() => {
    const newDepartments = departmentsByInstitution[selectedInstitution] || [];
    if (newDepartments.length > 0) {
      setSelectedDepartment(newDepartments[0].name);
    }
  }, [selectedInstitution]);
  
  // Update course when department changes
  useEffect(() => {
    const newCourses = coursesByDepartment[selectedDepartment] || [];
    if (newCourses.length > 0) {
      setSelectedCourse(newCourses[0]);
    }
  }, [selectedDepartment]);
  
  // Handle filter changes
  const handleInstitutionChange = (e) => {
    setSelectedInstitution(e.target.value);
  };
  
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };
  
  // Handle data refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Get the selected course data
  const selectedCourseData = getSelectedCourseData();

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (allCoursesData.length === 0) return { 
      avgSmartQnA: 0, 
      avgTA: 0, 
      avgImprovement: 0, 
      count: 0, 
      totalStudents: 0, 
      totalAssignments: 0 
    };
    
    const avgSmartQnA = allCoursesData.reduce((acc, course) => acc + course.data.smartQnA, 0) / allCoursesData.length;
    const avgTA = allCoursesData.reduce((acc, course) => acc + course.data.ta, 0) / allCoursesData.length;
    const avgImprovement = allCoursesData.reduce((acc, course) => acc + (course.data.smartQnA - course.data.ta), 0) / allCoursesData.length;
    const totalStudents = allCoursesData.reduce((acc, course) => acc + course.data.students, 0);
    const totalAssignments = allCoursesData.reduce((acc, course) => acc + course.data.totalAssignments, 0);
    
    return {
      avgSmartQnA: avgSmartQnA.toFixed(1),
      avgTA: avgTA.toFixed(1),
      avgImprovement: avgImprovement.toFixed(1),
      count: allCoursesData.length,
      totalStudents,
      totalAssignments
    };
  };

  const summaryStats = getSummaryStats();

  return (
    <section className="relative py-16 px-4 sm:px-6 md:px-8 lg:px-12 min-h-screen bg-gray-50 overflow-hidden">
      <ParticleBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent/10 text-gray-800 text-base shadow-md font-semibold tracking-wide gap-2 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <HiOutlineChartBar className="w-5 h-5 text-accent" /> Analytics
          </motion.div>
          
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Department <span className="text-accent">Analytics</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Compare grading performance across departments and courses
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              className="flex flex-col justify-center items-center h-64 gap-4"
              exit={{ opacity: 0 }}
              key="loading"
            >
              <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Loading analytics data...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Filters row */}
              <div className="w-full mb-12">
                <motion.div 
                  className="bg-white/70 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                    >
                      <CustomSelect
                        options={institutions}
                        value={selectedInstitution}
                        onChange={handleInstitutionChange}
                        icon={<HiOutlineOfficeBuilding className="w-5 h-5" />}
                        label="Institution"
                      />
                    </motion.div>
                    
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 }}
                    >
                      <CustomSelect
                        options={currentDepartments}
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                        icon={currentDepartments.find(d => d.name === selectedDepartment)?.icon}
                        label="Department"
                        disabled={currentDepartments.length === 0}
                      />
                    </motion.div>
                    
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.2 }}
                    >
                      <CustomSelect
                        options={currentCourses}
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        icon={<HiOutlineAcademicCap className="w-5 h-5 text-accent" />}
                        label="Course"
                        disabled={currentCourses.length === 0}
                      />
                    </motion.div>
                  </div>
                  
                  {/* Refresh button */}
                  <motion.div 
                    className="flex justify-center"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      onClick={handleRefresh}
                      className="flex items-center gap-3 px-6 py-3 bg-accent text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(var(--accent-rgb), 0.25)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HiOutlineRefresh className="w-5 h-5" />
                      <span>Refresh Analytics Data</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Single course chart */}
              <motion.div 
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                layoutId="chart-container"
              >
                {/* Defensive: Only render if data is present */}
                {selectedCourseData && selectedCourseData.data ? (
                  <SingleCourseChart 
                    data={selectedCourseData.data} 
                    label={selectedCourseData.name}
                  />
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    No course data available.
                  </div>
                )}
              </motion.div>
              
              {/* Summary statistics */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Performance Summary</h3>
                  <div className="text-sm text-gray-500">
                    Department: <span className="font-semibold text-gray-700">{selectedDepartment}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Average SmartQnA score */}
                  <div className="bg-accent/5 rounded-xl p-5 shadow-md border border-accent/20">
                    <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Avg. SmartQnA Score</p>
                    <p className="text-3xl font-bold text-accent mb-1">
                      {summaryStats.avgSmartQnA}%
                    </p>
                    <p className="text-xs text-accent">Conservative grading</p>
                  </div>
                  
                  {/* Average TA score */}
                  <div className="bg-gray-50 rounded-xl p-5 shadow-md border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Avg. TA Score</p>
                    <p className="text-3xl font-bold text-gray-600 mb-1">
                      {summaryStats.avgTA}%
                    </p>
                    <p className="text-xs text-gray-500">Manual grading</p>
                  </div>
                  
                  {/* Score difference */}
                  <div className={`rounded-xl p-5 shadow-md border ${summaryStats.avgImprovement < 0 ? 'bg-red-50 border-red-100' : 'bg-accent/5 border-accent/20'}`}>
                    <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Score Difference</p>
                    <p className={`text-3xl font-bold mb-1 ${summaryStats.avgImprovement < 0 ? 'text-red-600' : 'text-accent'}`}>
                      {summaryStats.avgImprovement > 0 ? '+' : ''}
                      {summaryStats.avgImprovement}%
                    </p>
                    <p className={`text-xs ${summaryStats.avgImprovement < 0 ? 'text-red-600' : 'text-accent'}`}>
                      {summaryStats.avgImprovement < 0 ? 'TA scores higher' : 'SmartQnA higher'}
                    </p>
                  </div>
                  
                  {/* Total students */}
                  <div className="bg-accent/5 rounded-xl p-5 shadow-md border border-accent/20">
                    <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Total Students</p>
                    <p className="text-3xl font-bold text-accent mb-1">
                      {summaryStats.totalStudents.toLocaleString()}
                    </p>
                    <p className="text-xs text-accent">Across {summaryStats.count} courses</p>
                  </div>
                  
                  {/* Total assignments */}
                  <div className="bg-gray-50 rounded-xl p-5 shadow-md border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Assignments Graded</p>
                    <p className="text-3xl font-bold text-gray-600 mb-1">
                      {summaryStats.totalAssignments}
                    </p>
                    <p className="text-xs text-gray-500">Total submissions</p>
                  </div>
                  
                  {/* Courses analyzed */}
                  <div className="bg-accent/5 rounded-xl p-5 shadow-md border border-accent/20">
                    <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Courses Analyzed</p>
                    <p className="text-3xl font-bold text-accent mb-1">
                      {summaryStats.count}
                    </p>
                    <p className="text-xs text-accent">Active courses</p>
                  </div>
                </div>

                {/* Key insights */}
                {/* <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 mt-0.5">
                      <HiOutlineLightBulb className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Key Insight</h4>
                      <p className="text-sm text-gray-700">
                        {summaryStats.avgImprovement < 0 ? (
                          <>SmartQnA maintains conservative grading standards, typically scoring {Math.abs(summaryStats.avgImprovement)}% lower than TAs to ensure fairness. Students can always request manual review if they believe their answer deserves higher marks.</>
                        ) : (
                          <>SmartQnA provides consistent grading with {summaryStats.avgImprovement}% higher average scores, indicating improved accuracy in assessment.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div> */}
              </motion.div>
              

              
              {/* Footer message */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <motion.div 
                  className="inline-block py-6 px-8 rounded-2xl bg-accent/5 border border-accent/20 shadow-lg backdrop-blur-lg"
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <HiOutlineLightBulb className="w-6 h-6 text-accent" />
                    <h4 className="text-lg font-bold text-gray-900">Grading Philosophy</h4>
                  </div>
                  <p className="text-gray-700 font-medium text-base md:text-lg max-w-2xl">
                    SmartQnA employs conservative grading standards to ensure fairness and maintain academic integrity. 
                    Students benefit from consistent evaluation criteria and can always request manual review for reassessment.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DepartmentAnalytics;