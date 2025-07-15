import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageSquare, Link as LinkIcon } from "lucide-react";

const QuestionMarksEditor = ({
  questionMarks,
  maxMarks,
  onQuestionMarkChange,
  totalOriginalMarks,
  totalNewMarks,
  addressedQuestions,
  questionResponses,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (questionNum) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionNum]: !prev[questionNum],
    }));
  };

  const handleMarkChange = (questionNum, field, value) => {
    onQuestionMarkChange(questionNum, field, value);
  };

  const improvementPercentage =
    totalOriginalMarks > 0
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
          <span className="text-sm font-medium text-gray-700">
            Total Assessment
          </span>
          <div className="px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-sm font-medium">
            <span className="text-blue-700">{totalNewMarks}</span>
            <span className="text-gray-400 mx-1.5">/</span>
            <span className="text-gray-500">{maxMarks.total}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200/50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">
              Original Total
            </span>
            <span className="text-xs font-medium">{totalOriginalMarks}</span>
          </div>

          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs font-medium text-gray-600">
              Adjustment
            </span>
            <span
              className={`text-xs font-medium ${
                totalNewMarks > totalOriginalMarks
                  ? "text-green-600"
                  : totalNewMarks < totalOriginalMarks
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {totalNewMarks > totalOriginalMarks ? "+" : ""}
              {(totalNewMarks - totalOriginalMarks).toFixed(1)}
              {totalOriginalMarks > 0 && (
                <span className="ml-1 text-gray-500">
                  ({improvementPercentage > 0 ? "+" : ""}
                  {improvementPercentage.toFixed(1)}%)
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
          .filter((key) => key !== "total")
          .map((questionNum) => {
            const isExpanded = expandedQuestions[questionNum] || false;
            const qMarks = questionMarks[questionNum] || {
              originalMark: 0,
              newMark: 0,
            };
            const qMaxMarks = maxMarks[questionNum];
            const percentChange =
              qMarks.originalMark > 0
                ? ((qMarks.newMark - qMarks.originalMark) /
                    qMarks.originalMark) *
                  100
                : 0;

            const isAddressed =
              addressedQuestions && addressedQuestions[questionNum];

            const responsesForQuestion = questionResponses[questionNum] || [];
            const responseCount = responsesForQuestion.length;

            return (
              <motion.div
                key={questionNum}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: parseInt(questionNum) * 0.05,
                }}
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
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isAddressed
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {questionNum}
                    </div>
                    <span className="font-medium text-gray-800">
                      Question {questionNum}
                    </span>
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
                      <span
                        className={`text-sm font-medium ${
                          qMarks.newMark > qMarks.originalMark
                            ? "text-green-600"
                            : qMarks.newMark < qMarks.originalMark
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
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
                              onChange={(e) =>
                                handleMarkChange(
                                  questionNum,
                                  "originalMark",
                                  parseFloat(e.target.value) || 0
                                )
                              }
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
                              onChange={(e) =>
                                handleMarkChange(
                                  questionNum,
                                  "newMark",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                qMarks.newMark > qMarks.originalMark
                                  ? "bg-green-50 border-green-200"
                                  : qMarks.newMark < qMarks.originalMark
                                  ? "bg-red-50 border-red-200"
                                  : ""
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
                              <MessageSquare
                                size={14}
                                className="text-blue-500"
                              />
                              Professor Responses ({responseCount})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {responsesForQuestion.map((response, index) => (
                                <div
                                  key={index}
                                  className="text-xs bg-gray-50 p-2 rounded-md border border-gray-200"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium text-blue-600">
                                        Response {index + 1}
                                      </span>
                                      <LinkIcon
                                        size={10}
                                        className="text-gray-400"
                                      />
                                      <span className="text-gray-500">
                                        Annotation{" "}
                                        {typeof response.annotationId ===
                                          "string" &&
                                        response.annotationId.includes("-")
                                          ? response.annotationId.split("-")[1]
                                          : response.annotationId}
                                      </span>
                                    </div>
                                    <span className="text-green-600 font-medium">
                                      Mark: {response.newMark}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 line-clamp-2">
                                    {response.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                              Adjustment
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                qMarks.newMark > qMarks.originalMark
                                  ? "text-green-600"
                                  : qMarks.newMark < qMarks.originalMark
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {qMarks.newMark > qMarks.originalMark ? "+" : ""}
                              {(qMarks.newMark - qMarks.originalMark).toFixed(
                                1
                              )}

                              {qMarks.originalMark > 0 &&
                                qMarks.newMark !== qMarks.originalMark && (
                                  <span className="ml-1 text-gray-500">
                                    ({percentChange > 0 ? "+" : ""}
                                    {percentChange.toFixed(1)}%)
                                  </span>
                                )}
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                qMarks.newMark > qMarks.originalMark
                                  ? "bg-green-500"
                                  : qMarks.newMark < qMarks.originalMark
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              }`}
                              style={{
                                width: `${(qMarks.newMark / qMaxMarks) * 100}%`,
                              }}
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

export default QuestionMarksEditor;
