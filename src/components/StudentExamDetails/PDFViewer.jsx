import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Shield } from "lucide-react";
import SecurityManager from "./SecurityManager";

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

const PDFViewer = ({
  file,
  pageNumber,
  totalPages,
  onPageChange,
  zoomLevel,
  onTotalPagesChange,
  pdfFallbackImage,
  selectedAnnotations,
  studentInfo,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const contentRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    if (pdfContainerRef.current && studentInfo) {
      const cleanup = SecurityManager.applySecurityFeatures(
        pdfContainerRef.current,
        studentInfo
      );
      return cleanup;
    }
  }, [studentInfo, pdfContainerRef.current, pageNumber]);

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

    return selectedAnnotations
      .filter((anno) => anno.pageNumber === pageNumber)
      .map((anno, index) => {
        const coordinates = anno.coordinates || {
          startX: anno.startX,
          startY: anno.startY,
          endX: anno.endX,
          endY: anno.endY,
        };

        return (
          <div
            key={`selected-anno-${index}`}
            className="absolute border-2 border-yellow-500 bg-yellow-100/40 z-30 pointer-events-none"
            style={{
              left: `${coordinates.startX}%`,
              top: `${coordinates.startY}%`,
              width: `${Math.abs(coordinates.endX - coordinates.startX)}%`,
              height: `${Math.abs(coordinates.endY - coordinates.startY)}%`,
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
        );
      });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full h-full">
      <div className="relative w-full h-full" ref={pdfContainerRef}>
        <div
          ref={contentRef}
          className="w-full h-full flex flex-col items-center justify-center pdf-content-container"
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
                    PDF viewer is using fallback mode due to security
                    restrictions.
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

        <div className="absolute top-4 left-4 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 z-20 select-none">
          <Shield size={12} />
          <span>Secured Document</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
