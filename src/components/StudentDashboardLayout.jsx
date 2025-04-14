import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../BaseURL";
import { useAuth } from "./AuthContext";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  History,
  LogOut,
  Bell,
  AlertCircle
} from "lucide-react";

const StudentDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const role = localStorage.getItem("userRole");

        if (!token || role !== "student") {
          throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/students/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired");
          }
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.code !== 200 || !result.data) {
          throw new Error("Invalid response format");
        }

        setUserData(result.data);
      } catch (err) {
        setError(err.message);
        if (
          err.message.includes("Authentication") ||
          err.message.includes("expired") ||
          err.message.includes("401")
        ) {
          setTimeout(() => {
            logout();
          }, 1500);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [logout]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      navigate("/auth");
    } catch (err) {
      navigate("/auth");
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      to: "/student-dashboard",
      description: "Overview of your evaluations",
    },
    {
      icon: FileText,
      label: "My Evaluations",
      to: "/student/evaluations",
      description: "View your evaluated assignments",
    },
    {
      icon: History,
      label: "Recheck History",
      to: "/student/recheck-history",
      description: "Track your recheck requests",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-md w-full">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Authentication Error</h3>
          </div>
          <p>{error}</p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const getUserInitial = () => {
    if (!userData || !userData.user_name) return "S";
    return userData.user_name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300
          ${isSidebarOpen ? "w-64" : "w-20"} 
          bg-white border-r border-gray-100 shadow-lg
          ${
            isMobile
              ? isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center h-16 px-4 border-b border-gray-100
            ${isSidebarOpen ? "justify-between" : "justify-center"}`}
          >
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isSidebarOpen ? "w-40" : "w-0"
              }`}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                Smart QnA
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-green-50 group"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
              )}
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-300 relative group
                  ${
                    isActive(item.to)
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.to) ? "text-green-600" : "text-gray-400"
                  }`}
                />

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isSidebarOpen ? "w-40 ml-3" : "w-0"
                  }`}
                >
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </div>

                {!isSidebarOpen && hoveredItem === item.label && (
                  <div className="absolute left-14 bg-white px-3 py-2 rounded-md shadow-lg border border-gray-100 z-50 min-w-[200px]">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                )}

                {isActive(item.to) && (
                  <span className="absolute inset-y-0 left-0 w-1 bg-green-600 rounded-r-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="px-3 pb-4 space-y-2">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg cursor-pointer
                transition-all duration-300 text-gray-600 hover:bg-red-50 hover:text-red-600`}
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isSidebarOpen ? "w-40 ml-3" : "w-0"
                }`}
              >
                <span className="text-sm font-medium">Exit Dashboard</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`flex-1 transition-all duration-300
        ${isSidebarOpen ? "md:ml-64" : "md:ml-20"} ${isMobile ? "ml-0" : ""}`}
      >
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-50"
                >
                  <Menu className="w-5 h-5 text-gray-500" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-800">
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-50 relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">{getUserInitial()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {userData?.user_name || "Student"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;