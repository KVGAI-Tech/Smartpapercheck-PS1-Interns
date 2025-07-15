import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const ErrorDisplay = ({ message, onRetry, onBack }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Exam
        </h2>
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

export const LoadingDisplay = ({ message = "Loading exam data..." }) => {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};
