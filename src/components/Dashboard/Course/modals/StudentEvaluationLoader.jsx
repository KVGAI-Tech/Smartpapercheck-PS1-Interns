import { AnimatePresence, motion } from "framer-motion";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Hash,
  Mail,
  MessageSquare,
  PieChart,
  Pencil,
  Share,
  User,
  ZoomIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../../../BaseURL";
import fetchStudentEvaluation from "../../../../lib/apis/fetchStudentEvaluation";
import { getSafeImageUrl } from "../../../../lib/utils";
import ExamEvaluationDetail from "./ExamEvaluationDetail";
import ImageZoomModal from "./ImageZoomModal";
import { PageViewer } from "./PageViewer/PageViewer";
import Breadcrumbs from "../../../ui/breadcrumbs";

const ScoreDisplay = ({ marks, maxMarks }) => {
  const percentage = Math.round((marks / maxMarks) * 100) || 0;

  const getColor = () => {
    if (percentage >= 60) return "bg-accent text-white";
    if (percentage >= 40) return "bg-amber-500 text-white";
    return "bg-red-600 text-white";
  };

  return (
    <div
      className={`flex items-center gap-1 px-3 py-2 ${getColor()} rounded-lg shadow-sm`}
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
  courseId,
  model,
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
  const [questionPageMap, setQuestionPageMap] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [activeTab, setActiveTab] = useState("question");
  const answerSheetRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [feedbackEdits, setFeedbackEdits] = useState({});
  const [showToast, setShowToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPDFControls, setShowPDFControls] = useState(false);
  const [useExamDetail, setUseExamDetail] = useState(false);
  const [localEvaluationOverrides, setLocalEvaluationOverrides] = useState({});
  const [editingMarksIndex, setEditingMarksIndex] = useState(null);

  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [zoomImageTitle, setZoomImageTitle] = useState("");

  const [mobilePane, setMobilePane] = useState("sheet");

  const location = useLocation();
  const navigationState = location.state || {};
  const courseName = navigationState.courseName || "Course";
  const examName = navigationState.examName || navigationState.examTitle || "Exam Evaluations";

  const getTotalMarks = () => {
    if (!studentData || !studentData.evaluations) return 0;

    return Object.values(studentData.evaluations).reduce(
      (sum, evaluation) => sum + (evaluation.total_marks || 0),
      0
    );
  };

  const getMaxMarks = () => {
    return questions.reduce(
      (sum, question) => sum + (Math.abs(question.max_marks) || 0),
      0
    );
  };

  const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    console.log("🚀 StudentEvaluationLoader useEffect - examId:", examId, "enrollmentId:", enrollmentId);

    if (examId && enrollmentId) {
      console.log("✅ Parameters valid, fetching student evaluation...");
      fetchStudentEvaluation(
        examId,
        enrollmentId,
        model,
        setAnswerScriptPages,
        setFeedbackEdits,
        setError,
        onError,
        setLoading,
        setQuestions,
        setStudentData
      );
    } else {
      console.error("❌ Missing required parameters - examId:", examId, "enrollmentId:", enrollmentId);
      const errorMessage = "Missing required exam ID or enrollment ID";
      setError(errorMessage);
      setLoading(false);
      onError(errorMessage);
    }
  }, [examId, enrollmentId, model, onError]);

  useEffect(() => {
    if (!answerScriptPages.length) {
      setQuestionPageMap({});
      return;
    }

    const map = {};
    answerScriptPages.forEach((page, index) => {
      const qNum = page.questionNumber;
      if (!qNum && qNum !== 0) return;
      if (!map[qNum]) map[qNum] = [];
      map[qNum].push(index);
    });

    setQuestionPageMap(map);
  }, [answerScriptPages]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  const syncPageWithQuestion = (newQuestionIndex) => {
    if (!answerScriptPages.length || !questions.length) return;

    if (answerSheetRef.current) {
      answerSheetRef.current.scrollTop = 0;
    }

    const safeQuestionIndex = Math.min(
      Math.max(newQuestionIndex, 0),
      questions.length - 1
    );

    const question = questions[safeQuestionIndex];
    const qNum = question?.question_number;

    if (qNum != null && questionPageMap[qNum]?.length) {
      // Use the first page for this question; users can still move to later pages
      setCurrentPageIndex(questionPageMap[qNum][0]);
    } else {
      // Fallback: if mapping is missing, keep current index or reset to first page
      setCurrentPageIndex((prev) =>
        prev < answerScriptPages.length ? prev : 0
      );
    }

    setZoomLevel(1);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => {
        const nextIndex = prev - 1;
        syncPageWithQuestion(nextIndex);
        return nextIndex;
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => {
        const nextIndex = prev + 1;
        syncPageWithQuestion(nextIndex);
        return nextIndex;
      });
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
    console.log("🔍 getCurrentQuestion - questions:", questions.length, "currentQuestionIndex:", currentQuestionIndex);
    if (!questions.length) {
      console.log("❌ No questions available");
      return null;
    }
    const question = questions[currentQuestionIndex];
    console.log("📝 Current question:", question?.question_number);
    return question;
  };

  const getCurrentEvaluation = () => {
    if (!studentData?.evaluations) {
      console.log("❌ No student evaluations available");
      return null;
    }
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      console.log("❌ No current question for evaluation");
      return null;
    }

    const evaluationKey = `question_${currentQuestion.question_number}`;
    const evaluation = studentData.evaluations[evaluationKey];
    console.log("📊 Current evaluation for", evaluationKey, ":", !!evaluation);

    return evaluation || null;
  };

  const getEffectiveEvaluation = () => {
    const base = getCurrentEvaluation();
    const currentQ = getCurrentQuestion();
    if (!base || !currentQ) return null;
    const key = `question_${currentQ.question_number}`;
    const override = localEvaluationOverrides[key];
    if (!override) return base;
    return {
      ...base,
      ...override,
      item_grades: override.item_grades || base.item_grades,
    };
  };

  const handleSaveManualMarks = async () => {
    const effective = getEffectiveEvaluation();
    const currentQ = getCurrentQuestion();
    if (!effective || !currentQ || !examId || !enrollmentId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setShowToast({
        visible: true,
        message: "Authentication required to save marks",
        type: "error",
      });
      setTimeout(() => {
        setShowToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return;
    }

    const key = `question_${currentQ.question_number}`;

    const payload = {
      evaluations: {
        [key]: {
          item_grades: (effective.item_grades || []).map((it) => ({
            item_number: it.item_number,
            marks_awarded: it.marks_awarded,
            feedback: it.feedback,
          })),
          total_marks: effective.total_marks || 0,
          overall_feedback:
            feedbackEdits[key]?.overall || effective.overall_feedback || "",
        },
      },
      recompute_overall: true,
    };

    try {
      setIsSavingMarks(true);
      const baseUrl = API_BASE_URL || "";
      const response = await fetch(
        `${baseUrl}/exams/${examId}/enrollments/${enrollmentId}/manual-evaluation`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save manual marks");
      }

      const result = await response.json();
      const updated = result?.data;

      if (updated?.evaluations) {
        setStudentData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            evaluations: {
              ...(prev.evaluations || {}),
              ...updated.evaluations,
            },
          };
        });

        setLocalEvaluationOverrides((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        setShowToast({
          visible: true,
          message: "Manual marks saved successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error saving manual marks", error);
      setShowToast({
        visible: true,
        message: "Failed to save manual marks",
        type: "error",
      });
    } finally {
      setIsSavingMarks(false);
      setTimeout(() => {
        setShowToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    }
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

  // Debug logging for render state
  console.log("🎯 StudentEvaluationLoader render state:", {
    loading,
    error: !!error,
    questionsLength: questions.length,
    studentData: !!studentData,
    answerScriptPagesLength: answerScriptPages.length,
    currentQuestionIndex,
    currentQuestion: !!getCurrentQuestion(),
    currentEvaluation: !!getCurrentEvaluation(),
    feedbackEditsKeys: Object.keys(feedbackEdits)
  });

  if (loading) {
    console.log("⏳ StudentEvaluationLoader - Loading state");
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-accent/10 border-t-accent/70 rounded-full animate-spin animation-delay-150"></div>
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
    console.log("❌ StudentEvaluationLoader - Error state:", error);
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
            className="px-6 py-3 bg-accent text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const questionNumber = currentQuestion?.question_number || 1;
  const currentPage = answerScriptPages[currentPageIndex] || null;
  const currentEvaluation = getEffectiveEvaluation();

  const totalMarks = getTotalMarks();
  const maxTotalMarks = getMaxMarks();

  const questionHasImage = !!currentQuestion?.question_file_url;
  const questionHasText = !!(
    currentQuestion?.question_text || currentQuestion?.question_body
  );
  const answerHasImage = !!currentQuestion?.answer_file_url;
  const answerHasText = !!(
    currentQuestion?.answer_text || currentQuestion?.answer_body
  );

  const getTypeLabel = (hasImage, hasText) => {
    if (hasImage && hasText) return "Image + Text";
    if (hasText) return "Text";
    if (hasImage) return "Image";
    return "Not available";
  };

  console.log("🎨 Rendering main StudentEvaluationLoader UI");

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 z-50 flex flex-col overflow-hidden ${
        isFullscreen ? "fullscreen-mode" : ""
      }`}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur px-4 md:px-6 py-4 shadow-sm space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
              aria-label="Back to evaluations"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </motion.button>

            <div className="min-w-0 space-y-1">
              <Breadcrumbs
                items={[
                  { label: "Courses", to: "/courses" },
                  {
                    label: courseName,
                    to: courseId ? `/courses/${courseId}` : "/courses",
                  },
                  { label: examName || "Exam Evaluations" },
                  { label: "Student Result" },
                ]}
              />

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                  Results
                </h1>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-900/5 text-slate-700 border border-slate-200">
                  {studentData?.evaluation_status || "Pending"}
                </span>
              </div>

              {studentData?.student && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-800 truncate">
                      {studentData.student.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{studentData.student.roll_number}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{studentData.student.email}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-3"
            >
              <div className="hidden sm:block text-xs text-gray-500">Total</div>
              <ScoreDisplay marks={totalMarks} maxMarks={maxTotalMarks} />
            </motion.div>

            {/* <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {}}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {}}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Share"
              >
                <Share className="w-5 h-5" />
              </motion.button>
            </motion.div> */}
          </div>
        </div>
      </motion.div>

      {!isFullscreen && (
        <div className="px-4 md:px-6 pt-4 sm:hidden">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobilePane("sheet")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                mobilePane === "sheet"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Answer Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => setMobilePane("details")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                mobilePane === "details"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              <BarChart className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full md:w-1/2 h-full flex flex-col overflow-hidden border-r border-slate-200 ${
            isFullscreen ? "md:w-full" : ""
          } ${!isFullscreen ? (mobilePane === "details" ? "hidden md:flex" : "") : ""}`}
          onMouseEnter={() => setShowPDFControls(true)}
          onMouseLeave={() => setShowPDFControls(false)}
        >
          <div className="bg-slate-100 text-slate-600 p-3 flex items-center justify-between border-b border-slate-200">
            <h2 className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Student Answer Sheet
              {answerScriptPages.length > 1 && (
                <span className="ml-2 text-slate-400 text-xs">
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
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPageIndex >= answerScriptPages.length - 1}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
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
            className="flex-1 overflow-auto bg-slate-100"
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
                <div className="text-center p-8 text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
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
          className={`w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-white/80 backdrop-blur ${
            isFullscreen ? "hidden md:hidden" : ""
          } ${mobilePane === "sheet" ? "hidden md:flex" : ""}`}
        >
          {/* Question content always visible at the top */}
          <div className="hidden">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-gray-900">
                Question {questionNumber}
              </h3>
              <div className="text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
          </div>

          {/* Question navigation (prev/next + counter) below header, above tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous question"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
                text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next question"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Tabs below the question switcher */}
          <div className="px-4 pt-3">
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
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
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center justify-between">
                          <span>Question</span>
                          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                            {getTypeLabel(questionHasImage, questionHasText)}
                          </span>
                        </h4>
                      </div>
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden p-2">
                        {questionHasImage ? (
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
                                e.target.onerror = null;
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded">
                              <div className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <ZoomIn className="w-3.5 h-3.5 mr-1" />
                                Zoom
                              </div>
                            </div>
                          </motion.div>
                        ) : questionHasText ? (
                          <div className="w-full h-full overflow-auto p-3 text-left">
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {currentQuestion.question_text || currentQuestion.question_body}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-sm">No question available</span>
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
                        <h4 className="text-sm font-medium text-gray-900 flex items-center justify-between">
                          <span>Answer Key</span>
                          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                            {getTypeLabel(answerHasImage, answerHasText)}
                          </span>
                        </h4>
                      </div>
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden p-2">
                        {answerHasImage ? (
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
                                e.target.onerror = null;
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded">
                              <div className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <ZoomIn className="w-3.5 h-3.5 mr-1" />
                                Zoom
                              </div>
                            </div>
                          </motion.div>
                        ) : answerHasText ? (
                          <div className="w-full h-full overflow-auto p-3 text-left">
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {currentQuestion.answer_text || currentQuestion.answer_body}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-sm">No answer available</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {getEffectiveEvaluation() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3 bg-accent/5 p-5 rounded-lg border border-accent/10"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-800">
                          Scoring Summary
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-accent">
                            {getEffectiveEvaluation().total_marks} /{" "}
                            {Math.abs(currentQuestion?.max_marks) || 10}
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                            {formatPercentage(
                              getEffectiveEvaluation().total_marks,
                              Math.abs(currentQuestion?.max_marks) || 10
                            )}
                          </div>
                        </div>
                      </div>

                      {getEffectiveEvaluation().overall_feedback && (
                        <div>
                          <h5 className="text-xs uppercase text-accent font-medium mb-1">
                            Overall Feedback
                          </h5>
                          <div className="text-sm text-gray-700 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            {getEffectiveEvaluation().overall_feedback}
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
                  {getEffectiveEvaluation() ? (
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
                          marks={getEffectiveEvaluation().total_marks}
                          maxMarks={Math.abs(currentQuestion?.max_marks) || 0}
                        />
                        <button
                          type="button"
                          onClick={handleSaveManualMarks}
                          disabled={isSavingMarks || !getEffectiveEvaluation()}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-accent text-accent hover:bg-accent/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingMarks ? "Saving..." : "Save marks"}
                        </button>
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
                              getEffectiveEvaluation().overall_feedback ||
                              "No feedback available"}
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
                              <CheckCircle className="w-4 h-4 text-accent" />
                              Assessment Criteria
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {getEffectiveEvaluation().item_grades?.length || 0}{" "}
                              criteria
                            </span>
                          </div>

                          {getEffectiveEvaluation().item_grades?.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * (index + 3) }}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1 mr-2">
                                  <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow-sm flex-shrink-0">
                                    {item.item_number}
                                  </div>
                                  <h5 className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {currentQuestion?.rubric_items?.[index]
                                      ?.description || "No description available"}
                                  </h5>
                                </div>
                                <div className="flex items-center gap-1 text-sm px-3 py-1.5 bg-accent/5 rounded-lg shadow-sm whitespace-nowrap">
                                  {editingMarksIndex === index ? (
                                    <input
                                      type="number"
                                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-white"
                                      value={item.marks_awarded ?? ""}
                                      min={0}
                                      step={0.5}
                                      max={
                                        currentQuestion?.rubric_items?.[index]?.max_marks ??
                                        item.max_marks ??
                                        0
                                      }
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        const parsed = parseFloat(raw);
                                        const maxVal =
                                          currentQuestion?.rubric_items?.[index]?.max_marks ??
                                          item.max_marks ??
                                          0;
                                        const safe = isNaN(parsed)
                                          ? 0
                                          : Math.min(Math.max(parsed, 0), maxVal);
                                        const key = `question_${questionNumber}`;
                                        setLocalEvaluationOverrides((prev) => {
                                          const existing = prev[key] || {};
                                          const existingItems =
                                            existing.item_grades ||
                                            getEffectiveEvaluation().item_grades ||
                                            [];
                                          const updatedItems = existingItems.map((it, i) =>
                                            i === index
                                              ? { ...it, marks_awarded: safe }
                                              : it
                                          );

                                          const newTotal = updatedItems.reduce(
                                            (sum, it) =>
                                              sum + (parseFloat(it.marks_awarded) || 0),
                                            0
                                          );

                                          return {
                                            ...prev,
                                            [key]: {
                                              ...existing,
                                              item_grades: updatedItems,
                                              total_marks: newTotal,
                                            },
                                          };
                                        });
                                      }}
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      className="flex items-center gap-1 text-sm text-gray-700 hover:text-accent"
                                      onClick={() => setEditingMarksIndex(index)}
                                    >
                                      <span>{item.marks_awarded ?? 0}</span>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <span className="text-gray-400">/</span>
                                  <span className="text-gray-600">
                                    {currentQuestion?.rubric_items?.[index]?.max_marks ?? item.max_marks ?? 0}
                                  </span>
                                </div>
                              </div>

                              <div className="relative">
                                {currentQuestion?.rubric_items?.[index]?.grading_guidelines && (
                                  <details className="mb-2 bg-gray-50 border border-gray-200 rounded-md">
                                    <summary className="cursor-pointer px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center justify-between">
                                      <span>Marking guidelines</span>
                                      <span className="text-gray-400 text-[10px]">Click to view</span>
                                    </summary>
                                    <div className="px-3 pb-2 pt-1 text-xs text-gray-600 whitespace-pre-line">
                                      {currentQuestion.rubric_items[index].grading_guidelines}
                                    </div>
                                  </details>
                                )}
                                <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg">
                                  {feedbackEdits[`question_${questionNumber}`]
                                    ?.items[index]?.editedFeedback ||
                                    item.feedback ||
                                    "No feedback provided"}
                                </div>

                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent rounded-full"
                                    style={{
                                      width: `${
                                        ((item.marks_awarded || 0) /
                                          ((currentQuestion?.rubric_items?.[index]?.max_marks ||
                                            item.max_marks ||
                                            1))) * 100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 max-w-md mx-auto px-4">
                      Evaluation will be available after submission is complete.
                    </p>
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
                    <BarChart className="w-5 h-5 text-accent" />
                    <span>Performance Statistics</span>
                    {currentEvaluation && (
                      <ScoreDisplay
                        marks={currentEvaluation.total_marks}
                        maxMarks={Math.abs(currentQuestion?.max_marks) || 0}
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
                            max: Math.abs(currentQuestion?.max_marks) || 10,
                            color: "bg-accent",
                            icon: <Award className="w-5 h-5 text-white" />,
                          },
                          {
                            label: "Percentage",
                            value: `${Math.round(
                              (currentEvaluation.total_marks /
                                (Math.abs(currentQuestion?.max_marks) || 10)) *
                                100
                            )}%`,
                            color: "bg-accent",
                            icon: (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ),
                          },
                          {
                            label: "Criteria",
                            value: currentEvaluation.item_grades?.length || 0,
                            color: "bg-accent",
                            icon: <Filter className="w-5 h-5 text-white" />,
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
                                className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center shadow-md`}
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
                          <PieChart className="w-4 h-4 text-accent" />
                          Criteria Breakdown
                        </h4>

                        <div className="space-y-4">
                          {currentEvaluation.item_grades?.map((item, index) => {
                            const rubricMax =
                              currentQuestion?.rubric_items?.[index]?.max_marks || 0;
                            const safeMax = rubricMax > 0 ? rubricMax : 1;
                            const percentage = Math.max(
                              0,
                              Math.min(
                                100,
                                (Number(item.marks_awarded || 0) / safeMax) * 100
                              )
                            );

                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-gray-700 flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium">
                                      {index + 1}
                                    </div>
                                    <span className="line-clamp-1">
                                      {currentQuestion?.rubric_items?.[index]?.description ||
                                        `Criterion ${item.item_number}`}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium">
                                    <span className="text-accent">
                                      {item.marks_awarded}
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-gray-600">
                                      {rubricMax || 1}
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                      duration: 0.8,
                                      delay: 0.1 * index,
                                    }}
                                    className="h-full bg-accent rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <BarChart className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No Statistics Available
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto px-4">
                        Statistics will be available after evaluation is complete.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              </AnimatePresence>
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
                        ? "bg-accent text-white"
                        : "bg-red-600 text-white"
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
            </motion.div>
      </div>
    </div>
  );
};

export default StudentEvaluationLoader;