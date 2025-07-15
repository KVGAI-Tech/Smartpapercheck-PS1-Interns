import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import Modal from './GradingTab/Modal';
import Toast from './GradingTab/Toast';
import Tooltip from './GradingTab/Tooltip';
import EmptyState from './GradingTab/EmptyState';

Chart.register(...registerables);

const GradingTab = ({ maxMarks = 100 }) => {
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
  const [toast, setToast] = useState(null);
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [autoGradeModalOpen, setAutoGradeModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [gradeSummaryModalOpen, setGradeSummaryModalOpen] = useState(false);
  const [gradeSettingsModalOpen, setGradeSettingsModalOpen] = useState(false);
  const [animateHistogram, setAnimateHistogram] = useState(false);
  const [includeNC, setIncludeNC] = useState(true);
  
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
  
  const clearSelectedStudents = () => {
    setSelectedStudents([]);
  };

  const getGradeForMark = (mark) => {
    const sortedBoundaries = Object.entries(gradeBoundaries)
      .sort((a, b) => b[1] - a[1]);
    
    if (includeNC) {
      return sortedBoundaries.find(([_, boundary]) => mark >= boundary)?.[0] || 'F';
    } else {
      return sortedBoundaries
        .filter(([grade]) => grade !== 'NC')
        .find(([_, boundary]) => mark >= boundary)?.[0] || 'F';
    }
  };

  const getGradeColor = (grade) => {
    return gradeColors[grade] || 'rgba(0, 0, 0, 0.7)';
  };

  const autoSetGradeBoundaries = async () => {
    if (histogramData.length === 0) {
      showToast("No data available for grading. Please upload student data first.", "warning");
      return;
    }

    setIsAutoGrading(true);
    setGradingProgress(0);

    try {
      const smoothedData = [];
      const windowSize = 5;
      
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
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const doubleSmoothedData = [];
      for (let i = 0; i < smoothedData.length; i++) {
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let j = Math.max(0, i - windowSize*2); j <= Math.min(smoothedData.length - 1, i + windowSize*2); j++) {
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
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const peaks = [];
      for (let i = 3; i < doubleSmoothedData.length - 3; i++) {
        const current = doubleSmoothedData[i].count;
        if (current > 0.1) {
          let isPeak = true;
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
      
      peaks.sort((a, b) => b.mark - a.mark);
      
      let valleys = [];
      for (let i = 0; i < peaks.length - 1; i++) {
        const startMark = peaks[i+1].mark;
        const endMark = peaks[i].mark;
        
        let minVal = Infinity;
        let minMark = startMark;
        
        for (let j = startMark; j <= endMark; j++) {
          const idx = doubleSmoothedData.findIndex(item => item.marks === j);
          if (idx !== -1 && doubleSmoothedData[idx].count < minVal) {
            minVal = doubleSmoothedData[idx].count;
            minMark = j;
          }
        }
        
        if (minMark !== startMark && minMark !== endMark) {
          valleys.push(minMark);
        }
        
        setGradingProgress(50 + Math.round((i / (peaks.length - 1)) * 10));
      }
      
      const marks = students.map(s => s.marks).sort((a, b) => b - a);
      const percentileCutoffs = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85];
      
      percentileCutoffs.forEach(cutoff => {
        const idx = Math.floor(marks.length * cutoff);
        if (idx < marks.length) {
          valleys.push(marks[idx]);
        }
      });
      
      valleys = Array.from(new Set(valleys)).sort((a, b) => b - a);
      
      const gradeKeys = Object.keys(gradeBoundaries).filter(g => g !== 'NC');
      
      if (valleys.length < gradeKeys.length - 1) {
        const step = Math.floor(maxMarks / (gradeKeys.length));
        for (let i = 1; i < gradeKeys.length; i++) {
          valleys.push(i * step);
        }
        valleys = Array.from(new Set(valleys)).sort((a, b) => b - a);
      }
      
      valleys = valleys.slice(0, gradeKeys.length - 1);
      
      valleys.sort((a, b) => b - a);
      
      const newBoundaries = { ...gradeBoundaries };
      
      for (let i = 0; i < valleys.length; i++) {
        newBoundaries[gradeKeys[i]] = Math.round(valleys[i]);
      }
      
      newBoundaries['NC'] = 0;
      
      const orderedGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
      for (let i = 0; i < orderedGrades.length - 1; i++) {
        const currentGrade = orderedGrades[i];
        const nextGrade = orderedGrades[i+1];
        
        if (newBoundaries[currentGrade] <= newBoundaries[nextGrade]) {
          newBoundaries[currentGrade] = newBoundaries[nextGrade] + 4;
        }
      }
      
      for (const grade in newBoundaries) {
        newBoundaries[grade] = Math.min(newBoundaries[grade], maxMarks);
      }
      
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

    const barColors = histogramData.map(item => {
      const grade = getGradeForMark(item.marks);
      return getGradeColor(grade);
    });

    const barsWithSelectedStudents = Array(histogramData.length).fill(false);
    
    selectedStudents.forEach((student) => {
      const markIndex = Math.floor(student.marks);
      if (markIndex >= 0 && markIndex <= maxMarks) {
        barsWithSelectedStudents[markIndex] = true;
      }
    });
    
    selectedStudents.forEach((student, index) => {
      const markIndex = Math.floor(student.marks);
      if (markIndex >= 0 && markIndex <= maxMarks) {
        const selectedStudentsInThisBar = histogramData[markIndex].students.filter(s => 
          selectedStudents.some(selected => selected.id === s.id)
        );
        
        if (selectedStudentsInThisBar.length === 1) {
          barColors[markIndex] = studentColors[index % studentColors.length];
        } else {
          const studentIndex = selectedStudentsInThisBar.findIndex(s => s.id === student.id);
          if (studentIndex === 0) {
            barColors[markIndex] = 'rgba(255, 215, 0, 0.9)';
          }
        }
      }
    });

    const ctx = chartRef.current.getContext('2d');
    
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

  const statistics = useMemo(() => {
    if (students.length === 0) return { highest: 0, lowest: 0, average: 0, totalStudents: 0, median: 0, standardDeviation: 0 };
    
    const marks = students.map(student => student.marks);
    marks.sort((a, b) => a - b);
    
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const sum = marks.reduce((a, b) => a + b, 0);
    const average = marks.length ? Math.round((sum / marks.length) * 10) / 10 : 0;
    
    const middleIndex = Math.floor(marks.length / 2);
    const median = marks.length % 2 === 0 
      ? (marks[middleIndex - 1] + marks[middleIndex]) / 2 
      : marks[middleIndex];
    
    const meanDiffSquared = marks.map(mark => Math.pow(mark - average, 2));
    const variance = meanDiffSquared.reduce((a, b) => a + b, 0) / marks.length;
    const standardDeviation = Math.round(Math.sqrt(variance) * 10) / 10;
    
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

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const updateGradeBoundary = (grade, value) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) return;
    
    const orderedGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
    
    const gradeIndex = orderedGrades.indexOf(grade);
    
    let upperBound = maxMarks;
    if (gradeIndex > 0) {
      const higherGrade = orderedGrades[gradeIndex - 1];
      upperBound = gradeBoundaries[higherGrade];
    }
    
    let lowerBound = 0;
    if (gradeIndex < orderedGrades.length - 1) {
      const lowerGrade = orderedGrades[gradeIndex + 1];
      lowerBound = gradeBoundaries[lowerGrade];
    }
    
    const validatedValue = Math.min(Math.max(numValue, lowerBound), upperBound);
    
    setGradeBoundaries(prev => ({
      ...prev,
      [grade]: validatedValue
    }));
  };

  const handleFileSelect = () => {
    setImportModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setImportModalOpen(false);
      
      const fileBuffer = await readFileAsArrayBuffer(file);
      
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcelFile = (buffer) => {
    try {
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        cellStyles: true
      });
      
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      return processRawData(rawData);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      throw new Error("Failed to process Excel file. Please check the format.");
    }
  };

  const processCSVFile = async (buffer) => {
    try {
      const text = new TextDecoder().decode(buffer);
      
      const result = Papa.parse(text, {
        header: false,
        skipEmptyLines: true
      });
      
      return processRawData(result.data);
    } catch (error) {
      console.error("Error processing CSV file:", error);
      throw new Error("Failed to process CSV file. Please check the format.");
    }
  };

  const processRawData = (rawData) => {
    if (!rawData || rawData.length <= 1) {
      throw new Error("No data found or invalid format.");
    }
    
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
    
    const processedData = rawData.slice(1).map((row, index) => {
      if (!row || !row.length) return null;
      
      const name = String(row[nameIndex] || '').trim();
      const id = String(row[idIndex] || '').trim();
      let marks = parseFloat(row[marksIndex]);
      
      if (isNaN(marks)) {
        console.warn(`Invalid marks for student ${name || index + 1}:`, row[marksIndex]);
        marks = 0;
      }
      
      marks = Math.max(0, Math.min(marks, maxMarks));
      
      return { name, id, marks };
    }).filter(Boolean);
    
    return processedData;
  };

  const downloadTemplate = () => {
    try {
      const templateData = [
        ['Student Name', 'Student ID', 'Marks'],
        ['John Doe', 'S001', 78],
        ['Jane Smith', 'S002', 85],
        ['Michael Johnson', 'S003', 65],
        ['', '', ''],
        ['', '', '']
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      
      worksheet['!cols'] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 10 }
      ];
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Marks Template');
      
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
      
      XLSX.writeFile(workbook, 'Student_Marks_Template.xlsx');
      
      showToast("Template downloaded successfully.", "success");
      setTemplateModalOpen(false);
      
    } catch (err) {
      console.error('Error creating template:', err);
      showToast("Failed to create template.", "error");
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const term = searchTerm.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(term) || 
      student.id.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  const exportResults = () => {
    if (students.length === 0) {
      showToast("No data to export. Please upload student data first.", "warning");
      return;
    }
    
    try {
      const gradedStudents = students.map(student => ({
        ...student,
        grade: getGradeForMark(student.marks)
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(gradedStudents.map(s => ({
        'Student Name': s.name,
        'Student ID': s.id,
        'Marks': s.marks,
        'Grade': s.grade
      })));
      
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
      
      const statRows = [
        ['Statistics'],
        ['Total Students', statistics.totalStudents],
        ['Highest Mark', statistics.highest],
        ['Lowest Mark', statistics.lowest],
        ['Average Mark', statistics.average],
        ['Median Mark', statistics.median],
        ['Standard Deviation', statistics.standardDeviation]
      ];
      
      const distributionRows = [
        ['Grade Distribution'],
        ['Grade', 'Number of Students', 'Percentage']
      ];
      
      const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E'];
      if (includeNC) gradeOrder.push('NC');
      gradeOrder.push('F');
      
      gradeOrder.forEach(grade => {
        const count = statistics.gradeDistribution[grade] || 0;
        const percentage = statistics.totalStudents ? Math.round((count / statistics.totalStudents) * 100 * 10) / 10 : 0;
        distributionRows.push([grade, count, `${percentage}%`]);
      });
      
      const boundarySheet = XLSX.utils.aoa_to_sheet(boundaryRows);
      const statsSheet = XLSX.utils.aoa_to_sheet(statRows);
      const distributionSheet = XLSX.utils.aoa_to_sheet(distributionRows);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Grades');
      XLSX.utils.book_append_sheet(workbook, boundarySheet, 'Grade Boundaries');
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
      XLSX.utils.book_append_sheet(workbook, distributionSheet, 'Grade Distribution');
      
      XLSX.writeFile(workbook, 'Grading_Results.xlsx');
      
      setExportModalOpen(false);
      showToast("Results exported successfully.", "success");
      
    } catch (err) {
      console.error('Error exporting results:', err);
      showToast("Failed to export results.", "error");
    }
  };

  const saveGradeBoundaries = () => {
    setGradeSummaryModalOpen(false);
  };

  const startDragging = (grade) => {
    if (!includeNC && grade === 'NC') return;
    setActiveSlider(grade);
    setDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && activeSlider && chartContainerRef.current) {
        const { mapping, chartArea } = markToPixelMapping.current;
        if (!mapping || !chartArea) return;
        
        const chartRect = chartContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        
        const chartInstance = chartInstanceRef.current;
        if (!chartInstance || !chartInstance.scales.x) return;
        
        const xValue = chartInstance.scales.x.getValueForPixel(mouseX);
        const newValue = Math.round(Math.max(0, Math.min(maxMarks, xValue)));
        
        if (activeSlider === 'NC') {
          return;
        }
        
        const orderedGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
        
        const activeGradeIndex = orderedGrades.indexOf(activeSlider);
        
        let upperBound = maxMarks;
        if (activeGradeIndex > 0) {
          const higherGrade = orderedGrades[activeGradeIndex - 1];
          upperBound = gradeBoundaries[higherGrade];
        }
        
        let lowerBound = 0;
        if (activeGradeIndex < orderedGrades.length - 1) {
          const lowerGrade = orderedGrades[activeGradeIndex + 1];
          lowerBound = gradeBoundaries[lowerGrade];
        }
        
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

  const orderedGradeBoundaries = Object.entries(gradeBoundaries)
    .filter(([grade]) => includeNC || grade !== 'NC')
    .sort((a, b) => {
      const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
      return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
    });

  const gradeSummaries = useMemo(() => {
    const sortedBoundaries = Object.entries(gradeBoundaries)
      .filter(([grade]) => includeNC || grade !== 'NC')
      .sort((a, b) => b[1] - a[1]);
    
    const summaries = [];
    
    for (let i = 0; i < sortedBoundaries.length; i++) {
      const [grade, minMark] = sortedBoundaries[i];
      
      const maxMark = i > 0 
        ? sortedBoundaries[i-1][1] - 1 
        : maxMarks;
      
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
                  .slice(0, 5)
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
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-4 relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Grade Distribution Histogram</h3>
            
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
              
              {orderedGradeBoundaries.map(([grade, boundary]) => {
                if (!includeNC && grade === 'NC') return null;
                
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 h-96 overflow-y-auto block">
                    {filteredStudents.map((student, index) => (
                      <motion.tr 
                        key={student.id} 
                        className={`cursor-pointer transition-colors duration-200 ${selectedStudents.some(s => s.id === student.id) ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                        onClick={() => toggleStudentSelection(student)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{student.name}</td>
                        <td className="px-4 py-2">{student.id}</td>
                        <td className="px-4 py-2">{student.marks}</td>
                        <td className="px-4 py-2">
                          <span 
                            className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                            style={{ backgroundColor: getGradeColor(getGradeForMark(student.marks)) }}
                          >
                            {getGradeForMark(student.marks)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                message="No students to display."
                icon={
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />
                  </svg>
                }
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      <Modal 
        isOpen={importModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        title="Import Student Data" 
        type="import"
      >
        <p className="text-gray-600 mb-4">Upload an Excel (.xlsx, .xls) or CSV file with student names, IDs, and marks.</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
          >
            Choose File
          </button>
          <button 
            onClick={() => setTemplateModalOpen(true)} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Download Template
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
        title="Export Grading Results" 
        type="export"
      >
        <p className="text-gray-600 mb-4">This will export the current student grades and grade boundaries to an Excel file.</p>
        <button 
          onClick={exportResults} 
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
        >
          Export Now
        </button>
      </Modal>

      <Modal 
        isOpen={autoGradeModalOpen} 
        onClose={() => setAutoGradeModalOpen(false)} 
        title="Automatic Grade Setter" 
        type="autograde"
      >
        <p className="text-gray-600 mb-4">This will attempt to find natural clusters in the data to set grade boundaries automatically. Do you want to proceed?</p>
        {isAutoGrading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${gradingProgress}%` }}
            ></div>
          </div>
        )}
        <button 
          onClick={autoSetGradeBoundaries} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
          disabled={isAutoGrading}
        >
          {isAutoGrading ? `Grading... ${gradingProgress}%` : 'Auto-set Grades'}
        </button>
      </Modal>

      <Modal 
        isOpen={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
        title="Help & Instructions"
      >
        <div className="text-left text-gray-600 space-y-2">
          <p><strong>Import Data:</strong> Upload an Excel or CSV file with columns for student name, ID, and marks.</p>
          <p><strong>Histogram:</strong> Visualizes the distribution of marks. You can click on a student in the list to highlight them on the chart.</p>
          <p><strong>Grade Sliders:</strong> Drag the vertical lines on the histogram to adjust the grade boundaries.</p>
          <p><strong>Auto-Grade:</strong> Automatically sets grade boundaries based on the distribution of marks.</p>
        </div>
      </Modal>

      <Modal 
        isOpen={templateModalOpen} 
        onClose={() => setTemplateModalOpen(false)} 
        title="Download Template"
      >
        <p className="text-gray-600 mb-4">Download a template Excel file with the correct format for student data.</p>
        <button 
          onClick={downloadTemplate} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
        >
          Download
        </button>
      </Modal>

      <Modal 
        isOpen={gradeSummaryModalOpen} 
        onClose={() => setGradeSummaryModalOpen(false)} 
        title="Grade Boundaries"
      >
        <div className="space-y-3">
          {orderedGradeBoundaries.map(([grade, boundary]) => (
            <div key={grade} className="flex items-center justify-between">
              <label className="font-medium text-gray-700">{grade}</label>
              <input 
                type="number" 
                value={boundary} 
                onChange={(e) => updateGradeBoundary(grade, e.target.value)} 
                className="w-24 p-1 border border-gray-300 rounded-md text-center"
                disabled={grade === 'NC'}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button 
            onClick={resetGradeBoundaries} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Reset
          </button>
          <button 
            onClick={saveGradeBoundaries} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 font-medium"
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={gradeSettingsModalOpen} 
        onClose={() => setGradeSettingsModalOpen(false)} 
        title="Grade Settings"
      >
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700">Include 'NC' (No Credit) Grade</label>
          <div 
            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${includeNC ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => setIncludeNC(!includeNC)}
          >
            <span 
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${includeNC ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradingTab;
