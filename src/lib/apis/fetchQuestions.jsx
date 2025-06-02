import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";

export default function fetchQuestions(examId, setQuestions, onError) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    axios
      .get(`${API_BASE_URL}/exams/${examId}/question-answer`, {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data.questions)) {
          setQuestions(data.data.questions);
        } else {
          throw new Error(data.message || "Failed to load questions");
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        onError(error.message || "Failed to load questions");
      });
  }
}
