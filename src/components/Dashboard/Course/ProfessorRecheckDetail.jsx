import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  PenTool, 
  Award, 
  Save,
  X, 
  Plus, 
  Minus,
  Eye,
  Menu,
  ClipboardList,
  BarChart,
  ChevronUp,
  ChevronDown,
  Layout,
  MoveHorizontal
} from 'lucide-react';
import { API_BASE_URL } from '../../../BaseURL';


const Toast = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 
        ${type === "success" ? "bg-blue-600" : "bg-red-500"} text-white`}
    >
      {type === "success" ? (
        <CheckCircle size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
        <X size={16} />
      </button>
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;

  switch (status.toLowerCase()) {
    case "approved":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = <CheckCircle className="w-4 h-4" />;
      break;
    case "rejected":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      icon = <XCircle className="w-4 h-4" />;
      break;
    case "pending":
    default:
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      icon = <AlertCircle className="w-4 h-4" />;
      break;
  }

  return (
    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${bgColor} ${textColor}`}>
      {icon}
      <span className="font-medium">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
};

const PageViewer = ({
  url,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomLevel,
  pageNumber,
  totalPages,
  onPageChange
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [url]);

  const handleError = () => {
    setError("Failed to load image");
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Unable to load image</h3>
        <p className="text-gray-300 mb-6 max-w-md">
          The image could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading image...</p>
          </div>
        </div>
      )}
      
      <div 
        className="transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {url ? (
          <img
            src={url}
            alt="Student Answer Sheet"
            className="max-w-full object-contain shadow-2xl rounded-lg"
            onError={handleError}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto">
            <FileText size={80} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Student Answer Sheet
            </h3>
            <div className="bg-gray-100 rounded-lg p-8 w-full min-h-[600px] flex items-center justify-center">
              <p className="text-center text-gray-500">
                Page {pageNumber} of {totalPages}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-6 right-6 flex bg-gray-900 bg-opacity-80 p-2 rounded-full shadow-xl">
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom out"
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors mx-1"
          title="Reset zoom"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom in"
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
      
      {totalPages > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-80 px-4 py-2 rounded-full shadow-xl flex items-center gap-3">
          <button
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className={`p-1 rounded ${
              pageNumber <= 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-200 hover:text-white"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-white">
            Page {pageNumber} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className={`p-1 rounded ${
              pageNumber >= totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-200 hover:text-white"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const AnnotationTool = ({ 
  onAnnotationChange, 
  currentPage, 
  studentAnnotations = [], 
  maxMarks,
  onSelectAnnotation,
  questionMarks,
  onQuestionMarkUpdate
}) => {
  const [annotations, setAnnotations] = useState([
    ...studentAnnotations
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [annotationMetadata, setAnnotationMetadata] = useState({
    questionNumber: 1,
    comment: "",
    newMark: 0,
    previousMark: 0,
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    onAnnotationChange(annotations);
  }, [annotations, onAnnotationChange]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentAnnotation({
      id: Date.now().toString(),
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      pageNumber: currentPage,
      color: "rgba(239, 68, 68, 0.3)", 
      borderColor: "rgb(239, 68, 68)",
      createdBy: "professor",
      metadata: {
        questionNumber: 1,
        comment: "",
        newMark: 0,
        previousMark: 0,
      },
    });

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentAnnotation((prev) => ({
      ...prev,
      endX: x,
      endY: y,
    }));
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    if (
      currentAnnotation &&
      Math.abs(currentAnnotation.endX - currentAnnotation.startX) > 10 &&
      Math.abs(currentAnnotation.endY - currentAnnotation.startY) > 10
    ) {
      setSelectedAnnotation(currentAnnotation);
      
      
      const qNum = 1; 
      if (questionMarks && questionMarks[qNum]) {
        setAnnotationMetadata({
          questionNumber: qNum,
          comment: "",
          previousMark: questionMarks[qNum].originalMark,
          newMark: questionMarks[qNum].newMark,
        });
      } else {
        setAnnotationMetadata({
          questionNumber: qNum,
          comment: "",
          previousMark: 0,
          newMark: 0,
        });
      }
      
      setShowForm(true);
    }

    setIsDrawing(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    
    const qMaxMarks = maxMarks[annotationMetadata.questionNumber] || maxMarks.total;
    if (annotationMetadata.newMark > qMaxMarks) {
      alert(`New mark for Question ${annotationMetadata.questionNumber} cannot exceed the maximum marks (${qMaxMarks})`);
      return;
    }

    const updatedAnnotation = {
      ...selectedAnnotation,
      metadata: annotationMetadata,
    };

    
    setAnnotations((prev) => [...prev, updatedAnnotation]);
    
    
    const qNum = annotationMetadata.questionNumber;
    onQuestionMarkUpdate(qNum, annotationMetadata.previousMark, annotationMetadata.newMark);
    
    
    setShowForm(false);
    setAnnotationMetadata({
      questionNumber: 1,
      comment: "",
      newMark: 0,
      previousMark: 0,
    });
  };

  const removeAnnotation = (id) => {
    
    const annoToRemove = annotations.find(anno => anno.id === id);
    
    setAnnotations((prevAnnotations) =>
      prevAnnotations.filter((anno) => anno.id !== id)
    );
    
    
    if (annoToRemove && annoToRemove.createdBy === "professor") {
      const qNum = annoToRemove.metadata.questionNumber;
      
      onQuestionMarkUpdate(qNum, annoToRemove.metadata.newMark, annoToRemove.metadata.previousMark);
    }
  };

  const clearAllProfessorAnnotations = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all your annotations?"
    );
    if (confirmClear) {
      
      const profAnnotations = annotations.filter(anno => anno.createdBy === "professor");
      
      
      setAnnotations(annotations.filter(anno => anno.createdBy !== "professor"));
      
      
      profAnnotations.forEach(anno => {
        const qNum = anno.metadata.questionNumber;
        
        onQuestionMarkUpdate(qNum, anno.metadata.newMark, anno.metadata.previousMark, true);
      });
    }
  };

  const handleAnnotationClick = (anno) => {
    
    if (anno.pageNumber !== currentPage) {
      
      onSelectAnnotation(anno);
    }
  };

  const currentPageAnnotations = annotations.filter(
    (anno) => anno.pageNumber === currentPage
  );

  return (
    <div className="relative w-full h-full">
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair z-10"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      >
        {currentPageAnnotations.map((anno) => {
          const left = Math.min(anno.startX, anno.endX);
          const top = Math.min(anno.startY, anno.endY);
          const width = Math.abs(anno.endX - anno.startX);
          const height = Math.abs(anno.endY - anno.startY);

          return (
            <motion.div
              key={anno.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute border-2"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                borderColor: anno.borderColor,
                backgroundColor: anno.color,
              }}
              onClick={() => handleAnnotationClick(anno)}
            >
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`absolute -top-7 left-0 bg-white text-xs px-2 py-1 rounded shadow-sm border flex items-center gap-1 ${
                  anno.createdBy === "professor" 
                    ? "border-red-100" 
                    : "border-blue-100"
                }`}
              >
                <span className={`${
                  anno.createdBy === "professor" 
                    ? "bg-red-500" 
                    : "bg-blue-500"
                } text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold`}>
                  {anno.metadata.questionNumber}
                </span>
                <span className={`font-medium ${
                  anno.createdBy === "professor" 
                    ? "text-red-700" 
                    : "text-blue-700"
                }`}>
                  {anno.createdBy === "professor" ? "Prof" : "Student"}
                </span>
              </motion.div>
              
              {anno.createdBy === "professor" && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAnnotation(anno.id);
                  }}
                  className="absolute -top-6 -right-6 bg-white p-1 rounded-full shadow-sm text-red-500 hover:bg-red-50 border border-red-100 z-20"
                >
                  <X size={12} />
                </motion.button>
              )}
            </motion.div>
          );
        })}

        {isDrawing && currentAnnotation && (
          <div
            className="absolute border-2"
            style={{
              borderColor: currentAnnotation.borderColor,
              backgroundColor: currentAnnotation.color,
              left: `${Math.min(
                currentAnnotation.startX,
                currentAnnotation.endX
              )}px`,
              top: `${Math.min(
                currentAnnotation.startY,
                currentAnnotation.endY
              )}px`,
              width: `${Math.abs(
                currentAnnotation.endX - currentAnnotation.startX
              )}px`,
              height: `${Math.abs(
                currentAnnotation.endY - currentAnnotation.startY
              )}px`,
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 w-80 border border-red-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold bg-red-500">
                  {annotations.filter(a => a.createdBy === "professor").length + 1}
                </div>
                <span>New Professor Annotation</span>
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </motion.button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Number
                </label>
                <select
                  value={annotationMetadata.questionNumber}
                  onChange={(e) => {
                    const qNum = parseInt(e.target.value);
                    setAnnotationMetadata({
                      ...annotationMetadata,
                      questionNumber: qNum,
                      previousMark: questionMarks[qNum]?.originalMark || 0,
                      newMark: questionMarks[qNum]?.newMark || 0
                    });
                  }}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50"
                >
                  {Object.keys(maxMarks).filter(k => k !== 'total').map((num) => (
                    <option key={num} value={num}>
                      Question {num} (Max: {maxMarks[num]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professor Comments
                </label>
                <textarea
                  value={annotationMetadata.comment}
                  onChange={(e) =>
                    setAnnotationMetadata({
                      ...annotationMetadata,
                      comment: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50"
                  rows={3}
                  placeholder="Add your assessment comments..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Mark
                  </label>
                  <input
                    type="number"
                    value={annotationMetadata.previousMark}
                    onChange={(e) =>
                      setAnnotationMetadata({
                        ...annotationMetadata,
                        previousMark: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50"
                    min="0"
                    max={maxMarks[annotationMetadata.questionNumber]}
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Mark
                  </label>
                  <input
                    type="number"
                    value={annotationMetadata.newMark}
                    onChange={(e) =>
                      setAnnotationMetadata({
                        ...annotationMetadata,
                        newMark: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50"
                    min="0"
                    max={maxMarks[annotationMetadata.questionNumber]}
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50">
                <div className="text-xs text-gray-600">Page {currentPage}</div>
                <div className="text-xs text-red-700">
                  Professor Annotation
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg flex items-center gap-2 shadow-sm bg-red-600 hover:bg-red-700"
                >
                  <Save size={16} />
                  Save Annotation
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const QuestionMarksEditor = ({ 
  questionMarks, 
  maxMarks,
  onQuestionMarkChange,
  totalOriginalMarks,
  totalNewMarks
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (questionNum) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionNum]: !prev[questionNum]
    }));
  };

  const handleMarkChange = (questionNum, field, value) => {
    onQuestionMarkChange(questionNum, field, value);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Assessment</span>
          <div className="px-2 py-1 bg-white rounded border border-blue-200 text-sm">
            <span className="font-medium text-gray-600">{totalNewMarks}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-gray-500">{maxMarks.total}</span>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Original Total</span>
          <span className="text-xs font-medium">{totalOriginalMarks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Adjustment</span>
          <span className={`text-xs font-medium ${
            totalNewMarks > totalOriginalMarks 
              ? 'text-green-600' 
              : totalNewMarks < totalOriginalMarks 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`}>
            {totalNewMarks > totalOriginalMarks ? '+' : ''}
            {(totalNewMarks - totalOriginalMarks).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.keys(maxMarks)
          .filter(key => key !== 'total')
          .map(questionNum => {
            const isExpanded = expandedQuestions[questionNum] || false;
            const qMarks = questionMarks[questionNum] || { originalMark: 0, newMark: 0 };
            const qMaxMarks = maxMarks[questionNum];
            
            return (
              <div 
                key={questionNum} 
                className="border rounded-lg overflow-hidden bg-white"
              >
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleQuestion(questionNum)}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-bold">
                      {questionNum}
                    </div>
                    <span className="font-medium text-gray-800">Question {questionNum}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <span className={`text-sm ${
                        qMarks.newMark > qMarks.originalMark 
                          ? 'text-green-600' 
                          : qMarks.newMark < qMarks.originalMark 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        {qMarks.newMark}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-500 text-sm">{qMaxMarks}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Original Mark
                        </label>
                        <input
                          type="number"
                          value={qMarks.originalMark}
                          onChange={(e) => handleMarkChange(questionNum, 'originalMark', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          max={qMaxMarks}
                          step="0.5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          New Mark
                        </label>
                        <input
                          type="number"
                          value={qMarks.newMark}
                          onChange={(e) => handleMarkChange(questionNum, 'newMark', parseFloat(e.target.value) || 0)}
                          className={`w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            qMarks.newMark > qMarks.originalMark 
                              ? 'bg-green-50 border-green-200' 
                              : qMarks.newMark < qMarks.originalMark 
                                ? 'bg-red-50 border-red-200' 
                                : ''
                          }`}
                          min="0"
                          max={qMaxMarks}
                          step="0.5"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-gray-500">Adjustment</span>
                      <span className={`text-xs font-medium ${
                        qMarks.newMark > qMarks.originalMark 
                          ? 'text-green-600' 
                          : qMarks.newMark < qMarks.originalMark 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        {qMarks.newMark > qMarks.originalMark ? '+' : ''}
                        {(qMarks.newMark - qMarks.originalMark).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};


const SidebarTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
          activeTab === 'annotations' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('annotations')}
      >
        <span className="flex items-center justify-center gap-1.5">
          <ClipboardList size={16} />
          <span>Annotations</span>
        </span>
        {activeTab === 'annotations' && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        )}
      </button>

      <button
        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
          activeTab === 'assessment' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('assessment')}
      >
        <span className="flex items-center justify-center gap-1.5">
          <BarChart size={16} />
          <span>Assessment</span>
        </span>
        {activeTab === 'assessment' && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        )}
      </button>
    </div>
  );
};


const ProfessorRecheckDetail = () => {
  const { courseId, requestId } = useParams();
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [decision, setDecision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(320); 
  const [resizing, setResizing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('annotations');
  const [questionMarks, setQuestionMarks] = useState({});
  const [maxMarks, setMaxMarks] = useState({ total: 10 });
  const [totalOriginalMarks, setTotalOriginalMarks] = useState(0);
  const [totalNewMarks, setTotalNewMarks] = useState(0);
  const resizeStartX = useRef(0);
  const startWidth = useRef(0);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  
  useEffect(() => {
    const fetchRequestData = async () => {
      setLoading(true);
      try {
        
        
        const mockData = {
          id: requestId || "req1",
          studentName: "Alice Johnson",
          studentId: "2023001",
          examTitle: "Mid-term Examination",
          examType: "Mid-term",
          reason: "Question 3 requires partial credit review. I believe my implementation logic was correct but I lost marks due to a minor syntax error. The core algorithm is correct and should be awarded at least 3 more marks according to the rubric.",
          status: "pending",
          submittedDate: "Oct 15, 2023",
          currentMarks: 7,
          maxMarks: {
            1: 5,
            2: 5,
            3: 10,
            4: 5,
            5: 5,
            total: 30
          },
          questionMarks: {
            1: { originalMark: 3, newMark: 3 },
            2: { originalMark: 2, newMark: 2 },
            3: { originalMark: 1, newMark: 1 },
            4: { originalMark: 0, newMark: 0 },
            5: { originalMark: 1, newMark: 1 }
          },
          annotations: 2,
          pages: [
            { 
              pageNumber: 1, 
              imageUrl: "/api/placeholder/800/1200" 
            },
            { 
              pageNumber: 2, 
              imageUrl: "/api/placeholder/800/1200" 
            }
          ],
          annotationData: [
            {
              id: "anno1",
              startX: 100,
              startY: 150,
              endX: 300,
              endY: 250,
              pageNumber: 1,
              color: "rgba(59, 130, 246, 0.3)",
              borderColor: "rgb(59, 130, 246)",
              createdBy: "student",
              metadata: {
                questionNumber: 3,
                comment: "My algorithm implementation is correct here, the logic follows the required approach.",
                previousMark: 1,
                newMark: 4,
              }
            },
            {
              id: "anno2",
              startX: 150,
              startY: 300,
              endX: 400,
              endY: 380,
              pageNumber: 2,
              color: "rgba(59, 130, 246, 0.3)",
              borderColor: "rgb(59, 130, 246)",
              createdBy: "student",
              metadata: {
                questionNumber: 3,
                comment: "This part correctly implements the required optimization technique.",
                previousMark: 1,
                newMark: 4,
              }
            }
          ]
        };
        
        setRequestData(mockData);
        setAnnotations(mockData.annotationData || []);
        setTotalPages(mockData.pages?.length || 5);
        setMaxMarks(mockData.maxMarks);
        setQuestionMarks(mockData.questionMarks);
        
        
        let originalTotal = 0;
        let newTotal = 0;
        Object.values(mockData.questionMarks).forEach(q => {
          originalTotal += q.originalMark;
          newTotal += q.newMark;
        });
        setTotalOriginalMarks(originalTotal);
        setTotalNewMarks(newTotal);
        
        
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Error fetching request data:", err);
        setError("Failed to load request data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchRequestData();
  }, [requestId]);

  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing) return;
      
      const newWidth = startWidth.current + (e.clientX - resizeStartX.current);
      
      
      if (newWidth >= 280 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const startResize = (e) => {
    e.preventDefault();
    setResizing(true);
    resizeStartX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handleAnnotationChange = (newAnnotations) => {
    setAnnotations(newAnnotations);
  };

  const handleQuestionMarkUpdate = (questionNum, oldMark, newMark, reset = false) => {
    setQuestionMarks(prev => {
      const updated = { ...prev };
      
      if (reset) {
        
        updated[questionNum] = {
          originalMark: oldMark,
          newMark: oldMark 
        };
      } else {
        
        updated[questionNum] = {
          originalMark: oldMark,
          newMark: newMark
        };
      }
      
      
      let originalTotal = 0;
      let newTotal = 0;
      Object.values(updated).forEach(q => {
        originalTotal += q.originalMark;
        newTotal += q.newMark;
      });
      
      
      if (newTotal > maxMarks.total) {
        updated[questionNum].newMark -= (newTotal - maxMarks.total);
        newTotal = maxMarks.total;
      }
      
      setTotalOriginalMarks(originalTotal);
      setTotalNewMarks(newTotal);
      
      return updated;
    });
  };

  const handleQuestionMarkChange = (questionNum, field, value) => {
    setQuestionMarks(prev => {
      const updated = { ...prev };
      
      
      if (!updated[questionNum]) {
        updated[questionNum] = { originalMark: 0, newMark: 0 };
      }
      
      
      updated[questionNum][field] = value;
      
      
      if (field === 'originalMark' && updated[questionNum].originalMark === updated[questionNum].newMark) {
        updated[questionNum].newMark = value;
      }
      
      
      const qMax = maxMarks[questionNum];
      if (updated[questionNum][field] > qMax) {
        updated[questionNum][field] = qMax;
      }
      
      
      let originalTotal = 0;
      let newTotal = 0;
      Object.values(updated).forEach(q => {
        originalTotal += q.originalMark;
        newTotal += q.newMark;
      });
      
      
      if (newTotal > maxMarks.total) {
        const excess = newTotal - maxMarks.total;
        if (field === 'newMark') {
          updated[questionNum].newMark -= excess;
          newTotal = maxMarks.total;
        }
      }
      
      setTotalOriginalMarks(originalTotal);
      setTotalNewMarks(newTotal);
      
      return updated;
    });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handleGoBack = () => {
    navigate(`/courses/${courseId}`);
  };

  const handleSubmitResponse = async () => {
    setIsSubmitting(true);
    
    try {
      
      
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      
      setRequestData(prev => ({
        ...prev,
        status: decision === "partial" ? "approved" : decision,
        currentMarks: totalNewMarks
      }));
      
      setRequestComplete(true);
      showToast(`Request ${decision === "approved" || decision === "partial" ? "approved" : "rejected"} successfully`, "success");
    } catch (error) {
      console.error("Error submitting response:", error);
      showToast("Failed to submit response", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const handleSelectAnnotation = (annotation) => {
    
    setPageNumber(annotation.pageNumber);
    setSelectedAnnotationId(annotation.id);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Loading request</h3>
          <p className="text-gray-500">Please wait while we fetch the recheck request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="inline-block bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Error Loading Request</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Recheck Request Details
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{requestData?.examTitle}</span>
                <span>•</span>
                <span>{requestData?.examType}</span>
                <span>•</span>
                <StatusBadge status={requestData?.status} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                {requestData?.studentName.charAt(0)}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{requestData?.studentName}</div>
                <div className="text-gray-500">{requestData?.studentId}</div>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700"
            >
              Professor Mode
            </motion.div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div 
          className="bg-white border-r border-gray-200 overflow-hidden flex flex-col"
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        >
          <SidebarTabs activeTab={sidebarTab} setActiveTab={setSidebarTab} />

          <div className="overflow-auto flex-1 p-4">
            {sidebarTab === 'annotations' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Request Overview</h2>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Reason</h3>
                      <div className="bg-gray-50 rounded-lg p-3 text-gray-700 border border-gray-100 text-sm">
                        {requestData?.reason}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Student Annotations</h2>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {annotations.filter(a => a.createdBy === "student").length > 0 ? (
                      annotations
                        .filter(a => a.createdBy === "student")
                        .map((anno) => (
                          <motion.div
                            key={anno.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all ${
                              selectedAnnotationId === anno.id 
                                ? "border-blue-400 ring-2 ring-blue-200" 
                                : "border-blue-200 hover:border-blue-300"
                            }`}
                            onClick={() => handleSelectAnnotation(anno)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                                  {anno.metadata.questionNumber}
                                </div>
                                <div className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700">
                                  Student
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Page {anno.pageNumber}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                              {anno.metadata.comment}
                            </p>
                            <div className="flex justify-between text-xs mt-1.5 text-gray-500">
                              <span>Current: {anno.metadata.previousMark}</span>
                              <span className="text-green-600 font-medium">
                                Expected: {anno.metadata.newMark}
                              </span>
                            </div>
                          </motion.div>
                        ))
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                        No student annotations found
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Professor Annotations</h2>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {annotations.filter(a => a.createdBy === "professor").length > 0 ? (
                      annotations
                        .filter(a => a.createdBy === "professor")
                        .map((anno) => (
                          <motion.div
                            key={anno.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all ${
                              selectedAnnotationId === anno.id 
                                ? "border-red-400 ring-2 ring-red-200" 
                                : "border-red-200 hover:border-red-300"
                            }`}
                            onClick={() => handleSelectAnnotation(anno)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-600">
                                  {anno.metadata.questionNumber}
                                </div>
                                <div className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-red-50 text-red-700">
                                  Professor
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Page {anno.pageNumber}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                              {anno.metadata.comment}
                            </p>
                            <div className="flex justify-between text-xs mt-1.5 text-gray-500">
                              <span>Original: {anno.metadata.previousMark}</span>
                              <span className={`font-medium ${
                                anno.metadata.newMark > anno.metadata.previousMark 
                                  ? "text-green-600" 
                                  : "text-red-600"
                              }`}>
                                New: {anno.metadata.newMark}
                              </span>
                            </div>
                          </motion.div>
                        ))
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                        No professor annotations yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === 'assessment' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Mark Assessment</h2>
                
                <QuestionMarksEditor
                  questionMarks={questionMarks}
                  maxMarks={maxMarks}
                  onQuestionMarkChange={handleQuestionMarkChange}
                  totalOriginalMarks={totalOriginalMarks}
                  totalNewMarks={totalNewMarks}
                />
                
                <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Decision
                    </label>
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setDecision("approved")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                          decision === "approved"
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setDecision("rejected")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                          decision === "rejected"
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Response to Student
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Provide feedback on the recheck request..."
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmitResponse}
                      disabled={!decision || isSubmitting}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span>Submit Response</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button 
                className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
                onClick={() => {
                  
                  setSidebarWidth(320);
                }}
              >
                <Layout size={14} />
                Reset size
              </button>
              
              <span className="text-xs text-gray-500">{sidebarWidth}px</span>
            </div>
          </div>
        </div>
        
        <div 
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-ew-resize flex items-center justify-center transition-colors"
          onMouseDown={startResize}
        >
          <div className="h-16 flex items-center justify-center">
            <MoveHorizontal size={12} className="text-gray-400" />
          </div>
        </div>

        <div className="flex-1 h-[calc(100vh-80px)] relative bg-gray-100">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 flex items-center justify-between">
            <h2 className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Student Answer Sheet
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400 text-xs">
                  Page {pageNumber} of {totalPages}
                </span>
              )}
            </h2>
            
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs px-2 py-1 rounded-full bg-red-700 text-white"
              >
                Draw to Annotate
              </motion.div>
            </div>
          </div>
          
          <div className="relative h-full bg-gray-800">
            <PageViewer
              url="/api/placeholder/800/1200"
              zoomLevel={zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            
            <div className="absolute inset-0 bg-transparent">
              <AnnotationTool
                onAnnotationChange={handleAnnotationChange}
                currentPage={pageNumber}
                studentAnnotations={annotations}
                maxMarks={maxMarks}
                onSelectAnnotation={handleSelectAnnotation}
                questionMarks={questionMarks}
                onQuestionMarkUpdate={handleQuestionMarkUpdate}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onClose={() => setToast({ ...toast, visible: false })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessorRecheckDetail;