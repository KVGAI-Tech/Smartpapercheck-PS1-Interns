import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const PageViewer = ({
  presigned_url,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomLevel,
  pageNumber,
  totalPages,
  onPageChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && pageNumber < totalPages) {
        onPageChange(pageNumber + 1);
      } else if (e.key === "ArrowLeft" && pageNumber > 1) {
        onPageChange(pageNumber - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNumber, totalPages, onPageChange]);

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
    <div
      className="relative flex items-center justify-center h-full w-full"
      ref={containerRef}
    >
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
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
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
            aria-label="Previous page"
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
            aria-label="Next page"
          >
            <ChevronRight size={22} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default PageViewer;
