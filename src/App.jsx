import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children, isAuthenticated }) => {
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            
            <DashboardLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:courseId" element={<CourseDetails />} />
                <Route path="analytics" element={<div><AnalyticsDashboard /></div>} />
                <Route path="grades" element={<div><GradeManagement /></div>} />
                <Route path="manage">
                <Route path="students" element={<div><StudentManagement/></div>} />
                <Route path="tas" element={<div><TeachingAssistantsPage /></div>} />
                </Route>
                <Route path="settings" element={<div><SettingsPage /></div>} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;