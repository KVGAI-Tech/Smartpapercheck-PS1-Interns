import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../BaseURL";
import { useAuth } from './AuthContext';
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Download,
  ExternalLink,
  AlertCircle,
  History,
  Eye,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, className }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${className}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  </div>
);

const EvaluationCard = ({
  title,
  subject,
  score,
  maxScore,
  status,
  submittedDate,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            status === "evaluated" ? "bg-green-50" : "bg-yellow-50"
          }`}
        >
          <FileText
            className={`w-5 h-5 ${
              status === "evaluated" ? "text-green-600" : "text-yellow-600"
            }`}
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{subject}</p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Score</span>
          <span className="font-medium text-accent">
            {score}/{maxScore}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${(score / maxScore) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {submittedDate}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "evaluated"
              ? "bg-green-50 text-green-600"
              : "bg-yellow-50 text-yellow-600"
          }`}
        >
          {status === "evaluated" ? "Evaluated" : "Under Review"}
        </span>
      </div>
    </div>
  </div>
);

const RecheckItem = ({ title, subject, reason, status, requestDate }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${
          status === "approved"
            ? "bg-green-50"
            : status === "pending"
            ? "bg-yellow-50"
            : "bg-red-50"
        }`}
      >
        <History
          className={`w-5 h-5 ${
            status === "approved"
              ? "text-accent"
              : status === "pending"
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{subject}</p>
      </div>
    </div>
    <div className="text-right">
      <p
        className={`text-sm font-medium ${
          status === "approved"
            ? "text-green-600"
            : status === "pending"
            ? "text-yellow-600"
            : "text-red-600"
        }`}
      >
        {requestDate}
      </p>
      <p className="text-xs text-gray-500">{status}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const role = localStorage.getItem("userRole");
        
        if (!token || role !== 'student') {
          throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/students/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired");
          }
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.code !== 200 || !data.data) {
          throw new Error("Invalid response format");
        }

        setStudentData(data.data);
      } catch (error) {
        setError(error.message);
        
        if (error.message.includes("Authentication") || 
            error.message.includes("expired") || 
            error.message.includes("401")) {
          setTimeout(() => {
            logout();
          }, 1500);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate, logout]);

  const getGreeting = () => {
    if (!studentData) return "Welcome";
    
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    return `${greeting}, ${studentData.user_name || "Student"}!`;
  };

  const stats = [
    {
      title: "Total Evaluations",
      value: "8",
      icon: FileText,
      className: "bg-accent",
    },
    {
      title: "Evaluated",
      value: "5",
      icon: CheckCircle,
      className: "bg-accent",
    },
    {
      title: "Under Review",
      value: "3",
      icon: Clock,
      className: "bg-accent",
    },
    {
      title: "Recheck Requests",
      value: "2",
      icon: AlertCircle,
      className: "bg-accent",
    },
  ];

  const evaluations = [
    {
      title: "Mid-term Examination",
      subject: "Computer Programming",
      score: 85,
      maxScore: 100,
      status: "evaluated",
      submittedDate: "2 days ago",
    },
    {
      title: "Graph Theory Assignment",
      subject: "Data Structures",
      score: 92,
      maxScore: 100,
      status: "evaluated",
      submittedDate: "5 days ago",
    },
    {
      title: "Neural Networks Lab",
      subject: "Machine Learning",
      score: 0,
      maxScore: 100,
      status: "pending",
      submittedDate: "1 day ago",
    },
    {
      title: "Calculus Quiz",
      subject: "Mathematics II",
      score: 0,
      maxScore: 50,
      status: "pending",
      submittedDate: "3 hours ago",
    },
  ];

  const recheckRequests = [
    {
      title: "Mid-term Examination",
      subject: "Computer Programming",
      reason: "Question 3 partial credit review",
      status: "approved",
      requestDate: "Yesterday",
    },
    {
      title: "Graph Theory Assignment",
      subject: "Data Structures",
      reason: "Implementation logic review",
      status: "pending",
      requestDate: "Today",
    },
    {
      title: "Final Project",
      subject: "Machine Learning",
      reason: "Model accuracy calculation",
      status: "rejected",
      requestDate: "2 days ago",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl my-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">An error occurred</h3>
        </div>
        <p>{error}</p>
        <button 
          onClick={() => navigate("/auth")}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}
          </h1>
          <p className="text-gray-500">
             Track your evaluations and recheck requests
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search evaluations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 lg:w-80 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Evaluations
              </h2>
              <button className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1">
                View All <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluations.map((evaluation, index) => (
                <EvaluationCard key={index} {...evaluation} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recheck Requests
            </h2>
            <button className="text-accent hover:text-accent/80">
              <Eye className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recheckRequests.map((request, index) => (
              <RecheckItem key={index} {...request} />
            ))}
          </div>

          <button className="mt-4 w-full py-2 bg-accent/5 text-accent rounded-lg font-medium hover:bg-accent/10 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>

        <div className="space-y-4">
          {[
            {
              action: "Recheck request approved",
              details: "Mid-term Examination: Computer Programming",
              time: "2 hours ago",
            },
            {
              action: "New evaluation received",
              details: "Calculus Quiz: Mathematics II",
              time: "Yesterday",
            },
            {
              action: "Submitted recheck request",
              details: "Graph Theory Assignment: Data Structures",
              time: "3 days ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
