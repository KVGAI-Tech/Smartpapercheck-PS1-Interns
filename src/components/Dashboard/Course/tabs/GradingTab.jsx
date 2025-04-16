import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const GradingTab = ({ maxMarks = 100 }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const [gradeBoundaries, setGradeBoundaries] = useState({
    'A': 70,
    'A-': 60,
    'B': 50,
    'B-': 45,
    'C': 40,
    'D': 35,
    'E': 30,
    'NC': 20
  });
  const [histogramData, setHistogramData] = useState([]);
  const [chart, setChart] = useState(null);
  const [activeSlider, setActiveSlider] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [sliderPositions, setSliderPositions] = useState({});
  const markToPixelMapping = useRef({});

  // Generate sample histogram data
  useEffect(() => {
    const generateSampleData = () => {
      const data = [];
      for (let i = 0; i <= maxMarks; i++) {
        // Create more realistic distribution with some peaks and valleys
        let count;
        if (i < 20) {
          count = Math.floor(Math.random() * 4); // Few students with very low marks
        } else if (i > 80) {
          count = Math.floor(Math.random() * 4); // Few students with very high marks
        } else if (i > 40 && i < 60) {
          count = Math.floor(Math.random() * 10); // More students in the middle range
        } else {
          count = Math.floor(Math.random() * 7); // Average number elsewhere
        }
        
        data.push({
          marks: i,
          count: count
        });
      }
      setHistogramData(data);
    };
    generateSampleData();
  }, [maxMarks]);

  // Calculate statistics from histogram data
  const statistics = useMemo(() => {
    if (histogramData.length === 0) return { highest: 0, lowest: 0, average: 0, totalStudents: 0 };
    
    let sum = 0;
    let totalCount = 0;
    let highest = 0;
    let lowest = maxMarks;
    
    histogramData.forEach(item => {
      if (item.count > 0) {
        sum += item.marks * item.count;
        totalCount += item.count;
        
        if (item.marks > highest) highest = item.marks;
        if (item.marks < lowest && item.count > 0) lowest = item.marks;
      }
    });
    
    return {
      highest,
      lowest,
      average: totalCount ? Math.round((sum / totalCount) * 10) / 10 : 0,
      totalStudents: totalCount
    };
  }, [histogramData, maxMarks]);

  // Setup chart with position calculation plugin
  useEffect(() => {
    if (chartRef.current && histogramData.length > 0) {
      if (chart) {
        chart.destroy();
      }

      const updateSliderPositions = (chart) => {
        // Create a mapping of mark values to pixel positions
        const mapping = {};
        
        // Check if chart and its scales are properly initialized
        if (!chart || !chart.scales || !chart.scales.x || !chart.chartArea) {
          return; // Exit early if chart isn't fully initialized
        }
        
        const xScale = chart.scales.x;
        
        // Get chart dimensions with safety checks
        const chartArea = {
          left: chart.chartArea?.left || 0,
          right: chart.chartArea?.right || 0,
          width: (chart.chartArea?.right || 0) - (chart.chartArea?.left || 0)
        };
        
        // Only proceed if we have valid chart dimensions
        if (chartArea.width <= 0) {
          return;
        }
        
        // Map each mark to its pixel position
        for (let i = 0; i <= maxMarks; i++) {
          try {
            // Get the pixel position for this mark value with error handling
            mapping[i] = xScale.getPixelForValue(i);
          } catch (e) {
            console.log('Error getting pixel for value', i, e);
          }
        }
        
        // Store the mapping for later use
        markToPixelMapping.current = {
          mapping,
          chartArea
        };
        
        // Update slider positions
        const positions = {};
        Object.entries(gradeBoundaries).forEach(([grade, boundary]) => {
          if (mapping[boundary] !== undefined) {
            positions[grade] = mapping[boundary];
          }
        });
        
        setSliderPositions(positions);
      };

      const ctx = chartRef.current.getContext('2d');
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: histogramData.map(item => item.marks),
          datasets: [{
            label: 'Number of Students',
            data: histogramData.map(item => item.count),
            backgroundColor: histogramData.map(item => {
              const grade = Object.entries(gradeBoundaries).find(
                ([_, boundary]) => item.marks >= boundary
              )?.[0] || 'F';
              return getGradeColor(grade);
            }),
            borderColor: '#ffffff',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false, // Remove animations
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Students'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Marks'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const marks = context.parsed.x;
                  const grade = Object.entries(gradeBoundaries).find(
                    ([_, boundary]) => marks >= boundary
                  )?.[0] || 'NC';
                  return [`Marks: ${marks}`, `Grade: ${grade}`, `Count: ${context.parsed.y}`];
                }
              }
            },
            // Custom plugin to update slider positions after render
            positionCalculator: {
              id: 'positionCalculator',
              afterRender: (chart) => {
                updateSliderPositions(chart);
              },
              afterResize: (chart) => {
                updateSliderPositions(chart);
              }
            }
          }
        },
        plugins: [{
          id: 'positionCalculator',
          afterRender: (chart) => {
            // Only call when chart is fully rendered
            if (chart && chart.chartArea && chart.scales && chart.scales.x) {
              updateSliderPositions(chart);
            }
          },
          resize: (chart) => {
            // Safely handle resize events
            try {
              if (chart && chart.chartArea && chart.scales && chart.scales.x) {
                updateSliderPositions(chart);
              }
            } catch (e) {
              console.log('Error during chart resize', e);
            }
          }
        }]
      });

      setChart(newChart);
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [histogramData, gradeBoundaries, maxMarks]);

  // Slider drag handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && activeSlider && chartContainerRef.current) {
        const { mapping, chartArea } = markToPixelMapping.current;
        if (!mapping || !chartArea) return;
        
        // Calculate x position relative to chart area
        const chartRect = chartContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        
        // Convert pixel position to mark value
        const chart = chartRef.current && Chart.getChart(chartRef.current);
        if (!chart || !chart.scales.x) return;
        
        // Find the closest mark to the current mouse position
        const xValue = chart.scales.x.getValueForPixel(mouseX);
        const newValue = Math.round(xValue);
        
        // Get ordered list of grade keys (A, A-, B, etc.)
        const orderedGrades = Object.keys(gradeBoundaries).sort((a, b) => {
          // Custom sorting for grades
          const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
          return gradeOrder.indexOf(a) - gradeOrder.indexOf(b);
        });
        
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

  const startDragging = (grade) => {
    setActiveSlider(grade);
    setDragging(true);
  };

  const getGradeColor = (grade) => {
    const colors = {
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
    return colors[grade] || 'rgba(0, 0, 0, 0.7)';
  }; 

  // Automatically set grade boundaries based on histogram distribution
  const autoSetGradeBoundaries = () => {
    if (histogramData.length === 0) return;

    // Create a smoothed version of the histogram to better find local minima
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
    }
    
    // Find local minima in the smoothed data (valleys in the distribution)
    const localMinima = [];
    
    for (let i = 5; i < smoothedData.length - 5; i++) {
      const current = smoothedData[i].count;
      let isMinimum = true;
      
      // Check if this point is lower than points on either side within a window
      for (let j = i - 3; j <= i + 3; j++) {
        if (j !== i && smoothedData[j].count < current) {
          isMinimum = false;
          break;
        }
      }
      
      if (isMinimum && smoothedData[i].marks > 10) {
        localMinima.push(smoothedData[i].marks);
      }
    }
    
    // If we don't have enough local minima, add some logical boundaries
    while (localMinima.length < 5 && localMinima.length > 0) {
      // Add a point between existing points
      const sortedMinima = [...localMinima].sort((a, b) => a - b);
      
      for (let i = 0; i < sortedMinima.length - 1; i++) {
        const gap = sortedMinima[i+1] - sortedMinima[i];
        if (gap > 15) {
          localMinima.push(Math.round(sortedMinima[i] + gap/2));
          break;
        }
      }
      
      // If we didn't add any point in the gaps, add one at the end
      if (localMinima.length === sortedMinima.length) {
        const lastPoint = sortedMinima[sortedMinima.length - 1];
        if (lastPoint < maxMarks - 15) {
          localMinima.push(Math.round(lastPoint + 15));
        } else {
          break; // Can't add any more reasonable points
        }
      }
    }
    
    // If we still don't have enough points, create evenly distributed boundaries
    if (localMinima.length < 5) {
      localMinima.length = 0;
      const step = Math.floor(maxMarks / 9);
      for (let i = 1; i < 9; i++) {
        localMinima.push(i * step);
      }
    }
    
    // Sort boundaries and assign to grades
    const sortedBoundaries = localMinima.sort((a, b) => b - a);
    
    const newBoundaries = {
      'A': sortedBoundaries[0] || 90,
      'A-': sortedBoundaries[1] || 80,
      'B': sortedBoundaries[2] || 70,
      'B-': sortedBoundaries[3] || 65,
      'C': sortedBoundaries[4] || 60,
      'C-': sortedBoundaries[5] || 55,
      'D': sortedBoundaries[6] || 50,
      'E': sortedBoundaries[7] || 40,
      'NC': sortedBoundaries[8] || 30
    };
    
    setGradeBoundaries(newBoundaries);
  };

  // Sort grades by grade level (A, A-, B, etc.) for display
  const orderedGradeBoundaries = Object.entries(gradeBoundaries).sort((a, b) => {
    const gradeOrder = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'NC'];
    return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Grade Distribution</h2>
        
        {/* Statistics cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center">
            <h3 className="text-gray-500 font-medium">Total Students</h3>
            <p className="text-2xl font-bold">{statistics.totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center">
            <h3 className="text-gray-500 font-medium">Highest Mark</h3>
            <p className="text-2xl font-bold">{statistics.highest}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center">
            <h3 className="text-gray-500 font-medium">Lowest Mark</h3>
            <p className="text-2xl font-bold">{statistics.lowest}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center">
            <h3 className="text-gray-500 font-medium">Average Mark</h3>
            <p className="text-2xl font-bold">{statistics.average}</p>
          </div>
        </div>
        
        {/* Auto-grade button */}
        <div className="mb-4">
          <button 
            onClick={autoSetGradeBoundaries}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors font-medium"
          >
            Auto-Set Grade Boundaries
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 relative">
          <div className="h-96 relative" ref={chartContainerRef}>
            <canvas ref={chartRef}></canvas>
            
            {/* Vertical Sliders */}
            {orderedGradeBoundaries.map(([grade, boundary]) => {
              // Add defensive checks
              const pixelPosition = markToPixelMapping.current?.mapping?.[boundary];
              const chartLeft = markToPixelMapping.current?.chartArea?.left || 0;
              
              return (
                <div 
                  key={grade}
                  className="absolute bottom-0 top-0 select-none"
                  style={{
                    left: pixelPosition !== undefined ? `${pixelPosition}px` : `${(boundary / maxMarks) * 100}%`,
                    cursor: 'col-resize',
                    width: '4px',
                    transform: 'translateX(-2px)',
                    zIndex: 10
                  }}
                >
                  {/* Slider Line */}
                  <div 
                    className="absolute bottom-0 top-0 w-full"
                    style={{ 
                      backgroundColor: getGradeColor(grade),
                      opacity: activeSlider === grade ? 1 : 0.7
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      startDragging(grade);
                    }}
                  />
                  
                  {/* Grade Label */}
                  <div
                    className="absolute top-0 transform -translate-y-8 -translate-x-1/2 font-bold text-white rounded-md p-1 px-2 text-sm"
                    style={{ 
                      backgroundColor: getGradeColor(grade),
                      left: '2px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {grade}: {boundary}
                  </div>
                  
                  {/* Draggable Handle */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full"
                    style={{ 
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'white',
                      border: `3px solid ${getGradeColor(grade)}`,
                      left: '2px',
                      cursor: 'col-resize'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      startDragging(grade);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingTab; 