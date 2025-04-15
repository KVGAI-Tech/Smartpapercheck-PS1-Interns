import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  History,
  X,
  AlertTriangle,
  PenTool,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Save,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  List,
  Bookmark,
  GripVertical,
  RefreshCw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../BaseURL";


const mockDocument = {
  Document: ({ children }) => children,
  Page: ({ pageNumber, width, className }) => (
    <div className={`pdf-page ${className}`} style={{ width: width || "100%" }}>
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-center text-xl font-semibold mb-6">
          Page {pageNumber}
        </h2>
        <div className="p-4 border border-gray-200 min-h-[600px] flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <FileText size={80} className="mx-auto text-gray-300" />
            <p className="text-gray-600">PDF content would appear here</p>
            <p className="text-sm text-gray-500">
              Due to CSP restrictions, PDF.js worker cannot be loaded
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

const STORAGE_KEY = "exam-viewer-annotations";


const examsApi = {
  
  submitRecheckRequest: async (examId, enrollmentId, requestData) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    return axios.post(
      `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/recheck`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  },
  
  
  getRecheckRequests: async (examId, enrollmentId) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    return axios.get(
      `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/recheck-requests`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};


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
        <AlertTriangle size={20} />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
        <X size={16} />
      </button>
    </motion.div>
  );
};


const PDFViewer = ({
  file,
  pageNumber,
  totalPages,
  onPageChange,
  zoomLevel,
  onTotalPagesChange,
  pdfFallbackImage,
  selectedAnnotations,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    
    if (pdfFallbackImage) {
      setImageUrl(pdfFallbackImage);
      setUseFallbackMode(true);
      setIsLoading(false);
      if (totalPages === 1) {
        onTotalPagesChange(1);
      }
    } else if (file) {
      
      setUseFallbackMode(true);
      setIsLoading(false);
    } else {
      setError("No PDF or image available");
      setIsLoading(false);
    }
  }, [file, pdfFallbackImage, totalPages, onTotalPagesChange]);

  function onDocumentLoadSuccess({ numPages }) {
    setIsLoading(false);
    onTotalPagesChange(numPages);
  }

  function onDocumentLoadError(error) {
    setIsLoading(false);
    setError("Failed to load PDF document");
    console.error("PDF load error:", error);
    setUseFallbackMode(true);
  }

  
  const renderSelectedAnnotations = () => {
    if (!selectedAnnotations || selectedAnnotations.length === 0) return null;

    return selectedAnnotations.filter(anno => anno.pageNumber === pageNumber).map((anno, index) => (
      <div
        key={`selected-anno-${index}`}
        className="absolute border-2 border-yellow-500 bg-yellow-100/40 z-30 pointer-events-none"
        style={{
          left: `${anno.coordinates.startX}%`,
          top: `${anno.coordinates.startY}%`,
          width: `${Math.abs(anno.coordinates.endX - anno.coordinates.startX)}%`,
          height: `${Math.abs(anno.coordinates.endY - anno.coordinates.startY)}%`,
        }}
      >
        <div className="absolute -top-7 left-0 bg-yellow-50 text-xs px-2 py-1 rounded shadow-sm border border-yellow-200 flex items-center gap-1 z-40">
          <span className="bg-yellow-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
            {anno.questionNumber}
          </span>
          <span className="font-medium text-yellow-700">
            +{anno.expectedMarks - anno.currentMarks}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full h-full">
      <div className="relative w-full h-full">
        <div
          ref={contentRef}
          className="w-full h-full flex flex-col items-center justify-center"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center",
            transition: "transform 0.3s ease",
          }}
          data-zoom-level={zoomLevel} 
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-red-500 flex items-center">
                <AlertTriangle size={24} className="mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {useFallbackMode ? (
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto">
              {imageUrl ? (
                <div className="relative w-full pdf-content-container">
                  <img 
                    src={imageUrl} 
                    alt={`Answer sheet page ${pageNumber}`} 
                    className="w-full h-auto rounded-md shadow-sm object-contain"
                    style={{ maxHeight: "800px" }}
                  />
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                    Page {pageNumber} of {totalPages || 1}
                  </div>
                  {renderSelectedAnnotations()}
                </div>
              ) : (
                <>
                  <FileText size={80} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    PDF Content
                  </h3>
                  <p className="text-gray-600 mb-4">
                    PDF viewer is using fallback mode due to security restrictions.
                  </p>
                  <div className="bg-gray-100 rounded-lg p-8 w-full min-h-[600px] flex items-center justify-center">
                    <p className="text-center text-gray-500">
                      Page {pageNumber} of {totalPages || "?"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : file ? (
            <mockDocument.Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="w-full h-full pdf-content-container"
              options={{
                cMapUrl:
                  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/cmaps/",
                cMapPacked: true,
                standardFontDataUrl:
                  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/standard_fonts/",
              }}
            >
              <mockDocument.Page
                pageNumber={pageNumber}
                width={800}
                className="shadow-md mx-auto"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              {renderSelectedAnnotations()}
            </mockDocument.Document>
          ) : (
            <div className="text-center space-y-6 p-8">
              <FileText size={80} className="mx-auto text-gray-300" />
              <p className="text-gray-600">No PDF file selected or provided</p>
            </div>
          )}
        </div>

        {(file || imageUrl) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-3 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className={`p-1 rounded ${
                pageNumber <= 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <span className="text-sm font-medium">
              Page {pageNumber} of {totalPages || 1}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className={`p-1 rounded ${
                pageNumber >= totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};


const RecheckModal = ({ isOpen, onClose, onSubmit, annotations, examData, enrollmentId }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const requestData = {
      reason,
      annotations: annotations.map((anno) => ({
        questionNumber: anno.metadata.questionNumber,
        pageNumber: anno.pageNumber,
        grievance: anno.metadata.grievance,
        currentMarks: anno.metadata.actualMarks,
        expectedMarks: anno.metadata.expectedMarks,
        coordinates: {
          startX: anno.startX,
          startY: anno.startY,
          endX: anno.endX,
          endY: anno.endY,
        },
      })),
    };

    try {
      
      examsApi.submitRecheckRequest(examData.id, enrollmentId, requestData)
        .then(response => {
          if (response.data && (response.data.code === 200 || response.data.code === 201)) {
            onSubmit({
              requestPayload: requestData,
              apiResponse: response.data
            });
            onClose();
          } else {
            setError(response.data?.message || "Failed to submit recheck request");
          }
        })
        .catch(err => {
          setError(err.response?.data?.message || err.message || "An error occurred while submitting the request");
        })
        .finally(() => {
          setSubmitting(false);
        });
    } catch (error) {
      setError("Failed to submit request: " + (error.message || "Unknown error"));
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Request Recheck
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-yellow-700">
              <strong className="font-bold">Important:</strong> You can submit a recheck request only once per exam. Please ensure all your annotations are accurate before submitting.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for requesting a recheck
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={4}
                placeholder="Explain why you're requesting a recheck..."
                required
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Annotations ({annotations.length})
              </h3>
              {annotations.length > 0 ? (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <motion.div className="space-y-2">
                    {annotations.map((anno, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={anno.id}
                        className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm"
                      >
                        <div className="flex justify-between">
                          <div>
                            <span className="text-sm font-medium text-blue-600">
                              Question {anno.metadata.questionNumber}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Page {anno.pageNumber}
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                            +
                            {anno.metadata.expectedMarks -
                              anno.metadata.actualMarks}{" "}
                            points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {anno.metadata.grievance}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-4 border border-gray-200 rounded-lg text-center bg-gray-50">
                  No annotations added. Use the annotation tool to mark areas
                  for review.
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || !reason || annotations.length === 0}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all ${
                  submitting || !reason || annotations.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <History size={18} />
                    <span>Submit Request</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};


const AnnotationTool = ({ onAnnotationChange, currentPage, examData, zoomLevel }) => {
  const [annotations, setAnnotations] = useState(() => {
    try {
      const savedAnnotations = localStorage.getItem(STORAGE_KEY);
      return savedAnnotations ? JSON.parse(savedAnnotations) : [];
    } catch (error) {
      console.error("Error loading annotations from localStorage:", error);
      return [];
    }
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [annotationMetadata, setAnnotationMetadata] = useState({
    questionNumber: 1,
    grievance: "",
    expectedMarks: 0,
    actualMarks: 0,
  });
  const [forceUpdate, setForceUpdate] = useState(false); 

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      
      setForceUpdate(prev => !prev);
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    } catch (error) {
      console.error("Error saving annotations to localStorage:", error);
    }

    onAnnotationChange(annotations);
  }, [annotations, onAnnotationChange]);

  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentAnnotation({
      id: Date.now().toString(),
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      pageNumber: currentPage,
      color: "rgba(59, 130, 246, 0.3)",
      metadata: {
        questionNumber: 1,
        grievance: "",
        expectedMarks: 0,
        actualMarks: 0,
      },
    });

    setIsDrawing(true);
  };

  
  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

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
      Math.abs(currentAnnotation.endX - currentAnnotation.startX) > 1 && 
      Math.abs(currentAnnotation.endY - currentAnnotation.startY) > 1
    ) {
      setSelectedAnnotation(currentAnnotation);
      setShowForm(true);
    }

    setIsDrawing(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const updatedAnnotation = {
      ...selectedAnnotation,
      metadata: annotationMetadata,
    };

    setAnnotations((prev) => [...prev, updatedAnnotation]);
    setShowForm(false);
    setAnnotationMetadata({
      questionNumber: 1,
      grievance: "",
      expectedMarks: 0,
      actualMarks: 0,
    });
  };

  const removeAnnotation = (id) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.filter((anno) => anno.id !== id)
    );
  };

  const clearAllAnnotations = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all annotations?"
    );
    if (confirmClear) {
      setAnnotations([]);
    }
  };

  const viewAllAnnotations = () => {
    console.log("View all annotations clicked");
  };

  const currentPageAnnotations = annotations.filter(
    (anno) => anno.pageNumber === currentPage
  );

  
  useEffect(() => {
    const pdfContainer = document.querySelector('.pdf-content-container');
    if (pdfContainer && containerRef.current) {
      containerRef.current.style.width = pdfContainer.offsetWidth + 'px';
      containerRef.current.style.height = pdfContainer.offsetHeight + 'px';
    }
  }, [forceUpdate]);

  
  const getAnnotationStyle = (anno) => {
    if (!canvasRef.current) return {};
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    
    const startXPx = (anno.startX * rect.width) / 100;
    const startYPx = (anno.startY * rect.height) / 100;
    const endXPx = (anno.endX * rect.width) / 100;
    const endYPx = (anno.endY * rect.height) / 100;
    
    const left = Math.min(startXPx, endXPx);
    const top = Math.min(startYPx, endYPx);
    const width = Math.abs(endXPx - startXPx);
    const height = Math.abs(endYPx - startYPx);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      
    };
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-auto"
      style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: 'center',
        transition: 'transform 0.3s ease'
      }}
    >
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair z-10"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      >
        {currentPageAnnotations.map((anno) => (
          <motion.div
            key={anno.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute border-2 border-blue-500 bg-blue-100/30"
            style={getAnnotationStyle(anno)}
          >
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute -top-7 left-0 bg-white text-xs px-2 py-1 rounded shadow-sm border border-blue-100 flex items-center gap-1"
            >
              <span className="bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                {anno.metadata.questionNumber}
              </span>
              <span className="font-medium text-blue-700">
                +{anno.metadata.expectedMarks - anno.metadata.actualMarks}
              </span>
            </motion.div>
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
          </motion.div>
        ))}

        {isDrawing && currentAnnotation && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-100/30"
            style={getAnnotationStyle(currentAnnotation)}
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
            className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 w-80 border border-blue-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {annotations.length + 1}
                </div>
                <span>New Annotation</span>
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
                  onChange={(e) =>
                    setAnnotationMetadata({
                      ...annotationMetadata,
                      questionNumber: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/50"
                >
                  {examData && examData.questions && examData.questions.map((q) => (
                    <option key={q.question_number} value={q.question_number}>
                      Question {q.question_number}
                    </option>
                  ))}
                  {(!examData || !examData.questions || examData.questions.length === 0) && (
                    <option value={1}>Question 1</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Description
                </label>
                <textarea
                  value={annotationMetadata.grievance}
                  onChange={(e) =>
                    setAnnotationMetadata({
                      ...annotationMetadata,
                      grievance: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/50"
                  rows={3}
                  placeholder="Describe the issue with this answer..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Marks
                  </label>
                  <input
                    type="number"
                    value={annotationMetadata.actualMarks}
                    onChange={(e) =>
                      setAnnotationMetadata({
                        ...annotationMetadata,
                        actualMarks: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/50"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Marks
                  </label>
                  <input
                    type="number"
                    value={annotationMetadata.expectedMarks}
                    onChange={(e) =>
                      setAnnotationMetadata({
                        ...annotationMetadata,
                        expectedMarks: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/50"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                <div className="text-xs text-blue-700">Page {currentPage}</div>
                <div className="text-xs text-blue-700">
                  Annotation #{annotations.length + 1}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                  <Save size={16} />
                  Save Annotation
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-20 w-64 border border-blue-100"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <PenTool size={16} className="text-blue-600" />
            Annotations ({annotations.length})
          </h3>
          {annotations.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded-md"
              onClick={clearAllAnnotations}
            >
              Clear All
            </motion.button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            Showing {currentPageAnnotations.length} annotations on page{" "}
            {currentPage}
          </span>

          <div className="text-xs flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={viewAllAnnotations}
              className="text-blue-600 hover:underline flex items-center"
            >
              <Eye size={12} className="mr-1" />
              All
            </motion.button>
          </div>
        </div>

        <div className="max-h-56 overflow-auto pr-1 space-y-2">
          {annotations.length === 0 ? (
            <div className="text-sm text-gray-500 italic text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
              Draw on the document to add annotations
            </div>
          ) : currentPageAnnotations.length === 0 ? (
            <div className="text-sm text-gray-500 italic text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
              No annotations on current page
            </div>
          ) : (
            <motion.div layout className="space-y-2">
              {currentPageAnnotations.map((anno) => (
                <motion.div
                  layout
                  key={anno.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {anno.metadata.questionNumber}
                      </div>
                      <div className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">
                        +
                        {anno.metadata.expectedMarks -
                          anno.metadata.actualMarks}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAnnotation(anno.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-0.5"
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                    {anno.metadata.grievance}
                  </p>
                  <div className="flex justify-between text-xs mt-1.5 text-gray-500">
                    <span>Current: {anno.metadata.actualMarks}</span>
                    <span>Expected: {anno.metadata.expectedMarks}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center">
            Click and drag on the document to create annotations
          </div>
        </div>
      </motion.div>
    </div>
  );
};


const ErrorDisplay = ({ message, onRetry, onBack }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Exam</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-center">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </motion.button>
          )}
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
            >
              Back to Exams
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};


const LoadingDisplay = ({ message = "Loading exam data..." }) => {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};


const RecheckRequestHistory = ({ requests, loading, error, onViewRequest }) => {
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading recheck requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm flex items-center gap-2">
        <AlertTriangle size={16} />
        <span>Failed to load recheck requests: {error}</span>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p>No recheck requests found for this exam.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request, index) => (
        <motion.div
          key={request._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => onViewRequest(request)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                Request #{request.request_number || index + 1}
                <span className="text-xs text-gray-500 font-normal">
                  (Click to view annotations)
                </span>
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Submitted on: {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium 
              ${request.status === 'approved' ? 'bg-green-100 text-green-700' : 
               request.status === 'rejected' ? 'bg-red-100 text-red-700' : 
               'bg-yellow-100 text-yellow-700'}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
            {request.reason}
          </p>
          
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2">Annotations ({request.annotations?.length || 0})</h5>
            <div className="space-y-2 max-h-48 overflow-auto">
              {request.annotations && request.annotations.map((anno, idx) => (
                <div key={idx} className="p-2 border border-blue-100 rounded-md bg-blue-50 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Question {anno.questionNumber}</span>
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      +{anno.expectedMarks - anno.currentMarks} marks
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{anno.grievance}</p>
                  <div className="flex justify-between text-gray-500">
                    <span>Current: {anno.currentMarks}</span>
                    <span>Expected: {anno.expectedMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};


const StudentExamDetails = ({ isHistory = false }) => {
  
  const { courseId, id: examId } = useParams();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollment_id');
  const navigate = useNavigate();

  
  const [currentTab, setCurrentTab] = useState("overview");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfImageUrl, setPdfImageUrl] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [examData, setExamData] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [annotationsByQuestion, setAnnotationsByQuestion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailedFeedback, setDetailedFeedback] = useState({});
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [recheckRequests, setRecheckRequests] = useState([]);
  const [loadingRecheckRequests, setLoadingRecheckRequests] = useState(false);
  const [recheckRequestsError, setRecheckRequestsError] = useState(null);
  const [selectedRecheckRequest, setSelectedRecheckRequest] = useState(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState([]);
  const [hasSubmittedRecheck, setHasSubmittedRecheck] = useState(false);

  const mainContentRef = useRef(null);
  const splitDividerRef = useRef(null);

  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !mainContentRef.current) return;
      
      const container = mainContentRef.current;
      const containerRect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      
      const limitedPosition = Math.min(Math.max(newPosition, 20), 80);
      setSplitPosition(limitedPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  
  const handleViewRecheckRequest = (request) => {
    setSelectedRecheckRequest(request);
    
    
    if (request.annotations && request.annotations.length > 0) {
      
      if (request.annotations[0].pageNumber) {
        setPageNumber(request.annotations[0].pageNumber);
      }
      
      setSelectedAnnotations(request.annotations);
      
      
      if (currentTab !== "history") {
        setCurrentTab("history");
      }
    }
  };

  
  useEffect(() => {
    if (currentTab !== "history") {
      setSelectedAnnotations([]);
      setSelectedRecheckRequest(null);
    }
  }, [currentTab]);

  
  const fetchRecheckRequests = async () => {
    if (!examId || !enrollmentId) return;
    
    setLoadingRecheckRequests(true);
    setRecheckRequestsError(null);
    
    try {
      const response = await examsApi.getRecheckRequests(examId, enrollmentId);
      
      if (response.data && response.data.code === 200) {
        const requests = response.data.data || [];
        setRecheckRequests(requests);
        
        
        if (requests.length > 0) {
          const latestRequest = requests[0]; 
          setRequestStatus({
            id: latestRequest._id,
            timestamp: new Date(latestRequest.created_at).toLocaleString(),
            status: latestRequest.status
          });
          
          
          setHasSubmittedRecheck(true);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch recheck requests');
      }
    } catch (err) {
      console.error('Error fetching recheck requests:', err);
      setRecheckRequestsError(err.message || 'Failed to load recheck requests');
    } finally {
      setLoadingRecheckRequests(false);
    }
  };

  
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        
        const response = await axios.get(
          `${API_BASE_URL}/exams/${examId}/answer-sheets/${enrollmentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        
        if (response && response.data && response.data.code === 200) {
          
          const apiData = response.data.data;
          console.log('API Response:', apiData);
          
          
          const questions = [];
          const detailedFeedbackData = {};
          
          if (apiData.evaluations) {
            Object.keys(apiData.evaluations).forEach((key) => {
              const questionData = apiData.evaluations[key];
              
              const questionNumber = parseInt(key.replace(/\D/g, ''));
              
              if (isNaN(questionNumber)) {
                console.warn(`Could not parse question number from key: ${key}`);
                return;
              }
              
              
              const totalMarks = parseFloat(questionData.total_marks) || 0;
              
              
              questions.push({
                question_number: questionNumber,
                question_text: apiData.problem_feedback?.[key] || `Question ${questionNumber}`,
                max_marks: 10, 
                marks_obtained: totalMarks,
                feedback: questionData.overall_feedback || ""
              });
              
              
              if (questionData.item_grades && questionData.item_grades.length > 0) {
                detailedFeedbackData[questionNumber] = {
                  items: questionData.item_grades,
                  overall: questionData.overall_feedback,
                  improvement: questionData.improvement_suggestions
                };
              }
            });
          }
          
          
          questions.sort((a, b) => a.question_number - b.question_number);

          
          setDetailedFeedback(detailedFeedbackData);

          
          const transformedData = {
            id: parseInt(examId),
            title: apiData.exam_name || "Exam",
            type: "Exam",
            date: new Date(apiData.upload_time || new Date()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            score: questions.reduce((sum, q) => sum + q.marks_obtained, 0),
            maxScore: questions.length * 10, 
            status: apiData.evaluation_status || "pending",
            questions: questions,
            student: apiData.student || null
          };
          
          setExamData(transformedData);
          
          
          if (transformedData.maxScore > 0) {
            setProgressPercentage((transformedData.score / transformedData.maxScore) * 100);
          }
          
          
          if (apiData.answer_sheet_url) {
            setPdfFile(apiData.answer_sheet_url);
          }
          
          
          if (apiData.pages && apiData.pages.length > 0) {
            setTotalPages(apiData.pages.length);
            
            setPdfImageUrl(apiData.pages[0].presigned_url);
          }
          
          
          if (transformedData.questions.length > 0) {
            setAnnotationsByQuestion(
              transformedData.questions.map(question => ({
                questionNumber: question.question_number,
                count: 0
              }))
            );
          }
          
          
          fetchRecheckRequests();
          
        } else {
          throw new Error(response?.data?.message || 'Failed to load exam data');
        }
      } catch (err) {
        console.error('Error fetching exam data:', err);
        setError(err.message || "Failed to load exam data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamData();
    
    return () => {
      
      if (pdfFile && pdfFile.startsWith("blob:")) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [examId, enrollmentId]);

  
  useEffect(() => {
    if (examData && examData.questions) {
      const questionCounts = {};
      
      
      annotations.forEach(anno => {
        const qNum = anno.metadata.questionNumber;
        questionCounts[qNum] = (questionCounts[qNum] || 0) + 1;
      });
      
      
      const updatedAnnotationsByQuestion = examData.questions.map(q => ({
        questionNumber: q.question_number,
        count: questionCounts[q.question_number] || 0
      }));
      
      setAnnotationsByQuestion(updatedAnnotationsByQuestion);
    }
  }, [annotations, examData]);

  useEffect(() => {
    if (!totalPages || totalPages === 1) {
      
      if (!pdfImageUrl && !pdfFile) {
        setTotalPages(1);
      }
    }
  }, [totalPages, pdfImageUrl, pdfFile]);

  useEffect(() => {
    const handleScreenshotAttempt = () => {
      setIsScreenshotAttempted(true);

      setTimeout(() => {
        setIsScreenshotAttempted(false);
      }, 1500);
    };

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "i" || e.key === "4" || e.key === "$")) ||
        (e.metaKey &&
          e.shiftKey &&
          (e.key === "3" || e.key === "4" || e.key === "#" || e.key === "$"))
      ) {
        handleScreenshotAttempt();
      }
    });

    return () => {
      document.removeEventListener("keydown", handleScreenshotAttempt);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (mainContentRef.current) {
        if (window.innerWidth < 768) {
          mainContentRef.current.classList.remove("flex-row");
          mainContentRef.current.classList.add("flex-col");
        } else {
          mainContentRef.current.classList.remove("flex-col");
          mainContentRef.current.classList.add("flex-row");
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentTab === "recheck" && !showAnnotation) {
      setShowAnnotation(true);
    }
  }, [currentTab, showAnnotation]);

  useEffect(() => {
    try {
      const savedAnnotations = localStorage.getItem(STORAGE_KEY);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    } catch (error) {
      console.error("Error loading annotations from localStorage:", error);
    }
  }, []);
  
  const handleAnnotationChange = (newAnnotations) => {
    setAnnotations(newAnnotations);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnnotations));
    } catch (error) {
      console.error("Error saving annotations to localStorage:", error);
    }
  };

  const handleRecheckSubmit = (data) => {
    console.log("Recheck data submitted:", data);
    
    
    setRequestStatus({
      id: data.apiResponse?.data?._id || Math.floor(Math.random() * 10000),
      timestamp: new Date().toLocaleString(),
      status: "pending",
    });

    
    setHasSubmittedRecheck(true);

    setToast({
      visible: true,
      message: "Recheck request submitted successfully",
      type: "success",
    });
    
    
    fetchRecheckRequests();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleGoBack = () => {
    navigate(`/student/evaluations/${courseId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handleTotalPagesChange = (numPages) => {
    setTotalPages(numPages);
  };
  
  const handleRetry = () => {
    window.location.reload();
  };
  
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDisplay />
      </div>
    );
  }

  
  if (error && !examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorDisplay 
          message={error}
          onRetry={handleRetry}
          onBack={() => navigate(`/student/evaluations/${courseId}`)}
        />
      </div>
    );
  }

  
  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorDisplay 
          message="No exam data available. The requested exam could not be found or has not been evaluated yet."
          onBack={() => navigate(`/student/evaluations/${courseId}`)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {isScreenshotAttempted && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <p className="text-white text-xl font-medium">
            Screenshots are not allowed
          </p>
        </div>
      )}

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
                {examData.student && <span>{examData.student.name} ({examData.student.roll_number})</span>}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{examData.date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                examData.status === "evaluated"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {examData.status === "evaluated" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" /> Evaluated
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-1" /> Pending
                </>
              )}
            </motion.div>

            {isHistory ? null : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAnnotation(!showAnnotation)}
                  className={`p-2 rounded-full ${
                    showAnnotation
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={
                    showAnnotation
                      ? "Hide annotation tool"
                      : "Show annotation tool"
                  }
                >
                  <PenTool className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRecheckModal(true)}
                  disabled={annotations.length === 0 || hasSubmittedRecheck}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                    annotations.length === 0 || hasSubmittedRecheck
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                  }`}
                >
                  <History className="w-4 h-4" />
                  Request Recheck
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border-b p-4 md:p-5"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4,
              }}
              className={`h-16 w-16 rounded-full flex flex-col items-center justify-center ${
                progressPercentage >= 70 ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              <span
                className={`text-xl font-bold ${
                  progressPercentage >= 70
                    ? "text-green-600"
                    : progressPercentage >= 40
                    ? "text-blue-600"
                    : "text-amber-600"
                }`}
              >
                {Math.round(progressPercentage)}%
              </span>
            </motion.div>

            <div>
              <div className="flex items-baseline gap-2">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {examData.score}
                </motion.h2>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500"
                >
                  / {examData.maxScore}
                </motion.span>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-gray-500 mt-1"
              >
                Evaluated on: {examData.date}
              </motion.p>
            </div>
          </div>

          <div className="w-full flex-1 hidden md:block">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  progressPercentage >= 70
                    ? "bg-green-500"
                    : progressPercentage >= 40
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 overflow-x-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentTab("overview")}
              className={`py-4 px-2 relative text-sm font-medium transition-all whitespace-nowrap ${
                currentTab === "overview"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
              {currentTab === "overview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentTab("questions")}
              className={`py-4 px-2 relative text-sm font-medium transition-all whitespace-nowrap ${
                currentTab === "questions"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Questions
              {currentTab === "questions" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </motion.button>

            {isHistory ? null : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentTab("recheck")}
                className={`py-4 px-2 relative text-sm font-medium transition-all whitespace-nowrap ${
                  currentTab === "recheck"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Recheck
                {annotations.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs">
                    {annotations.length}
                  </span>
                )}
                {currentTab === "recheck" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </motion.button>
            )}
            
            {recheckRequests.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentTab("history")}
                className={`py-4 px-2 relative text-sm font-medium transition-all whitespace-nowrap ${
                  currentTab === "history"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Recheck History
                <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs">
                  {recheckRequests.length}
                </span>
                {currentTab === "history" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div
        ref={mainContentRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden"
      >
        <div 
          className="flex flex-col"
          style={{ 
            width: window.innerWidth >= 768 ? `${splitPosition}%` : '100%',
            height: window.innerWidth >= 768 ? '100%' : '50%' 
          }}
        >
          <div className="bg-gray-100 p-3 flex items-center justify-between border-b border-gray-200">
            <span className="font-medium text-gray-700">
              Student Answer Script
            </span>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30"
              >
                <ZoomOut size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleResetZoom}
                className="p-1 rounded text-gray-500 hover:bg-gray-200"
              >
                <RotateCw size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30"
              >
                <ZoomIn size={18} />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 relative overflow-auto bg-gray-200 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-full w-full max-w-4xl mx-auto"
            >
              <PDFViewer
                file={pdfFile}
                pdfFallbackImage={pdfImageUrl}
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                zoomLevel={zoomLevel}
                onTotalPagesChange={handleTotalPagesChange}
                selectedAnnotations={selectedAnnotations}
              />
            </motion.div>

            {showAnnotation && currentTab !== 'history' && (
              <div className="absolute inset-0 bg-transparent">
                <AnnotationTool
                  onAnnotationChange={handleAnnotationChange}
                  currentPage={pageNumber}
                  examData={examData}
                  zoomLevel={zoomLevel}
                />
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden opacity-10">
              {[...Array(20)].map((_, index) => (
                <div
                  key={index}
                  className="absolute text-gray-800 text-opacity-20 font-bold text-lg"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(-${30 + Math.random() * 15}deg)`,
                  }}
                >
                  CONFIDENTIAL
                </div>
              ))}
            </div>
          </div>
        </div>

        {window.innerWidth >= 768 && (
          <div 
            ref={splitDividerRef}
            className="relative cursor-ew-resize w-1 bg-gray-300 hover:bg-blue-500 active:bg-blue-600 flex items-center justify-center transition-colors"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center">
              <GripVertical className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        )}

        <div 
          className="bg-white border-l border-gray-200 flex flex-col overflow-hidden"
          style={{ 
            width: window.innerWidth >= 768 ? `${100 - splitPosition}%` : '100%',
            height: window.innerWidth >= 768 ? '100%' : '50%' 
          }}
        >
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              {currentTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-xl font-semibold text-gray-900"
                  >
                    Evaluation Summary
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <motion.div
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      className="bg-white rounded-lg shadow p-4 border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Overall Score
                        </h3>
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            progressPercentage >= 70
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {progressPercentage >= 50 ? (
                            <CheckCircle size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          {examData.score}
                        </span>
                        <span className="text-gray-500">
                          / {examData.maxScore}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      className="bg-white rounded-lg shadow p-4 border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Questions
                        </h3>
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        {examData.questions.length}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      className="bg-white rounded-lg shadow p-4 border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Average Score
                        </h3>
                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Eye size={16} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        {examData.questions.length > 0 
                          ? (examData.score / examData.questions.length).toFixed(1)
                          : "0.0"}
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Performance by Question
                    </h3>

                    <div className="space-y-5">
                      {examData.questions.map((question, index) => {
                        const questionScore =
                          (question.marks_obtained / question.max_marks) * 100;
                        const colorClass =
                          questionScore >= 70
                            ? "bg-green-500"
                            : questionScore >= 40
                            ? "bg-blue-500"
                            : "bg-amber-500";
                        const annotationCount =
                          annotationsByQuestion.find(
                            (a) => a.questionNumber === question.question_number
                          )?.count || 0;

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index + 0.5 }}
                            whileHover={{
                              y: -2,
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                              borderColor: "rgba(59, 130, 246, 0.5)",
                            }}
                            className="border border-gray-100 rounded-lg p-4 transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1 text-blue-600 font-medium">
                                  {question.question_number}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800 mb-1">
                                    {question.question_text.length > 100
                                      ? question.question_text.substring(
                                          0,
                                          100
                                        ) + "..."
                                      : question.question_text}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="text-gray-500">
                                      Score:{" "}
                                      <span className="font-medium text-blue-600">
                                        {question.marks_obtained} /{" "}
                                        {question.max_marks}
                                      </span>
                                    </span>

                                    {annotationCount > 0 && (
                                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center">
                                        <PenTool className="w-3 h-3 mr-1" />
                                        {annotationCount}{" "}
                                        {annotationCount === 1
                                          ? "annotation"
                                          : "annotations"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setCurrentQuestion(index);
                                  setCurrentTab("questions");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span>View</span>
                                <ChevronRight size={16} />
                              </motion.button>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${questionScore}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: 0.1 * index + 0.8,
                                }}
                                className={`h-full rounded-full ${colorClass}`}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {currentTab === "questions" && examData.questions.length > 0 && (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setCurrentQuestion(Math.max(0, currentQuestion - 1))
                        }
                        disabled={currentQuestion === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 disabled:opacity-40 text-gray-500 hover:bg-gray-200"
                      >
                        <ChevronLeft size={18} />
                      </motion.button>
                      <motion.h2
                        layout
                        key={currentQuestion}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-semibold text-gray-900"
                      >
                        Question{" "}
                        {examData.questions[currentQuestion].question_number}
                      </motion.h2>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setCurrentQuestion(
                            Math.min(
                              examData.questions.length - 1,
                              currentQuestion + 1
                            )
                          )
                        }
                        disabled={
                          currentQuestion === examData.questions.length - 1
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 disabled:opacity-40 text-gray-500 hover:bg-gray-200"
                      >
                        <ChevronRight size={18} />
                      </motion.button>
                    </div>
                    <motion.div
                      layout
                      key={`score-${currentQuestion}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                        {examData.questions[currentQuestion].max_marks > 0 
                          ? Math.round(
                              (examData.questions[currentQuestion].marks_obtained /
                                examData.questions[currentQuestion].max_marks) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {examData.questions[currentQuestion].marks_obtained} /{" "}
                        {examData.questions[currentQuestion].max_marks}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    key={`question-${currentQuestion}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-5"
                  >
                    <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        Question
                      </h3>
                      <p className="text-gray-700">
                        {examData.questions[currentQuestion].question_text}
                      </p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <PenTool size={16} className="text-blue-600" />
                        Your Answer
                      </h3>
                      <p className="text-gray-600">
                        Your answer is displayed in the document viewer.
                        {!showAnnotation && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAnnotation(true)}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Enable annotations
                          </motion.button>
                        )}
                      </p>

                      {annotationsByQuestion.find(a => a.questionNumber === examData.questions[currentQuestion].question_number)?.count > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs flex items-center">
                            <PenTool className="w-3 h-3 mr-1" />
                            {annotationsByQuestion.find(a => a.questionNumber === examData.questions[currentQuestion].question_number).count}{" "}
                            {annotationsByQuestion.find(a => a.questionNumber === examData.questions[currentQuestion].question_number).count === 1
                              ? "annotation"
                              : "annotations"}{" "}
                            for this question
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-600" />
                        Overall Feedback
                      </h3>
                      <p className="text-gray-700">
                        {examData.questions[currentQuestion].feedback || "No feedback provided."}
                      </p>
                    </motion.div>

                    {detailedFeedback[examData.questions[currentQuestion].question_number] && 
                     detailedFeedback[examData.questions[currentQuestion].question_number].items && 
                     detailedFeedback[examData.questions[currentQuestion].question_number].items.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                      >
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <List size={16} className="text-blue-600" />
                          Detailed Assessment
                        </h3>
                        <div className="space-y-3">
                          {detailedFeedback[examData.questions[currentQuestion].question_number].items.map((item, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-medium text-gray-700">
                                  Criteria {item.item_number}
                                </h4>
                                <div className="text-sm font-medium text-gray-600">
                                  Score: {item.marks_awarded}/10
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{item.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {detailedFeedback[examData.questions[currentQuestion].question_number]?.improvement && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"
                      >
                        <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Bookmark size={16} className="text-blue-600" />
                          Improvement Suggestions
                        </h3>
                        <p className="text-gray-700">
                          {detailedFeedback[examData.questions[currentQuestion].question_number].improvement}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-center gap-8 mt-8"
                    >
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          Was this evaluation helpful?
                        </p>
                        <div className="flex gap-4 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.2, color: "#10B981" }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                          >
                            <ThumbsUp size={24} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2, color: "#EF4444" }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
                          >
                            <ThumbsDown size={24} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {currentTab === "recheck" && (
                <motion.div
                  key="recheck"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl font-semibold text-gray-900 flex items-center gap-2"
                    >
                      <History className="text-blue-600" size={20} />
                      Recheck Request
                    </motion.h2>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowRecheckModal(true)}
                      disabled={
                        annotations.length === 0 || hasSubmittedRecheck
                      }
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm ${
                        annotations.length === 0 || hasSubmittedRecheck
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {hasSubmittedRecheck ? "Request Submitted" : "Submit Request"}
                    </motion.button>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start gap-3 shadow-sm"
                  >
                    <Info size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-800 text-base mb-1">
                        Important Notice
                      </h3>
                      <p className="text-amber-700">
                        You can submit a recheck request <span className="font-bold underline">only once</span> per exam. Please ensure all your annotations are accurate before submitting.
                      </p>
                    </div>
                  </motion.div>

                  {requestStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm">
                      <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        Request Successfully Submitted
                      </h3>
                      <div className="text-sm text-green-700">
                        <p>
                          Your recheck request has been submitted and is under
                          review.
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span>
                            Request ID:{" "}
                            <span className="font-medium">
                              {requestStatus.id}
                            </span>
                          </span>
                          <span>Submitted on: {requestStatus.timestamp}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-2">
                      How to Request a Recheck
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        1. Use the annotation tool on the left to highlight
                        areas of your answer that you believe were incorrectly evaluated.
                      </p>
                      <p>
                        2. For each annotation, provide details about what you
                        believe was incorrectly evaluated and the marks you expected.
                      </p>
                      <p>
                        3. Once you've added all annotations, click "Submit
                        Request" and provide an overall reason.
                      </p>

                      {!showAnnotation && !hasSubmittedRecheck && (
                        <div className="mt-4">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowAnnotation(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                          >
                            <PenTool size={16} />
                            Enable Annotation Tool
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Your Annotations ({annotations.length})
                    </h3>

                    {annotations.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <PenTool className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-600 mb-2">
                          No annotations yet
                        </p>
                        <p className="text-sm max-w-md mx-auto">
                          Use the annotation tool to highlight areas of your
                          answer that you want rechecked.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {examData.questions.map((question) => {
                          const questionAnnotations = annotations.filter(
                            (a) =>
                              a.metadata.questionNumber ===
                              question.question_number
                          );

                          if (questionAnnotations.length === 0) return null;

                          return (
                            <div
                              key={question.question_number}
                              className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors"
                            >
                              <h4 className="font-medium text-gray-800 mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                    {question.question_number}
                                  </div>
                                  <span>
                                    Question {question.question_number}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {questionAnnotations.length}{" "}
                                  {questionAnnotations.length === 1
                                    ? "annotation"
                                    : "annotations"}
                                </span>
                              </h4>

                              <div className="space-y-3">
                                {questionAnnotations.map((anno) => (
                                  <motion.div
                                    key={anno.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                          Page {anno.pageNumber}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                          +
                                          {anno.metadata.expectedMarks -
                                            anno.metadata.actualMarks}{" "}
                                          points
                                        </span>
                                      </div>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                          setPageNumber(anno.pageNumber);
                                          if (!showAnnotation)
                                            setShowAnnotation(true);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                      >
                                        <Eye size={12} />
                                        View
                                      </motion.button>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">
                                      {anno.metadata.grievance}
                                    </p>
                                    <div className="flex justify-between text-xs mt-2 text-gray-500">
                                      <span>
                                        Current: {anno.metadata.actualMarks}
                                      </span>
                                      <span>
                                        Expected: {anno.metadata.expectedMarks}
                                      </span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl font-semibold text-gray-900 flex items-center gap-2"
                    >
                      <History className="text-blue-600" size={20} />
                      Recheck Request History
                    </motion.h2>
                    
                    {selectedRecheckRequest && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedRecheckRequest(null);
                          setSelectedAnnotations([]);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ArrowLeft size={16} />
                        Back to all requests
                      </motion.button>
                    )}
                  </div>

                  {selectedRecheckRequest ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-800 flex items-center gap-2">
                              Request #{selectedRecheckRequest.request_number || ''}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted on: {new Date(selectedRecheckRequest.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${selectedRecheckRequest.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            selectedRecheckRequest.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'}`}>
                            {selectedRecheckRequest.status.charAt(0).toUpperCase() + selectedRecheckRequest.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Reason</h4>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-700">{selectedRecheckRequest.reason}</p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-700 flex items-center gap-2 mb-4">
                          <Info size={16} />
                          <span>
                            The annotations from this request are highlighted in yellow on the document. 
                            Navigate through pages to view all annotations.
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Annotations ({selectedRecheckRequest.annotations?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-auto">
                            {selectedRecheckRequest.annotations && selectedRecheckRequest.annotations.map((anno, idx) => (
                              <motion.div 
                                key={idx} 
                                className="p-3 border border-yellow-200 rounded-md bg-yellow-50 text-sm hover:shadow-md transition-all cursor-pointer"
                                onClick={() => {
                                  if (anno.pageNumber) {
                                    setPageNumber(anno.pageNumber);
                                  }
                                }}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium flex items-center gap-1">
                                    <Eye size={14} className="text-yellow-600" />
                                    Question {anno.questionNumber}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                      Page {anno.pageNumber}
                                    </span>
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                      +{anno.expectedMarks - anno.currentMarks} marks
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700 mb-1">{anno.grievance}</p>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Current: {anno.currentMarks}</span>
                                  <span>Expected: {anno.expectedMarks}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {selectedRecheckRequest.feedback && (
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                          <h3 className="font-medium text-gray-800 mb-2">Evaluator Feedback</h3>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-700">{selectedRecheckRequest.feedback}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <RecheckRequestHistory 
                      requests={recheckRequests}
                      loading={loadingRecheckRequests}
                      error={recheckRequestsError}
                      onViewRequest={handleViewRecheckRequest}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRecheckModal && (
          <RecheckModal
            isOpen={showRecheckModal}
            onClose={() => setShowRecheckModal(false)}
            onSubmit={handleRecheckSubmit}
            annotations={annotations}
            examData={examData}
            enrollmentId={enrollmentId}
          />
        )}
      </AnimatePresence>

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

export default StudentExamDetails;