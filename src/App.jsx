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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId" element={<CourseDetails />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="grades" element={<GradeManagement />} />
            <Route path="manage/students" element={<StudentManagement />} />
            <Route path="manage/tas" element={<TeachingAssistantsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;