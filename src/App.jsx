import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import StudentDashboardLayout from "./components/StudentDashboardLayout";
import Dashboard from "./components/Dashboard/DashboardHome";
import StudentDashboard from "./components/StudentDashboard";
import TADashboard from "./components/TADashboard";
import Courses from "./components/Dashboard/Course";
import CourseDetails from "./components/Dashboard/Course/CourseDetails";
import RoleAuth from "./components/RoleAuth";
import LandingPage from "./components/LandingPage";
import ResourcesPage from "./components/ResourcesPage";
import AboutUsPage from "./components/AboutUsPage";
import LoadingIndicator from "./components/Loader";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import StudentEvaluations from "./components/StudentEvaluations";
import CourseEvaluations from "./components/CourseEvaluations";
import StudentExamDetails from "./components/StudentExamDetails";
import StudentRecheckRequests from "./components/StudentRecheckRequests";
import ProfessorRecheckDetail from "./components/Dashboard/Course/ProfessorRecheckDetail";
function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setLoading(true);
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timeoutId);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        {loading && <LoadingIndicator />}

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/auth" element={<RoleAuth />} />

          <Route
            path="/dashboard"
            element={
              <RoleRoute requiredRole="professor">
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <RoleRoute requiredRole="professor">
                <DashboardLayout>
                  <Courses />
                </DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <RoleRoute requiredRole="professor">
                <DashboardLayout>
                  <CourseDetails />
                </DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <RoleRoute requiredRole="student">
                <StudentDashboardLayout>
                  <StudentDashboard />
                </StudentDashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <RoleRoute requiredRole="student">
                <StudentDashboardLayout>
                  <Courses />
                </StudentDashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/student/evaluations"
            element={
              <RoleRoute requiredRole="student">
                <StudentDashboardLayout>
                  <StudentEvaluations />
                </StudentDashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/student/evaluations/:courseId"
            element={
              <RoleRoute requiredRole="student">
                <StudentDashboardLayout>
                  <CourseEvaluations />
                </StudentDashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/student/evaluations/:courseId/exam/:id"
            element={
              <RoleRoute requiredRole="student">
                <StudentExamDetails />
              </RoleRoute>
            }
          />
          <Route
            path="/student/history/:courseId/exam/:id"
            element={
              <RoleRoute requiredRole="student">
                <StudentExamDetails isHistory />
              </RoleRoute>
            }
          />

          <Route
            path="/student/recheck-history"
            element={
              <RoleRoute requiredRole="student">
                <StudentDashboardLayout>
                  <StudentRecheckRequests />
                </StudentDashboardLayout>
              </RoleRoute>
            }
          />

          <Route
            path="/ta-dashboard"
            element={
              <RoleRoute requiredRole="ta">
                <DashboardLayout>
                  <TADashboard />
                </DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/professor/recheck-requests"
            element={
              <ProfessorRecheckDetail />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
