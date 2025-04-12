import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProfessorLogin from "./ProfessorLogin";
import StudentLogin from "./StudentLogin";
import TALogin from "./TALogin";
import { useAuth } from "./AuthContext";

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30"></div>

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${
              i % 3 === 0
                ? "rgba(79, 70, 229, 0.8)"
                : i % 3 === 1
                ? "rgba(147, 51, 234, 0.8)"
                : "rgba(59, 130, 246, 0.8)"
            }, transparent)`,
            width: `${Math.random() * 30 + 15}rem`,
            height: `${Math.random() * 30 + 15}rem`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIG9wYWNpdHk9IjAuMDYiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIwIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
    </div>
  );
};

const FloatingShapes = () => {
  const shapes = [
    {
      type: "rect",
      className:
        "w-8 h-8 rounded-lg bg-blue-400/30 backdrop-blur-sm border border-blue-400/50",
      animate: {
        y: [-10, 10, -10],
        rotate: [0, 10, 0],
        scale: [1, 1.05, 1],
      },
    },
    {
      type: "circle",
      className:
        "w-10 h-10 rounded-full bg-purple-400/30 backdrop-blur-sm border border-purple-400/50",
      animate: {
        y: [10, -10, 10],
        x: [-5, 5, -5],
        scale: [1, 1.1, 1],
      },
    },
    {
      type: "triangle",
      className:
        "w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-green-400/50",
      animate: {
        y: [0, -15, 0],
        rotate: [0, -10, 0],
        scale: [1, 0.9, 1],
      },
    },
    {
      type: "rect",
      className:
        "w-6 h-14 rounded-lg bg-indigo-400/30 backdrop-blur-sm border border-indigo-400/50",
      animate: {
        x: [-8, 8, -8],
        rotate: [0, -5, 0],
        scale: [1, 1.08, 1],
      },
    },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 -z-5 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.className}`}
          style={{
            top: `${15 + index * 20}%`,
            left: index % 2 === 0 ? "10%" : "85%",
          }}
          animate={shape.animate}
          transition={{
            duration: 4 + index,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {shapes.map((shape, index) => (
        <motion.div
          key={`right-${index}`}
          className={`absolute ${shape.className}`}
          style={{
            top: `${25 + index * 15}%`,
            right: index % 2 === 0 ? "18%" : "5%",
          }}
          animate={shape.animate}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        />
      ))}
    </div>
  );
};

const RoleSelector = ({ selectedRole, onRoleSelect }) => {
  const [hoveredRole, setHoveredRole] = useState(null);

  const roles = [
    {
      id: "professor",
      name: "Professor",
      color: "from-blue-600 to-indigo-700",
      hoverColor: "hover:from-blue-700 hover:to-indigo-800",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      description:
        "Create exams, manage courses, and evaluate student performance",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
          <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
          <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
        </svg>
      ),
    },
    {
      id: "student",
      name: "Student",
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      description: "Take exams, submit assignments, and track your progress",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
          <path
            fillRule="evenodd"
            d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z"
            clipRule="evenodd"
          />
          <path d="M12 7.875a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
        </svg>
      ),
    },
    {
      id: "ta",
      name: "Teaching Assistant",
      color: "from-purple-500 to-fuchsia-600",
      hoverColor: "hover:from-purple-600 hover:to-fuchsia-700",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-500",
      description: "Assist professors and help students with their queries",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-200/50">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
        Choose Your Role
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Select the role that best describes you
      </p>

      <div className="space-y-5">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden
              ${
                selectedRole === role.id
                  ? `${role.borderColor} ${role.bgColor}`
                  : "border-gray-200 hover:border-gray-300 bg-white/80"
              }
            `}
          >
            {(hoveredRole === role.id || selectedRole === role.id) && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${role.color} opacity-0`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            <div
              className={`p-3 rounded-xl flex items-center justify-center
              ${
                selectedRole === role.id
                  ? `bg-gradient-to-br ${role.color} text-white`
                  : `bg-gray-100/80 ${role.textColor}`
              }`}
            >
              {role.icon}
            </div>

            <div className="flex-1 text-left z-10">
              <h3 className="font-medium text-gray-900">{role.name}</h3>
              <p className="text-sm text-gray-500">{role.description}</p>
            </div>

            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${
                selectedRole === role.id ? role.borderColor : "border-gray-300"
              }`}
            >
              {selectedRole === role.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-3 h-3 rounded-full ${role.textColor.replace(
                    "text",
                    "bg"
                  )}`}
                />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            whileTap={{ scale: 0.98 }}
            className={`px-10 py-3.5 rounded-xl font-medium bg-gradient-to-r 
              ${roles.find((r) => r.id === selectedRole)?.color}
              ${roles.find((r) => r.id === selectedRole)?.hoverColor}
              text-white shadow-lg shadow-current/20`}
            onClick={() => onRoleSelect(selectedRole, true)}
          >
            Continue as {roles.find((r) => r.id === selectedRole)?.name}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

const RoleAuth = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState("select-role");
  const navigate = useNavigate();
  const { login } = useAuth();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const handleRoleSelect = (role, confirmed = false) => {
    setSelectedRole(role);
    if (confirmed) {
      setStep("login");
    }
  };

  const handleBackToRoles = () => {
    setStep("select-role");
  };

  const handleLoginSuccess = (token, role) => {
    login(token, role);

    switch (role) {
      case "professor":
        navigate("/dashboard", { replace: true });
        break;
      case "student":
        navigate("/student-dashboard", { replace: true });
        break;
      case "ta":
        navigate("/ta-dashboard", { replace: true });
        break;
      default:
        navigate("/dashboard", { replace: true });
    }
  };

  const renderLoginForm = () => {
    switch (selectedRole) {
      case "professor":
        return (
          <ProfessorLogin
            onBack={handleBackToRoles}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "student":
        return (
          <StudentLogin
            onBack={handleBackToRoles}
            onLoginSuccess={handleLoginSuccess}
            isStudent={true}
          />
        );
      case "ta":
        return (
          <TALogin
            onBack={handleBackToRoles}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10 relative">
      <AnimatedBackground />
      <FloatingShapes />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-1.5 border border-white/30"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 font-medium">
              Next-Gen Evaluation Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 drop-shadow-sm"
          >
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart QnA
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-600 text-lg max-w-xl mx-auto"
          >
            AI-powered script evaluation for universities and educational
            institutions
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          >
            {step === "select-role" ? (
              <RoleSelector
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
              />
            ) : (
              renderLoginForm()
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>© 2025 Smart QnA. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleAuth;
