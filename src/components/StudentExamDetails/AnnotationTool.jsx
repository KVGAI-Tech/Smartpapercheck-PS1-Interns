import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, PenTool, Save, X } from "lucide-react";

const STORAGE_KEY = "exam-viewer-annotations";

const AnnotationTool = ({
  onAnnotationChange,
  currentPage,
  examData,
  zoomLevel,
}) => {
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

  const canvasRef = useRef(null);
  const containerRef = useRef(null); // This will be our main container

  // This effect will sync our annotation container with the PDF/image content
  useEffect(() => {
    const contentElement = document.querySelector(".pdf-content-container");
    if (!contentElement || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && contentElement) {
        const { width, height, top, left } =
          contentElement.getBoundingClientRect();
        const parentRect =
          containerRef.current.parentElement.getBoundingClientRect();

        // Position the annotation container directly over the content
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.height = `${height}px`;
        containerRef.current.style.top = `${top - parentRect.top}px`;
        containerRef.current.style.left = `${left - parentRect.left}px`;
      }
    });

    resizeObserver.observe(contentElement);

    return () => resizeObserver.unobserve(contentElement);
  }, [currentPage, zoomLevel]);

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

    // We calculate the position as a percentage of the canvas, which is now the same size as the image
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp coordinates to be within the 0-100 range to avoid issues
    const clampedX = Math.max(0, Math.min(x, 100));
    const clampedY = Math.max(0, Math.min(y, 100));

    setCurrentAnnotation({
      id: Date.now().toString(),
      startX: clampedX,
      startY: clampedY,
      endX: clampedX,
      endY: clampedY,
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

    const clampedX = Math.max(0, Math.min(x, 100));
    const clampedY = Math.max(0, Math.min(y, 100));

    setCurrentAnnotation((prev) => ({
      ...prev,
      endX: clampedX,
      endY: clampedY,
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

  const getAnnotationStyle = (anno) => {
    return {
      left: `${Math.min(anno.startX, anno.endX)}%`,
      top: `${Math.min(anno.startY, anno.endY)}%`,
      width: `${Math.abs(anno.endX - anno.startX)}%`,
      height: `${Math.abs(anno.endY - anno.startY)}%`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none" // pointer-events-none on container
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: "center",
        transition: "transform 0.3s ease",
      }}
    >
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair z-10 pointer-events-auto" // pointer-events-auto on canvas
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
                  {examData &&
                    examData.questions &&
                    examData.questions.map((q) => (
                      <option key={q.question_number} value={q.question_number}>
                        Question {q.question_number}
                      </option>
                    ))}
                  {(!examData ||
                    !examData.questions ||
                    examData.questions.length === 0) && (
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

export default AnnotationTool;
