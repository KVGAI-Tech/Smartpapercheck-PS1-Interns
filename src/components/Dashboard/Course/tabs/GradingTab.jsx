import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

// Register Chart.js components
Chart.register(...registerables);

// Modal component for popups
const Modal = ({ isOpen, onClose, title, children, type = "info" }) => {
  const modalRef = useRef(null);
  
  // Background colors based on modal type
  const bgColors = {
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
    import: "bg-purple-50 border-purple-200",
    export: "bg-emerald-50 border-emerald-200",
    autograde: "bg-indigo-50 border-indigo-200"
  };
  
  // Icon based on modal type
  const iconComponent = () => {
    switch(type) {
      case 'success':
        return (
          <motion.svg 
            className="w-12 h-12 text-green-500 mx-auto"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </motion.svg>
        );
      case 'error':
        return (
          <motion.svg 
            className="w-12 h-12 text-red-500 mx-auto"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </motion.svg>
        );
      case 'warning':
        return (
          <motion.svg 
            className="w-12 h-12 text-yellow-500 mx-auto"
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </motion.svg>
        );
      case 'import':
        return (
          <motion.svg 
            className="w-12 h-12 text-purple-500 mx-auto"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </motion.svg>
        );
      case 'export':
        return (
          <motion.svg 
            className="w-12 h-12 text-emerald-500 mx-auto"
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </motion.svg>
        );
      case 'autograde':
        return (
          <motion.svg 
            className="w-12 h-12 text-indigo-500 mx-auto"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </motion.svg>
        );
      default:
        return (
          <motion.svg 
            className="w-12 h-12 text-blue-500 mx-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </motion.svg>
        );
    }
  };
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle ESC key press
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 ${bgColors[type]}`}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="absolute top-3 right-3">
              <motion.button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <div className="mt-4 mb-6">
              {iconComponent()}
            </div>
            
            <motion.h3 
              className="text-xl font-bold text-center mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {title}
            </motion.h3>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = 
    type === "success" ? "bg-green-500" :
    type === "error" ? "bg-red-500" :
    type === "warning" ? "bg-yellow-500" :
    "bg-blue-500";
  
  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white rounded-lg shadow-lg p-4 flex items-center pr-12 max-w-sm`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div className="mr-3">
        {type === "success" && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === "error" && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === "warning" && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {type === "info" && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <p>{message}</p>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

// Tooltip component
const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap"
            style={{ bottom: "100%", left: "50%", marginBottom: "5px", transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {text}
            <div 
              className="absolute w-2 h-2 bg-gray-800 transform rotate-45"
              style={{ bottom: "-4px", left: "50%", marginLeft: "-4px" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Empty state illustration component
const EmptyState = ({ message, icon }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 text-gray-400">
        {icon}
      </div>
      <p className="text-gray-500 text-lg">{message}</p>
    </motion.div>
  );
};

// Main GradingTab component
const GradingTab = ({ maxMarks = 100 }) => {
  // Core state management
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const chartContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const markToPixelMapping = useRef({ mapping: {}, chartArea: {} });
  const [students, setStudents] = useState([]);
  const [histogramData, setHistogramData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [activeSlider, setActiveSlider] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);

  // UI state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [autoGradeModalOpen, setAutoGradeModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [gradeSummaryModalOpen, setGradeSummaryModalOpen] = useState(false);
  const [gradeSettingsModalOpen, setGradeSettingsModalOpen] = useState(false);
  const [animateHistogram, setAnimateHistogram] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [includeNC, setIncludeNC] = useState(true);
  
  // Grade boundaries state
  const [gradeBoundaries, setGradeBoundaries] = useState({
    'A': 90,
    'A-': 86,
    'B': 82,
    'B-': 78,
    'C': 74,
    'C-': 70,
    'D': 66,
    'E': 62,
    'NC': 0
  });

  // Colors for selected students
  const studentColors = [
    'rgba(255, 99, 132, 0.9)',   // Red
    'rgba(54, 162, 235, 0.9)',   // Blue
    'rgba(255, 206, 86, 0.9)',   // Yellow
    'rgba(75, 192, 192, 0.9)',   // Teal
    'rgba(153, 102, 255, 0.9)',  // Purple
    'rgba(255, 159, 64, 0.9)',   // Orange
    'rgba(199, 199, 199, 0.9)',  // Gray
    'rgba(83, 102, 255, 0.9)',   // Indigo
    'rgba(40, 159, 64, 0.9)',    // Green
    'rgba(210, 199, 199, 0.9)'   // Light Gray
  ];

  // Grade colors
  const gradeColors = {
    'A': 'rgba(0, 150, 136, 0.7)',    // Teal
    'A-': 'rgba(0, 188, 212, 0.7)',   // Cyan
    'B': 'rgba(33, 150, 243, 0.7)',   // Blue
    'B-': 'rgba(63, 81, 181, 0.7)',   // Indigo
    'C': 'rgba(156, 39, 176, 0.7)',   // Purple
    'C-': 'rgba(233, 30, 99, 0.7)',   // Pink
    'D': 'rgba(255, 87, 34, 0.7)',    // Deep Orange
    'E': 'rgba(255, 152, 0, 0.7)',    // Orange
    'NC': 'rgba(158, 158, 158, 0.7)'  // Grey
  };

  // Toggle student selection
  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      } else {
        if (prev.length >= 10) {
          showToast("Maximum 10 students can be selected at once", "warning");
          return prev;
        }
        return [...prev, student];
      }
    });
  };
  
  // Clear all selected students
  const clearSelectedStudents = () => {
    setSelectedStudents([]);
  };

  // Find the grade for a mark
  const getGradeForMark = (mark) => {
    // Sort boundaries from highest to lowest
    const sortedBoundaries = Object.entries(gradeBoundaries)
      .sort((a, b) => b[1] - a[1]);
    
    // If including NC grade, use it in grading
    if (includeNC) {
      return sortedBoundaries.find(([_, boundary]) => mark >= boundary)?.[0] || 'F';
    } else {
      // If not including NC, filter it out
      return sortedBoundaries
        .filter(([grade]) => grade !== 'NC')
        .find(([_, boundary]) => mark >= boundary)?.[0] || 'F';
    }
  };

  // Get color for grade display
  const getGradeColor = (grade) => {
    return gradeColors[grade] || 'rgba(0, 0, 0, 0.7)';
  };

  // Enhanced auto-grading function
  const autoSetGradeBoundaries = async () => {
    if (histogramData.length === 0) {
      showToast("No data available for grading. Please upload student data first.", "warning");
      return;
    }

    setIsAutoGrading(true);
    setGradingProgress(0);

    try {
      // Create a smoothed version of the histogram
      const smoothedData = [];
      const windowSize = 5;
      
      // Step 1: First pass - basic smoothing with equal weights
      for (let i = 0; i < histogramData.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - windowSize); j <= Math.min(histogramData.length - 1, i + windowSize); j++) {
          sum += histogramData[j].count;
          count++;
        }
        smoothedData.push({
          marks: histogramData[i].marks,
          count: sum / count
        });
        setGradingProgress(Math.round((i / histogramData.length) * 20));
        await new Promise(resolve => setTimeout(resolve, 10)); // Slight delay for UI update
      }

      // Step 2: Second pass - weighted smoothing (gaussian-like)
      const doubleSmoothedData = [];
      for (let i = 0; i < smoothedData.length; i++) {
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let j = Math.max(0, i - windowSize*2); j <= Math.min(smoothedData.length - 1, i + windowSize*2); j++) {
          // Gaussian-like weight calculation
          const distance = Math.abs(i - j);
          const weight = Math.exp(-(distance * distance) / (2 * (windowSize * 0.8) * (windowSize * 0.8)));
          
          weightedSum += smoothedData[j].count * weight;
          totalWeight += weight;
        }
        
        doubleSmoothedData.push({
          marks: smoothedData[i].marks,
          count: weightedSum / totalWeight
        });
        setGradingProgress(20 + Math.round((i / smoothedData.length) * 20));
        await new Promise(resolve => setTimeout(resolve, 10)); // Slight delay for UI update
      }
      
      // Step 3: Use peak detection to find natural clusters
      // First identify peaks (local maxima)
      const peaks = [];
      for (let i = 3; i < doubleSmoothedData.length - 3; i++) {
        const current = doubleSmoothedData[i].count;
        if (current > 0.1) { // Only consider bins with some students
          let isPeak = true;
          // Check if higher than neighbors
          for (let j = i - 3; j <= i + 3; j++) {
            if (j !== i && j >= 0 && j < doubleSmoothedData.length && doubleSmoothedData[j].count > current) {
              isPeak = false;
              break;
            }
          }
          if (isPeak) {
            peaks.push({ mark: doubleSmoothedData[i].marks, height: current });
          }
        }
        setGradingProgress(40 + Math.round((i / doubleSmoothedData.length) * 10));
      }
      
      // Step 4: Sort peaks by mark value (descending)
      peaks.sort((a, b) => b.mark - a.mark);
      
      // Step 5: Find valleys (local minima) between peaks
      let valleys = [];
      for (let i = 0; i < peaks.length - 1; i++) {
        const startMark = peaks[i+1].mark;
        const endMark = peaks[i].mark;
        
        // Find the minimum point between these peaks
        let minVal = Infinity;
        let minMark = startMark;
        
        for (let j = startMark; j <= endMark; j++) {
          const idx = doubleSmoothedData.findIndex(item => item.marks === j);
          if (idx !== -1 && doubleSmoothedData[idx].count < minVal) {
            minVal = doubleSmoothedData[idx].count;
            minMark = j;
          }
        }
        
        // Add valley if found
        if (minMark !== startMark && minMark !== endMark) {
          valleys.push(minMark);
        }
        
        setGradingProgress(50 + Math.round((i / (peaks.length - 1)) * 10));
      }
      
      // Additionally add natural boundary points at certain percentiles
      const marks = students.map(s => s.marks).sort((a, b) => b - a);
      const percentileCutoffs = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85];
      
      percentileCutoffs.forEach(cutoff => {
        const idx = Math.floor(marks.length * cutoff);
        if (idx < marks.length) {
          valleys.push(marks[idx]);
        }
      });
      
      // Deduplicate and sort valleys
      valleys = Array.from(new Set(valleys)).sort((a, b) => b - a);
      
      // Get available grade keys excluding 'NC' since it's always 0
      const gradeKeys = Object.keys(gradeBoundaries).filter(g => g !== 'NC');
      
      // If not enough valleys, add evenly spaced boundaries
      if (valleys.length < gradeKeys.length - 1) {
        const step = Math.floor(maxMarks / (gradeKeys.length));
        for (let i = 1; i < gradeKeys.length; i++) {
          valleys.push(i * step);
        }
        valleys = Array.from(new Set(valleys)).sort((a, b) => b - a);
      }
      
      // Take the appropriate number of valleys
      valleys = valleys.slice(0, gradeKeys.length - 1);
      
      // Ensure valleys are in descending order
      valleys.sort((a, b) => b - a);
      
      // Create new boundaries
      const newBoundaries = { ...gradeBoundaries };
      
      // Assign valleys to grades
      for (let i = 0; i < valleys.length; i++) {
        newBoundaries[gradeKeys[i]] = Math.round(valleys[i]);
      }
      
      // Always set NC to 0
      newBoundaries['NC'] = 0;
      
      // Ensure logical ordering (grades must be in descending order)
      const orderedGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
      for (let i = 0; i < orderedGrades.length - 1; i++) {
        const currentGrade = orderedGrades[i];
        const nextGrade = orderedGrades[i+1];
        
        if (newBoundaries[currentGrade] <= newBoundaries[nextGrade]) {
          newBoundaries[currentGrade] = newBoundaries[nextGrade] + 4;
        }
      }
      
      // Make sure we don't exceed maxMarks
      for (const grade in newBoundaries) {
        newBoundaries[grade] = Math.min(newBoundaries[grade], maxMarks);
      }
      
      // Animate the changes
      const steps = 20;
      const delay = 40;
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const interpolatedBoundaries = {};
        
        for (const grade in gradeBoundaries) {
          const oldValue = gradeBoundaries[grade];
          const newValue = newBoundaries[grade];
          interpolatedBoundaries[grade] = Math.round(oldValue + (newValue - oldValue) * progress);
        }
        
        setGradeBoundaries(interpolatedBoundaries);
        setGradingProgress(60 + Math.round(progress * 40));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      showToast("Grade boundaries set automatically based on distribution.", "success");
    } catch (error) {
      console.error("Error in auto-grading:", error);
      showToast("Failed to set grade boundaries automatically.", "error");
    } finally {
      setIsAutoGrading(false);
      setGradingProgress(0);
      setAutoGradeModalOpen(false);
    }
  };

  // Update histogram data when students array changes
  useEffect(() => {
    if (students.length === 0) return;
    
    const bins = Array(maxMarks + 1).fill().map((_, i) => ({
      marks: i,
      count: 0,
      students: []
    }));
    
    students.forEach(student => {
      const markIndex = Math.min(Math.floor(student.marks), maxMarks);
      bins[markIndex].count += 1;
      bins[markIndex].students.push(student);
    });
    
    setHistogramData(bins);
    setAnimateHistogram(true);
    setTimeout(() => setAnimateHistogram(false), 1000);
  }, [students, maxMarks]);

  // Update chart when histogram data or selected students change
  useEffect(() => {
    if (!chartRef.current || histogramData.length === 0) return;
    
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const updateSliderPositions = (chart) => {
      if (!chart || !chart.scales || !chart.scales.x || !chart.chartArea) {
        return;
      }
      
      const xScale = chart.scales.x;
      
      const chartArea = {
        left: chart.chartArea?.left || 0,
        right: chart.chartArea?.right || 0,
        width: (chart.chartArea?.right || 0) - (chart.chartArea?.left || 0)
      };
      
      if (chartArea.width <= 0) {
        return;
      }
      
      const mapping = {};
      for (let i = 0; i <= maxMarks; i++) {
        try {
          mapping[i] = xScale.getPixelForValue(i);
        } catch (e) {
          console.log('Error getting pixel for value', i, e);
        }
      }
      
      markToPixelMapping.current = {
        mapping,
        chartArea
      };
    };

    // Calculate bar colors based on grades
    const barColors = histogramData.map(item => {
      const grade = getGradeForMark(item.marks);
      return getGradeColor(grade);
    });

    // Create an array to track which bars have selected students
    const barsWithSelectedStudents = Array(histogramData.length).fill(false);
    
    // Highlight selected students
    selectedStudents.forEach((student) => {
      const markIndex = Math.floor(student.marks);
      if (markIndex >= 0 && markIndex <= maxMarks) {
        barsWithSelectedStudents[markIndex] = true;
      }
    });
    
    // For bars with multiple selected students, use a gradient or special color
    selectedStudents.forEach((student, index) => {
      const markIndex = Math.floor(student.marks);
      if (markIndex >= 0 && markIndex <= maxMarks) {
        // If this is the only selected student in this bar, use their color
        // If multiple selected students, use a distinctive gradient
        const selectedStudentsInThisBar = histogramData[markIndex].students.filter(s => 
          selectedStudents.some(selected => selected.id === s.id)
        );
        
        if (selectedStudentsInThisBar.length === 1) {
          barColors[markIndex] = studentColors[index % studentColors.length];
        } else {
          // For bars with multiple selected students, assign a glowing effect
          const studentIndex = selectedStudentsInThisBar.findIndex(s => s.id === student.id);
          if (studentIndex === 0) { // Only change color once for multiple students
            barColors[markIndex] = 'rgba(255, 215, 0, 0.9)'; // Gold for multiple selections
          }
        }
      }
    });

    const ctx = chartRef.current.getContext('2d');
    
    // Add a gradient overlay for selected bars
    const createBarGradient = (ctx, area) => {
      const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
      return gradient;
    };
    
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: histogramData.map(item => item.marks),
        datasets: [{
          label: 'Number of Students',
          data: histogramData.map(item => item.count),
          backgroundColor: barColors,
          borderColor: histogramData.map((_, i) => 
            barsWithSelectedStudents[i] ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)'
          ),
          borderWidth: histogramData.map((_, i) => 
            barsWithSelectedStudents[i] ? 2 : 1
          ),
          hoverBackgroundColor: barColors.map(color => {
            // Make hover color slightly brighter
            if (color.startsWith('rgba(')) {
              return color.replace('0.7', '0.9').replace('0.9', '1.0');
            }
            return color;
          }),
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 2,
          borderRadius: 4,
          barPercentage: 0.9,
          categoryPercentage: 1.0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animateHistogram ? 1000 : 300,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Students',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: { top: 10, bottom: 10 }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
              drawBorder: false
            },
            ticks: {
              precision: 0,
              font: {
                size: 12
              },
              padding: 8
            }
          },
          x: {
            title: {
              display: true,
              text: 'Marks',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: { top: 10, bottom: 10 }
            },
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: window.innerWidth < 768 ? 10 : 20,
              callback: function(value, index, values) {
                return value % 5 === 0 ? value : '';
              },
              font: {
                size: 12
              },
              padding: 8
            },
            stacked: false
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 16,
              weight: 'bold'
            },
            bodyFont: {
              size: 14
            },
            padding: 12,
            cornerRadius: 8,
            caretSize: 8,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return `Marks: ${context[0].label}`;
              },
              label: function(context) {
                const marks = context.parsed.x;
                const grade = getGradeForMark(marks);
                const count = context.parsed.y;
                const studentsWithMark = histogramData[marks]?.students || [];
                
                const selectedStudentsInBin = studentsWithMark.filter(student => 
                  selectedStudents.some(s => s.id === student.id)
                );

                return [
                  `Grade: ${grade}`,
                  `Total Students: ${count}`,
                  ...(selectedStudentsInBin.length > 0 ? ['', 'Selected Students:'] : []),
                  ...selectedStudentsInBin.map((s, idx) => {
                    const colorIndex = selectedStudents.findIndex(selected => selected.id === s.id);
                    return `• ${s.name} (${s.id}): ${s.marks}`; 
                  }),
                  ...(studentsWithMark.length > selectedStudentsInBin.length && studentsWithMark.length > 3 ? 
                    [`... and ${studentsWithMark.length - selectedStudentsInBin.length} more`] : 
                    []
                  )
                ];
              }
            }
          }
        }
      },
      plugins: [{
        id: 'positionCalculator',
        afterLayout: (chart) => {
          updateSliderPositions(chart);
        },
        resize: (chart) => {
          updateSliderPositions(chart);
        }
      }]
    });

    chartInstanceRef.current = newChart;
    
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [histogramData, gradeBoundaries, selectedStudents, maxMarks, animateHistogram, includeNC]);

  // Calculate statistics from student data
  const statistics = useMemo(() => {
    if (students.length === 0) return { highest: 0, lowest: 0, average: 0, totalStudents: 0, median: 0, standardDeviation: 0 };
    
    const marks = students.map(student => student.marks);
    marks.sort((a, b) => a - b);
    
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const sum = marks.reduce((a, b) => a + b, 0);
    const average = marks.length ? Math.round((sum / marks.length) * 10) / 10 : 0;
    
    // Calculate median
    const middleIndex = Math.floor(marks.length / 2);
    const median = marks.length % 2 === 0 
      ? (marks[middleIndex - 1] + marks[middleIndex]) / 2 
      : marks[middleIndex];
    
    // Calculate standard deviation
    const meanDiffSquared = marks.map(mark => Math.pow(mark - average, 2));
    const variance = meanDiffSquared.reduce((a, b) => a + b, 0) / marks.length;
    const standardDeviation = Math.round(Math.sqrt(variance) * 10) / 10;
    
    // Calculate grade distribution
    const gradeDistribution = {};
    students.forEach(student => {
      const grade = getGradeForMark(student.marks);
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });
    
    return {
      highest,
      lowest,
      average,
      median,
      standardDeviation,
      totalStudents: students.length,
      gradeDistribution
    };
  }, [students, gradeBoundaries, includeNC]);

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // Close toast notification
  const closeToast = () => {
    setToast(null);
  };

  // Update grade boundary
  const updateGradeBoundary = (grade, value) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) return;
    
    // Get ordered list of grade keys
    const orderedGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
    
    // Find bounds for this grade
    const gradeIndex = orderedGrades.indexOf(grade);
    
    // Upper bound is the grade above (or max marks if this is the highest grade)
    let upperBound = maxMarks;
    if (gradeIndex > 0) {
      const higherGrade = orderedGrades[gradeIndex - 1];
      upperBound = gradeBoundaries[higherGrade];
    }
    
    // Lower bound is the grade below (or 0 if this is the lowest grade)
    let lowerBound = 0;
    if (gradeIndex < orderedGrades.length - 1) {
      const lowerGrade = orderedGrades[gradeIndex + 1];
      lowerBound = gradeBoundaries[lowerGrade];
    }
    
    // Validate the value
    const validatedValue = Math.min(Math.max(numValue, lowerBound), upperBound);
    
    // Update the grade boundary
    setGradeBoundaries(prev => ({
      ...prev,
      [grade]: validatedValue
    }));
  };

  // Handle file selection before upload
  const handleFileSelect = () => {
    setImportModalOpen(true);
  };

  // Process Excel/CSV file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setImportModalOpen(false);
      
      // Read the uploaded file
      const fileBuffer = await readFileAsArrayBuffer(file);
      
      // Check file type and process accordingly
      const fileType = file.name.split('.').pop().toLowerCase();
      let parsedData;
      
      if (fileType === 'xlsx' || fileType === 'xls') {
        parsedData = await processExcelFile(fileBuffer);
      } else if (fileType === 'csv') {
        parsedData = await processCSVFile(fileBuffer);
      } else {
        throw new Error('Unsupported file format. Please upload an Excel or CSV file.');
      }
      
      if (parsedData.length === 0) {
        throw new Error('No data found in the uploaded file or format is incorrect.');
      }
      
      setStudents(parsedData);
      showToast(`Successfully loaded ${parsedData.length} student records.`, "success");
      
    } catch (err) {
      console.error('Error processing file:', err);
      showToast(err.message || 'Failed to process the file. Please check the format.', "error");
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Read file as ArrayBuffer
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Process Excel file
  const processExcelFile = (buffer) => {
    try {
      // Read the Excel file
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        cellStyles: true
      });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Process data
      return processRawData(rawData);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      throw new Error("Failed to process Excel file. Please check the format.");
    }
  };

  // Process CSV file
  const processCSVFile = async (buffer) => {
    try {
      // Convert ArrayBuffer to string
      const text = new TextDecoder().decode(buffer);
      
      // Parse CSV
      const result = Papa.parse(text, {
        header: false,
        skipEmptyLines: true
      });
      
      // Process data
      return processRawData(result.data);
    } catch (error) {
      console.error("Error processing CSV file:", error);
      throw new Error("Failed to process CSV file. Please check the format.");
    }
  };

  // Process raw data from Excel or CSV
  const processRawData = (rawData) => {
    if (!rawData || rawData.length <= 1) {
      throw new Error("No data found or invalid format.");
    }
    
    // Get headers from first row and find the column indices
    const headers = rawData[0].map(header => String(header).toLowerCase().trim());
    
    const nameIndex = headers.findIndex(h => 
      h.includes('name') || h.includes('student') || h === 'fullname' || h === 'full name'
    );
    
    const idIndex = headers.findIndex(h => 
      h.includes('id') || h === 'student id' || h === 'studentid' || h === 'roll' || h === 'rollno'
    );
    
    const marksIndex = headers.findIndex(h => 
      h.includes('mark') || h.includes('score') || h === 'grade' || h === 'points' || h === 'result'
    );
    
    if (nameIndex === -1 || idIndex === -1 || marksIndex === -1) {
      throw new Error("Required columns not found. The file should contain columns for student name, ID, and marks.");
    }
    
    // Process data rows (skip the header row)
    const processedData = rawData.slice(1).map((row, index) => {
      // Skip empty rows
      if (!row || !row.length) return null;
      
      const name = String(row[nameIndex] || '').trim();
      const id = String(row[idIndex] || '').trim();
      let marks = parseFloat(row[marksIndex]);
      
      // Validate marks
      if (isNaN(marks)) {
        console.warn(`Invalid marks for student ${name || index + 1}:`, row[marksIndex]);
        marks = 0;
      }
      
      // Ensure marks are within range
      marks = Math.max(0, Math.min(marks, maxMarks));
      
      return { name, id, marks };
    }).filter(Boolean); // Remove null entries
    
    return processedData;
  };

  // Generate template Excel file
  const downloadTemplate = () => {
    try {
      // Create sample data
      const templateData = [
        ['Student Name', 'Student ID', 'Marks'],
        ['John Doe', 'S001', 78],
        ['Jane Smith', 'S002', 85],
        ['Michael Johnson', 'S003', 65],
        ['', '', ''],
        ['', '', '']
      ];
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      
      // Add some styles (limited support in SheetJS)
      worksheet['!cols'] = [
        { wch: 20 }, // Student Name column width
        { wch: 15 }, // Student ID column width
        { wch: 10 }  // Marks column width
      ];
      
      // Create workbook and add sheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Marks Template');
      
      // Instructions sheet
      const instructionsData = [
        ['Instructions'],
        ['1. Enter student names in the "Student Name" column'],
        ['2. Enter student IDs in the "Student ID" column'],
        ['3. Enter marks (0-100) in the "Marks" column'],
        ['4. Do not change the column headers'],
        ['5. All three columns are required'],
        [''],
        ['Example Format:'],
        ['Student Name', 'Student ID', 'Marks'],
        ['John Doe', 'S001', 78],
        ['Jane Smith', 'S002', 85]
      ];
      
      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
      
      // Export workbook
      XLSX.writeFile(workbook, 'Student_Marks_Template.xlsx');
      
      showToast("Template downloaded successfully.", "success");
      setTemplateModalOpen(false);
      
    } catch (err) {
      console.error('Error creating template:', err);
      showToast("Failed to create template.", "error");
    }
  };

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const term = searchTerm.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(term) || 
      student.id.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Export results to Excel
  const exportResults = () => {
    if (students.length === 0) {
      showToast("No data to export. Please upload student data first.", "warning");
      return;
    }
    
    try {
      // Add grade to each student
      const gradedStudents = students.map(student => ({
        ...student,
        grade: getGradeForMark(student.marks)
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(gradedStudents.map(s => ({
        'Student Name': s.name,
        'Student ID': s.id,
        'Marks': s.marks,
        'Grade': s.grade
      })));
      
      // Add grade boundaries as additional rows
      const boundaryRows = [
        ['Grade Boundaries'],
        ['Grade', 'Minimum Mark']
      ];
      
      Object.entries(gradeBoundaries)
        .sort((a, b) => b[1] - a[1])
        .forEach(([grade, boundary]) => {
          if (!includeNC && grade === 'NC') return;
          boundaryRows.push([grade, boundary]);
        });
      
      // Add statistics
      const statRows = [
        ['Statistics'],
        ['Total Students', statistics.totalStudents],
        ['Highest Mark', statistics.highest],
        ['Lowest Mark', statistics.lowest],
        ['Average Mark', statistics.average],
        ['Median Mark', statistics.median],
        ['Standard Deviation', statistics.standardDeviation]
      ];
      
      // Add grade distribution
      const distributionRows = [
        ['Grade Distribution'],
        ['Grade', 'Number of Students', 'Percentage']
      ];
      
      // Create distribution data
      const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E'];
      if (includeNC) gradeOrder.push('NC');
      gradeOrder.push('F');
      
      gradeOrder.forEach(grade => {
        const count = statistics.gradeDistribution[grade] || 0;
        const percentage = statistics.totalStudents ? Math.round((count / statistics.totalStudents) * 100 * 10) / 10 : 0;
        distributionRows.push([grade, count, `${percentage}%`]);
      });
      
      // Create boundary and statistics worksheets
      const boundarySheet = XLSX.utils.aoa_to_sheet(boundaryRows);
      const statsSheet = XLSX.utils.aoa_to_sheet(statRows);
      const distributionSheet = XLSX.utils.aoa_to_sheet(distributionRows);
      
      // Create workbook and add sheets
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Grades');
      XLSX.utils.book_append_sheet(workbook, boundarySheet, 'Grade Boundaries');
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
      XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Grade Distribution');
      
      // Export workbook
      XLSX.writeFile(workbook, 'Grading_Results.xlsx');
      
      setExportModalOpen(false);
      showToast("Results exported successfully.", "success");
      
    } catch (err) {
      console.error('Error exporting results:', err);
      showToast("Failed to export results.", "error");
    }
  };

  // Update grade boundaries and close modal
  const saveGradeBoundaries = () => {
    setGradeSummaryModalOpen(false);
  };

  // Start dragging slider
  const startDragging = (grade) => {
    if (!includeNC && grade === 'NC') return;
    setActiveSlider(grade);
    setDragging(true);
  };

  // Handle slider dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && activeSlider && chartContainerRef.current) {
        const { mapping, chartArea } = markToPixelMapping.current;
        if (!mapping || !chartArea) return;
        
        // Calculate x position relative to chart area
        const chartRect = chartContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        
        // Convert pixel position to mark value
        const chartInstance = chartInstanceRef.current;
        if (!chartInstance || !chartInstance.scales.x) return;
        
        // Find the closest mark to the current mouse position
        const xValue = chartInstance.scales.x.getValueForPixel(mouseX);
        const newValue = Math.round(Math.max(0, Math.min(maxMarks, xValue)));
        
        if (activeSlider === 'NC') {
          // NC is always 0, don't allow dragging
          return;
        }
        
        // Get ordered list of grade keys
        const orderedGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
        
        const activeGradeIndex = orderedGrades.indexOf(activeSlider);
        
        // Validate against higher grade (if not highest grade)
        let upperBound = maxMarks;
        if (activeGradeIndex > 0) {
          const higherGrade = orderedGrades[activeGradeIndex - 1];
          upperBound = gradeBoundaries[higherGrade];
        }
        
        // Validate against lower grade (if not lowest grade)
        let lowerBound = 0;
        if (activeGradeIndex < orderedGrades.length - 1) {
          const lowerGrade = orderedGrades[activeGradeIndex + 1];
          lowerBound = gradeBoundaries[lowerGrade];
        }
        
        // Apply validation - ensure value is between bounds
        const validatedValue = Math.min(Math.max(newValue, lowerBound), upperBound);
        
        setGradeBoundaries(prev => ({
          ...prev,
          [activeSlider]: validatedValue
        }));
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);
        setActiveSlider(null);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, activeSlider, gradeBoundaries, maxMarks]);

  // Sort grades by grade level (A, A-, B, etc.) for display
  const orderedGradeBoundaries = Object.entries(gradeBoundaries)
    .filter(([grade]) => includeNC || grade !== 'NC')
    .sort((a, b) => {
      const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
      return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
    });

  // Calculate grade summaries
  const gradeSummaries = useMemo(() => {
    // Sort boundaries from highest to lowest
    const sortedBoundaries = Object.entries(gradeBoundaries)
      .filter(([grade]) => includeNC || grade !== 'NC')
      .sort((a, b) => b[1] - a[1]);
    
    // Create summaries with range info
    const summaries = [];
    
    for (let i = 0; i < sortedBoundaries.length; i++) {
      const [grade, minMark] = sortedBoundaries[i];
      
      // Upper bound is either the next grade's min - 1, or maxMarks
      const maxMark = i > 0 
        ? sortedBoundaries[i-1][1] - 1 
        : maxMarks;
      
      // Count students in this grade
      const studentsInGrade = students.filter(s => {
        const marks = s.marks;
        return marks >= minMark && marks <= maxMark;
      }).length;
      
      const percentage = students.length > 0 
        ? Math.round((studentsInGrade / students.length) * 100) 
        : 0;
      
      summaries.push({
        grade,
        minMark,
        maxMark,
        count: studentsInGrade,
        percentage
      });
    }
    
    // Add F grade if not including NC
    if (!includeNC) {
      const lowestBoundary = Math.min(...Object.values(gradeBoundaries).filter(val => val > 0));
      const studentsWithF = students.filter(s => s.marks < lowestBoundary).length;
      const percentageF = students.length > 0 
        ? Math.round((studentsWithF / students.length) * 100) 
        : 0;
      
      summaries.push({
        grade: 'F',
        minMark: 0,
        maxMark: lowestBoundary - 1,
        count: studentsWithF,
        percentage: percentageF
      });
    }
    
    return summaries;
  }, [gradeBoundaries, students, includeNC, maxMarks]);

  // Reset grade boundaries to default
  const resetGradeBoundaries = () => {
    setGradeBoundaries({
      'A': 90,
      'A-': 86,
      'B': 82,
      'B-': 78,
      'C': 74,
      'C-': 70,
      'D': 66,
      'E': 62,
      'NC': 0
    });
    showToast("Grade boundaries reset to default values.", "info");
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      <motion.div 
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-xl md:text-3xl font-bold text-gray-800"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Grade Distribution Analysis
          </motion.h1>
          
          <div className="flex space-x-2">
            <motion.button
              onClick={() => setGradeSettingsModalOpen(true)}
              className="p-2 text-purple-500 hover:text-purple-700 transition-colors"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              aria-label="Grade Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
            
            <motion.button
              onClick={() => setHelpModalOpen(true)}
              className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              aria-label="Help"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-blue-50 p-3 mr-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Import Data</h3>
                <p className="text-sm text-gray-500">Upload student marks from Excel or CSV</p>
              </div>
              <button
                onClick={handleFileSelect}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Import'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-green-50 p-3 mr-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Export Results</h3>
                <p className="text-sm text-gray-500">Download grades as Excel file</p>
              </div>
              <button
                onClick={() => setExportModalOpen(true)}
                className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                disabled={students.length === 0 || isUploading}
              >
                Export
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.1), 0 8px 10px -6px rgba(139, 92, 246, 0.1)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-purple-50 p-3 mr-4">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Grade Management</h3>
                <p className="text-sm text-gray-500">View and edit grade boundaries</p>
              </div>
              <button
                onClick={() => setGradeSummaryModalOpen(true)}
                className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                disabled={students.length === 0 || isUploading}
              >
                Manage
              </button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Statistics cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500"
            whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <h3 className="text-sm md:text-base text-gray-500 font-medium mb-1">Total Students</h3>
            <p className="text-xl md:text-3xl font-bold text-gray-800">{statistics.totalStudents}</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500"
            whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <h3 className="text-sm md:text-base text-gray-500 font-medium mb-1">Average Mark</h3>
            <p className="text-xl md:text-3xl font-bold text-gray-800">{statistics.average}</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500"
            whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <h3 className="text-sm md:text-base text-gray-500 font-medium mb-1">Range</h3>
            <p className="text-xl md:text-3xl font-bold text-gray-800">{statistics.lowest} - {statistics.highest}</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500"
            whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            onClick={() => setGradeSummaryModalOpen(true)}
            style={{ cursor: students.length > 0 ? 'pointer' : 'default' }}
          >
            <h3 className="text-sm md:text-base text-gray-500 font-medium mb-1">Grades</h3>
            <div className="flex items-center space-x-1">
              {students.length > 0 ? (
                Object.entries(gradeColors)
                  .filter(([grade]) => includeNC || grade !== 'NC')
                  .filter(([grade]) => statistics.gradeDistribution?.[grade] > 0)
                  .sort((a, b) => {
                    const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC', 'F'];
                    return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
                  })
                  .slice(0, 5) // Only show first 5 grades
                  .map(([grade, color]) => (
                    <span 
                      key={grade}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-medium"
                      style={{ backgroundColor: color.replace('0.7', '0.9') }}
                    >
                      {grade}
                    </span>
                  ))
              ) : (
                <p className="text-xl md:text-3xl font-bold text-gray-800">-</p>
              )}
              
              {students.length > 0 && Object.keys(statistics.gradeDistribution || {}).length > 5 && (
                <span className="text-xs text-gray-500">+more</span>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Grade Summary Section */}
        {students.length > 0 && (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Grade Distribution</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAutoGradeModalOpen(true)}
                  className="flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Auto-Grade
                </button>
                <button
                  onClick={() => setGradeSummaryModalOpen(true)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gradeSummaries.map((summary, index) => (
                    <motion.tr 
                      key={summary.grade}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ backgroundColor: getGradeColor(summary.grade) }}
                        >
                          {summary.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {summary.minMark} - {summary.maxMark}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {summary.count} ({summary.percentage}%)
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <motion.div 
                            className="h-2.5 rounded-full"
                            style={{ 
                              width: `${summary.percentage}%`,
                              backgroundColor: getGradeColor(summary.grade)
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${summary.percentage}%` }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        
        {/* Histogram Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-4 relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Grade Distribution Histogram</h3>
            
            {/* Legend and actions for selected students */}
            <div className="flex items-center space-x-2">
              {selectedStudents.length > 0 && (
                <button
                  onClick={clearSelectedStudents}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Selected students legend */}
          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap items-center mb-3 gap-2 bg-gray-50 p-2 rounded-lg">
              <span className="text-xs text-gray-500 border-r border-gray-300 pr-2 mr-1">Selected Students:</span>
              {selectedStudents.map((student, idx) => (
                <motion.span 
                  key={student.id} 
                  className="flex items-center text-xs font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: studentColors[idx % studentColors.length].replace('0.9', '0.2'),
                    color: studentColors[idx % studentColors.length].replace('rgba', 'rgb').replace(/, 0.9\)/, ')'),
                    border: `1px solid ${studentColors[idx % studentColors.length].replace('rgba', 'rgb').replace(/, 0.9\)/, ')')}`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.3, delay: idx * 0.05 }}
                >
                  <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: studentColors[idx % studentColors.length] }}></span>
                  {student.name} ({student.id}: {student.marks})
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
                    }}
                    className="ml-1 opacity-60 hover:opacity-100"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              ))}
            </div>
          )}
          
          {students.length > 0 ? (
            <div className="h-96 relative" ref={chartContainerRef}>
              <canvas ref={chartRef}></canvas>
              
              {/* Vertical Sliders */}
              {orderedGradeBoundaries.map(([grade, boundary]) => {
                // Skip NC if not included
                if (!includeNC && grade === 'NC') return null;
                
                // Add defensive checks
                const pixelPosition = markToPixelMapping.current?.mapping?.[boundary];
                
                return (
                  <div 
                    key={grade}
                    className="absolute bottom-0 top-0 select-none"
                    style={{
                      left: pixelPosition !== undefined ? `${pixelPosition}px` : `${(boundary / maxMarks) * 100}%`,
                      cursor: grade === 'NC' ? 'default' : 'col-resize',
                      width: '4px',
                      transform: 'translateX(-2px)',
                      zIndex: 10,
                      opacity: grade === 'NC' && !includeNC ? 0 : 1,
                      pointerEvents: grade === 'NC' ? 'none' : 'auto'
                    }}
                  >
                    {/* Slider Line */}
                    <motion.div 
                      className="absolute bottom-0 top-0 w-full"
                      style={{ 
                        backgroundColor: getGradeColor(grade),
                        opacity: activeSlider === grade ? 1 : 0.7
                      }}
                      whileHover={{ opacity: 0.9 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        startDragging(grade);
                      }}
                      layout
                    />
                    
                    {/* Grade Label */}
                    <motion.div
                      className="absolute top-0 transform -translate-y-8 -translate-x-1/2 font-bold text-white rounded-md p-1 px-2 text-sm"
                      style={{ 
                        backgroundColor: getGradeColor(grade),
                        left: '2px',
                        whiteSpace: 'nowrap'
                      }}
                      whileHover={{ scale: 1.1 }}
                      layout
                    >
                      {grade}: {boundary}
                    </motion.div>
                    
                    {/* Draggable Handle */}
                    <motion.div 
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full"
                      style={{ 
                        width: '16px',
                        height: '16px',
                        backgroundColor: 'white',
                        border: `3px solid ${getGradeColor(grade)}`,
                        left: '2px',
                        cursor: grade === 'NC' ? 'default' : 'col-resize',
                        opacity: grade === 'NC' ? 0.5 : 1
                      }}
                      whileHover={{ scale: grade === 'NC' ? 1 : 1.2 }}
                      whileTap={{ scale: grade === 'NC' ? 1 : 0.9 }}
                      onMouseDown={(e) => {
                        if (grade !== 'NC') {
                          e.preventDefault();
                          startDragging(grade);
                        }
                      }}
                      layout
                    />
                  </div>
                );
              })}
              
              {/* Instructions for slider manipulation */}
              <div className="absolute top-2 right-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm p-2 text-xs text-gray-600">
                <p>Drag grade sliders to adjust boundaries</p>
              </div>
            </div>
          ) : (
            <EmptyState 
              message="No student data available. Upload an Excel or CSV file to view grade distribution."
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          )}
        </motion.div>
        
        {/* Student List Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Student List</h3>
            
            <div className="text-sm text-gray-500">
              {selectedStudents.length > 0 ? (
                <div className="flex items-center">
                  <span>Selected: </span>
                  <span className="font-medium text-blue-700 ml-1">{selectedStudents.length} students</span>
                  <button 
                    onClick={clearSelectedStudents}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <span>Click on a student to highlight on the chart</span>
              )}
            </div>
          </div>
          
          {/* Search Box */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Student Table */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {students.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-4 py-3">Name</th>
                      <th scope="col" className="px-4 py-3">ID</th>
                      <th scope="col" className="px-4 py-3">Marks</th>
                      <th scope="col" className="px-4 py-3">Grade</th>
                      <th scope="col" className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => {
                        const isSelected = selectedStudents.some(s => s.id === student.id);
                        const selectedIndex = selectedStudents.findIndex(s => s.id === student.id);
                        const grade = getGradeForMark(student.marks);
                        
                        return (
                          <motion.tr 
                            key={student.id || index}
                            className={`border-b ${isSelected ? '' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:bg-blue-50 transition-colors duration-200`}
                            style={isSelected ? { 
                              background: `${studentColors[selectedIndex % studentColors.length].replace('0.9', '0.15')}`,
                              borderLeft: `4px solid ${studentColors[selectedIndex % studentColors.length]}`
                            } : {}}
                            whileHover={{ 
                              backgroundColor: isSelected ? studentColors[selectedIndex % studentColors.length].replace('0.9', '0.2') : 'rgba(219, 234, 254, 0.5)',
                              scale: 1.01,
                              transition: { duration: 0.2 }
                            }}
                            animate={{ 
                              backgroundColor: isSelected ? studentColors[selectedIndex % studentColors.length].replace('0.9', '0.15') : (index % 2 === 0 ? 'rgba(255, 255, 255, 1)' : 'rgba(249, 250, 251, 1)'),
                              transition: { duration: 0.3 }
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                              <div className="flex items-center">
                                {isSelected && (
                                  <span 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{backgroundColor: studentColors[selectedIndex % studentColors.length]}}
                                  ></span>
                                )}
                                <span>{student.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {student.id}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <span className="mr-2">{student.marks}</span>
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full"
                                    style={{ 
                                      width: `${(student.marks / maxMarks) * 100}%`,
                                      backgroundColor: getGradeColor(grade)
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(student.marks / maxMarks) * 100}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <motion.span
                                className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                                style={{ backgroundColor: getGradeColor(grade) }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {grade}
                              </motion.span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => toggleStudentSelection(student)}
                                className={`px-2 py-1 text-xs rounded-md ${
                                  isSelected 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                {isSelected ? 'Deselect' : 'Select'}
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center">
                          <EmptyState 
                            message="No students match your search criteria."
                            icon={
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                              </svg>
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <EmptyState 
                  message="No student data available. Upload an Excel or CSV file to view students."
                  icon={
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Import Modal */}
      <Modal 
        isOpen={importModalOpen} 
        onClose={() => setImportModalOpen(false)}
        title="Import Student Data"
        type="import"
      >
        <p className="mb-4 text-gray-600">
          Upload an Excel or CSV file with student data. The file should contain columns for student name, ID, and marks.
        </p>
        
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg shadow transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Select File
          </button>
          
          <div className="text-center">
            <button
              onClick={() => {
                setImportModalOpen(false);
                setTemplateModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Download Template
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Export Modal */}
      <Modal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)}
        title="Export Grading Results"
        type="export"
      >
        <p className="mb-4 text-gray-600">
          Export student grades and statistics to an Excel file. The file will include:
        </p>
        
        <ul className="list-disc text-left pl-5 mb-4 text-gray-600">
          <li>Complete student list with grades</li>
          <li>Current grade boundaries</li>
          <li>Class statistics</li>
          <li>Grade distribution</li>
        </ul>
        
        <button
          onClick={exportResults}
          className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow transition-colors duration-200 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export to Excel
        </button>
      </Modal>
      
      {/* Auto-Grade Modal */}
      <Modal 
        isOpen={autoGradeModalOpen} 
        onClose={() => setAutoGradeModalOpen(false)}
        title="Automatic Grade Boundaries"
        type="autograde"
      >
        <p className="mb-4 text-gray-600">
          Set grade boundaries automatically based on the distribution of marks. The algorithm will:
        </p>
        
        <ul className="list-disc text-left pl-5 mb-4 text-gray-600">
          <li>Analyze the distribution pattern</li>
          <li>Find natural breaks in the data</li>
          <li>Set boundaries at optimal points</li>
          <li>Ensure fair grading across the class</li>
        </ul>
        
        {isAutoGrading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div 
                className="bg-purple-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${gradingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Analyzing distribution... {gradingProgress}%
            </p>
          </div>
        )}
        
        <button
          onClick={autoSetGradeBoundaries}
          disabled={isAutoGrading}
          className={`flex items-center justify-center w-full ${
            isAutoGrading 
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white px-4 py-3 rounded-lg shadow transition-colors duration-200 font-medium`}
        >
          {isAutoGrading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Auto-Set Boundaries
            </>
          )}
        </button>
      </Modal>
      
      {/* Template Modal */}
      <Modal 
        isOpen={templateModalOpen} 
        onClose={() => setTemplateModalOpen(false)}
        title="Download Template"
        type="info"
      >
        <p className="mb-4 text-gray-600">
          Download an Excel template with the correct format for student data. The template includes:
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left">Student Name</th>
                <th className="py-2 px-3 text-left">Student ID</th>
                <th className="py-2 px-3 text-left">Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-3">John Doe</td>
                <td className="py-2 px-3">S001</td>
                <td className="py-2 px-3">78</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-3">Jane Smith</td>
                <td className="py-2 px-3">S002</td>
                <td className="py-2 px-3">85</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Michael Johnson</td>
                <td className="py-2 px-3">S003</td>
                <td className="py-2 px-3">65</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow transition-colors duration-200 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Template
        </button>
      </Modal>
      
      {/* Grade Summary Modal */}
      <Modal 
        isOpen={gradeSummaryModalOpen} 
        onClose={() => setGradeSummaryModalOpen(false)}
        title="Grade Boundary Management"
        type="info"
      >
        <div className="text-left mb-4">
          <p className="text-gray-600 mb-4">
            Edit grade boundaries by adjusting the values below. The changes will update the histogram and grade calculations.
          </p>
          
          <div className="max-h-64 overflow-y-auto px-1 py-2">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="py-2 px-3 text-left">Grade</th>
                  <th className="py-2 px-3 text-left">Min. Marks</th>
                  <th className="py-2 px-3 text-left">Max. Marks</th>
                  <th className="py-2 px-3 text-left">Students</th>
                </tr>
              </thead>
              <tbody>
                {gradeSummaries.map((summary, index) => (
                  <tr key={summary.grade} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-3">
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                        style={{ backgroundColor: getGradeColor(summary.grade) }}
                      >
                        {summary.grade}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {summary.grade === 'NC' ? (
                        <span className="text-gray-500">0 (fixed)</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          value={summary.minMark}
                          onChange={(e) => updateGradeBoundary(summary.grade, e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                        />
                      )}
                    </td>
                    <td className="py-2 px-3">{summary.maxMark}</td>
                    <td className="py-2 px-3">{summary.count} ({summary.percentage}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={resetGradeBoundaries}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Reset to Default
          </button>
          <button
            onClick={saveGradeBoundaries}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
          >
            Save Changes
          </button>
        </div>
      </Modal>
      
      {/* Grade Settings Modal */}
      <Modal 
        isOpen={gradeSettingsModalOpen} 
        onClose={() => setGradeSettingsModalOpen(false)}
        title="Grade Settings"
        type="info"
      >
        <div className="text-left mb-4">
          <div className="mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeNC}
                onChange={() => setIncludeNC(!includeNC)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">Include NC Grade (starts at 0)</span>
            </label>
            <p className="text-xs text-gray-500 ml-14 mt-1">
              When disabled, students below the lowest defined grade will receive an F.
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Grade Color Legend</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(gradeColors)
                .filter(([grade]) => includeNC || grade !== 'NC')
                .sort((a, b) => {
                  const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
                  return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
                })
                .map(([grade, color]) => (
                  <div 
                    key={grade}
                    className="flex items-center px-2 py-1 rounded-md"
                    style={{ backgroundColor: color.replace('0.7', '0.1') }}
                  >
                    <span 
                      className="w-4 h-4 rounded-full mr-1"
                      style={{ backgroundColor: color.replace('0.7', '0.9') }}
                    ></span>
                    <span className="text-sm font-medium">{grade}</span>
                  </div>
                ))
              }
              {!includeNC && (
                <div 
                  className="flex items-center px-2 py-1 rounded-md bg-gray-100"
                >
                  <span 
                    className="w-4 h-4 rounded-full mr-1 bg-gray-500"
                  ></span>
                  <span className="text-sm font-medium">F</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-2">Grade Management Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  setGradeSettingsModalOpen(false);
                  setGradeSummaryModalOpen(true);
                }}
                className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Grade Boundaries
              </button>
              
              <button 
                onClick={() => {
                  setGradeSettingsModalOpen(false);
                  setAutoGradeModalOpen(true);
                }}
                className="flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Auto-Grade
              </button>
              
              <button 
                onClick={() => {
                  setGradeSettingsModalOpen(false);
                  resetGradeBoundaries();
                }}
                className="flex items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to Default
              </button>
              
              <button 
                onClick={() => {
                  setGradeSettingsModalOpen(false);
                  setExportModalOpen(true);
                }}
                className="flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export Grades
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setGradeSettingsModalOpen(false)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200 font-medium w-full"
        >
          Close
        </button>
      </Modal>
      
      {/* Help Modal */}
      <Modal 
        isOpen={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)}
        title="How to Use Grade Distribution"
        type="info"
      >
        <div className="text-left">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">1. Import Student Data</h4>
            <p className="text-gray-600 text-sm">Upload an Excel or CSV file with student name, ID, and marks.</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">2. View Distribution</h4>
            <p className="text-gray-600 text-sm">Analyze the histogram to see how marks are distributed.</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">3. Set Grade Boundaries</h4>
            <p className="text-gray-600 text-sm">Either use Auto-Grade or drag the sliders to adjust grade cut-offs.</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">4. Select Students</h4>
            <p className="text-gray-600 text-sm">Click on students in the table to highlight them in the histogram (up to 10 at once).</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">5. Manage Grades</h4>
            <p className="text-gray-600 text-sm">Use the Grade Management button to view and edit grade boundaries.</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">6. Export Results</h4>
            <p className="text-gray-600 text-sm">Download final grades and statistics as an Excel file.</p>
          </div>
        </div>
        
        <button
          onClick={() => setHelpModalOpen(false)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
        >
          Got it
        </button>
      </Modal>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradingTab;