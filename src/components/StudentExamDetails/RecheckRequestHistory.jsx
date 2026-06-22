import { motion } from "framer-motion";
import { AlertTriangle, History } from "lucide-react";

const RecheckRequestHistory = ({ requests, loading, error, onViewRequest }) => {
  const getDisplayStatus = (request) =>
    request?.final_decision || request?.status || "pending";

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
      {requests.map((request, index) => {
        const displayStatus = getDisplayStatus(request);

        return (
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
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium 
                ${
                  displayStatus === "approved" || displayStatus === "completed"
                    ? "bg-green-100 text-green-700"
                    : displayStatus === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
              {request.reason}
            </p>

            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Annotations ({request.annotations?.length || 0})
              </h5>
              <div className="space-y-2 max-h-48 overflow-auto">
                {request.annotations &&
                  request.annotations.map((anno, idx) => (
                    <div
                      key={idx}
                      className="p-2 border border-blue-100 rounded-md bg-blue-50 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          Question {anno.questionNumber}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                          +{anno.expectedMarks - anno.currentMarks} marks
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">{anno.grievance}</p>
                      {anno.professorFeedback &&
                        anno.professorFeedback !== "" && (
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">Feedback</span>
                            </div>
                            <p className="text-gray-600 mb-1">
                              {anno.professorFeedback}
                            </p>
                          </>
                        )}
                      <div className="flex justify-between text-gray-500">
                        <span>Current: {anno.currentMarks}</span>
                        <span>Expected: {anno.expectedMarks}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RecheckRequestHistory;
