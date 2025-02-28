import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  BookOpen, 
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  FileCheck,
  Search,
  Bell,
  Plus,
  MoreVertical,
  Filter,
  Download,
  Upload
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, className }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
        {trend && (
          <p className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}% from last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${className || 'bg-blue-50'}`}>
        <Icon className={`w-6 h-6 ${className ? 'text-white' : 'text-blue-500'}`} />
      </div>
    </div>
  </div>
);

const EvaluationCard = ({ course, total, evaluated, timeLeft }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileCheck className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{course}</h4>
          <p className="text-sm text-gray-500">{total} Answer Sheets</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
    
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Evaluation Progress</span>
          <span className="font-medium text-blue-600">{Math.round((evaluated/total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(evaluated/total) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          {timeLeft} remaining
        </span>
        <span className="text-gray-500">{evaluated}/{total} checked</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch('http://api.whyujjwal.com/api/users/me', {
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

  // Default user name if userData is not loaded yet
  const userName = userData?.name || 'Guest User';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome {userName}!</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`relative transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all duration-300"
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
          value="2,845"
          icon={FileCheck}
          trend="up"
          trendValue="15.3"
          className="bg-blue-500"
        />
        <StatCard
          title="Evaluated Today"
          value="486"
          icon={CheckCircle}
          trend="up"
          trendValue="8.2"
          className="bg-green-500"
        />
        <StatCard
          title="Active TAs"
          value="12"
          icon={Users}
          trend="up"
          trendValue="2.5"
          className="bg-purple-500"
        />
        <StatCard
          title="Pending Reviews"
          value="24"
          icon={Clock}
          trend="down"
          trendValue="5.8"
          className="bg-orange-500"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Current Evaluations</h2>
          <button className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EvaluationCard 
            course="Computer Programming (CS F111)"
            total={512}
            evaluated={384}
            timeLeft="2 days"
          />
          <EvaluationCard 
            course="Data Structures (CS F212)"
            total={428}
            evaluated={257}
            timeLeft="3 days"
          />
          <EvaluationCard 
            course="Machine Learning (CS F320)"
            total={356}
            evaluated={142}
            timeLeft="5 days"
          />
        </div>
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