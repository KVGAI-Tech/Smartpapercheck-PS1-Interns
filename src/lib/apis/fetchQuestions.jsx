import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";

export default function fetchQuestions(examId, setQuestions, onError) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    axios
      .get(`${API_BASE_URL}/exams/${examId}/question-answer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Questions API response:", response.data);
        
        if (response.data && response.data.code === 200 && response.data.data && Array.isArray(response.data.data.questions)) {
          const questions = response.data.data.questions.map(question => ({
            ...question,
            max_marks: Math.abs(question.max_marks || 0) 
          }));
          
          setQuestions(questions);
        } else {
          console.error("Unexpected response structure:", response.data);
          throw new Error(response.data?.message || "Failed to load questions - unexpected response structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (onError) {
          onError(error.response?.data?.message || error.message || "Failed to load questions");
        }
      });
  } else {
    console.error("No access token found");
    if (onError) {
      onError("Authentication required");
    }
  }
}