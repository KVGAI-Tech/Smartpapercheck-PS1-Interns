import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Dashboard from './components/Dashboard/DashboardHome';
import Courses from './components/Dashboard/Course';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import GradeManagement from './components/Dashboard/GradeManagement';
import StudentManagement from './components/Dashboard/StudentManagement';
import TeachingAssistantsPage from './components/Dashboard/TeachingAssistantsPage';
import SettingsPage from './components/Dashboard/SettingsPage';
import CourseDetails from './components/Dashboard/Course/CourseDetails';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Courses />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses/:courseId" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CourseDetails />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticsDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/grades" element={
            <ProtectedRoute>
              <DashboardLayout>
                <GradeManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/manage/students" element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudentManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/manage/tas" element={
            <ProtectedRoute>
              <DashboardLayout>
                <TeachingAssistantsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;