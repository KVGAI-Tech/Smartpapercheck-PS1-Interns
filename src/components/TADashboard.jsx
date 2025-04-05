import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText,
  Search,
  Bell,
  User,
  Download,
  ExternalLink,
  Users,
  Zap,
  ChevronRight,
  BarChart
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const StatCard = ({ title, value, icon: Icon, className, change }) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        {change && (
          <p className={`text-xs font-medium ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {change.type === 'increase' ? '↑' : '↓'} {change.value}% from last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${className || 'bg-purple-50'}`}>
        <Icon className={`w-6 h-6 ${className ? 'text-white' : 'text-purple-600'}`} />
      </div>
    </div>
  </motion.div>
);

const GradingTask = ({ course, assignment, deadline, studentsCount, completedCount, delay = 0 }) => {
  const percentComplete = (completedCount / studentsCount) * 100;
  
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay }}
      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{assignment}</h3>
        <div className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
          {course}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Grading Progress</span>
          <span className="font-medium text-purple-600">{percentComplete.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className="bg-purple-500 h-2.5 rounded-full"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Users className="w-4 h-4" />
          <span>{completedCount}/{studentsCount} students</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{deadline}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">Last updated: 2 hours ago</span>
        <button className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium flex items-center gap-1">
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const StudentQuery = ({ student, course, question, time, status, delay = 0 }) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.3, delay }}
    className="flex items-start justify-between p-4 border-b border-gray-100 last:border-0"
  >
    <div className="flex items-start gap-3">
      <div className="mt-1 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{student}</h4>
        <p className="text-sm text-gray-500 mb-1">{course}</p>
        <p className="text-sm text-gray-700">{question}</p>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
        status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
        status === 'Resolved' ? 'bg-green-100 text-green-800' : 
        'bg-blue-100 text-blue-800'
      }`}>{status}</span>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </motion.div>
);

const TADashboard = () => {
  const [searchFocused, setSearchFocused] = useState(false);

  const gradingTasks = [
    {
      course: "CS F111",
      assignment: "Programming Assignment 3",
      deadline: "2 days left",
      studentsCount: 45,
      completedCount: 28
    },
    {
      course: "CS F212",
      assignment: "Data Structures Mid-Term",
      deadline: "Due today",
      studentsCount: 38,
      completedCount: 35
    },
    {
      course: "CS F320",
      assignment: "Neural Networks Quiz",
      deadline: "5 days left",
      studentsCount: 41,
      completedCount: 12
    }
  ];

  const studentQueries = [
    {
      student: "Alice Johnson",
      course: "CS F111",
      question: "Could you clarify the requirements for Q3 in the assignment?",
      time: "10 min ago",
      status: "Pending"
    },
    {
      student: "Bob Smith",
      course: "CS F212",
      question: "I'm getting a stack overflow error in my recursive solution",
      time: "1 hour ago",
      status: "In Progress"
    },
    {
      student: "Carol Davis",
      course: "CS F111",
      question: "Is it necessary to implement error handling in the functions?",
      time: "Yesterday",
      status: "Resolved"
    },
    {
      student: "David Wilson",
      course: "CS F320",
      question: "Can we use external libraries for the matrix operations?",
      time: "Yesterday",
      status: "Resolved"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TA Dashboard</h1>
          <p className="text-gray-500">Manage grading, student queries, and course materials</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`relative transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-50 transition-all duration-300"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="relative">
            <button className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assigned Courses"
          value="3"
          icon={BookOpen}
          className="bg-purple-500"
        />
        <StatCard
          title="Grading Tasks"
          value="7"
          icon={FileText}
          className="bg-blue-500"
          change={{ type: 'increase', value: 2 }}
        />
        <StatCard
          title="Students Supported"
          value="124"
          icon={Users}
          className="bg-green-500"
        />
        <StatCard
          title="Open Queries"
          value="6"
          icon={Zap}
          className="bg-orange-500"
          change={{ type: 'decrease', value: 4 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Current Grading Tasks</h2>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
                View All <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradingTasks.map((task, index) => (
                <GradingTask 
                  key={index} 
                  {...task}
                  delay={0.1 * (index + 1)}
                />
              ))}
            </div>
          </div>
          
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Grading Analytics</h2>
              <select className="text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>This Week</option>
                <option>This Month</option>
                <option>This Semester</option>
              </select>
            </div>
            
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-center">
                <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Analytics visualization would go here</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Student Queries</h2>
            <div className="flex gap-1">
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                2 New
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {studentQueries.map((query, index) => (
              <StudentQuery 
                key={index} 
                {...query}
                delay={0.1 * (index + 1)}
              />
            ))}
          </div>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 w-full py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>View All Queries</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>

      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Office Hours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              day: "Monday", 
              date: "Oct 15",
              time: "2:00 PM - 4:00 PM",
              location: "Lab 3B",
              course: "CS F111"
            },
            { 
              day: "Wednesday", 
              date: "Oct 17",
              time: "10:00 AM - 12:00 PM",
              location: "Online",
              course: "CS F212"
            },
            { 
              day: "Friday", 
              date: "Oct 19",
              time: "3:00 PM - 5:00 PM",
              location: "Lab 2A",
              course: "CS F320"
            }
          ].map((session, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              className="bg-gradient-to-br from-purple-50 to-gray-50 rounded-lg p-4 border border-purple-100"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-medium text-purple-700">{session.day}</div>
                <div className="text-sm text-gray-500">{session.date}</div>
              </div>
              <div className="text-gray-800 mb-1">{session.time}</div>
              <div className="text-sm text-gray-600 mb-2">{session.location}</div>
              <div className="px-2 py-1 bg-white text-purple-600 text-xs font-medium rounded-full inline-block">
                {session.course}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TADashboard;
