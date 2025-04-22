import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Save,
  X, 
  ClipboardList,
  BarChart,
  ChevronDown,
  Layout,
  MoveHorizontal,
  MessageSquare,
  Info,
  Link as LinkIcon,
  AlertTriangle
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
      className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 
        ${type === "success" ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gradient-to-r from-red-500 to-red-600"} text-white`}
    >
      {type === "success" ? (
        <CheckCircle size={22} />
      ) : (
        <AlertCircle size={22} />
      )}
      <span className="font-medium">{message}</span>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose} 
        className="ml-2 text-white/80 hover:text-white"
      >
        <X size={18} />
      </motion.button>
    </motion.div>
  );
};


const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;

  switch (status?.toLowerCase()) {
    case "approved":
      bgColor = "bg-gradient-to-r from-green-100 to-green-50";
      textColor = "text-green-800";
      icon = <CheckCircle className="w-4 h-4" />;
      break;
    case "rejected":
      bgColor = "bg-gradient-to-r from-red-100 to-red-50";
      textColor = "text-red-800";
      icon = <XCircle className="w-4 h-4" />;
      break;
    case "pending":
    default:
      bgColor = "bg-gradient-to-r from-yellow-100 to-yellow-50";
      textColor = "text-yellow-800";
      icon = <AlertCircle className="w-4 h-4" />;
      break;
  }

  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${bgColor} ${textColor} shadow-sm border border-white/20`}
    >
      {icon}
      <span className="font-medium">{status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}</span>
    </motion.span>
  );
};


const PageViewer = ({
  presigned_url,
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
  const imageRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    if (presigned_url) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [presigned_url]);

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
          The image could not be loaded. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10"
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-t-blue-500 border-blue-300/30 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Loading image...</p>
          </div>
        </motion.div>
      )}
      
      <motion.div
        className="transition-all duration-300 ease-out will-change-transform"
        animate={{ scale: zoomLevel }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {presigned_url ? (
          <img
            ref={imageRef}
            src={presigned_url}
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
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 right-6 flex bg-gray-900/90 p-2 rounded-full shadow-xl backdrop-blur-sm"
      >
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgb(55, 65, 81)" }}
          whileTap={{ scale: 0.9 }}
          onClick={onZoomOut}
          className="p-2.5 text-gray-200 hover:text-white rounded-full transition-all"
          title="Zoom out"
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgb(55, 65, 81)" }}
          whileTap={{ scale: 0.9 }}
          onClick={onZoomReset}
          className="p-2.5 text-gray-200 hover:text-white rounded-full transition-all mx-1"
          title="Reset zoom"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgb(55, 65, 81)" }}
          whileTap={{ scale: 0.9 }}
          onClick={onZoomIn}
          className="p-2.5 text-gray-200 hover:text-white rounded-full transition-all"
          title="Zoom in"
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
      </motion.div>
      
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 px-5 py-2.5 rounded-full shadow-xl flex items-center gap-4 backdrop-blur-sm"
        >
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className={`p-1 rounded ${
              pageNumber <= 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-200 hover:text-white"
            }`}
          >
            <ChevronLeft size={22} />
          </motion.button>
          <span className="text-sm font-medium text-white">
            Page {pageNumber} of {totalPages}
          </span>
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className={`p-1 rounded ${
              pageNumber >= totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-200 hover:text-white"
            }`}
          >
            <ChevronRight size={22} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};


const AnnotationViewer = ({ 
  annotations = [], 
  currentPage,
  onSelectAnnotation,
  selectedAnnotationId,
  respondedAnnotationIds = []
}) => {
  
  const studentAnnotations = annotations.filter(
    anno => anno.pageNumber === currentPage
  );

  return (
    <div className="relative w-full h-full pointer-events-none">
      {studentAnnotations.map((anno) => {
        
        const startX = anno.coordinates?.startX || anno.startX || 0;
        const startY = anno.coordinates?.startY || anno.startY || 0;
        const endX = anno.coordinates?.endX || anno.endX || 0;
        const endY = anno.coordinates?.endY || anno.endY || 0;
        
        
        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        
        
        const visibleWidth = Math.max(width, 20);
        const visibleHeight = Math.max(height, 20);
        
        
        const annotationId = anno.id || anno.annotation_id;
        const isSelected = annotationId === selectedAnnotationId;
        const isResponded = respondedAnnotationIds.includes(annotationId) || 
                           anno.status === 'accepted' || 
                           anno.status === 'rejected';

        return (
          <motion.div
            key={annotationId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: isSelected ? '0 0 0 4px rgba(59, 130, 246, 0.8)' : isResponded ? '0 0 0 4px rgba(34, 197, 94, 0.6)' : 'none'
            }}
            transition={{ duration: 0.3, type: "spring" }}
            className={`absolute border-4 ${
              isSelected ? 'ring-4 ring-blue-500' : 
              isResponded ? 'ring-4 ring-green-500' : ''
            } pointer-events-auto`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${visibleWidth}px`,
              height: `${visibleHeight}px`,
              borderColor: isResponded ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
              backgroundColor: isResponded ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
              zIndex: isSelected ? 30 : 20
            }}
            onClick={() => onSelectAnnotation(anno)}
          >
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`absolute -top-10 left-0 bg-white text-xs px-2 py-1.5 rounded-md shadow-md border ${
                isResponded ? "border-green-200" : "border-blue-200"
              } z-40`}
            >
              <span className={`${
                isResponded ? "bg-green-500" : "bg-blue-500"
              } text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold`}>
                {anno.questionNumber}
              </span>
              {isResponded && (
                <span className="ml-1 text-xs text-green-600 font-medium">✓</span>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};


const AnnotationResponseForm = ({ 
  selectedAnnotation, 
  onClose, 
  onSubmit, 
  maxMarks,
  existingResponses = [],
  questionResponses = []
}) => {
  const [responseData, setResponseData] = useState({
    comment: "",
    newMark: selectedAnnotation?.expectedMarks || selectedAnnotation?.metadata?.newMark || 0,
  });

  
  const questionNumber = selectedAnnotation?.questionNumber || selectedAnnotation?.metadata?.questionNumber;
  const hasExistingResponses = questionResponses.length > 0;

  useEffect(() => {
    
    if (hasExistingResponses && questionResponses.length > 0) {
      
      const latestResponse = questionResponses[questionResponses.length - 1];
      setResponseData(prev => ({
        ...prev,
        newMark: latestResponse.newMark
      }));
    } else {
      
      setResponseData(prev => ({
        ...prev,
        newMark: selectedAnnotation?.expectedMarks || selectedAnnotation?.metadata?.newMark || selectedAnnotation?.currentMarks || 0
      }));
    }
  }, [selectedAnnotation, hasExistingResponses, questionResponses]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    
    const qMaxMarks = maxMarks[questionNumber] || maxMarks.total;
    if (responseData.newMark > qMaxMarks) {
      alert(`New mark for Question ${questionNumber} cannot exceed the maximum marks (${qMaxMarks})`);
      return;
    }

    onSubmit({
      questionNumber: questionNumber,
      comment: responseData.comment,
      newMark: parseFloat(responseData.newMark),
      annotationId: selectedAnnotation.id || selectedAnnotation.annotation_id
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: "spring", damping: 20 }}
      className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-5 z-40 w-96 border border-blue-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-blue-500">
            {questionNumber}
          </div>
          <span>Address Student Annotation</span>
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </motion.button>
      </div>

      {hasExistingResponses && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Question Already Addressed
          </h4>
          <p className="text-xs text-amber-700 mb-2">
            This question has been addressed in {questionResponses.length} previous annotation{questionResponses.length > 1 ? 's' : ''}.
            The latest mark assigned was <span className="font-medium">{questionResponses[questionResponses.length - 1].newMark}</span>.
          </p>
          
          {questionResponses.length > 0 && (
            <div className="mt-1 text-xs text-amber-700">
              <span className="font-medium">Previous responses:</span>
              <ul className="mt-1 space-y-1 pl-4">
                {questionResponses.map((resp, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    <div>
                      <span className="font-medium">{resp.newMark} marks</span>: 
                      <span className="ml-1 italic">{resp.comment.length > 40 ? resp.comment.substring(0, 40) + '...' : resp.comment}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1.5">
          <Info size={14} />
          Student Comment
        </h4>
        <p className="text-sm text-gray-700">{selectedAnnotation.grievance || selectedAnnotation.metadata?.comment}</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Professor Remarks
          </label>
          <textarea
            value={responseData.comment}
            onChange={(e) => setResponseData({...responseData, comment: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
            rows={3}
            placeholder="Add your assessment comments..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Original Mark
            </label>
            <input
              type="number"
              value={selectedAnnotation.currentMarks || selectedAnnotation.metadata?.previousMark}
              className="w-full p-3 border rounded-lg border-gray-300 bg-gray-100 text-gray-700"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Original mark (non-editable)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Mark
            </label>
            <input
              type="number"
              value={responseData.newMark}
              onChange={(e) => setResponseData({
                ...responseData, 
                newMark: parseFloat(e.target.value) || 0
              })}
              className={`w-full p-3 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                hasExistingResponses ? 'bg-amber-50/50' : 'bg-blue-50/50'
              }`}
              min="0"
              max={maxMarks[questionNumber]}
              step="0.5"
              required
            />
            {hasExistingResponses && (
              <p className="text-xs text-amber-600 mt-1">This will update the mark for all annotations of question {questionNumber}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-50">
          <div className="text-xs text-gray-600">Page {selectedAnnotation.pageNumber}</div>
          <div className="text-xs text-blue-700 font-medium">
            Question {questionNumber}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
            }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="px-5 py-2.5 text-white rounded-lg flex items-center gap-2 shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Save size={18} />
            Submit Response
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};


const QuestionMarksEditor = ({ 
  questionMarks, 
  maxMarks,
  onQuestionMarkChange,
  totalOriginalMarks,
  totalNewMarks,
  addressedQuestions,
  questionResponses
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
  
  const improvementPercentage = totalOriginalMarks > 0 
    ? ((totalNewMarks - totalOriginalMarks) / totalOriginalMarks) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/70 rounded-xl border border-blue-200 shadow-sm"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Assessment</span>
          <div className="px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-sm font-medium">
            <span className="text-blue-700">{totalNewMarks}</span>
            <span className="text-gray-400 mx-1.5">/</span>
            <span className="text-gray-500">{maxMarks.total}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200/50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Original Total</span>
            <span className="text-xs font-medium">{totalOriginalMarks}</span>
          </div>
          
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs font-medium text-gray-600">Adjustment</span>
            <span className={`text-xs font-medium ${
              totalNewMarks > totalOriginalMarks 
                ? 'text-green-600' 
                : totalNewMarks < totalOriginalMarks 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {totalNewMarks > totalOriginalMarks ? '+' : ''}
              {(totalNewMarks - totalOriginalMarks).toFixed(1)}
              {totalOriginalMarks > 0 && (
                <span className="ml-1 text-gray-500">
                  ({improvementPercentage > 0 ? '+' : ''}{improvementPercentage.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
          
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(totalNewMarks / maxMarks.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {Object.keys(maxMarks)
          .filter(key => key !== 'total')
          .map(questionNum => {
            const isExpanded = expandedQuestions[questionNum] || false;
            const qMarks = questionMarks[questionNum] || { originalMark: 0, newMark: 0 };
            const qMaxMarks = maxMarks[questionNum];
            const percentChange = qMarks.originalMark > 0 
              ? ((qMarks.newMark - qMarks.originalMark) / qMarks.originalMark) * 100 
              : 0;
            
            
            const isAddressed = addressedQuestions && addressedQuestions[questionNum];
            
            
            const responsesForQuestion = questionResponses[questionNum] || [];
            const responseCount = responsesForQuestion.length;
            
            return (
              <motion.div 
                key={questionNum}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: parseInt(questionNum) * 0.05 }}
                className={`border rounded-lg overflow-hidden bg-white shadow-sm ${
                  isAddressed ? "border-green-200" : "border-gray-200"
                }`}
              >
                <div 
                  className={`flex justify-between items-center p-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isAddressed ? "bg-green-50/50" : ""
                  }`}
                  onClick={() => toggleQuestion(questionNum)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAddressed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {questionNum}
                    </div>
                    <span className="font-medium text-gray-800">Question {questionNum}</span>
                    {isAddressed && (
                      <div className="flex items-center gap-1.5">
                        <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Addressed
                        </span>
                        {responseCount > 1 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {responseCount} responses
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
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
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} className="text-gray-500" />
                    </motion.div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              Original Mark
                            </label>
                            <input
                              type="number"
                              value={qMarks.originalMark}
                              onChange={(e) => handleMarkChange(questionNum, 'originalMark', parseFloat(e.target.value) || 0)}
                              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              max={qMaxMarks}
                              step="0.5"
                              disabled={isAddressed} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              New Mark
                            </label>
                            <input
                              type="number"
                              value={qMarks.newMark}
                              onChange={(e) => handleMarkChange(questionNum, 'newMark', parseFloat(e.target.value) || 0)}
                              className={`w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                qMarks.newMark > qMarks.originalMark 
                                  ? 'bg-green-50 border-green-200' 
                                  : qMarks.newMark < qMarks.originalMark 
                                    ? 'bg-red-50 border-red-200' 
                                    : ''
                              }`}
                              min="0"
                              max={qMaxMarks}
                              step="0.5"
                              disabled={isAddressed} 
                            />
                          </div>
                        </div>
                        
                        {responseCount > 0 && (
                          <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                              <MessageSquare size={14} className="text-blue-500" />
                              Professor Responses ({responseCount})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {responsesForQuestion.map((response, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded-md border border-gray-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium text-blue-600">Response {index + 1}</span>
                                      <LinkIcon size={10} className="text-gray-400" />
                                      <span className="text-gray-500">Annotation {
                                        typeof response.annotationId === 'string' && response.annotationId.includes('-') 
                                          ? response.annotationId.split('-')[1] 
                                          : response.annotationId
                                      }</span>
                                    </div>
                                    <span className="text-green-600 font-medium">Mark: {response.newMark}</span>
                                  </div>
                                  <p className="text-gray-600 line-clamp-2">{response.comment}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Adjustment</span>
                            <span className={`text-xs font-medium ${
                              qMarks.newMark > qMarks.originalMark 
                                ? 'text-green-600' 
                                : qMarks.newMark < qMarks.originalMark 
                                  ? 'text-red-600' 
                                  : 'text-gray-600'
                            }`}>
                              {qMarks.newMark > qMarks.originalMark ? '+' : ''}
                              {(qMarks.newMark - qMarks.originalMark).toFixed(1)}
                              
                              {qMarks.originalMark > 0 && qMarks.newMark !== qMarks.originalMark && (
                                <span className="ml-1 text-gray-500">
                                  ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                qMarks.newMark > qMarks.originalMark 
                                  ? 'bg-green-500' 
                                  : qMarks.newMark < qMarks.originalMark 
                                    ? 'bg-red-500' 
                                    : 'bg-blue-500'
                              }`}
                              style={{ width: `${(qMarks.newMark / qMaxMarks) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
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
        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
          activeTab === 'annotations' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('annotations')}
      >
        <span className="flex items-center justify-center gap-2">
          <ClipboardList size={18} />
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
        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
          activeTab === 'assessment' 
            ? 'text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('assessment')}
      >
        <span className="flex items-center justify-center gap-2">
          <BarChart size={18} />
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


const StudentAnnotationsList = ({ 
  annotations, 
  respondedIds, 
  onSelectAnnotation, 
  selectedAnnotationId,
  questionResponses
}) => {
  
  const groupedAnnotations = annotations.reduce((acc, anno) => {
    const qNum = anno.questionNumber || anno.metadata?.questionNumber;
    if (qNum) {
      if (!acc[qNum]) {
        acc[qNum] = [];
      }
      acc[qNum].push(anno);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.keys(groupedAnnotations).length > 0 ? (
        Object.entries(groupedAnnotations).map(([questionNum, annotations]) => {
          const responseCount = (questionResponses[questionNum] || []).length;
          const isFullyResponded = annotations.every(anno => 
            respondedIds.includes(anno.id) || 
            respondedIds.includes(anno.annotation_id) || 
            anno.status === 'accepted' || 
            anno.status === 'rejected'
          );
          
          return (
            <motion.div
              key={questionNum}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: parseInt(questionNum) * 0.05 }}
              className={`border rounded-lg overflow-hidden bg-white shadow-sm ${
                isFullyResponded ? "border-green-200" : "border-blue-200"
              }`}
            >
              <div className={`px-3 py-2 ${isFullyResponded ? "bg-green-50" : "bg-blue-50"} border-b border-gray-100`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isFullyResponded ? "bg-green-500" : "bg-blue-500"
                    }`}>
                      {questionNum}
                    </div>
                    <span className="text-sm font-medium">Question {questionNum}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200">
                      {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                    </span>
                    {responseCount > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isFullyResponded ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {responseCount} response{responseCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 p-2">
                {annotations.map((anno) => {
                  const annotationId = anno.id || anno.annotation_id;
                  const hasResponse = respondedIds.includes(annotationId) || 
                                      anno.status === 'accepted' || 
                                      anno.status === 'rejected';
                  
                  return (
                    <motion.div
                      key={annotationId}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all ${
                        selectedAnnotationId === annotationId 
                          ? "border-blue-400 ring-2 ring-blue-200" 
                          : hasResponse
                            ? "border-green-300 bg-green-50/50"
                            : "border-blue-200 hover:border-blue-300"
                      }`}
                      onClick={() => onSelectAnnotation(anno)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <div className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700">
                            Student
                          </div>
                          {hasResponse && (
                            <div className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-green-50 text-green-700">
                              Addressed
                            </div>
                          )}
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                          Page {anno.pageNumber}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {anno.grievance || anno.metadata?.comment}
                      </p>
                      <div className="flex justify-between text-xs mt-2 text-gray-500">
                        <span>Current: {anno.currentMarks || anno.metadata?.previousMark}</span>
                        <span className="text-green-600 font-medium">
                          Expected: {anno.expectedMarks || anno.metadata?.newMark}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg text-gray-500 text-sm border border-gray-100">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          No student annotations found
        </div>
      )}
    </div>
  );
};


const ProfessorRecheckDetail = () => {
  
  const { courseId, requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const queryParams = new URLSearchParams(location.search);
  const examId = queryParams.get('examId') || courseId;
  const enrollmentId = queryParams.get('enrollmentId') || requestId;
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [decision, setDecision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(500); 
  const [resizing, setResizing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('annotations');
  const [questionMarks, setQuestionMarks] = useState({});
  const [maxMarks, setMaxMarks] = useState({ total: 10 });
  const [totalOriginalMarks, setTotalOriginalMarks] = useState(0);
  const [totalNewMarks, setTotalNewMarks] = useState(0);
  const [professorFeedback, setProfessorFeedback] = useState('');
  const [addressedQuestions, setAddressedQuestions] = useState({});
  const [professorResponses, setProfessorResponses] = useState([]);
  const [questionResponses, setQuestionResponses] = useState({}); 
  const [pageUrls, setPageUrls] = useState([]);
  const resizeStartX = useRef(0);
  const startWidth = useRef(0);
  const containerRef = useRef(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [mongoId, setMongoId] = useState(null);

  
  const respondedAnnotationIds = professorResponses.map(response => response.annotationId);

  
  useEffect(() => {
    const handleResize = () => {
      if (!resizing) {
        setSidebarWidth(Math.min(window.innerWidth * 0.4, 500));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizing]);
  
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing) return;
      
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
      const newWidth = startWidth.current + (e.clientX - resizeStartX.current);
      
      
      const minWidth = Math.max(320, containerWidth * 0.2);
      const maxWidth = containerWidth * 0.6;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
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

  
  useEffect(() => {
    const fetchRequestData = async () => {
      setLoading(true);
      try {
        console.log("Fetching data with examId:", examId, "and enrollmentId:", enrollmentId);
        
        
        const recheckResponse = await fetch(
          `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/recheck-requests`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (!recheckResponse.ok) {
          throw new Error('Failed to fetch recheck request');
        }

        const recheckData = await recheckResponse.json();
        
        if (!recheckData.data || recheckData.data.length === 0) {
          throw new Error('No recheck requests found');
        }

        const request = recheckData.data[0];
        setMongoId(request._id);
        
        
        const answerSheetResponse = await fetch(
          `${API_BASE_URL}/exams/${request.exam_id || examId}/answer-sheets/${request.enrollment_id || enrollmentId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (!answerSheetResponse.ok) {
          throw new Error('Failed to fetch answer sheets');
        }

        const answerSheetData = await answerSheetResponse.json();
        
        
        const pages = answerSheetData.data.pages || [];
        const pageUrls = pages.map(page => page.presigned_url || page.url);
        const studentData = answerSheetData.data.student || {};
        const annotationsData = request.annotations || [];
        
        
        const transformedAnnotations = annotationsData.map(anno => ({
          id: anno.annotation_id || `anno-${anno.questionNumber}-${anno.pageNumber}`,
          annotation_id: anno.annotation_id || `anno-${anno.questionNumber}-${anno.pageNumber}`,
          pageNumber: anno.pageNumber,
          questionNumber: anno.questionNumber,
          grievance: anno.grievance,
          coordinates: anno.coordinates,
          currentMarks: anno.currentMarks,
          expectedMarks: anno.expectedMarks,
          status: anno.status || 'pending',
          professorFeedback: anno.professorFeedback || '',
          marksAwarded: anno.marksAwarded || 0
        }));
        
        
        const qMarks = {};
        const maxMarksByQuestion = { total: 0 };
        let origTotal = 0;
        let newTotal = 0;
        
        
        const questionMap = {};
        transformedAnnotations.forEach(anno => {
          const qNum = anno.questionNumber;
          if (!questionMap[qNum]) {
            questionMap[qNum] = [];
            
            maxMarksByQuestion[qNum] = 10; 
          }
          questionMap[qNum].push(anno);
          
          if (anno.status === 'accepted' || anno.status === 'rejected') {
            const profResponse = {
              id: `prof-${Date.now()}-${anno.id}`,
              questionNumber: anno.questionNumber,
              comment: anno.professorFeedback || "Review completed",
              newMark: anno.marksAwarded || anno.currentMarks,
              annotationId: anno.id || anno.annotation_id
            };
            
            setProfessorResponses(prev => {
              if (!prev.some(r => r.annotationId === profResponse.annotationId)) {
                return [...prev, profResponse];
              }
              return prev;
            });
            
            setAddressedQuestions(prev => ({
              ...prev,
              [anno.questionNumber]: true
            }));
          }
        });
        
        Object.keys(questionMap).forEach(qNum => {
          const annotations = questionMap[qNum];
          const firstAnno = annotations[0];
          qMarks[qNum] = {
            originalMark: firstAnno.currentMarks,
            newMark: firstAnno.status === 'accepted' ? firstAnno.marksAwarded : firstAnno.currentMarks
          };
          
          origTotal += firstAnno.currentMarks;
          newTotal += qMarks[qNum].newMark;
          maxMarksByQuestion.total += maxMarksByQuestion[qNum];
        });
        
        const formattedRequestData = {
          id: request._id,
          studentName: studentData.name || "Student",
          studentId: studentData.roll_number || studentData.student_id || "ID",
          examTitle: `Exam ${request.exam_id || examId}`,
          examType: "Examination",
          reason: request.reason,
          status: request.status,
          submittedDate: new Date(request.created_at).toLocaleDateString(),
          currentMarks: origTotal,
          maxMarks: maxMarksByQuestion,
          questionMarks: qMarks,
          annotations: transformedAnnotations.length,
          pages: pages.map((page, idx) => ({ 
            pageNumber: page.page_number || (idx + 1), 
            imageUrl: page.presigned_url || page.url 
          }))
        };
        
        setRequestData(formattedRequestData);
        setAnnotations(transformedAnnotations);
        setTotalPages(pages.length);
        setMaxMarks(maxMarksByQuestion);
        setQuestionMarks(qMarks);
        setTotalOriginalMarks(origTotal);
        setTotalNewMarks(newTotal);
        setPageUrls(pageUrls);
        
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Error fetching request data:", err);
        setError("Failed to load request data. Please try again.");
        setLoading(false);
      }
    };
    
    if (examId && enrollmentId) {
      fetchRequestData();
    } else {
      setError("Missing required parameters: examId and enrollmentId");
      setLoading(false);
    }
  }, [examId, enrollmentId]);

  
  useEffect(() => {
    const byQuestion = professorResponses.reduce((acc, response) => {
      const qNum = response.questionNumber;
      if (!acc[qNum]) {
        acc[qNum] = [];
      }
      acc[qNum].push(response);
      return acc;
    }, {});
    
    setQuestionResponses(byQuestion);
  }, [professorResponses]);

  const startResize = (e) => {
    e.preventDefault();
    setResizing(true);
    resizeStartX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handleQuestionMarkUpdate = (questionNum, oldMark, newMark) => {
    setQuestionMarks(prev => {
      const updated = { ...prev };
      
      
      updated[questionNum] = {
        originalMark: oldMark,
        newMark: newMark
      };
      
      
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
    
    
    setAddressedQuestions(prev => ({
      ...prev,
      [questionNum]: true
    }));
  };

  const handleQuestionMarkChange = (questionNum, field, value) => {
    if (addressedQuestions[questionNum]) {
      
      showToast("This question has already been addressed via annotation response", "error");
      return;
    }
    
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
      
      
      setShowResponseForm(false);
      setSelectedAnnotation(null);
      setSelectedAnnotationId(null);
    }
  };

  const handleGoBack = () => {
    navigate(`/courses`);
  };

  const handleSelectAnnotation = (annotation) => {
    const annotationId = annotation.id || annotation.annotation_id;
    
    setSelectedAnnotation(annotation);
    setSelectedAnnotationId(annotationId);
    setShowResponseForm(true);
    
    
    if (annotation.pageNumber !== pageNumber) {
      setPageNumber(annotation.pageNumber);
    }
  };

  const handleAnnotationResponse = async (responseData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('status', 'accepted');
      formData.append('feedback', responseData.comment);
      formData.append('marks_awarded', responseData.newMark);
      
      const response = await fetch(
        `${API_BASE_URL}/exams/recheck/${mongoId}/annotations/${responseData.annotationId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update annotation');
      }
      
      const result = await response.json();
      
      const newResponse = {
        id: `prof-${Date.now()}`,
        questionNumber: responseData.questionNumber,
        comment: responseData.comment,
        newMark: responseData.newMark,
        annotationId: responseData.annotationId,
        studentComment: selectedAnnotation?.grievance || selectedAnnotation?.metadata?.comment || ""
      };
      
      setProfessorResponses(prev => [...prev, newResponse]);
      
      setAnnotations(prev => prev.map(anno => {
        if ((anno.id === responseData.annotationId) || (anno.annotation_id === responseData.annotationId)) {
          return {
            ...anno,
            status: 'accepted',
            professorFeedback: responseData.comment,
            marksAwarded: responseData.newMark
          };
        }
        return anno;
      }));
      
      handleQuestionMarkUpdate(
        responseData.questionNumber,
        selectedAnnotation.currentMarks || selectedAnnotation.metadata?.previousMark,
        responseData.newMark
      );
      
      setShowResponseForm(false);
      setSelectedAnnotation(null);
      setSelectedAnnotationId(null);
      
      showToast("Response submitted successfully", "success");
    } catch (error) {
      console.error("Error submitting annotation response:", error);
      showToast("Failed to submit response", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!decision) {
      showToast("Please select a decision (Approve or Reject)", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const unansweredAnnotations = annotations.filter(anno => 
        !respondedAnnotationIds.includes(anno.id) && 
        !respondedAnnotationIds.includes(anno.annotation_id) &&
        anno.status !== 'accepted' &&
        anno.status !== 'rejected'
      );
      
      if (decision === "rejected") {
        await Promise.all(unansweredAnnotations.map(async (anno) => {
          const formData = new FormData();
          formData.append('status', 'rejected');
          formData.append('feedback', professorFeedback || "Annotation rejected");
          formData.append('marks_awarded', anno.currentMarks);
          
          const annoId = anno.id || anno.annotation_id;
          
          const response = await fetch(
            `${API_BASE_URL}/exams/recheck/${mongoId}/annotations/${annoId}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: formData
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to reject annotation ${annoId}`);
          }
          
          return response.json();
        }));
      }
      
      const updateRecheckStatus = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRequestData(prev => ({
          ...prev,
          status: decision === "partial" ? "approved" : decision,
          currentMarks: totalNewMarks
        }));
      };
      
      await updateRecheckStatus();
      
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
  
  const resetSidebarWidth = useCallback(() => {
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    setSidebarWidth(Math.min(containerWidth * 0.4, 500));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 border-4 border-t-blue-500 border-blue-200/30 rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-medium text-gray-900 mb-6">Loading request</h3>
            <p className="text-gray-500">Please wait while we fetch the recheck request...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="inline-block bg-red-100 p-8 rounded-full mb-8"
          >
            <AlertCircle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Request</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  
  if (requestComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm p-4 border-b">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGoBack}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <h1 className="text-xl font-bold text-gray-900">
                Recheck Request Complete
              </h1>
            </div>
            <StatusBadge status={decision === "approved" || decision === "partial" ? "approved" : "rejected"} />
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="inline-block p-6 rounded-full bg-blue-50 mb-6">
              {decision === "approved" || decision === "partial" ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Request {decision === "approved" || decision === "partial" ? "Approved" : "Rejected"}
            </h2>
            
            <p className="text-gray-600 mb-6">
              You have {decision === "approved" || decision === "partial" ? "approved" : "rejected"} the recheck request for {requestData?.studentName}. 
              {decision === "approved" || decision === "partial" 
                ? ` The student's mark has been updated from ${totalOriginalMarks} to ${totalNewMarks}.`
                : " No changes have been made to the student's marks."}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all w-full"
            >
              Return to Course
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" ref={containerRef}>
      <header className="bg-white shadow-md p-4 border-b sticky top-0 z-40">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium shadow-sm"
              >
                {requestData?.studentName?.charAt(0) || "S"}
              </motion.div>
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
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm"
            >
              Professor Mode
            </motion.div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div 
          className="bg-white border-r border-gray-200 overflow-hidden flex flex-col shadow-md z-30"
          style={{ 
            width: `${sidebarWidth}px`,
            minWidth: `${sidebarWidth}px`,
            maxHeight: 'calc(100vh - 73px)',
            transition: resizing ? 'none' : 'width 0.3s ease-in-out'
          }}
        >
          <SidebarTabs activeTab={sidebarTab} setActiveTab={setSidebarTab} />

          <div className="overflow-y-auto flex-1 p-5">
            {sidebarTab === 'annotations' && (
              <div className="space-y-5">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Request Overview</h2>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1.5">Student's Reason</h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 border border-gray-100 text-sm shadow-sm">
                        {requestData?.reason}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Student Annotations</h2>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {annotations.length}
                    </span>
                  </div>
                  
                  <StudentAnnotationsList 
                    annotations={annotations}
                    respondedIds={respondedAnnotationIds}
                    onSelectAnnotation={handleSelectAnnotation}
                    selectedAnnotationId={selectedAnnotationId}
                    questionResponses={questionResponses}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Professor Responses</h2>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {professorResponses.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                    {professorResponses.length > 0 ? (
                      professorResponses.map((response) => {
                        const linkedAnnotation = annotations.find(a => 
                          a.id === response.annotationId || a.annotation_id === response.annotationId
                        );
                        
                        return (
                          <motion.div
                            key={response.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-3.5 bg-white rounded-lg border shadow-sm transition-all border-red-200 hover:border-red-300"
                            onClick={() => {
                              
                              if (linkedAnnotation) {
                                setPageNumber(linkedAnnotation.pageNumber);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-600">
                                  {response.questionNumber}
                                </div>
                                <div className="text-xs px-1.5 py-0.5 rounded-md font-medium bg-red-50 text-red-700">
                                  Professor
                                </div>
                              </div>
                              {linkedAnnotation && (
                                <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                  Page {linkedAnnotation.pageNumber}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {response.comment}
                            </p>
                            
                            {linkedAnnotation && (
                              <div className="mt-2 p-2 bg-blue-50/50 rounded-md border border-blue-100 text-xs flex items-start gap-1.5">
                                <LinkIcon size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-blue-700">In response to:</span>
                                  <p className="text-gray-600 mt-0.5 line-clamp-1">
                                    {linkedAnnotation.grievance || linkedAnnotation.metadata?.comment}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-end text-xs mt-2">
                              <span className={`font-medium ${
                                linkedAnnotation && response.newMark > (linkedAnnotation.currentMarks || linkedAnnotation.metadata?.previousMark)
                                  ? "text-green-600" 
                                  : "text-red-600"
                              }`}>
                                New Mark: {response.newMark}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg text-gray-500 text-sm border border-gray-100">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        No professor responses yet
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {sidebarTab === 'assessment' && (
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart size={18} className="text-blue-500" />
                    Mark Assessment Summary
                  </h2>
                  
                  <QuestionMarksEditor
                    questionMarks={questionMarks}
                    maxMarks={maxMarks}
                    onQuestionMarkChange={handleQuestionMarkChange}
                    totalOriginalMarks={totalOriginalMarks}
                    totalNewMarks={totalNewMarks}
                    addressedQuestions={addressedQuestions}
                    questionResponses={questionResponses}
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4 pt-5 border-t border-gray-200 mt-5"
                >
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-gray-500" />
                      Decision
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setDecision("approved")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border shadow-sm ${
                          decision === "approved"
                            ? "bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <CheckCircle size={18} />
                        <span className="font-medium">Approve</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setDecision("rejected")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border shadow-sm ${
                          decision === "rejected"
                            ? "bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <XCircle size={18} />
                        <span className="font-medium">Reject</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-gray-500" />
                      Response to Student
                    </label>
                    <textarea
                      value={professorFeedback}
                      onChange={(e) => setProfessorFeedback(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                      placeholder="Provide feedback on the recheck request..."
                    ></textarea>
                  </div>

                  <div className="pt-3">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitResponse}
                      disabled={!decision || isSubmitting}
                      className="w-full px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span className="font-medium">Submit Response</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-gray-500 flex items-center gap-1.5 hover:text-blue-600 transition-colors px-3 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm"
                onClick={resetSidebarWidth}
              >
                <Layout size={14} />
                Reset layout
              </motion.button>
              
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                {Math.round(sidebarWidth)}px
              </span>
            </div>
          </div>
        </div>
        
        <div 
          className="w-2 bg-gray-200 hover:bg-blue-400 cursor-ew-resize flex items-center justify-center transition-colors relative z-30"
          onMouseDown={startResize}
        >
          <div className="h-20 flex items-center justify-center">
            <MoveHorizontal size={16} className="text-gray-400" />
          </div>
        </div>

        <div className="flex-1 h-[calc(100vh-73px)] relative bg-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Student Answer Sheet
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400 text-xs">
                  Page {pageNumber} of {totalPages}
                </span>
              )}
            </h2>
            
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-1.5 shadow-md"
              >
                <Info size={12} />
                <span>Click on student annotations to respond</span>
              </motion.div>
            </div>
          </div>
          
          <div className="relative flex-1 bg-gray-800 overflow-auto">
            <PageViewer
              presigned_url={pageUrls[pageNumber - 1]}
              zoomLevel={zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            
            <div className="absolute inset-0 bg-transparent">
              <AnnotationViewer
                annotations={annotations}
                currentPage={pageNumber}
                onSelectAnnotation={handleSelectAnnotation}
                selectedAnnotationId={selectedAnnotationId}
                respondedAnnotationIds={respondedAnnotationIds}
              />
            </div>
            
            <AnimatePresence>
              {showResponseForm && selectedAnnotation && (
                <AnnotationResponseForm
                  selectedAnnotation={selectedAnnotation}
                  onClose={() => {
                    setShowResponseForm(false);
                    setSelectedAnnotation(null);
                    setSelectedAnnotationId(null);
                  }}
                  onSubmit={handleAnnotationResponse}
                  maxMarks={maxMarks}
                  existingResponses={professorResponses}
                  questionResponses={questionResponses[selectedAnnotation.questionNumber || selectedAnnotation.metadata?.questionNumber] || []}
                />
              )}
            </AnimatePresence>
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