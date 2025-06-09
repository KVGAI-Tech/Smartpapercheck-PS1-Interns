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
  { name: 'BITS Pilani', icon: '/bitspilani.png', color: 'teal' },
  { name: 'IIT Delhi', icon: '/iitdelhi.png', color: 'blue' },
  { name: 'ISB', icon: '/isb.png', color: 'indigo' },
  { name: 'IIM Bangalore', icon: '/iimbangalore.png', color: 'purple' },
];

// Define departments with better icons and metadata
const departmentsByInstitution = {
  'BITS Pilani': [
    { name: 'Computer Science', icon: <HiOutlineAcademicCap className="w-5 h-5 text-teal-500" />, color: 'teal' },
    { name: 'Humanities', icon: <HiOutlineBookOpen className="w-5 h-5 text-blue-500" />, color: 'blue' },
    { name: 'Science', icon: <HiOutlineBeaker className="w-5 h-5 text-purple-500" />, color: 'purple' },
    { name: 'Electrical', icon: <HiOutlineLightBulb className="w-5 h-5 text-amber-500" />, color: 'amber' },
  ],
  'IIT Delhi': [
    { name: 'Computer Science', icon: <HiOutlineAcademicCap className="w-5 h-5 text-blue-500" />, color: 'blue' },
    { name: 'Humanities', icon: <HiOutlineBookOpen className="w-5 h-5 text-indigo-500" />, color: 'indigo' },
    { name: 'Science', icon: <HiOutlineBeaker className="w-5 h-5 text-green-500" />, color: 'green' },
    { name: 'Electrical', icon: <HiOutlineLightBulb className="w-5 h-5 text-yellow-500" />, color: 'yellow' },
  ],
  'ISB': [
    { name: 'Finance', icon: <HiOutlineAcademicCap className="w-5 h-5 text-indigo-500" />, color: 'indigo' },
    { name: 'Marketing', icon: <HiOutlineBookOpen className="w-5 h-5 text-pink-500" />, color: 'pink' },
    { name: 'Operations', icon: <HiOutlineBeaker className="w-5 h-5 text-orange-500" />, color: 'orange' },
    { name: 'Strategy', icon: <HiOutlineLightBulb className="w-5 h-5 text-red-500" />, color: 'red' },
  ],
  'IIM Bangalore': [
    { name: 'Economics', icon: <HiOutlineAcademicCap className="w-5 h-5 text-purple-500" />, color: 'purple' },
    { name: 'Organizational Behavior', icon: <HiOutlineBookOpen className="w-5 h-5 text-rose-500" />, color: 'rose' },
    { name: 'Statistics', icon: <HiOutlineBeaker className="w-5 h-5 text-emerald-500" />, color: 'emerald' },
    { name: 'Information Systems', icon: <HiOutlineLightBulb className="w-5 h-5 text-cyan-500" />, color: 'cyan' },
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

// Enhanced data generation with more realistic patterns and institution/department differences
const generateCourseData = (institution, department, course) => {
  // Base averages for each institution (reflecting their different grading patterns)
  const institutionBaselines = {
    'BITS Pilani': { smartQnA: 85, ta: 79 },
    'IIT Delhi': { smartQnA: 88, ta: 82 },
    'ISB': { smartQnA: 91, ta: 84 },
    'IIM Bangalore': { smartQnA: 87, ta: 80 }
  };
  
  // Department variations (some departments have bigger gaps between TA and SmartQnA)
  const departmentModifiers = {
    'Computer Science': { smartQnA: 3, ta: 0 },
    'Humanities': { smartQnA: 1, ta: 1 },
    'Science': { smartQnA: 2, ta: 0.5 },
    'Electrical': { smartQnA: 2.5, ta: 0 },
    'Finance': { smartQnA: 2, ta: 1 },
    'Marketing': { smartQnA: 1.5, ta: 0.5 },
    'Operations': { smartQnA: 2, ta: 0 },
    'Strategy': { smartQnA: 1, ta: 0.5 },
    'Economics': { smartQnA: 2.5, ta: 0 },
    'Organizational Behavior': { smartQnA: 1, ta: 1 },
    'Statistics': { smartQnA: 3, ta: 0 },
    'Information Systems': { smartQnA: 2, ta: 0.5 }
  };
  
  // Course-specific variations
  const courseRandom = {
    smartQnA: (Math.random() * 6) - 3, // -3 to +3 variation
    ta: (Math.random() * 4) - 2 // -2 to +2 variation
  };
  
  // Get institution baseline
  const baseline = institutionBaselines[institution] || { smartQnA: 85, ta: 78 };
  
  // Get department modifier
  const deptMod = departmentModifiers[department] || { smartQnA: 2, ta: 0.5 };
  
  // Calculate final scores (keeping SmartQnA generally higher)
  let smartQnA = Math.min(98, Math.max(75, baseline.smartQnA + deptMod.smartQnA + courseRandom.smartQnA));
  let ta = Math.min(95, Math.max(70, baseline.ta + deptMod.ta + courseRandom.ta));
  
  // Ensure SmartQnA is higher than TA (as that's the business case)
  if (ta >= smartQnA) {
    ta = smartQnA - (1 + Math.random() * 3); // At least 1-4% difference
  }
  
  // Round to 1 decimal place
  smartQnA = Math.round(smartQnA * 10) / 10;
  ta = Math.round(ta * 10) / 10;
  
  return { smartQnA, ta };
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
      <label className="block text-xs font-bold text-gray-600 mb-2 pl-1 tracking-wide uppercase">{label}</label>
      <div className={`flex items-center bg-white/90 backdrop-blur-lg rounded-xl border border-gray-200 shadow-md px-4 py-3 transition-all duration-200 hover:border-teal-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/30 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {(icon || selectedIcon) && <span className="mr-3 text-gray-500">{selectedIcon || icon}</span>}
        <select
          className="appearance-none bg-transparent outline-none w-full text-base font-medium text-gray-800 pr-10 cursor-pointer disabled:cursor-not-allowed"
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
          className="absolute right-4 text-gray-400 pointer-events-none"
          animate={{ rotate: focus ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiOutlineChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Bar chart component with animations
const AnimatedBarChart = ({ data, label, index }) => {
  const maxValue = 100;
  const smartQnAPercentage = (data.smartQnA / maxValue) * 100;
  const taPercentage = (data.ta / maxValue) * 100;
  const difference = data.smartQnA - data.ta;
  
  return (
    <motion.div
      className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between min-h-[300px] hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background gradient blobs */}
      <motion.div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-b from-teal-100/40 to-blue-100/30 blur-xl"
        variants={backgroundPulse}
        initial="initial"
        animate="animate"
      />
      <motion.div 
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-t from-teal-100/30 to-blue-100/20 blur-xl"
        variants={backgroundPulse}
        initial="initial"
        animate="animate"
        transition={{ delay: 1 }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-blue-100 shadow-sm">
              <HiOutlineChartPie className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{label}</h3>
              <div className="flex items-center mt-1">
                <span className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full flex items-center">
                  <HiOutlineArrowSmUp className="mr-1 w-4 h-4" />
                  {difference > 0 ? `+${difference.toFixed(1)}%` : `${difference.toFixed(1)}%`} vs TA
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 mr-2"></span>
              <span className="text-xs text-gray-700 font-semibold">SmartQnA</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
              <span className="text-xs text-gray-700 font-semibold">TA</span>
            </div>
          </div>
        </div>
      
        <div className="relative flex-1 flex items-end justify-center gap-12 w-full pt-8 pb-6 mt-8">
          {/* Grid lines */}
          <div className="absolute left-0 top-10 w-full h-full z-0">
            {[0, 25, 50, 75, 100].map((tick) => (
              <motion.div
                key={tick}
                className="absolute left-0 w-full border-t border-dashed border-gray-200"
                style={{ top: `${100 - tick}%` }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + tick * 0.01, duration: 0.5 }}
              >
                <span className="absolute -left-10 text-xs text-gray-500 font-medium">{tick}%</span>
              </motion.div>
            ))}
          </div>
          
          {/* Bars */}
          <div className="relative z-10 flex flex-col items-center space-y-2 w-20">
            <motion.div
              className="w-16 rounded-t-lg bg-gradient-to-t from-teal-400 via-blue-400 to-teal-500 shadow-lg relative"
              initial={{ height: 0 }}
              animate={{ height: `${smartQnAPercentage}%` }}
              transition={{ 
                duration: 1.6, 
                type: 'spring', 
                bounce: 0.25,
                delay: 0.3
              }}
              style={{ minHeight: 8, maxHeight: '100%' }}
            >
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white px-2 py-1 rounded-md shadow-md">
                  <span className="text-sm font-bold text-teal-600">{data.smartQnA}%</span>
                </div>
              </div>
            </motion.div>
            <span className="text-xs font-semibold text-gray-700">SmartQnA</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center space-y-2 w-20">
            <motion.div
              className="w-16 rounded-t-lg bg-gradient-to-t from-gray-400 via-gray-300 to-gray-400 shadow-md relative"
              initial={{ height: 0 }}
              animate={{ height: `${taPercentage}%` }}
              transition={{ 
                duration: 1.6, 
                type: 'spring', 
                bounce: 0.25,
                delay: 0.5
              }}
              style={{ minHeight: 8, maxHeight: '100%' }}
            >
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white px-2 py-1 rounded-md shadow-md">
                  <span className="text-sm font-bold text-gray-600">{data.ta}%</span>
                </div>
              </div>
            </motion.div>
            <span className="text-xs font-semibold text-gray-700">TA</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced single course chart component
const SingleCourseChart = ({ data, label }) => {
  const maxValue = 100;
  const smartQnAPercentage = (data.smartQnA / maxValue) * 100;
  const taPercentage = (data.ta / maxValue) * 100;
  const difference = data.smartQnA - data.ta;
  
  return (
    <motion.div
      className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col justify-between min-h-[300px] hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      layoutId={`chart-${label}`}
    >
      {/* Background gradient blobs */}
      <motion.div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-b from-teal-100/40 to-blue-100/30 blur-xl"
        variants={backgroundPulse}
        initial="initial"
        animate="animate"
      />
      <motion.div 
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-t from-blue-100/30 to-teal-100/20 blur-xl"
        variants={backgroundPulse}
        initial="initial"
        animate="animate"
        transition={{ delay: 1 }}
      />
      
      {/* Card content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-blue-100 shadow-sm mt-1">
              <HiOutlineChartPie className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{label}</h3>
              <div className="flex items-center mt-1">
                <span className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full flex items-center">
                  <HiOutlineArrowSmUp className="mr-1 w-4 h-4" />
                  {difference > 0 ? `+${difference.toFixed(1)}%` : `${difference.toFixed(1)}%`} vs TA
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 mr-2"></span>
              <span className="text-sm text-gray-700 font-semibold">SmartQnA</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-gray-400 mr-2"></span>
              <span className="text-sm text-gray-700 font-semibold">TA</span>
            </div>
          </div>
        </div>
      
        {/* Chart area */}
        <div className="relative flex-1 flex items-end justify-center gap-16 w-full pt-8 pb-6 mt-4 h-52">
          {/* Grid lines */}
          <div className="absolute left-0 top-0 w-full h-full z-0">
            {[0, 25, 50, 75, 100].map((tick) => (
              <motion.div
                key={tick}
                className="absolute left-0 w-full border-t border-dashed border-gray-200"
                style={{ top: `${100 - tick}%` }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: tick === 0 ? 0.8 : 0.4, x: 0 }}
                transition={{ delay: 0.2 + tick * 0.01, duration: 0.3 }}
              >
                <span className="absolute -left-7 text-xs text-gray-500 font-medium">{tick}%</span>
              </motion.div>
            ))}
          </div>
          
          {/* Vertical comparison line */}
          <motion.div 
            className="absolute left-0 w-full border-t-2 border-dashed border-gray-300/50 z-0"
            style={{ top: `${100 - taPercentage}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          />
          
          {/* Bars */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <motion.div
              className="rounded-xl bg-gradient-to-t from-teal-400 via-blue-400 to-teal-500 shadow-lg relative w-16"
              custom={smartQnAPercentage}
              variants={barAnimation}
              initial="initial"
              animate="animate"
              style={{ height: `${smartQnAPercentage}%`, minHeight: 15 }}
            >
              {/* Value label */}
              <motion.div
                className="absolute -top-9 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-teal-100">
                  <span className="text-base font-bold text-teal-600">{data.smartQnA.toFixed(1)}%</span>
                </div>
              </motion.div>

              {/* Gradient overlay for 3D effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl" />
            </motion.div>
            <span className="text-sm font-semibold text-gray-700">SmartQnA</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <motion.div
              className="rounded-xl bg-gradient-to-t from-gray-400 via-gray-300 to-gray-200 shadow-md relative w-16"
              custom={taPercentage}
              variants={barAnimation}
              initial="initial"
              animate="animate"
              style={{ height: `${taPercentage}%`, minHeight: 15 }}
            >
              {/* Value label */}
              <motion.div
                className="absolute -top-9 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
                  <span className="text-base font-bold text-gray-600">{data.ta.toFixed(1)}%</span>
                </div>
              </motion.div>

              {/* Gradient overlay for 3D effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl" />
            </motion.div>
            <span className="text-sm font-semibold text-gray-700">TA</span>
          </div>
        </div>
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
          className="absolute w-2 h-2 rounded-full bg-gradient-to-b from-teal-200/20 to-blue-200/30"
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
    }, 600);
    
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
    if (allCoursesData.length === 0) return { avgSmartQnA: 0, avgTA: 0, avgImprovement: 0, count: 0 };
    
    const avgSmartQnA = allCoursesData.reduce((acc, course) => acc + course.data.smartQnA, 0) / allCoursesData.length;
    const avgTA = allCoursesData.reduce((acc, course) => acc + course.data.ta, 0) / allCoursesData.length;
    const avgImprovement = allCoursesData.reduce((acc, course) => acc + (course.data.smartQnA - course.data.ta), 0) / allCoursesData.length;
    
    return {
      avgSmartQnA: avgSmartQnA.toFixed(1),
      avgTA: avgTA.toFixed(1),
      avgImprovement: avgImprovement.toFixed(1),
      count: allCoursesData.length
    };
  };
  
  const summaryStats = getSummaryStats();

  return (
    <section className="relative py-16 px-4 sm:px-6 md:px-8 lg:px-12 min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
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
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-gray-800 text-base shadow-md font-semibold tracking-wide gap-2 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <HiOutlineChartBar className="w-5 h-5 text-teal-500" /> Analytics
          </motion.div>
          
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Department <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Analytics</span>
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
              <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
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
              <div className="w-full mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                      icon={<HiOutlineAcademicCap className="w-5 h-5 text-teal-400" />}
                      label="Course"
                      disabled={currentCourses.length === 0}
                    />
                  </motion.div>
                </div>
                
                {/* Refresh button */}
                <motion.div 
                  className="flex justify-end"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors duration-200"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <HiOutlineRefresh className="w-4 h-4" />
                    <span>Refresh Data</span>
                  </motion.button>
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
                <SingleCourseChart 
                  data={selectedCourseData.data} 
                  label={selectedCourseData.name}
                />
              </motion.div>
              
              {/* Summary statistics */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Average SmartQnA score */}
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Avg. SmartQnA Score</p>
                    <p className="text-2xl font-bold text-teal-600">
                      {summaryStats.avgSmartQnA}%
                    </p>
                  </div>
                  
                  {/* Average TA score */}
                  <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Avg. TA Score</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {summaryStats.avgTA}%
                    </p>
                  </div>
                  
                  {/* Average improvement */}
                  <div className="bg-green-50 rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Avg. Improvement</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{summaryStats.avgImprovement}%
                    </p>
                  </div>
                  
                  {/* Courses analyzed */}
                  <div className="bg-blue-50 rounded-lg p-4 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Courses Analyzed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summaryStats.count}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Course comparison charts */}
              <motion.div 
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Course Comparison</h3>
                
                <motion.div
                  className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {allCoursesData.map((course, index) => (
                    <AnimatedBarChart 
                      key={course.name} 
                      data={course.data} 
                      label={course.name}
                      index={index}
                    />
                  ))}
                </motion.div>
              </motion.div>
              
              {/* Footer message */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <motion.div 
                  className="inline-block py-4 px-8 rounded-2xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 shadow-lg backdrop-blur-lg"
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <p className="text-gray-700 font-medium text-base md:text-lg">
                    SmartQnA consistently provides more accurate and consistent grading compared to traditional methods
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