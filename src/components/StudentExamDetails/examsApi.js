import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";

const examsApi = {
  submitRecheckRequest: async (examId, enrollmentId, requestData) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    return axios.post(
      `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/recheck`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  getRecheckRequests: async (examId, enrollmentId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    return axios.get(
      `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/recheck-requests`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  },
};

export default examsApi;
