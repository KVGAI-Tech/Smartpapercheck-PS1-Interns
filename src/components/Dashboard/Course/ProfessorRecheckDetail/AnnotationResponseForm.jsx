import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, Save, X } from "lucide-react";

const AnnotationResponseForm = ({
  selectedAnnotation,
  onClose,
  onSubmit,
  maxMarks,
  existingResponses = [],
  questionResponses = [],
}) => {
  const [responseData, setResponseData] = useState({
    comment: "",
    newMark:
      selectedAnnotation?.expectedMarks ||
      selectedAnnotation?.metadata?.newMark ||
      0,
  });

  const questionNumber =
    selectedAnnotation?.questionNumber ||
    selectedAnnotation?.metadata?.questionNumber;
  const hasExistingResponses = questionResponses.length > 0;

  useEffect(() => {
    if (hasExistingResponses && questionResponses.length > 0) {
      const latestResponse = questionResponses[questionResponses.length - 1];
      setResponseData((prev) => ({
        ...prev,
        newMark: latestResponse.newMark,
      }));
    } else {
      setResponseData((prev) => ({
        ...prev,
        newMark:
          selectedAnnotation?.expectedMarks ||
          selectedAnnotation?.metadata?.newMark ||
          selectedAnnotation?.currentMarks ||
          0,
      }));
    }
  }, [selectedAnnotation, hasExistingResponses, questionResponses]);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const qMaxMarks = maxMarks[questionNumber] || maxMarks.total;
    if (responseData.newMark > qMaxMarks) {
      alert(
        `New mark for Question ${questionNumber} cannot exceed the maximum marks (${qMaxMarks})`
      );
      return;
    }

    onSubmit({
      questionNumber: questionNumber,
      comment: responseData.comment,
      newMark: parseFloat(responseData.newMark),
      annotationId: selectedAnnotation.id || selectedAnnotation.annotation_id,
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
            This question has been addressed in {questionResponses.length}{" "}
            previous annotation{questionResponses.length > 1 ? "s" : ""}. The
            latest mark assigned was{" "}
            <span className="font-medium">
              {questionResponses[questionResponses.length - 1].newMark}
            </span>
            .
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
                      <span className="ml-1 italic">
                        {resp.comment.length > 40
                          ? resp.comment.substring(0, 40) + "..."
                          : resp.comment}
                      </span>
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
        <p className="text-sm text-gray-700">
          {selectedAnnotation.grievance || selectedAnnotation.metadata?.comment}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Professor Remarks
          </label>
          <textarea
            value={responseData.comment}
            onChange={(e) =>
              setResponseData({ ...responseData, comment: e.target.value })
            }
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
              value={
                selectedAnnotation.currentMarks ||
                selectedAnnotation.metadata?.previousMark
              }
              className="w-full p-3 border rounded-lg border-gray-300 bg-gray-100 text-gray-700"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Original mark (non-editable)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Mark
            </label>
            <input
              type="number"
              value={responseData.newMark}
              onChange={(e) =>
                setResponseData({
                  ...responseData,
                  newMark: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full p-3 border rounded-lg focus:ring-2 transition-all border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                hasExistingResponses ? "bg-amber-50/50" : "bg-blue-50/50"
              }`}
              min="0"
              max={maxMarks[questionNumber]}
              step="0.5"
              required
            />
            {hasExistingResponses && (
              <p className="text-xs text-amber-600 mt-1">
                This will update the mark for all annotations of question{" "}
                {questionNumber}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-50">
          <div className="text-xs text-gray-600">
            Page {selectedAnnotation.pageNumber}
          </div>
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

export default AnnotationResponseForm;
