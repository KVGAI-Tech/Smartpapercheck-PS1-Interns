import React, { useState, useEffect, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../BaseURL';

import { 
  Users,
  CheckCircle,
  Clock,
  FileCheck,
  Search,
  MoreVertical,
  Filter,
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
        {trend && (
          <p className={`text-sm ${trend === 'up' ? 'text-accent' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}% from last week
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-accent/10">
        <Icon className="w-6 h-6 text-accent" />
      </div>
    </div>
  </div>
);

const CourseOverviewCard = ({ courseId, courseName, examsCount, studentsCount, onViewDetails }) => (
  <div className="min-w-[260px] max-w-xs bg-gradient-to-br from-accent/10 via-white to-indigo-50 rounded-2xl border border-accent/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent/80 mb-1">Course</p>
          <h4 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{courseName}</h4>
        </div>
        <div className="flex -space-x-2">
          <div className="p-2 rounded-xl bg-white/80 shadow-sm border border-accent/10">
            <FileCheck className="w-4 h-4 text-accent" />
          </div>
          <div className="p-2 rounded-xl bg-white/80 shadow-sm border border-accent/10">
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/80 rounded-xl px-3 py-2 border border-gray-100 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-gray-500 mb-0.5">Exams</span>
          <span className="text-lg font-semibold text-gray-900">{examsCount}</span>
        </div>
        <div className="bg-white/80 rounded-xl px-3 py-2 border border-gray-100 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-gray-500 mb-0.5">Students</span>
          <span className="text-lg font-semibold text-gray-900">{studentsCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-dashed border-accent/20">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Active evaluations
        </span>
        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-accent hover:text-accent/80 font-medium"
        >
          <span className="text-xs">View details</span>
          <MoreVertical className="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userData, setUserData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const navigate = useNavigate();
  
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      console.log('User data:', data);
      
      if (data && data.data && data.data.name) {
        setUserData(data.data);
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('accessToken');
      navigate('/auth');
    } 
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        setIsLoadingSummary(true);
        setSummaryError(null);
        const res = await fetch(`${API_BASE_URL}/professors/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await res.json();
        setSummary(data?.data || null);
      } catch (err) {
        console.error('Error fetching summary', err);
        setSummaryError(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [navigate]);

  // Default user name if userData is not loaded yet
  const userName = userData?.name || 'Guest User';

  const statValues = {
    totalAnswerSheets: summary?.total_answer_sheets ?? 0,
    evaluatedToday: summary?.evaluated_today ?? 0,
    activeTAs: summary?.active_tas ?? 0,
    pendingReviews: summary?.pending_reviews ?? 0,
  };

  const evaluationCards = summary?.current_evaluations || [];
  const courseOverview = summary?.course_overview || [];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome {userName}!</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`relative transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-300"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Answer Sheets"
          value={isLoadingSummary ? '—' : statValues.totalAnswerSheets.toLocaleString()}
          icon={FileCheck}
          trend="up"
          trendValue="15.3"
        />
        <StatCard
          title="Evaluated Today"
          value={isLoadingSummary ? '—' : statValues.evaluatedToday.toLocaleString()}
          icon={CheckCircle}
          trend="up"
          trendValue="8.2"
        />
        <StatCard
          title="Active TAs"
          value={isLoadingSummary ? '—' : statValues.activeTAs.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="2.5"
        />
        <StatCard
          title="Pending Reviews"
          value={isLoadingSummary ? '—' : statValues.pendingReviews.toLocaleString()}
          icon={Clock}
          trend="down"
          trendValue="5.8"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Courses Overview</h2>
        </div>

        {summaryError && (
          <div className="text-red-500 text-sm mb-4">{summaryError}</div>
        )}

        {isLoadingSummary ? (
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {[1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="min-w-[260px] max-w-xs animate-pulse bg-gray-50 border border-gray-100 rounded-2xl h-40"
                />
              ))}
            </div>
          </div>
        ) : courseOverview.length === 0 ? (
          <div className="text-sm text-gray-500">No course data available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {courseOverview.map((course) => (
                <CourseOverviewCard
                  key={course.course_id}
                  courseId={course.course_id}
                  courseName={course.course_name}
                  examsCount={course.exams_count}
                  studentsCount={course.students_count}
                  onViewDetails={() => navigate(`/courses/${course.course_id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { 
              action: "Evaluation completed", 
              course: "Computer Programming Mid-Term", 
              time: "2 hours ago",
              detail: "512 answer sheets processed"
            },
            { 
              action: "New Golden Key uploaded", 
              course: "Data Structures Quiz 3", 
              time: "4 hours ago",
              detail: "Waiting for answer sheets"
            },
            { 
              action: "Results exported", 
              course: "Machine Learning Assignment 2", 
              time: "1 day ago",
              detail: "356 students evaluated"
            },
          ].map((activity, index) => (
            <div 
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.course}</p>
                <p className="text-xs text-gray-400">{activity.detail}</p>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;