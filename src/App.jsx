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
import PricingPage from './pages/pricing';
import ResourcesPage from './pages/resources';
import ContactPage from './pages/contact';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:courseId" element={<CourseDetails />} />
                    <Route path="analytics" element={<AnalyticsDashboard />} />
                    <Route path="grades" element={<GradeManagement />} />
                    <Route path="manage">
                      <Route path="students" element={<StudentManagement />} />
                      <Route path="tas" element={<TeachingAssistantsPage />} />
                    </Route>
                    <Route path="settings" element={<SettingsPage />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
