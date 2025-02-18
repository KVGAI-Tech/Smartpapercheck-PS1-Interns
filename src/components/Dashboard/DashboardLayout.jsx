import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, ChevronLeft, ChevronRight, LayoutDashboard, 
  BookOpen, LineChart, GraduationCap, Users,
  Settings, LogOut
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch('http://43.205.184.7:8000/api/users/me', {
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
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/auth');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: BookOpen, label: 'Courses', to: '/courses' },
    { icon: LineChart, label: 'Analytics', to: '/analytics' },
    { icon: GraduationCap, label: 'Grade Management', to: '/grades' },
    { 
      icon: Users, 
      label: 'Manage', 
      to: '/manage', 
      subItems: [
        { label: 'Students', to: '/manage/students' },
        { label: 'Teaching assistants', to: '/manage/tas' }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname === path;
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-500 ease-in-out 
          ${isSidebarOpen ? 'w-72' : 'w-20'} 
          bg-white border-r border-gray-100 shadow-lg transform
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center h-16 px-4 border-b border-gray-100 transition-all duration-500
            ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'w-40' : 'w-0'}`}>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                Smart QnA
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-blue-50 group transition-all duration-300 flex-shrink-0"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transform transition-transform group-hover:scale-110" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transform transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  to={item.to}
                  className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer
                    transition-all duration-300 ease-in-out relative overflow-hidden
                    ${isActive(item.to) ? 
                      'bg-blue-50 text-blue-600' : 
                      'text-gray-600 hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <item.icon className={`w-5 h-5 transition-all duration-300 transform group-hover:scale-110
                    ${isActive(item.to) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} 
                  />
                  <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'w-40 ml-3' : 'w-0'}`}>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                  {!isSidebarOpen && hoveredItem === item.label && (
                    <div className="absolute left-14 bg-white px-2 py-1 rounded-md shadow-lg border border-gray-100
                      transition-all duration-300 z-50">
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    </div>
                  )}
                  {isActive(item.to) && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                </Link>
                {isSidebarOpen && item.subItems && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.to}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg
                          transition-all duration-300 group
                          ${isActive(subItem.to) ?
                            'text-blue-600 bg-blue-50' :
                            'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all duration-300 transform group-hover:scale-110
                          ${isActive(subItem.to) ? 'bg-blue-400' : 'bg-gray-300 group-hover:bg-blue-400'}`} />
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg cursor-pointer
                transition-all duration-300 ease-in-out relative overflow-hidden
                text-gray-600 hover:bg-red-50 hover:text-red-600 group`}
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-all duration-300 transform group-hover:scale-110" />
              <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'w-40 ml-3' : 'w-0'}`}>
                <span className="text-sm font-medium whitespace-nowrap">Logout</span>
              </div>
              {!isSidebarOpen && (
                <div className="absolute left-14 bg-white px-2 py-1 rounded-md shadow-lg border border-gray-100
                  opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-sm font-medium whitespace-nowrap">Logout</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-500 ease-in-out relative
        ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'} ${isMobile ? 'ml-0' : ''}`}>
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <Menu className="w-5 h-5 text-gray-500 transform transition-transform hover:scale-110" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => isActive(item.to))?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/settings"
                className="p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 hidden sm:block"
              >
                <Settings className="w-5 h-5 text-gray-500 transform transition-transform hover:scale-110" />
              </Link>
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
              <div className="flex items-center space-x-3">
                <div className="relative hidden sm:block">
                  <img
                    src="/api/placeholder/32/32"
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {userData?.name || 'Guest User'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;