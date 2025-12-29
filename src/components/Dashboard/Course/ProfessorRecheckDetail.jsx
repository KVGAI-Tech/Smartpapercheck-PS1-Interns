import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../../BaseURL";
import Toast from "./ProfessorRecheckDetail/Toast";
import StatusBadge from "./ProfessorRecheckDetail/StatusBadge";
import PageViewer from "./ProfessorRecheckDetail/PageViewer";
import AnnotationViewer from "./ProfessorRecheckDetail/AnnotationViewer";
import AnnotationResponseForm from "./ProfessorRecheckDetail/AnnotationResponseForm";
import QuestionMarksEditor from "./ProfessorRecheckDetail/QuestionMarksEditor";
import SidebarTabs from "./ProfessorRecheckDetail/SidebarTabs";
import StudentAnnotationsList from "./ProfessorRecheckDetail/StudentAnnotationsList";
import { AlertCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

const ProfessorRecheckDetail = () => {
  const { courseId, requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const examId = queryParams.get("examId") || courseId;
  const enrollmentId = queryParams.get("enrollmentId") || requestId;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [decision, setDecision] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(500);
  const [resizing, setResizing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("annotations");
  const [questionMarks, setQuestionMarks] = useState({});
  const [maxMarks, setMaxMarks] = useState({ total: 10 });
  const [totalOriginalMarks, setTotalOriginalMarks] = useState(0);
  const [totalNewMarks, setTotalNewMarks] = useState(0);
  const [professorFeedback, setProfessorFeedback] = useState("");
  const [addressedQuestions, setAddressedQuestions] = useState({});
  const [professorResponses, setProfessorResponses] = useState([]);
  const [questionResponses, setQuestionResponses] = useState({});
  const [pageUrls, setPageUrls] = useState([]);
  const resizeStartX = useRef(0);
  const startWidth = useRef(0);
  const containerRef = useRef(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [mongoId, setMongoId] = useState(null);

  const respondedAnnotationIds = professorResponses.map(
    (response) => response.annotationId
  );

  useEffect(() => {
    const handleResize = () => {
      if (!resizing) {
        setSidebarWidth(Math.min(window.innerWidth * 0.4, 500));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizing]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing) return;

      const containerWidth =
        containerRef.current?.offsetWidth || window.innerWidth;
      const newWidth = startWidth.current + (e.clientX - resizeStartX.current);

      const minWidth = Math.max(320, containerWidth * 0.2);
      const maxWidth = containerWidth * 0.6;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    const fetchRequestData = async () => {
      setLoading(true);
      try {
        const recheckResponse = await fetch(
          `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/recheck-requests`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!recheckResponse.ok) {
          throw new Error("Failed to fetch recheck request");
        }

        const recheckData = await recheckResponse.json();

        if (!recheckData.data || recheckData.data.length === 0) {
          throw new Error("No recheck requests found");
        }

        const request = recheckData.data[0];
        setMongoId(request._id);

        const answerSheetResponse = await fetch(
          `${API_BASE_URL}/exams/${request.exam_id || examId}/answer-sheets/${
            request.enrollment_id || enrollmentId
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!answerSheetResponse.ok) {
          throw new Error("Failed to fetch answer sheets");
        }

        const answerSheetData = await answerSheetResponse.json();

        const pages = answerSheetData.data.pages || [];
        const pageUrls = pages.map((page) => page.presigned_url || page.url);
        const studentData = answerSheetData.data.student || {};
        const annotationsData = request.annotations || [];

        const Y_OFFSET = 5; // finer vertical offset in percentage units

        const transformedAnnotations = annotationsData.map((anno) => {
          const coords = anno.coordinates || {};

          const correctedCoords = {
            ...coords,
            startY:
              typeof coords.startY === "number"
                ? Math.max(0, coords.startY - Y_OFFSET)
                : coords.startY,
            endY:
              typeof coords.endY === "number"
                ? Math.max(0, coords.endY - Y_OFFSET)
                : coords.endY,
          };

          return {
            id:
              anno.annotation_id ||
              `anno-${anno.questionNumber}-${anno.pageNumber}`,
            annotation_id:
              anno.annotation_id ||
              `anno-${anno.questionNumber}-${anno.pageNumber}`,
            pageNumber: anno.pageNumber,
            questionNumber: anno.questionNumber,
            grievance: anno.grievance,
            coordinates: correctedCoords,
            currentMarks: anno.currentMarks,
            expectedMarks: anno.expectedMarks,
            status: anno.status || "pending",
            professorFeedback: anno.professorFeedback || "",
            marksAwarded: anno.marksAwarded || 0,
          };
        });

        const qMarks = {};
        const maxMarksByQuestion = { total: 0 };
        let origTotal = 0;
        let newTotal = 0;

        // Get max_marks from questions data if available
        const questionsData = answerSheetData.data.questions || {};
        const examFullMarks = answerSheetData.data.full_marks || 0;

        const questionMap = {};
        transformedAnnotations.forEach((anno) => {
          const qNum = anno.questionNumber;
          if (!questionMap[qNum]) {
            questionMap[qNum] = [];

            // Get max_marks from questions data, fallback to calculating from exam full_marks
            const questionKey = `question_${qNum}`;
            const questionInfo = questionsData[questionKey];
            if (questionInfo && questionInfo.max_marks) {
              maxMarksByQuestion[qNum] = questionInfo.max_marks;
            } else {
              // Fallback: if we have exam full_marks and can estimate, use it
              // Otherwise default to 10 (but this should rarely happen)
              maxMarksByQuestion[qNum] = 10;
            }
          }
          questionMap[qNum].push(anno);

          if (anno.status === "accepted" || anno.status === "rejected") {
            const profResponse = {
              id: `prof-${Date.now()}-${anno.id}`,
              questionNumber: anno.questionNumber,
              comment: anno.professorFeedback || "Review completed",
              newMark: anno.marksAwarded || anno.currentMarks,
              annotationId: anno.id || anno.annotation_id,
            };

            setProfessorResponses((prev) => {
              if (
                !prev.some((r) => r.annotationId === profResponse.annotationId)
              ) {
                return [...prev, profResponse];
              }
              return prev;
            });

            setAddressedQuestions((prev) => ({
              ...prev,
              [anno.questionNumber]: true,
            }));
          }
        });

        Object.keys(questionMap).forEach((qNum) => {
          const annotations = questionMap[qNum];
          const firstAnno = annotations[0];
          qMarks[qNum] = {
            originalMark: firstAnno.currentMarks,
            newMark:
              firstAnno.status === "accepted"
                ? firstAnno.marksAwarded
                : firstAnno.currentMarks,
          };

          origTotal += firstAnno.currentMarks;
          newTotal += qMarks[qNum].newMark;
          maxMarksByQuestion.total += maxMarksByQuestion[qNum];
        });

        const formattedRequestData = {
          id: request._id,
          studentName: studentData.name || "Student",
          studentId: studentData.roll_number || studentData.student_id || "ID",
          examTitle: `Exam ${request.exam_id || examId}`,
          examType: "Examination",
          reason: request.reason,
          status: request.status,
          submittedDate: new Date(request.created_at).toLocaleDateString(),
          currentMarks: origTotal,
          maxMarks: maxMarksByQuestion,
          questionMarks: qMarks,
          annotations: transformedAnnotations.length,
          pages: pages.map((page, idx) => ({
            pageNumber: page.page_number || idx + 1,
            imageUrl: page.presigned_url || page.url,
          })),
        };

        setRequestData(formattedRequestData);
        setAnnotations(transformedAnnotations);
        setTotalPages(pages.length);
        setMaxMarks(maxMarksByQuestion);
        setQuestionMarks(qMarks);
        setTotalOriginalMarks(origTotal);
        setTotalNewMarks(newTotal);
        setPageUrls(pageUrls);

        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Error fetching request data:", err);
        setError("Failed to load request data. Please try again.");
        setLoading(false);
      }
    };

    if (examId && enrollmentId) {
      fetchRequestData();
    } else {
      setError("Missing required parameters: examId and enrollmentId");
      setLoading(false);
    }
  }, [examId, enrollmentId]);

  useEffect(() => {
    const byQuestion = professorResponses.reduce((acc, response) => {
      const qNum = response.questionNumber;
      if (!acc[qNum]) {
        acc[qNum] = [];
      }
      acc[qNum].push(response);
      return acc;
    }, {});

    setQuestionResponses(byQuestion);
  }, [professorResponses]);

  const startResize = (e) => {
    e.preventDefault();
    setResizing(true);
    resizeStartX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  const handleQuestionMarkUpdate = (questionNum, oldMark, newMark) => {
    setQuestionMarks((prev) => {
      const updated = { ...prev };

      updated[questionNum] = {
        originalMark: oldMark,
        newMark: newMark,
      };

      let originalTotal = 0;
      let newTotal = 0;
      Object.values(updated).forEach((q) => {
        originalTotal += q.originalMark;
        newTotal += q.newMark;
      });

      if (newTotal > maxMarks.total) {
        updated[questionNum].newMark -= newTotal - maxMarks.total;
        newTotal = maxMarks.total;
      }

      setTotalOriginalMarks(originalTotal);
      setTotalNewMarks(newTotal);

      return updated;
    });

    setAddressedQuestions((prev) => ({
      ...prev,
      [questionNum]: true,
    }));
  };

  const handleQuestionMarkChange = (questionNum, field, value) => {
    if (addressedQuestions[questionNum]) {
      showToast(
        "This question has already been addressed via annotation response",
        "error"
      );
      return;
    }

    setQuestionMarks((prev) => {
      const updated = { ...prev };

      if (!updated[questionNum]) {
        updated[questionNum] = { originalMark: 0, newMark: 0 };
      }

      updated[questionNum][field] = value;

      if (
        field === "originalMark" &&
        updated[questionNum].originalMark === updated[questionNum].newMark
      ) {
        updated[questionNum].newMark = value;
      }

      const qMax = maxMarks[questionNum];
      if (updated[questionNum][field] > qMax) {
        updated[questionNum][field] = qMax;
      }

      let originalTotal = 0;
      let newTotal = 0;
      Object.values(updated).forEach((q) => {
        originalTotal += q.originalMark;
        newTotal += q.newMark;
      });

      if (newTotal > maxMarks.total) {
        const excess = newTotal - maxMarks.total;
        if (field === "newMark") {
          updated[questionNum].newMark -= excess;
          newTotal = maxMarks.total;
        }
      }

      setTotalOriginalMarks(originalTotal);
      setTotalNewMarks(newTotal);

      return updated;
    });
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);

      setShowResponseForm(false);
      setSelectedAnnotation(null);
      setSelectedAnnotationId(null);
    }
  };

  const handleGoBack = () => {
    navigate(`/courses`);
  };

  const handleSelectAnnotation = (annotation) => {
    const annotationId = annotation.id || annotation.annotation_id;

    setSelectedAnnotation(annotation);
    setSelectedAnnotationId(annotationId);
    setShowResponseForm(true);

    if (annotation.pageNumber !== pageNumber) {
      setPageNumber(annotation.pageNumber);
    }
  };

  const handleAnnotationResponse = async (responseData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("status", "accepted");
      formData.append("feedback", responseData.comment);
      formData.append("marks_awarded", responseData.newMark);

      const response = await fetch(
        `${API_BASE_URL}/exams/recheck/${mongoId}/annotations/${responseData.annotationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update annotation");
      }

      const result = await response.json();

      const newResponse = {
        id: `prof-${Date.now()}`,
        questionNumber: responseData.questionNumber,
        comment: responseData.comment,
        newMark: responseData.newMark,
        annotationId: responseData.annotationId,
        studentComment:
          selectedAnnotation?.grievance ||
          selectedAnnotation?.metadata?.comment ||
          "",
      };

      setProfessorResponses((prev) => [...prev, newResponse]);

      setAnnotations((prev) =>
        prev.map((anno) => {
          if (
            anno.id === responseData.annotationId ||
            anno.annotation_id === responseData.annotationId
          ) {
            return {
              ...anno,
              status: "accepted",
              professorFeedback: responseData.comment,
              marksAwarded: responseData.newMark,
            };
          }
          return anno;
        })
      );

      handleQuestionMarkUpdate(
        responseData.questionNumber,
        selectedAnnotation.currentMarks ||
          selectedAnnotation.metadata?.previousMark,
        responseData.newMark
      );

      setShowResponseForm(false);
      setSelectedAnnotation(null);
      setSelectedAnnotationId(null);

      showToast("Response submitted successfully", "success");
    } catch (error) {
      console.error("Error submitting annotation response:", error);
      showToast("Failed to submit response", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!decision) {
      showToast("Please select a decision (Approve or Reject)", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const unansweredAnnotations = annotations.filter(
        (anno) =>
          !respondedAnnotationIds.includes(anno.id) &&
          !respondedAnnotationIds.includes(anno.annotation_id) &&
          anno.status !== "accepted" &&
          anno.status !== "rejected"
      );

      if (decision === "rejected") {
        await Promise.all(
          unansweredAnnotations.map(async (anno) => {
            const formData = new FormData();
            formData.append("status", "rejected");
            formData.append(
              "feedback",
              professorFeedback || "Annotation rejected"
            );
            formData.append("marks_awarded", anno.currentMarks);

            const annoId = anno.id || anno.annotation_id;

            const response = await fetch(
              `${API_BASE_URL}/exams/recheck/${mongoId}/annotations/${annoId}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to reject annotation ${annoId}`);
            }

            return response.json();
          })
        );
      }

      const updateRecheckStatus = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setRequestData((prev) => ({
          ...prev,
          status: decision === "partial" ? "approved" : decision,
          currentMarks: totalNewMarks,
        }));
      };

      await updateRecheckStatus();

      setRequestComplete(true);
      showToast(
        `Request ${
          decision === "approved" || decision === "partial"
            ? "approved"
            : "rejected"
        } successfully`,
        "success"
      );
    } catch (error) {
      console.error("Error submitting response:", error);
      showToast("Failed to submit response", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const resetSidebarWidth = useCallback(() => {
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth;
    setSidebarWidth(Math.min(containerWidth * 0.4, 500));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 border-4 border-t-accent border-accent/20 rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-medium text-gray-900 mb-6">
              Loading request
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch the recheck request...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="inline-block bg-red-100 p-8 rounded-full mb-8"
          >
            <AlertCircle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Error Loading Request
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="px-8 py-3 bg-accent text-white rounded-lg shadow-md hover:bg-accent transition-all"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  if (requestComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm p-4 border-b">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGoBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <h1 className="text-xl font-bold text-gray-900">
                Recheck Request Complete
              </h1>
            </div>
            <StatusBadge
              status={
                decision === "approved" || decision === "partial"
                  ? "approved"
                  : "rejected"
              }
            />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="inline-block p-6 rounded-full bg-accent/10 mb-6">
              {decision === "approved" || decision === "partial" ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Request{" "}
              {decision === "approved" || decision === "partial"
                ? "Approved"
                : "Rejected"}
            </h2>

            <p className="text-gray-600 mb-6">
              You have{" "}
              {decision === "approved" || decision === "partial"
                ? "approved"
                : "rejected"}{" "}
              the recheck request for {requestData?.studentName}.
              {decision === "approved" || decision === "partial"
                ? ` The student's mark has been updated from ${totalOriginalMarks} to ${totalNewMarks}.`
                : " No changes have been made to the student's marks."}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="px-6 py-3 bg-accent text-white rounded-lg shadow-md hover:bg-accent transition-all w-full"
            >
              Return to Course
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" ref={containerRef}>
      <header className="bg-white shadow-md p-4 border-b sticky top-0 z-40">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Recheck Request Details
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{requestData?.examTitle}</span>
                <span>•</span>
                <span>{requestData?.examType}</span>
                <span>•</span>
                <StatusBadge status={requestData?.status} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium shadow-sm"
              >
                {requestData?.studentName?.charAt(0) || "S"}
              </motion.div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {requestData?.studentName}
                </div>
                <div className="text-gray-500">{requestData?.studentId}</div>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200"></div>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-gray-800 relative">
        <PageViewer
          presigned_url={pageUrls[pageNumber - 1]}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          zoomLevel={zoomLevel}
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <AnnotationViewer
          annotations={annotations}
          currentPage={pageNumber}
          onSelectAnnotation={handleSelectAnnotation}
          selectedAnnotationId={selectedAnnotationId}
          respondedAnnotationIds={respondedAnnotationIds}
          zoomLevel={zoomLevel}
        />
        {showResponseForm && selectedAnnotation && (
          <AnnotationResponseForm
            selectedAnnotation={selectedAnnotation}
            onClose={() => setShowResponseForm(false)}
            onSubmit={handleAnnotationResponse}
            maxMarks={maxMarks}
            questionResponses={
              questionResponses[selectedAnnotation.questionNumber] || []
            }
          />
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
};

export default ProfessorRecheckDetail;