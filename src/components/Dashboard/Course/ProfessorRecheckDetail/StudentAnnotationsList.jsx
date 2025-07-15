import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const StudentAnnotationsList = ({
  annotations,
  respondedIds,
  onSelectAnnotation,
  selectedAnnotationId,
  questionResponses,
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
          const isFullyResponded = annotations.every(
            (anno) =>
              respondedIds.includes(anno.id) ||
              respondedIds.includes(anno.annotation_id) ||
              anno.status === "accepted" ||
              anno.status === "rejected"
          );

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
                isFullyResponded ? "border-green-200" : "border-blue-200"
              }`}
            >
              <div
                className={`px-3 py-2 ${
                  isFullyResponded ? "bg-green-50" : "bg-blue-50"
                } border-b border-gray-100`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        isFullyResponded ? "bg-green-500" : "bg-blue-500"
                      }`}
                    >
                      {questionNum}
                    </div>
                    <span className="text-sm font-medium">
                      Question {questionNum}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200">
                      {annotations.length} annotation
                      {annotations.length !== 1 ? "s" : ""}
                    </span>
                    {responseCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isFullyResponded
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {responseCount} response{responseCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-2">
                {annotations.map((anno) => {
                  const annotationId = anno.id || anno.annotation_id;
                  const hasResponse =
                    respondedIds.includes(annotationId) ||
                    anno.status === "accepted" ||
                    anno.status === "rejected";

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
                        <span>
                          Current:{" "}
                          {anno.currentMarks || anno.metadata?.previousMark}
                        </span>
                        <span className="text-green-600 font-medium">
                          Expected:{" "}
                          {anno.expectedMarks || anno.metadata?.newMark}
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

export default StudentAnnotationsList;
