import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Download,
  Share,
  FileText,
  MessageSquare,
  BarChart,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Hash,
  Award,
  ThumbsUp,
  ThumbsDown,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Clipboard,
  Calculator,
  PieChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../../../BaseURL";
import ExamEvaluationDetail from "./ExamEvaluationDetail";
import ImageZoomModal from "./ImageZoomModal";

const getSafeImageUrl = (url) => {
  if (!url) return null;

  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/api/placeholder")
  ) {
    return url;
  }

  if (url.toLowerCase().endsWith(".pdf")) {
    return "/api/placeholder/800/1200";
  }

  if (url.includes("?")) {
    return url;
  } else {
    return url;
  }
};

const PageViewer = ({ url, onZoomIn, onZoomOut, onZoomReset, zoomLevel }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    console.error("Failed to load image:", url);
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Unable to load image</h3>
        <p className="text-gray-300 mb-6 max-w-md">
          The image could not be loaded due to access restrictions or CORS
          policy.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open in new window</span>
        </a>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading image...</p>
          </div>
        </div>
      )}
      <div
        className="transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <img
          src={getSafeImageUrl(url)}
          alt="Student Answer Sheet"
          className="max-w-full object-contain shadow-2xl rounded-lg"
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>

      <div className="absolute bottom-6 right-6 flex bg-gray-900 bg-opacity-80 p-2 rounded-full shadow-xl">
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom out"
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors mx-1"
          title="Reset zoom"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom in"
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ScoreDisplay = ({ marks, maxMarks }) => {
  const percentage = Math.round((marks / maxMarks) * 100) || 0;

  const getColor = () => {
    if (percentage >= 80) return "from-green-500 to-green-600 text-white";
    if (percentage >= 60) return "from-blue-500 to-blue-600 text-white";
    if (percentage >= 40) return "from-yellow-500 to-yellow-600 text-white";
    return "from-red-500 to-red-600 text-white";
  };

  return (
    <div
      className={`flex items-center gap-1 px-3 py-2 bg-gradient-to-r ${getColor()} rounded-lg shadow-sm`}
    >
      <Award className="w-4 h-4" />
      <span className="font-medium">{marks}</span>
      <span className="opacity-75">/</span>
      <span>{maxMarks}</span>
    </div>
  );
};

const StudentEvaluationLoader = ({
  examId,
  enrollmentId,
  onClose,
  onSaveFeedback = () => {},
  onError = () => {},
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answerScriptPages, setAnswerScriptPages] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [activeTab, setActiveTab] = useState("question");
  const answerSheetRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackEdits, setFeedbackEdits] = useState({});
  const [showToast, setShowToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPDFControls, setShowPDFControls] = useState(false);
  const [useExamDetail, setUseExamDetail] = useState(false);

  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [zoomImageTitle, setZoomImageTitle] = useState("");

  const getTotalMarks = () => {
    if (!studentData || !studentData.evaluations) return 0;

    return Object.values(studentData.evaluations).reduce(
      (sum, evaluation) => sum + (evaluation.total_marks || 0),
      0
    );
  };
  const getMaxMarks = () => {
    return questions.reduce(
      (sum, question) => sum + (question.max_marks || 0),
      0
    );
  };

  const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    const fetchStudentEvaluation = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch evaluation: ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 200) {
          setStudentData(data.data);

          if (data.data.pages && Array.isArray(data.data.pages)) {
            const processedPages = data.data.pages.map((page) => ({
              pageNumber: page.page_number,
              totalPages: page.total_pages,
              imageUrl: page.presigned_url,
            }));
            setAnswerScriptPages(processedPages);
          }

          const initialFeedback = {};
          Object.entries(data.data.evaluations || {}).forEach(
            ([qKey, qEval]) => {
              initialFeedback[qKey] = {
                overall: qEval.overall_feedback || "",
                items:
                  qEval.item_grades?.map((grade) => ({
                    ...grade,
                    editedFeedback: grade.feedback,
                  })) || [],
              };
            }
          );

          setFeedbackEdits(initialFeedback);

          await fetchQuestions();
        } else {
          throw new Error(data.message || "Failed to load student evaluation");
        }
      } catch (error) {
        console.error("Error fetching student evaluation:", error);
        setError(error.message || "Failed to load student evaluation");
        onError(error.message || "Failed to load student evaluation");
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/exams/${examId}/question-answer`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        const data = await response.json();

        if (
          data.code === 200 &&
          data.data &&
          Array.isArray(data.data.questions)
        ) {
          setQuestions(data.data.questions);
        } else {
          throw new Error(data.message || "Failed to load questions");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        onError(error.message || "Failed to load questions");
      }
    };

    if (examId && enrollmentId) {
      fetchStudentEvaluation();
    } else {
      setError("Missing required exam ID or enrollment ID");
      setLoading(false);
      onError("Missing required exam ID or enrollment ID");
    }
  }, [examId, enrollmentId, onError]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < answerScriptPages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const getCurrentQuestion = () => {
    if (!questions.length) return null;
    return questions[currentQuestionIndex];
  };

  const getCurrentEvaluation = () => {
    if (!studentData?.evaluations) return null;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    return (
      studentData.evaluations[`question_${currentQuestion.question_number}`] ||
      null
    );
  };

  const handleOpenQuestionImage = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion?.question_file_url) {
      setZoomImageUrl(getSafeImageUrl(currentQuestion.question_file_url));
      setZoomImageTitle(`Question ${currentQuestion.question_number}`);
      setZoomModalOpen(true);
    }
  };

  const handleOpenAnswerImage = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion?.answer_file_url) {
      setZoomImageUrl(getSafeImageUrl(currentQuestion.answer_file_url));
      setZoomImageTitle(
        `Answer for Question ${currentQuestion.question_number}`
      );
      setZoomModalOpen(true);
    }
  };

  const handleScroll = () => {
    if (answerSheetRef.current) {
      setScrollPosition(answerSheetRef.current.scrollTop);
    }
  };

  const formatPercentage = (value, max) => {
    if (!max) return "0%";
    return `${Math.round((value / max) * 100)}%`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDetailComplete = (data) => {
    onSaveFeedback(data);

    setShowToast({
      visible: true,
      message: "Evaluation completed successfully",
      type: "success",
    });

    setTimeout(() => {
      setShowToast({ visible: false, message: "", type: "success" });
    }, 3000);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-50 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Loading evaluation
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch the student's work...
          </p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-md px-6"
        >
          <div className="inline-block bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Failed to Load Evaluation
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (useExamDetail) {
    return (
      <ExamEvaluationDetail
        examId={examId}
        enrollmentId={enrollmentId}
        studentInfo={
          studentData?.student
            ? {
                student_name: studentData.student.name,
                roll_number: studentData.student.roll_number,
                email: studentData.student.email,
              }
            : null
        }
        questions={questions}
        answerScriptPages={answerScriptPages}
        existingEvaluations={studentData?.evaluations || {}}
        evaluationStatus={studentData?.evaluation_status || "pending"}
        onClose={onClose}
        onComplete={handleDetailComplete}
      />
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentEvaluation = getCurrentEvaluation();
  const questionNumber = currentQuestion?.question_number || 1;
  const currentPage = answerScriptPages[currentPageIndex] || null;

  const totalMarks = getTotalMarks();
  const maxTotalMarks = getMaxMarks();

  return (
    <div
      className={`fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden ${
        isFullscreen ? "fullscreen-mode" : ""
      }`}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
      >
        <div className="flex items-start">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </motion.button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Student Evaluation
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {studentData?.evaluation_status || "Pending"}
              </span>
            </h1>
            {studentData?.student && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1"
              >
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {studentData.student.name}
                  </span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span>{studentData.student.roll_number}</span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{studentData.student.email}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-end"
          >
            <div className="text-xs text-gray-500 mb-1">Total Score</div>
            <ScoreDisplay marks={totalMarks} maxMarks={maxTotalMarks} />
          </motion.div>

          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {}}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download evaluation"
            >
              <Download className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {}}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share evaluation"
            >
              <Share className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full md:w-1/2 h-full flex flex-col overflow-hidden border-r border-gray-200 ${
            isFullscreen ? "md:w-full" : ""
          }`}
          onMouseEnter={() => setShowPDFControls(true)}
          onMouseLeave={() => setShowPDFControls(false)}
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Student Answer Sheet
              {answerScriptPages.length > 1 && (
                <span className="ml-2 text-gray-400 text-xs">
                  Page {currentPageIndex + 1} of {answerScriptPages.length}
                </span>
              )}
            </h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showPDFControls ? 1 : 0 }}
              className="flex items-center gap-2"
            >
              {answerScriptPages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPageIndex === 0}
                    className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPageIndex >= answerScriptPages.length - 1}
                    className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </motion.div>
          </div>

          <div
            ref={answerSheetRef}
            className="flex-1 overflow-auto bg-gradient-to-b from-gray-800 to-gray-900"
            onScroll={handleScroll}
          >
            {currentPage && currentPage.imageUrl ? (
              <PageViewer
                url={currentPage.imageUrl}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                zoomLevel={zoomLevel}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">
                    No answer sheet available
                  </p>
                  <p className="text-sm mt-2 max-w-md">
                    The student may not have submitted their answer yet or there
                    might be an issue loading the document.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-white ${
            isFullscreen ? "hidden md:hidden" : ""
          }`}
        >
          <div className="flex border-b border-gray-200">
            {[
              {
                id: "question",
                label: "Question",
                icon: <FileText className="w-4 h-4" />,
              },
              {
                id: "feedback",
                label: "Feedback",
                icon: <MessageSquare className="w-4 h-4" />,
              },
              {
                id: "stats",
                label: "Statistics",
                icon: <BarChart className="w-4 h-4" />,
              },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{
                  backgroundColor:
                    tab.id === activeTab ? "" : "rgba(0,0,0,0.02)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Previous question"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex >= questions.length - 1}
              className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Next question"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === "question" && (
                <motion.div
                  key="question-tab"
                  variants={pageTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-3">
                      <span>Question {questionNumber}</span>
                      <span className="text-sm text-gray-500 font-normal rounded-full bg-gray-100 px-2 py-0.5">
                        {currentQuestion?.domain || "General"}
                      </span>
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-700">
                        {currentQuestion?.question_text ||
                          "No question text available"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900">
                          Question Image
                        </h4>
                      </div>
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden p-2">
                        {currentQuestion?.question_file_url ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer relative w-full h-full flex items-center justify-center"
                            onClick={handleOpenQuestionImage}
                          >
                            <img
                              src={getSafeImageUrl(
                                currentQuestion.question_file_url
                              )}
                              alt={`Question ${questionNumber}`}
                              className="max-h-full object-contain rounded shadow-sm"
                              onError={(e) => {
                                // e.target.src = "/api/placeholder/400/300";
                                e.target.onerror = null;
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded">
                              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <ZoomIn className="w-3.5 h-3.5 mr-1" />
                                Zoom
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-sm">No image available</span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900">
                          Answer Key
                        </h4>
                      </div>
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden p-2">
                        {currentQuestion?.answer_file_url ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer relative w-full h-full flex items-center justify-center"
                            onClick={handleOpenAnswerImage}
                          >
                            <img
                              src={getSafeImageUrl(
                                currentQuestion.answer_file_url
                              )}
                              alt={`Answer for Question ${questionNumber}`}
                              className="max-h-full object-contain rounded shadow-sm"
                              onError={(e) => {
                                // e.target.src = "/api/placeholder/400/300";
                                e.target.onerror = null;
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded">
                              <div className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <ZoomIn className="w-3.5 h-3.5 mr-1" />
                                Zoom
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-sm">No image available</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {currentEvaluation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-800">
                          Scoring Summary
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-blue-600">
                            {currentEvaluation.total_marks} /{" "}
                            {currentQuestion?.max_marks || 10}
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {formatPercentage(
                              currentEvaluation.total_marks,
                              currentQuestion?.max_marks || 10
                            )}
                          </div>
                        </div>
                      </div>

                      {currentEvaluation.overall_feedback && (
                        <div>
                          <h5 className="text-xs uppercase text-blue-600 font-medium mb-1">
                            Overall Feedback
                          </h5>
                          <div className="text-sm text-gray-700 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                            {currentEvaluation.overall_feedback}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === "feedback" && (
                <motion.div
                  key="feedback-tab"
                  variants={pageTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {currentEvaluation ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                      >
                        <h3 className="text-lg font-medium text-gray-900">
                          Feedback & Assessment
                        </h3>
                        <ScoreDisplay
                          marks={currentEvaluation.total_marks}
                          maxMarks={currentQuestion?.max_marks || 0}
                        />
                      </motion.div>

                      <div className="space-y-5">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-2"
                        >
                          <label className="block text-sm font-medium text-gray-700">
                            Overall Feedback
                          </label>
                          <div className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-white">
                            {feedbackEdits[`question_${questionNumber}`]
                              ?.overall ||
                              currentEvaluation.overall_feedback ||
                              ""}
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                              Assessment Criteria
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {currentEvaluation.item_grades?.length || 0}{" "}
                              criteria
                            </span>
                          </div>

                          {currentEvaluation.item_grades?.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * (index + 3) }}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1 mr-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                                    {item.item_number}
                                  </div>
                                  <h5 className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {item.rubric_description ||
                                      `Criterion ${item.item_number}`}
                                  </h5>
                                </div>
                                <div className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-50 rounded-lg shadow-sm whitespace-nowrap">
                                  <span className="font-medium text-blue-600">
                                    {item.marks_awarded}
                                  </span>
                                  <span className="text-gray-400">Marks</span>
                                </div>
                              </div>

                              <div className="relative">
                                <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg">
                                  {feedbackEdits[`question_${questionNumber}`]
                                    ?.items[index]?.editedFeedback ||
                                    item.feedback ||
                                    ""}
                                </div>

                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                    style={{
                                      width: `${
                                        (item.marks_awarded / item.max_marks) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {(!currentEvaluation.item_grades ||
                            currentEvaluation.item_grades.length === 0) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-center py-8 bg-gray-50 rounded-lg"
                            >
                              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <AlertCircle className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-500">
                                No assessment criteria available
                              </p>
                            </motion.div>
                          )}
                        </motion.div>

                        {currentEvaluation.improvement_suggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                          >
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4 text-yellow-500" />
                              Improvement Suggestions
                            </h4>
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                              {currentEvaluation.improvement_suggestions}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <MessageSquare className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No Feedback Available
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto px-4">
                        There is no feedback available for this question yet.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        Add Feedback
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === "stats" && (
                <motion.div
                  key="stats-tab"
                  variants={pageTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-medium text-gray-900 flex items-center gap-2"
                  >
                    <BarChart className="w-5 h-5 text-blue-500" />
                    <span>Performance Statistics</span>
                    {currentEvaluation && (
                      <ScoreDisplay
                        marks={currentEvaluation.total_marks}
                        maxMarks={currentQuestion?.max_marks || 0}
                      />
                    )}
                  </motion.h3>

                  {currentEvaluation ? (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        {[
                          {
                            label: "Score",
                            value: currentEvaluation.total_marks,
                            max: currentQuestion?.max_marks || 10,
                            color: "from-blue-500 to-blue-600",
                            icon: <Award className="w-5 h-5 text-blue-50" />,
                          },
                          {
                            label: "Percentage",
                            value: `${Math.round(
                              (currentEvaluation.total_marks /
                                (currentQuestion?.max_marks || 10)) *
                                100
                            )}%`,
                            color: "from-green-500 to-green-600",
                            icon: (
                              <CheckCircle className="w-5 h-5 text-green-50" />
                            ),
                          },
                          {
                            label: "Criteria",
                            value: currentEvaluation.item_grades?.length || 0,
                            color: "from-purple-500 to-purple-600",
                            icon: <Filter className="w-5 h-5 text-purple-50" />,
                          },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (i + 1) }}
                            className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex justify-center mb-2">
                              <div
                                className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}
                              >
                                {stat.icon}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {stat.label}
                            </div>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 mt-1">
                              {typeof stat.value === "number"
                                ? stat.value
                                : stat.value}
                            </div>
                            {stat.max && (
                              <div className="text-xs text-gray-500 mt-1">
                                out of {stat.max}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-blue-500" />
                          Criteria Breakdown
                        </h4>

                        <div className="space-y-4">
                          {currentEvaluation.item_grades?.map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </div>
                                  <span className="line-clamp-1">
                                    {item.rubric_description ||
                                      `Criterion ${item.item_number}`}
                                  </span>
                                </div>
                                <div className="text-sm font-medium">
                                  <span className="text-blue-600">
                                    {item.marks_awarded}
                                  </span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-gray-600">
                                    {item.max_marks}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${
                                      (item.marks_awarded / item.max_marks) *
                                      100
                                    }%`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: 0.1 * index,
                                  }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <BarChart className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No Statistics Available
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto px-4">
                        Statistics will be available after evaluation is
                        complete.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
              showToast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {showToast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageZoomModal
        isOpen={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        imageUrl={zoomImageUrl}
        title={zoomImageTitle}
      />
    </div>
  );
};

export default StudentEvaluationLoader;
