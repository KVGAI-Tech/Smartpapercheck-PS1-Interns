import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  ChevronRight,
  User,
} from "lucide-react";
import axios from "axios";
import { loginUser, signupUser } from "./auth";

const ParticleAnimation = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-green-400/30"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const StudentLogin = ({ onBack, onLoginSuccess, isStudent = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const formFieldVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" },
    blur: { scale: 1, boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = () => {
    if (isSignUp) {
      return (
        formData.fullName &&
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        validateEmail(formData.email) &&
        formData.password === formData.confirmPassword
      );
    }
    return formData.email && formData.password && validateEmail(formData.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        return await signupUser(
          formData.fullName,
          formData.email,
          formData.password,
          isStudent
        );
      }
      return await loginUser(formData.email, formData.password, isStudent);
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
      <ParticleAnimation />

      <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-green-500/10 blur-xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-xl"></div>

      <div className="relative z-10">
        <div className="mb-6">
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-green-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:mr-3 transition-all" />
            <span className="text-sm font-medium">Back to role selection</span>
          </motion.button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-900"
          >
            {isSignUp ? "Student Sign Up" : "Student Login"}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20"
          >
            <BookOpen className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`text-lg font-medium ${
              !isSignUp
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`text-lg font-medium ${
              isSignUp
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.0 }}
              className="space-y-1.5"
            >
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <motion.div
                className="relative"
                variants={formFieldVariants}
                animate={currentFocus === "fullName" ? "focus" : "blur"}
              >
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onFocus={() => setCurrentFocus("fullName")}
                  onBlur={() => setCurrentFocus(null)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900"
                  placeholder="Enter your full name"
                />
              </motion.div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-1.5"
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <motion.div
              className="relative"
              variants={formFieldVariants}
              animate={currentFocus === "email" ? "focus" : "blur"}
            >
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setCurrentFocus("email")}
                onBlur={() => setCurrentFocus(null)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900"
                placeholder="Enter your email"
              />
            </motion.div>
          </motion.div>

          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="space-y-1.5"
            >
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <motion.div
                className="relative"
                variants={formFieldVariants}
                animate={currentFocus === "confirmPassword" ? "focus" : "blur"}
              >
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setCurrentFocus("confirmPassword")}
                  onBlur={() => setCurrentFocus(null)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900"
                  placeholder="Confirm your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-1.5"
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <motion.div
              className="relative"
              variants={formFieldVariants}
              animate={currentFocus === "password" ? "focus" : "blur"}
            >
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setCurrentFocus("password")}
                onBlur={() => setCurrentFocus(null)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900"
                placeholder="Enter your password"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex justify-end"
          >
            <button
              type="button"
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              Forgot Password?
            </button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{
              scale: 1.02,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!isFormValid() || isLoading}
            className={`w-full py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 
              ${
                isFormValid() && !isLoading
                  ? "hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                  : "opacity-70 cursor-not-allowed"
              }
              flex items-center justify-center transition-all duration-300`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <span className="flex items-center">
                {isSignUp ? "Sign Up for Account" : "Login to Account"}
                <ChevronRight className="ml-2 w-5 h-5" />
              </span>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
