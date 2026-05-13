import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";
import fetchQuestions from "./fetchQuestions";

export default function fetchStudentEvaluation(
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
) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    setLoading(true);
    axios
      .get(
        `${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}${
          model ? `?model=${encodeURIComponent(model)}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("Student evaluation API response:", response.data);

        if (response.data && response.data.code === 200 && response.data.data) {
          const data = response.data.data;
          setStudentData(data);

          if (data.pages && Array.isArray(data.pages)) {
            const processedPages = data.pages.map((page) => ({
              pageNumber: page.page_number,
              totalPages: page.total_pages,
              imageUrl: page.presigned_url || page.url,
              type: page.type || (page.text || page.text_answer ? "text" : "image"),
              text: page.text || page.text_answer,
              text_answer: page.text_answer || page.text,
              // Preserve question_number so UI can map pages to questions precisely
              questionNumber: page.question_number,
              selected_option_ids: page.selected_option_ids,
              is_correct: page.is_correct,
            }));
            setAnswerScriptPages(processedPages);
          } else {
            console.warn("No pages found in response or pages is not an array");
            setAnswerScriptPages([]);
          }

          const initialFeedback = {};
          if (data.evaluations && typeof data.evaluations === 'object') {
            Object.entries(data.evaluations).forEach(([qKey, qEval]) => {
              initialFeedback[qKey] = {
                overall: qEval.overall_feedback || "",
                items:
                  qEval.item_grades?.map((grade) => ({
                    ...grade,
                    editedFeedback: grade.feedback,
                  })) || [],
              };
            });
          }

          setFeedbackEdits(initialFeedback);

          if (data.questions) {
            console.log("Processing questions from feedback data:", typeof data.questions);
            let questionsArray = [];
            
            if (Array.isArray(data.questions)) {
              questionsArray = data.questions;
            } else if (typeof data.questions === 'object') {
              questionsArray = Object.entries(data.questions).map(([key, qData]) => {
                const qNumFromKey = parseInt(key.replace('question_', ''));
                const qNum = !isNaN(qNumFromKey) ? qNumFromKey : (qData.question_number || qData.number || 0);
                return {
                  ...qData,
                  question_number: qNum,
                  max_marks: Math.abs(qData.max_marks || qData.marks || 0)
                };
              });
            }

            questionsArray = questionsArray.filter(q => q != null).sort((a, b) => 
              (a.question_number || 0) - (b.question_number || 0)
            );

            if (questionsArray.length > 0) {
              console.log(`Successfully processed ${questionsArray.length} questions from feedback data`);
              setQuestions(questionsArray);
            } else {
              console.log("No valid questions found in feedback data, falling back to fetchQuestions");
              fetchQuestions(examId, setQuestions, onError);
            }
          } else {
            console.log("No questions field in feedback data, calling fetchQuestions");
            fetchQuestions(examId, setQuestions, onError);
          }
        } else {
          console.error("Unexpected response structure:", response.data);
          const errorMessage = response.data?.message || "Failed to load student evaluation - unexpected response structure";
          setError(errorMessage);
          onError(errorMessage);
        }
      })
      .catch((error) => {
        console.error("Error fetching student evaluation:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        const errorMessage = error.response?.data?.message || error.message || "Failed to load student evaluation";
        setError(errorMessage);
        onError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  } else {
    console.error("No access token found");
    const errorMessage = "Authentication required";
    setError(errorMessage);
    onError(errorMessage);
    setLoading(false);
  }
}