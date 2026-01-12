import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../BaseURL";
import Breadcrumbs from "../ui/breadcrumbs";
// import PaymentModal from "../Payments/PaymentModal"; // Temporarily disabled credits UI

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadJobs, setUnreadJobs] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      console.log("User data:", data);

      if (data && data.data && data.data.name) {
        setUserData(data.data);
      } else {
        throw new Error("Invalid user data format");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("accessToken");
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    // Open a WebSocket for professor notifications when logged in
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const wsBase = API_BASE_URL.replace(/^http/, "ws");
      const ws = new WebSocket(`${wsBase}/exams/ws/professor/notifications?token=${encodeURIComponent(token)}`);

      ws.onopen = () => {
        console.log("Notifications WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Notifications WS message", data);
          if (data.event === "job_update" && data.job) {
            setUnreadJobs((prev) => prev + 1);
            setRecentJobs((prev) => {
              const next = [data.job, ...prev];
              // Keep only a small number of recent notifications in the dropdown
              return next.slice(0, 5);
            });
          }
        } catch (e) {
          console.error("Failed to parse notifications WS message", e);
        }
      };

      ws.onerror = (e) => {
        console.error("Notifications WebSocket error", e);
      };

      return () => {
        ws.close();
      };
    } catch (e) {
      console.error("Failed to open notifications WebSocket", e);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("accessToken");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/auth");
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: BookOpen, label: "Courses", to: "/courses" },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === path || location.pathname === "/";
    }
    return location.pathname === path;
  };

  const getPageHeader = () => {
    const path = location.pathname || "";
    const state = location.state || {};

    // Defaults
    let title = "";
    let subtitle = "";
    let breadcrumbItems = [];

    if (path === "/" || path.startsWith("/dashboard")) {
      title = "Dashboard";
      breadcrumbItems = [{ label: "Dashboard" }];
    } else if (path.includes("/evaluations")) {
      title = state.examName || "Exam Evaluations";
      subtitle = state.examSubtitle || "";
      breadcrumbItems = [
        { label: "Courses", to: "/courses" },
        { label: state.courseName || "Course" },
      ];
    } else if (path.startsWith("/courses")) {
      if (/^\/courses\//.test(path)) {
        // Course details or nested exam pages
        title = state.courseName || "Course";
        subtitle = state.courseCode || "";
        breadcrumbItems = [
          { label: "Courses", to: "/courses" },
          { label: title },
        ];
      } else {
        title = "Courses";
        breadcrumbItems = [{ label: "Courses" }];
      }
    }

    return { title, subtitle, breadcrumbItems };
  };

  const { title: pageTitle, subtitle: pageSubtitle, breadcrumbItems } =
    getPageHeader();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out 
          ${isSidebarOpen ? "w-64" : "w-16"} 
          bg-white border-r border-gray-100 shadow-lg 
          ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"} 
          md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center h-16 px-4 border-b border-gray-100 transition-all duration-500
            ${isSidebarOpen ? "justify-between" : "justify-center"}`}
          >
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isSidebarOpen ? "w-40" : "w-0"
              }`}
            >
              <h1 className="text-xl font-bold text-accent whitespace-nowrap">
                Smart QnA
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="p-2 rounded-lg hover:bg-accent/10 group transition-all duration-300 flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-500 group-hover:text-accent transform transition-transform group-hover:scale-110" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  to={item.to}
                  className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer
                    transition-all duration-300 ease-in-out relative overflow-hidden
                    ${
                      isActive(item.to)
                        ? "bg-accent/10 text-accent"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={handleNavClick}
                >
                  <item.icon
                    className={`w-5 h-5 transition-all duration-300 transform group-hover:scale-110
                    ${
                      isActive(item.to)
                        ? "text-accent"
                        : "text-gray-400 group-hover:text-accent"
                    }`}
                  />
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isSidebarOpen ? "w-40 ml-3" : "w-0"
                    }`}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                  {!isSidebarOpen && hoveredItem === item.label && (
                    <div
                      className="absolute left-12 bg-white px-2 py-1 rounded-md shadow-lg border border-gray-100
                      transition-all duration-300 z-50"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  )}
                  {isActive(item.to) && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-accent rounded-r-full" />
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
                          ${
                            isActive(subItem.to)
                              ? "text-accent bg-accent/10"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        onClick={handleNavClick}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-3 transition-all duration-300 transform group-hover:scale-110
                          ${
                            isActive(subItem.to)
                              ? "bg-accent"
                              : "bg-gray-300 group-hover:bg-accent"
                          }`}
                        />
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
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  isSidebarOpen ? "w-40 ml-3" : "w-0"
                }`}
              >
                <span className="text-sm font-medium whitespace-nowrap">
                  Logout
                </span>
              </div>
              {!isSidebarOpen && (
                <div
                  className="absolute left-12 bg-white px-2 py-1 rounded-md shadow-lg border border-gray-100
                  opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <span className="text-sm font-medium whitespace-nowrap">
                    Logout
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out relative
        ${isSidebarOpen ? "md:ml-64" : "md:ml-16"} ml-0`}
      >
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3 min-w-0">
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  className="p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <Menu className="w-5 h-5 text-gray-500 transform transition-transform hover:scale-110" />
                </button>
              )}
              {pageTitle && (
                <div className="flex flex-col gap-0.5 leading-tight truncate max-w-[220px] md:max-w-xs">
                  <span className="text-base md:text-lg font-semibold text-gray-900 truncate">
                    {pageTitle}
                  </span>
                  {pageSubtitle && (
                    <span className="text-xs md:text-sm text-gray-500 truncate">
                      {pageSubtitle}
                    </span>
                  )}
                  <Breadcrumbs items={breadcrumbItems} />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/** Available Credits / Buy Credits temporarily disabled */}
              {/* <PaymentModal /> */}
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen((open) => !open)}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-500" />
                    {unreadJobs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                        {unreadJobs}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40 text-sm">
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-medium text-gray-800">Notifications</span>
                        {unreadJobs > 0 && (
                          <span className="text-xs text-gray-500">{unreadJobs} new</span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {recentJobs.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-500">
                            Background exam processing updates will appear here.
                          </div>
                        ) : (
                          recentJobs.map((job) => (
                            <div
                              key={job.id}
                              className="px-3 py-2 border-b border-gray-100 last:border-b-0 text-xs text-gray-700"
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-medium text-gray-800 truncate">
                                  Exam #{job.exam_id}
                                </span>
                                <span
                                  className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                    job.status === "completed"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : job.status === "failed"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  {job.status || "pending"}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-500">
                                Processed {job.summary?.total_processed ?? 0} · Failed {job.summary?.total_failed ?? 0}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-xs text-accent hover:bg-accent/5 border-t border-gray-100"
                        onClick={() => {
                          setUnreadJobs(0);
                          setIsNotificationsOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full border border-gray-200 bg-accent text-white flex items-center justify-center font-medium text-sm">
                    {userData?.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "G"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {userData?.name || "Guest User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] bg-white p-4 md:p-6 min-w-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
