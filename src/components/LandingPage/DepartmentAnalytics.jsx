import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BarChart2,
  ChevronDown,
  PieChart,
  Building2,
  ArrowUp,
  RefreshCw,
  FlaskConical,
  Lightbulb,
  LayoutGrid,
  BookOpen,
  Check
} from 'lucide-react';

// Enhanced data structure with real institutions and departments
const institutions = [
  { name: 'BITS Pilani', icon: <Building2 className="w-5 h-5 text-accent" />, color: 'accent' },
  { name: 'IIT Delhi', icon: <Building2 className="w-5 h-5 text-accent" />, color: 'accent' },
  { name: 'ISB', icon: <Building2 className="w-5 h-5 text-accent" />, color: 'accent' },
  { name: 'IIM Bangalore', icon: <Building2 className="w-5 h-5 text-accent" />, color: 'accent' },
];

// Define departments with better icons and metadata
const departmentsByInstitution = {
  'BITS Pilani': [
    { name: 'Computer Science', icon: <GraduationCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Humanities', icon: <BookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Science', icon: <FlaskConical className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Electrical', icon: <Lightbulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ],
  'IIT Delhi': [
    { name: 'Computer Science', icon: <GraduationCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Humanities', icon: <BookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Science', icon: <FlaskConical className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Electrical', icon: <Lightbulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ],
  'ISB': [
    { name: 'Finance', icon: <GraduationCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Marketing', icon: <BookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Operations', icon: <FlaskConical className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Strategy', icon: <Lightbulb className="w-5 h-5 text-accent" />, color: 'accent' },
  ],
  'IIM Bangalore': [
    { name: 'Economics', icon: <GraduationCap className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Organizational Behavior', icon: <BookOpen className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Statistics', icon: <FlaskConical className="w-5 h-5 text-accent" />, color: 'accent' },
    { name: 'Information Systems', icon: <Lightbulb className="w-5 h-5 text-accent" />, color: 'accent' },
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
  'Data Structures': { smartQnA: 76.2, ta: 78.5, students: 145, totalAssignments: 8, avgGradingTime: '2.3 min' },
  'Algorithms': { smartQnA: 81.0, ta: 83.2, students: 132, totalAssignments: 6, avgGradingTime: '1.8 min' },
  'Database Systems': { smartQnA: 74.5, ta: 76.0, students: 118, totalAssignments: 5, avgGradingTime: '2.1 min' },
  'Operating Systems': { smartQnA: 79.8, ta: 81.1, students: 156, totalAssignments: 7, avgGradingTime: '2.7 min' }
};

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

const generateCourseData = (institution, department, course) => {
  const mockData = completeMockData[institution]?.[department]?.[course];
  if (mockData) return mockData;
  
  const institutionBaselines = {
    'BITS Pilani': { ta: 85, smartQnA: 82 },
    'IIT Delhi': { ta: 88, smartQnA: 85 },
    'ISB': { ta: 91, smartQnA: 88 },
    'IIM Bangalore': { ta: 87, smartQnA: 84 }
  };
  
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
  
  const courseRandom = { ta: (Math.random() * 4) - 2, smartQnA: (Math.random() * 3) - 1.5 };
  const baseline = institutionBaselines[institution] || { ta: 85, smartQnA: 82 };
  const deptMod = departmentModifiers[department] || { ta: 2, smartQnA: 1 };
  
  let ta = Math.min(98, Math.max(75, baseline.ta + deptMod.ta + courseRandom.ta));
  let smartQnA = Math.min(95, Math.max(70, baseline.smartQnA + deptMod.smartQnA + courseRandom.smartQnA));
  
  if (smartQnA >= ta) smartQnA = ta - (1 + Math.random() * 4);
  
  ta = Math.round(ta * 10) / 10;
  smartQnA = Math.round(smartQnA * 10) / 10;
  
  const students = Math.floor(Math.random() * 150) + 50;
  const totalAssignments = Math.floor(Math.random() * 6) + 3;
  const avgGradingTime = (Math.random() * 2 + 0.5).toFixed(1) + ' min';
  
  return { smartQnA, ta, students, totalAssignments, avgGradingTime };
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const CustomSelect = ({ options, value, onChange, icon, label, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const selectedIcon = Array.isArray(options) && options.length > 0 && 
    typeof options[0] !== 'string' && 
    options.find(opt => opt.name === value)?.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
    setIsOpen(false);
  };
  
  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="block text-[11px] md:text-[13px] font-bold text-slate-600 mb-1 md:mb-2 uppercase tracking-wider ml-1">
        {label}
      </label>
      
      <div className="group relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between bg-white py-2.5 md:py-3.5 pl-10 md:pl-12 pr-4 md:pr-5 rounded-xl border-2 outline-none transition-all duration-300 ease-out z-10 relative
            ${disabled 
              ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400' 
              : isOpen 
                ? 'border-accent ring-4 ring-accent/15 shadow-lg shadow-accent/15 -translate-y-1 text-slate-800' 
                : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-1 text-slate-800'
            }
          `}
        >
          <div className="pointer-events-none absolute left-3 md:left-4 flex items-center text-accent">
            {selectedIcon || icon}
          </div>
          <span className="text-base md:text-lg font-medium truncate">{value}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-400">
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 w-full mt-1 md:mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto py-1">
                {options.map((opt, idx) => {
                  const optName = typeof opt === 'string' ? opt : opt.name;
                  const optIcon = typeof opt === 'string' ? null : opt.icon;
                  const isSelected = value === optName;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(optName)}
                      className={`w-full text-left px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base font-normal flex items-center justify-between transition-colors duration-150
                        ${isSelected ? 'bg-accent/10 text-accent font-medium' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        {optIcon && <span className={isSelected ? 'text-accent' : 'text-slate-400'}>{optIcon}</span>}
                        <span>{optName}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 text-accent" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

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
            y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
            x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
            opacity: [0.2, 0.5, 0.2],
            scale: [Math.random() * 1.5 + 0.5, Math.random() * 2 + 1, Math.random() * 1.5 + 0.5]
          }}
          transition={{ duration: 20 + Math.random() * 30, repeat: Infinity, ease: "easeInOut" }}
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
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl md:rounded-3xl border border-gray-200 shadow-2xl p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500 mt-1">Smart Paper Check vs TA grading comparison</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            Smart Paper Check
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
            TA
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md px-5 py-4">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">Smart Paper Check Score</p>
              <p className="text-2xl md:text-3xl font-bold text-accent">{smartQnAValue}%</p>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((smartQnAValue / max) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center bg-accent/5 border border-accent/20 rounded-2xl px-4 py-4 min-w-[120px]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Difference</span>
            <span className="text-3xl font-bold text-accent leading-none my-1">{Math.abs((taValue - smartQnAValue).toFixed(1))}%</span>
            <span className="text-xs text-slate-500">
              {taValue > smartQnAValue ? "TA Higher" : taValue < smartQnAValue ? "Smart Paper Check Higher" : "Scores Equal"}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md px-5 py-4">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">TA Score</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-700">{taValue}%</p>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gray-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((taValue / max) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4">
          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-4 text-center shadow-sm">
            <div className="text-lg md:text-2xl font-bold text-accent">{data?.students ?? "-"}</div>
            <div className="text-[10px] md:text-sm text-slate-500 mt-1">Students</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-4 text-center shadow-sm">
            <div className="text-lg md:text-2xl font-bold text-accent">{data?.totalAssignments ?? "-"}</div>
            <div className="text-[10px] md:text-sm text-slate-500 mt-1">Assignments</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-4 text-center shadow-sm">
            <div className="text-lg md:text-2xl font-bold text-accent">{data?.avgGradingTime ?? "-"}</div>
            <div className="text-[10px] md:text-sm text-slate-500 mt-1">Avg Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DepartmentAnalytics = () => {
  const [selectedInstitution, setSelectedInstitution] = useState(institutions[0].name);
  const [selectedDepartment, setSelectedDepartment] = useState(departmentsByInstitution[institutions[0].name][0].name);
  const [selectedCourse, setSelectedCourse] = useState(coursesByDepartment[departmentsByInstitution[institutions[0].name][0].name][0]);
  const [isLoading, setIsLoading] = useState(true);
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPhilosophyExpanded, setIsPhilosophyExpanded] = useState(false);
  
  const currentDepartments = departmentsByInstitution[selectedInstitution] || [];
  const currentCourses = coursesByDepartment[selectedDepartment] || [];
  
  const generateAllCoursesData = useCallback(() => {
    if (selectedInstitution === 'BITS Pilani' && selectedDepartment === 'Computer Science') {
      return currentCourses.map(course => ({
        name: course,
        data: bitsPilaniCSMockData[course] || { smartQnA: 0, ta: 0 },
        isActive: course === selectedCourse
      }));
    }
    return currentCourses.map(course => ({
      name: course,
      data: generateCourseData(selectedInstitution, selectedDepartment, course),
      isActive: course === selectedCourse
    }));
  }, [selectedInstitution, selectedDepartment, selectedCourse, currentCourses]);
  
  const getSelectedCourseData = useCallback(() => {
    return allCoursesData.find(course => course.name === selectedCourse) || {
      name: selectedCourse,
      data: { smartQnA: 0, ta: 0 },
      isActive: true
    };
  }, [allCoursesData, selectedCourse]);
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setAllCoursesData(generateAllCoursesData());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedInstitution, selectedDepartment, selectedCourse, refreshKey, generateAllCoursesData]);
  
  useEffect(() => {
    const newDepartments = departmentsByInstitution[selectedInstitution] || [];
    if (newDepartments.length > 0) setSelectedDepartment(newDepartments[0].name);
  }, [selectedInstitution]);
  
  useEffect(() => {
    const newCourses = coursesByDepartment[selectedDepartment] || [];
    if (newCourses.length > 0) setSelectedCourse(newCourses[0]);
  }, [selectedDepartment]);
  
  const handleInstitutionChange = (e) => setSelectedInstitution(e.target.value);
  const handleDepartmentChange = (e) => setSelectedDepartment(e.target.value);
  const handleCourseChange = (e) => setSelectedCourse(e.target.value);
  const handleRefresh = () => setRefreshKey(prev => prev + 1);
  
  const selectedCourseData = getSelectedCourseData();

  const getSummaryStats = () => {
    if (allCoursesData.length === 0) return { avgSmartQnA: 0, avgTA: 0, avgImprovement: 0, count: 0, totalStudents: 0, totalAssignments: 0 };
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

    <section className="relative py-12 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-gray-50 overflow-hidden">

      <ParticleBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-2 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent/10 text-gray-800 text-base shadow-md font-semibold tracking-wide gap-2 mb-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BarChart2 className="w-5 h-5 text-accent" /> Analytics
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 md:mb-2 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Department <span className="text-accent">Analytics</span>
          </motion.h2>
          
          <motion.p 
            className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto font-medium"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full pt-1 mb-3 md:mb-10">
                <motion.div 
                  className="bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md border border-slate-200 p-4 md:p-6 lg:p-8 transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2 lg:gap-6 items-end">
                    <CustomSelect options={institutions} value={selectedInstitution} onChange={handleInstitutionChange} icon={<Building2 className="w-5 h-5" />} label="Institution" />
                    <CustomSelect options={currentDepartments} value={selectedDepartment} onChange={handleDepartmentChange} icon={<LayoutGrid className="w-5 h-5" />} label="Department" disabled={currentDepartments.length === 0} />
                    <CustomSelect options={currentCourses} value={selectedCourse} onChange={handleCourseChange} icon={<BookOpen className="w-5 h-5" />} label="Course" disabled={currentCourses.length === 0} />
                  
                    <div className="w-full flex justify-center lg:justify-end mt-2 lg:mt-0">
                      <button
                        onClick={handleRefresh}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 font-medium text-[15px] border-2 border-accent shrink-0"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Update Data</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mb-6 md:mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                layoutId="chart-container"
              >
                {selectedCourseData && selectedCourseData.data ? (
                  <SingleCourseChart data={selectedCourseData.data} label={selectedCourseData.name} />
                ) : (
                  <div className="text-center text-gray-400 py-12">No course data available.</div>
                )}
              </motion.div>
              
              <motion.div
                className="mb-6 md:mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="mb-3 md:mb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Performance Summary</h2>
                  <span className="hidden sm:inline text-slate-300 font-medium">—</span>
                  <span className="text-sm md:text-base font-medium text-slate-500">
                    <span className="font-semibold text-slate-700">{selectedDepartment}</span> Department
                  </span>
                </div>
                
                <div className="w-full grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">

                  <div className="bg-slate-100 rounded-xl p-3 md:p-5 shadow-md border border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                    <p className="text-[9px] md:text-xs text-gray-600 mb-1 font-medium uppercase tracking-tight md:tracking-wide leading-tight">Avg. SPC Score</p>
                    <p className="text-xl md:text-3xl font-bold text-accent mb-0.5 md:mb-1">{summaryStats.avgSmartQnA}%</p>
                    <p className="text-[9px] md:text-xs text-accent leading-tight">Conservative grading</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 md:p-5 shadow-md border border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                    <p className="text-[9px] md:text-xs text-gray-600 mb-1 font-medium uppercase tracking-tight md:tracking-wide leading-tight">Avg. TA Score</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-600 mb-0.5 md:mb-1">{summaryStats.avgTA}%</p>
                    <p className="text-[9px] md:text-xs text-gray-500 leading-tight">Manual grading</p>
                  </div>
                  
                  <div className="bg-slate-100 rounded-xl p-3 md:p-5 shadow-md border border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                    <p className="text-[9px] md:text-xs text-gray-600 mb-1 font-medium uppercase tracking-tight md:tracking-wide leading-tight">Score Difference (SPC VS TA)</p>
                    <p className="text-xl md:text-3xl font-bold text-accent mb-0.5 md:mb-1">{summaryStats.avgImprovement > 0 ? '+' : ''}{summaryStats.avgImprovement}%</p>
                    <p className="text-[9px] md:text-xs text-accent leading-tight line-clamp-2 md:line-clamp-none">{summaryStats.avgImprovement < 0 ? 'Within expected conservative bounds' : 'Scores align closely'}</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 md:p-5 shadow-md border border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <p className="text-[9px] md:text-xs text-gray-600 font-medium uppercase tracking-tight md:tracking-wide">Dataset</p>
                      <span className="text-[9px] md:text-xs font-medium text-gray-500 bg-white border border-slate-300 px-1 md:px-2 py-0.5 rounded whitespace-nowrap">{summaryStats.count} Courses</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 md:gap-4 mt-auto">
                      <div>
                        <p className="text-lg md:text-3xl font-bold text-accent mb-0.5 md:mb-1">{summaryStats.totalStudents}</p>
                        <p className="text-[9px] md:text-xs text-accent font-medium">Students</p>
                      </div>
                      <div>
                        <p className="text-lg md:text-3xl font-bold text-gray-600 mb-0.5 md:mb-1">{summaryStats.totalAssignments}</p>
                        <p className="text-[9px] md:text-xs text-gray-500 font-medium">Graded</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="mt-4 md:mt-8 flex justify-center w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="w-full flex flex-row items-start sm:items-center gap-3 md:gap-5 py-4 md:py-5 px-4 md:px-6 rounded-2xl bg-gradient-to-r from-accent/15 via-accent/5 to-transparent border border-accent/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-accent/40 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-br-full pointer-events-none" />
                  <div className="relative flex-shrink-0 bg-white p-2 md:p-3 rounded-xl border border-accent/20 shadow-sm mt-0.5 sm:mt-0">
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  </div>
                  <div className="text-left relative flex-1">
                    <h4 className="text-xs md:text-sm font-bold text-accent mb-0.5 md:mb-1 tracking-wide uppercase">Grading Philosophy</h4>
                    <p className={`text-slate-600 font-medium text-xs md:text-[15px] leading-relaxed transition-all duration-300 ${!isPhilosophyExpanded ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                      Smart Paper Check employs conservative grading standards to ensure fairness and maintain academic integrity. 
                      Students benefit from consistent evaluation criteria and can always request manual review for reassessment.
                    </p>
                    <button 
                      className="md:hidden text-accent text-xs font-bold mt-1.5 hover:underline focus:outline-none flex items-center gap-1"
                      onClick={() => setIsPhilosophyExpanded(!isPhilosophyExpanded)}
                    >
                      {isPhilosophyExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DepartmentAnalytics;
