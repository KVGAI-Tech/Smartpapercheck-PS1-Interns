import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";
import fetchQuestions from "./fetchQuestions";

export default function fetchStudentEvaluation(
  examId,
  enrollmentId,
  setAnswerScriptPages,
  setFeedbackEdits,
  setError,
  onError,
  setLoading,
  setQuestions
) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((data) => {
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
        Object.entries(data.data.evaluations || {}).forEach(([qKey, qEval]) => {
          initialFeedback[qKey] = {
            overall: qEval.overall_feedback || "",
            items:
              qEval.item_grades?.map((grade) => ({
                ...grade,
                editedFeedback: grade.feedback,
              })) || [],
          };
        });

        setFeedbackEdits(initialFeedback);

        fetchQuestions(examId, setQuestions, onError);
      })
      .catch((error) => {
        setError(error.message || "Failed to load student evaluation");
        onError(error.message || "Failed to load student evaluation");
      })
      .finally(() => {
        setLoading(false);
      });
  }
}
