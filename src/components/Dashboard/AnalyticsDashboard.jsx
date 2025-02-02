import React, { useState, useCallback } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, Users, GraduationCap, ClipboardCheck, Award,
  Calendar, ArrowUp, ArrowDown, Filter, Clock, Target,
  BookOpen, UserCheck, ChevronRight, CheckCircle, AlertCircle,
  PieChart as PieChartIcon, BarChart2, Activity,
  TrendingDown, Plus, ChevronDown
} from 'lucide-react';
const GRADE_COLORS = {
    'A': '#16a34a',
    'A-': '#22c55e',
    'B+': '#4ade80',
    'B': '#86efac',
    'B-': '#bbf7d0',
    'C+': '#fde047',
    'C': '#facc15',
    'C-': '#eab308',
    'D': '#f87171',
    'E': '#ef4444',
    'NC': '#dc2626'
  };
  

const generateGradeDistribution = (total = 1500, skew = 'normal') => {
  const grades = [ 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E', 'NC'];
  const distributions = {
    high: [0.15, 0.20, 0.18, 0.15, 0.12, 0.08, 0.05, 0.03, 0.02, 0.01, 0.007, 0.003],
    normal: [0.08, 0.12, 0.15, 0.18, 0.15, 0.12, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01],
    low: [0.03, 0.05, 0.07, 0.10, 0.15, 0.18, 0.15, 0.12, 0.08, 0.05, 0.01, 0.01]
  };

  const colors = {
    'A': '#16a34a', 'A-': '#22c55e',
    'B+': '#4ade80', 'B': '#86efac', 'B-': '#bbf7d0',
    'C+': '#fde047', 'C': '#facc15', 'C-': '#eab308',
    'D': '#f87171', 'E': '#ef4444', 'NC': '#dc2626'
  };

  return grades.map((grade, index) => ({
    grade,
    students: Math.round(total * distributions[skew][index]),
    color: colors[grade]
  }));
};

const generatePerformanceData = (timeRange) => {
  const months = {
    '1M': 1, '3M': 3, '6M': 6, '1Y': 12
  }[timeRange];

  return Array.from({ length: months }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
    submissions: Math.floor(Math.random() * 200) + 300,
    evaluations: Math.floor(Math.random() * 180) + 280,
    average: Math.floor(Math.random() * 15) + 75,
    attendance: Math.floor(Math.random() * 10) + 85
  }));
};


const COURSES = {
  'CS F111': {
    name: 'Computer Programming',
    enrolled: 512,
    completed: 485,
    avgScore: '87.5%',
    attendance: '92%',
    skew: 'high'
  },
  'CS F212': {
    name: 'Data Structures',
    enrolled: 428,
    completed: 410,
    avgScore: '82.3%',
    attendance: '88%',
    skew: 'normal'
  },
  'CS F320': {
    name: 'Machine Learning',
    enrolled: 356,
    completed: 342,
    avgScore: '85.7%',
    attendance: '90%',
    skew: 'high'
  },
  'CS F342': {
    name: 'Operating Systems',
    enrolled: 298,
    completed: 285,
    avgScore: '83.1%',
    attendance: '86%',
    skew: 'normal'
  }
};

const LEARNING_OUTCOMES = [
  { name: 'Problem Solving', value: 88 },
  { name: 'Technical Skills', value: 92 },
  { name: 'Theoretical Knowledge', value: 85 },
  { name: 'Project Work', value: 90 },
  { name: 'Team Collaboration', value: 87 }
];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p 
            key={index} 
            className="text-sm flex items-center gap-2"
            style={{ color: entry.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span>{entry.name}: {entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-lg p-6">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {trend === 'up' ? '+' : '-'}{trendValue}%
            </span>
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const TimeRangeSelector = ({ selectedRange, onRangeChange }) => (
  <div className="flex bg-white rounded-lg shadow-sm">
    {['1M', '3M', '6M', '1Y'].map((range) => (
      <button
        key={range}
        onClick={() => onRangeChange(range)}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          selectedRange === range
            ? 'bg-blue-500 text-white rounded-lg'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        {range}
      </button>
    ))}
  </div>
);

const CourseCard = ({ course, codeId }) => {
  const gradeDistribution = generateGradeDistribution(course.enrolled, course.skew);
  
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500">{codeId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Enrolled Students</p>
          <p className="text-xl font-semibold">{course.enrolled}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-xl font-semibold">{course.completed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Average Score</p>
          <p className="text-xl font-semibold">{course.avgScore}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Attendance</p>
          <p className="text-xl font-semibold">{course.attendance}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={gradeDistribution}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="grade" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="students" 
              radius={[4, 4, 0, 0]}
            >
              {gradeDistribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('6M');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('All Metrics');
  const [selectedCourse, setSelectedCourse] = useState('all');

  
  const performanceData = React.useMemo(() => {
    const months = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12
    }[selectedTimeRange];
    
    return Array.from({ length: months }, (_, i) => ({
      month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
      submissions: Math.floor(Math.random() * 200) + 300,
      evaluations: Math.floor(Math.random() * 180) + 280,
      average: Math.floor(Math.random() * 15) + 75,
      attendance: Math.floor(Math.random() * 10) + 85
    }));
  }, [selectedTimeRange]);
  const defaultGradeDistribution = React.useMemo(() => 
    generateGradeDistribution(1500, 'normal'), 
    []
  );


  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Performance Trends</h2>
                  <p className="text-sm text-gray-500">Monthly evaluation metrics</p>
                </div>
                <select 
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  <option>All Metrics</option>
                  <option>Submissions</option>
                  <option>Evaluations</option>
                  <option>Average Score</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEvaluations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}${selectedMetric === 'Average Score' ? '%' : ''}`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#E5E7EB' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="submissions"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorSubmissions)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="evaluations"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorEvaluations)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>


            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Course Analytics</h2>
                  <p className="text-sm text-gray-500">Performance by course</p>
                </div>
                <select 
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {Object.keys(COURSES).map(code => (
                    <option key={code} value={code}>{COURSES[code].name}</option>
                  ))}
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={LEARNING_OUTCOMES}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Radar
                      name="Achievement"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Grade Distribution</h2>
                  <p className="text-sm text-gray-500">Student performance breakdown</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={generateGradeDistribution(
                      selectedCourse === 'all' 
                        ? 1500 
                        : COURSES[selectedCourse].enrolled,
                      selectedCourse === 'all'
                        ? 'normal'
                        : COURSES[selectedCourse].skew
                    )}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="grade" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="students" 
                      radius={[4, 4, 0, 0]}
                    >
                      {Object.values(GRADE_COLORS).map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Learning Outcomes</h2>
                  <p className="text-sm text-gray-500">Achievement metrics by skill category</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={LEARNING_OUTCOMES}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Radar
                      name="Achievement"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(COURSES).map(([code, course]) => (
              <CourseCard key={code} course={course} codeId={code} />
            ))}
          </div>
        );
      case 'students':
        return (
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Student Analytics</h2>
                <p className="text-sm text-gray-500">Overall performance metrics</p>
              </div>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Semesters</option>
                <option>Current Semester</option>
                <option>Previous Semester</option>
              </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    case 'students':
        return (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Student Performance Analytics</h2>
                  <p className="text-sm text-gray-500">Overall student metrics and trends</p>
                </div>
                <div className="flex space-x-3">
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">
                    <option>All Semesters</option>
                    <option>Current Semester</option>
                    <option>Previous Semester</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Grade Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="grade" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                          {gradeDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">GPA Statistics</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Average GPA', value: '3.42' },
                      { label: 'Median GPA', value: '3.50' },
                      { label: 'Highest GPA', value: '4.00' },
                      { label: 'Lowest GPA', value: '2.10' }
                    ].map((stat, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Comprehensive insights into your teaching metrics</p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-6 border-b border-gray-200 w-full">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'courses', label: 'Courses', icon: BookOpen },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'evaluations', label: 'Evaluations', icon: ClipboardCheck }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 pb-4 transition-colors ${
                    activeTab === id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <TimeRangeSelector 
                selectedRange={selectedTimeRange}
                onRangeChange={setSelectedTimeRange}
              />
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value="1,594"
            trend="up"
            trendValue="12.5"
            icon={Users}
            color="bg-blue-500"
            subtitle="Active enrollments"
          />
          <StatCard
            title="Average Score"
            value="84.2%"
            trend="up"
            trendValue="3.2"
            icon={Award}
            color="bg-green-500"
            subtitle="Across all courses"
          />
          <StatCard
            title="Completion Rate"
            value="92.8%"
            trend="down"
            trendValue="1.8"
            icon={CheckCircle}
            color="bg-purple-500"
            subtitle="Course completion"
          />
          <StatCard
            title="Active Courses"
            value="6"
            trend="up"
            trendValue="20.0"
            icon={BookOpen}
            color="bg-orange-500"
            subtitle="This semester"
          />
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;