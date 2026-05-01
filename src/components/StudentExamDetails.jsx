import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../BaseURL";
import Breadcrumbs from "./ui/breadcrumbs";
import AnnotationTool from "./StudentExamDetails/AnnotationTool";
import examsApi from "./StudentExamDetails/examsApi";
import PDFViewer from "./StudentExamDetails/PDFViewer";
import RecheckModal from "./StudentExamDetails/RecheckModal";
import RecheckRequestHistory from "./StudentExamDetails/RecheckRequestHistory";
import ScreenshotProtection from "./StudentExamDetails/ScreenshotProtection";
import SecurityManager from "./StudentExamDetails/SecurityManager";
import {
  ErrorDisplay,
  LoadingDisplay,
} from "./StudentExamDetails/StatusDisplays";
import Toast from "./StudentExamDetails/Toast";
import QuestionOverview from "./StudentExamDetails/QuestionOverview";
import ConductExamSession from "./ConductExamSession";
import SubjectiveConductExamSession from "./SubjectiveConductExamSession";
import { getExamVariant, isSubjectiveConductExam } from "./examTypeUtils";

const StatusBadge = ({ status }) => {
  const isEvaluated = status === "evaluated";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border shadow-sm ${
        isEvaluated
          ? "bg-accent/10 text-accent border-accent/20"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {isEvaluated ? (
        <>
          <CheckCircle className="w-4 h-4 mr-1.5" /> Evaluated
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 mr-1.5" /> Pending
        </>
      )}
    </span>
  );
};

const StudentExamDetails = ({ isHistory = false }) => {
  const { courseId, id: examId } = useParams();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get("enrollment_id");
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState("overview");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfImageUrl, setPdfImageUrl] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [examData, setExamData] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [annotationsByQuestion, setAnnotationsByQuestion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailedFeedback, setDetailedFeedback] = useState({});
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [recheckRequests, setRecheckRequests] = useState([]);
  const [loadingRecheckRequests, setLoadingRecheckRequests] = useState(false);
  const [recheckRequestsError, setRecheckRequestsError] = useState(null);
  const [selectedRecheckRequest, setSelectedRecheckRequest] = useState(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState([]);
  const [hasSubmittedRecheck, setHasSubmittedRecheck] = useState(false);
  const [canRequestRecheck, setCanRequestRecheck] = useState(true);
  const [recheckDeadline, setRecheckDeadline] = useState(null);
  const [examMeta, setExamMeta] = useState(null);
  const [examMetaResolved, setExamMetaResolved] = useState(false);
  const examVariant = getExamVariant(examMeta);
  const isPortalConductExam = examVariant === "portal_mcq";
  const isSubjectiveExam = isSubjectiveConductExam(examMeta);

  const mainContentRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !mainContentRef.current) return;

      const container = mainContentRef.current;
      const containerRect = container.getBoundingClientRect();
      const newPosition =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      const limitedPosition = Math.min(Math.max(newPosition, 20), 80);
      setSplitPosition(limitedPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleViewRecheckRequest = (request) => {
    setSelectedRecheckRequest(request);

    if (request.annotations && request.annotations.length > 0) {
      if (request.annotations[0].pageNumber) {
        setPageNumber(request.annotations[0].pageNumber);
      }

      setSelectedAnnotations(request.annotations);

      if (currentTab !== "history") {
        setCurrentTab("history");
      }
    }
  };

  useEffect(() => {
    if (currentTab !== "history") {
      setSelectedAnnotations([]);
      setSelectedRecheckRequest(null);
    }
  }, [currentTab]);

  const fetchRecheckRequests = async () => {
    if (!examId || !enrollmentId) return;

    setLoadingRecheckRequests(true);
    setRecheckRequestsError(null);

    try {
      const response = await examsApi.getRecheckRequests(examId, enrollmentId);

      if (response.data && response.data.code === 200) {
        const requests = response.data.data || [];

        setRecheckRequests(requests);

        let newMarks = 0;

        for (let question of requests[0].annotations) {
          newMarks += question.currentMarks;
        }

        if (requests.length > 0) {
          const latestRequest = requests[0];
          setRequestStatus({
            id: latestRequest._id,
            timestamp: new Date(latestRequest.created_at).toLocaleString(),
            status: latestRequest.status,
          });

          setHasSubmittedRecheck(true);
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch recheck requests"
        );
      }
    } catch (err) {
      console.error("Error fetching recheck requests:", err);
      setRecheckRequestsError(err.message || "Failed to load recheck requests");
    } finally {
      setLoadingRecheckRequests(false);
    }
  };

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examMetaResolved) {
        return;
      }

      if (isPortalConductExam || isSubjectiveExam) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get(
          `${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response && response.data && response.data.code === 200) {
          const apiData = response.data.data;
          console.log("API Response:", apiData);

          const questions = [];
          const detailedFeedbackData = {};

          // Get max_marks from questions data if available
          const questionsData = apiData.questions || {};
          
          if (apiData.evaluations) {
            Object.keys(apiData.evaluations).forEach((key) => {
              const questionData = apiData.evaluations[key];

              const questionNumber = parseInt(key.replace(/\D/g, ""));

              if (isNaN(questionNumber)) {
                console.warn(
                  `Could not parse question number from key: ${key}`
                );
                return;
              }

              const totalMarks = parseFloat(questionData.total_marks) || 0;
              
              // Get max_marks from questions data, fallback to 0 if not found
              const questionInfo = questionsData[key] || {};
              const maxMarks =
                parseFloat(questionInfo.max_marks) ||
                parseFloat(questionData.max_marks) ||
                0;

              questions.push({
                question_number: questionNumber,
                question_text: questionInfo.question_text || apiData.problem_feedback?.[key] || `Question ${questionNumber}`,
                question_body: questionInfo.question_body || null,
                image_url: questionInfo.image_url || null,
                max_marks: maxMarks,
                marks_obtained: totalMarks,
                feedback: questionData.overall_feedback || "",
              });

              if (
                questionData.item_grades &&
                questionData.item_grades.length > 0
              ) {
                detailedFeedbackData[questionNumber] = {
                  items: questionData.item_grades,
                  overall: questionData.overall_feedback,
                  improvement: questionData.improvement_suggestions,
                };
              }
            });
          }

          questions.sort((a, b) => a.question_number - b.question_number);

          setDetailedFeedback(detailedFeedbackData);

          // Calculate total max score from questions
          const totalMaxScore = questions.reduce((sum, q) => sum + (q.max_marks || 0), 0);
          
          const transformedData = {
            id: parseInt(examId),
            title: apiData.exam_name || "Exam",
            type: "Exam",
            date: new Date(
              apiData.upload_time || new Date()
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            score: questions.reduce((sum, q) => sum + q.marks_obtained, 0),
            maxScore: totalMaxScore || apiData.full_marks || 0,
            status: apiData.evaluation_status || "pending",
            questions: questions,
            student: apiData.student || null,
          };

          setExamData(transformedData);

          if (apiData.answer_sheet_url) {
            setPdfFile(apiData.answer_sheet_url);
          }

          if (apiData.pages && apiData.pages.length > 0) {
            setTotalPages(apiData.pages.length);

            setPdfImageUrl(apiData.pages[0].url);
          }

          if (transformedData.questions.length > 0) {
            setAnnotationsByQuestion(
              transformedData.questions.map((question) => ({
                questionNumber: question.question_number,
                count: 0,
              }))
            );
          }

          fetchRecheckRequests();
        } else {
          throw new Error(
            response?.data?.message || "Failed to load exam data"
          );
        }
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setError(err.message || "Failed to load exam data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();

    return () => {
      if (pdfFile && pdfFile.startsWith("blob:")) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [examId, enrollmentId, examMetaResolved, isPortalConductExam, isSubjectiveExam]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Authentication token not found");
    }
    axios
      .get(`${API_BASE_URL}/students/courses/${courseId}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(({ data }) => {
        console.log(courseId);
        for (let exam of data.data) {
          if (exam.exam_id === parseInt(examId)) {
            setExamMeta(exam);
            setProgressPercentage(
              (100 * exam.marks_obtained) / exam.full_marks
            );

            // Use backend-calculated allow_recheck and recheck_deadline if available
            if (typeof exam.allow_recheck === "boolean") {
              setCanRequestRecheck(exam.allow_recheck && !exam.recheck_requested);
            }

            if (exam.recheck_deadline) {
              setRecheckDeadline(exam.recheck_deadline);
            }
            break;
          }
        }
        setExamMetaResolved(true);
      })
      .catch((err) => {
        console.log(err);
        setExamMetaResolved(true);
      });
  }, [courseId, examId]);

  useEffect(() => {
    if (examData && examData.questions) {
      const questionCounts = {};

      annotations.forEach((anno) => {
        const qNum = anno.metadata.questionNumber;
        questionCounts[qNum] = (questionCounts[qNum] || 0) + 1;
      });

      const updatedAnnotationsByQuestion = examData.questions.map((q) => ({
        questionNumber: q.question_number,
        count: questionCounts[q.question_number] || 0,
      }));

      setAnnotationsByQuestion(updatedAnnotationsByQuestion);
    }
  }, [annotations, examData]);

  useEffect(() => {
    if (!totalPages || totalPages === 1) {
      if (!pdfImageUrl && !pdfFile) {
        setTotalPages(1);
      }
    }
  }, [totalPages, pdfImageUrl, pdfFile]);

  useEffect(() => {
    const handleScreenshotAttempt = (e) => {
      const isScreenshot =
        SecurityManager.screenshotDetectionMethods.keyboardScreenshot(e) ||
        SecurityManager.screenshotDetectionMethods.devTools(e) ||
        SecurityManager.screenshotDetectionMethods.screenCapture(e);

      if (isScreenshot) {
        setIsScreenshotAttempted(true);

        setTimeout(() => {
          setIsScreenshotAttempted(false);
        }, 3000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const now = new Date().getTime();

        if (
          !window._lastVisibilityChange ||
          now - window._lastVisibilityChange > 5000
        ) {
          window._lastVisibilityChange = now;
        }
      }
    };

    document.addEventListener("keydown", handleScreenshotAttempt);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("keydown", handleScreenshotAttempt);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (mainContentRef.current) {
        if (window.innerWidth < 768) {
          mainContentRef.current.classList.remove("flex-row");
          mainContentRef.current.classList.add("flex-col");
        } else {
          mainContentRef.current.classList.remove("flex-col");
          mainContentRef.current.classList.add("flex-row");
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentTab === "recheck" && !showAnnotation) {
      setShowAnnotation(true);
    }
  }, [currentTab, showAnnotation]);

  useEffect(() => {
    try {
      const savedAnnotations = localStorage.getItem("exam-viewer-annotations");
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    } catch (error) {
      console.error("Error loading annotations from localStorage:", error);
    }
  }, []);

  const handleAnnotationChange = (newAnnotations) => {
    setAnnotations(newAnnotations);

    try {
      localStorage.setItem(
        "exam-viewer-annotations",
        JSON.stringify(newAnnotations)
      );
    } catch (error) {
      console.error("Error saving annotations to localStorage:", error);
    }
  };

  const handleRecheckSubmit = (data) => {
    console.log("Recheck data submitted:", data);

    setRequestStatus({
      id: data.apiResponse?.data?._id || Math.floor(Math.random() * 10000),
      timestamp: new Date().toLocaleString(),
      status: "pending",
    });

    setHasSubmittedRecheck(true);

    setToast({
      visible: true,
      message: "Recheck request submitted successfully",
      type: "success",
    });

    fetchRecheckRequests();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleGoBack = () => {
    navigate(`/student/evaluations/${courseId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handleTotalPagesChange = (numPages) => {
    setTotalPages(numPages);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isPortalConductExam) {
    return (
      <ConductExamSession
        examId={examId}
        courseId={courseId}
        enrollmentId={enrollmentId}
      />
    );
  }

  if (isSubjectiveExam) {
    return (
      <SubjectiveConductExamSession
        examId={examId}
        courseId={courseId}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingDisplay />
      </div>
    );
  }

  if (error && !examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorDisplay
          message={error}
          onRetry={handleRetry}
          onBack={() => navigate(`/student/evaluations/${courseId}`)}
        />
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorDisplay
          message="No exam data available. The requested exam could not be found or has not been evaluated yet."
          onBack={() => navigate(`/student/evaluations/${courseId}`)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <ScreenshotProtection
        active={isScreenshotAttempted}
        studentInfo={examData.student}
      />

      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            <div className="min-w-0">
              <Breadcrumbs
                items={[
                  { label: 'My Evaluations', to: '/student/evaluations' },
                  { label: 'Course', to: courseId ? `/student/evaluations/${courseId}` : '/student/evaluations' },
                  { label: isHistory ? 'History' : 'Exam' },
                ]}
              />
              <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">
                {examData.student && (
                  <span>
                    {examData.student.name} ({examData.student.roll_number})
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>{examData.title}</span>
                <span className="text-gray-300">|</span>
                <span>{examData.date}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 sm:gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <StatusBadge status={examData.status} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20 shadow-sm"
            >
              <Shield className="w-4 h-4 mr-1" /> Secured
            </motion.div>

            {isHistory ? null : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRecheckModal(true)}
                  disabled={hasSubmittedRecheck || !canRequestRecheck}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    hasSubmittedRecheck || !canRequestRecheck
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-accent text-white hover:bg-accent/90 shadow-sm"
                  }`}
                >
                  Request Recheck
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      <main
        ref={mainContentRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
      >
        <div
          className="w-full md:w-1/2 h-full overflow-hidden bg-gray-50 p-4 relative flex flex-col"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="flex-1 min-h-0">
            <PDFViewer
              file={pdfFile}
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              zoomLevel={zoomLevel}
              onTotalPagesChange={handleTotalPagesChange}
              pdfFallbackImage={pdfImageUrl}
              selectedAnnotations={selectedAnnotations}
              studentInfo={examData.student}
            />
          </div>
          {showAnnotation && (
            <AnnotationTool
              onAnnotationChange={handleAnnotationChange}
              currentPage={pageNumber}
              examData={examData}
              zoomLevel={zoomLevel}
            />
          )}
        </div>

        <div
          className="w-2 h-full bg-gray-300 cursor-ew-resize hidden md:block"
          onMouseDown={handleMouseDown}
        ></div>

        <div
          className="w-full md:w-1/2 h-full overflow-y-auto bg-gray-50 p-4 md:p-6"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab("overview")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentTab === "overview"
                      ? "bg-accent text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setCurrentTab("recheck")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentTab === "recheck"
                      ? "bg-accent text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Recheck
                </button>
                <button
                  onClick={() => setCurrentTab("history")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentTab === "history"
                      ? "bg-accent text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  History
                </button>
              </div>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentTab === "overview" && (
                    <QuestionOverview
                      questions={examData.questions}
                      detailedFeedback={detailedFeedback}
                    />
                  )}
                  {currentTab === "recheck" && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Recheck Request
                      </h2>
                      {hasSubmittedRecheck ? (
                        <div
                          className="bg-accent/5 border border-accent/10 text-gray-800 p-4 rounded-xl"
                          role="alert"
                        >
                          <p className="font-semibold text-accent">
                            Recheck request submitted
                          </p>
                          <p className="text-gray-600">
                            Your recheck request has been submitted and is awaiting review.
                          </p>
                          {requestStatus && (
                            <div className="mt-3 text-sm text-gray-700">
                              <p>
                                <strong>Status:</strong> {requestStatus.status}
                              </p>
                              <p>
                                <strong>Submitted On:</strong> {requestStatus.timestamp}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : !canRequestRecheck ? (
                        <div
                          className="bg-gray-50 border border-gray-200 text-gray-700 p-4 rounded-xl"
                          role="alert"
                        >
                          <p className="font-semibold text-gray-800">
                            Recheck window closed
                          </p>
                          <p className="text-gray-600">
                            The recheck window for this exam has expired, so new recheck
                            requests can no longer be submitted.
                            {recheckDeadline && (
                              <>
                                {" "}
                                Last date: {new Date(recheckDeadline).toLocaleString()}
                              </>
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          Click the "Request Recheck" button above to submit a recheck request for this exam.
                        </p>
                      )}
                    </div>
                  )}
                  {currentTab === "history" && (
                    <RecheckRequestHistory
                      requests={recheckRequests}
                      loading={loadingRecheckRequests}
                      error={recheckRequestsError}
                      onViewRequest={handleViewRecheckRequest}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {showRecheckModal && (
        <RecheckModal
          isOpen={showRecheckModal}
          onClose={() => setShowRecheckModal(false)}
          onSubmit={handleRecheckSubmit}
          annotations={annotations}
          examData={examData}
          enrollmentId={enrollmentId}
        />
      )}
    </div>
  );
};

export default StudentExamDetails;
