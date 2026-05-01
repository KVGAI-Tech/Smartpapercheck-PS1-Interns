import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const QuestionOverview = ({ questions, detailedFeedback }) => {
  const [expandedQuestion, setExpandedQuestion] = React.useState(null);

  const toggleQuestion = (questionNumber) => {
    setExpandedQuestion(expandedQuestion === questionNumber ? null : questionNumber);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No questions available for this exam.
      </div>
    );
  }

  const getItemMaxMarks = (item, question) =>
    item?.total_marks ??
    item?.max_marks ??
    question?.max_marks ??
    0;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Overview</h2>
      {questions.map((question) => (
        <motion.div
          key={question.question_number}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <button
            className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
            onClick={() => toggleQuestion(question.question_number)}
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Question {question.question_number}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Marks Obtained: {question.marks_obtained} / {question.max_marks}
              </p>
            </div>
            {expandedQuestion === question.question_number ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <AnimatePresence>
            {expandedQuestion === question.question_number && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="px-4 pb-4"
              >
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  {/* Question Content */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Question:</h4>
                    {question.image_url && (
                      <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm max-w-md mx-auto">
                        <img 
                          src={question.image_url} 
                          alt={`Question ${question.question_number}`}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                    {question.question_body ? (
                      <div 
                        className="prose prose-sm max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: question.question_body }}
                      />
                    ) : (
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">
                        {question.question_text}
                      </p>
                    )}
                  </div>

                  {question.feedback && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-800">Overall Feedback:</h4>
                      <p className="text-gray-700 text-sm mt-1">{question.feedback}</p>
                    </div>
                  )}

                  {detailedFeedback[question.question_number] && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-800">Detailed Feedback:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
                        {detailedFeedback[question.question_number].items.map((item, index) => (
                          <li key={index}>
                            {item.feedback} (Marks: {item.marks_obtained ?? item.marks_awarded ?? 0}/{getItemMaxMarks(item, question)})
                          </li>
                        ))}
                      </ul>
                      {detailedFeedback[question.question_number].improvement && (
                        <div className="mt-3">
                          <h4 className="text-md font-medium text-gray-800">Improvement Suggestions:</h4>
                          <p className="text-gray-700 text-sm mt-1">{detailedFeedback[question.question_number].improvement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!question.feedback && !detailedFeedback[question.question_number] && (
                    <p className="text-gray-500 text-sm">No detailed feedback available for this question.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default QuestionOverview;
