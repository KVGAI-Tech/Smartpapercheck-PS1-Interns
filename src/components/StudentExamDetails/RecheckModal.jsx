import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, History, X } from "lucide-react";
import examsApi from "./examsApi";

const RecheckModal = ({
  isOpen,
  onClose,
  onSubmit,
  annotations,
  examData,
  enrollmentId,
}) => {
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
      examsApi
        .submitRecheckRequest(examData.id, enrollmentId, requestData)
        .then((response) => {
          if (
            response.data &&
            (response.data.code === 200 || response.data.code === 201)
          ) {
            onSubmit({
              requestPayload: requestData,
              apiResponse: response.data,
            });
            onClose();
          } else {
            setError(
              response.data?.message || "Failed to submit recheck request"
            );
          }
        })
        .catch((err) => {
          setError(
            err.response?.data?.message ||
              err.message ||
              "An error occurred while submitting the request"
          );
        })
        .finally(() => {
          setSubmitting(false);
        });
    } catch (error) {
      setError(
        "Failed to submit request: " + (error.message || "Unknown error")
      );
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
            <AlertTriangle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={18}
            />
            <div className="text-sm text-yellow-700">
              <strong className="font-bold">Important:</strong> You can submit a
              recheck request only once per exam. Please ensure all your
              annotations are accurate before submitting.
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

export default RecheckModal;
