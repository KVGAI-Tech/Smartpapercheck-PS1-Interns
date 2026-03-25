import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../BaseURL';
import ForgotPasswordModal from './ForgotPasswordModal';

const MinimalBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-white"></div>
      <div className="absolute inset-0 bg-accent/5"></div>
    </div>
  );
});

const TabNavigation = React.memo(({ activeTab, setActiveTab }) => {
  const handleLoginClick = useCallback(() => setActiveTab('login'), [setActiveTab]);
  const handleSignupClick = useCallback(() => setActiveTab('signup'), [setActiveTab]);

  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={handleLoginClick}
        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
          activeTab === 'login' 
            ? 'text-accent border-b-2 border-accent -mb-px' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Login
      </button>
      <button
        onClick={handleSignupClick}
        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
          activeTab === 'signup' 
            ? 'text-accent border-b-2 border-accent -mb-px' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Create Account
      </button>
    </div>
  );
});

const PasswordRequirements = React.memo(({ password }) => {
  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  return (
    <div className="bg-accent/10 p-3 rounded-lg text-sm">
      <div className="flex items-center mb-1">
        <CheckCircle className="text-accent h-4 w-4 mr-1.5" />
        <span className="font-medium text-accent">Password Requirements</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-1">
        <div className="flex items-center">
          <div className={`h-1.5 w-1.5 rounded-full ${passwordChecks.minLength ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
          <span className={`text-xs ${passwordChecks.minLength ? 'text-green-600' : 'text-red-500'}`}>At least 8 characters</span>
        </div>
        <div className="flex items-center">
          <div className={`h-1.5 w-1.5 rounded-full ${passwordChecks.hasUppercase ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
          <span className={`text-xs ${passwordChecks.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>One uppercase letter</span>
        </div>
        <div className="flex items-center">
          <div className={`h-1.5 w-1.5 rounded-full ${passwordChecks.hasLowercase ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
          <span className={`text-xs ${passwordChecks.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>One lowercase letter</span>
        </div>
        <div className="flex items-center">
          <div className={`h-1.5 w-1.5 rounded-full ${passwordChecks.hasNumber ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
          <span className={`text-xs ${passwordChecks.hasNumber ? 'text-green-600' : 'text-red-500'}`}>One number</span>
        </div>
        <div className="flex items-center">
          <div className={`h-1.5 w-1.5 rounded-full ${passwordChecks.hasSymbol ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
          <span className={`text-xs ${passwordChecks.hasSymbol ? 'text-green-600' : 'text-red-500'}`}>One special character</span>
        </div>
      </div>
    </div>
  );
});

const ProfessorLogin = ({ onBack, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const passwordChecks = useMemo(() => ({
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  }), [formData.password]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const toggleTermsAccepted = useCallback(() => {
    setTermsAccepted(prev => !prev);
  }, []);

  const validateEmail = useCallback((email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const isLoginFormValid = useMemo(() => {
    return formData.email && formData.password && validateEmail(formData.email);
  }, [formData.email, formData.password, validateEmail]);

  const isSignupFormValid = useMemo(() => {
    return formData.name && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           validateEmail(formData.email) && 
           passwordChecks.minLength &&
           passwordChecks.hasUppercase &&
           passwordChecks.hasLowercase &&
           passwordChecks.hasNumber &&
           formData.password === formData.confirmPassword &&
           termsAccepted;
  }, [
    formData.name, formData.email, formData.password, formData.confirmPassword,
    validateEmail, passwordChecks, termsAccepted
  ]);

  const handleOpenForgotPassword = useCallback(() => {
    setIsForgotPasswordOpen(true);
  }, []);

  const handleCloseForgotPassword = useCallback(() => {
    setIsForgotPasswordOpen(false);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (activeTab === 'login' && !isLoginFormValid) return;
    if (activeTab === 'signup' && !isSignupFormValid) return;

    setIsLoading(true);
    setError('');

    const getFriendlyError = (status, detail) => {
      if (detail?.includes('User role does not match')) {
        return 'You are not authorized to log in from this portal. Please use the correct login page.';
      }
      if (status === 401) return 'Incorrect email or password. Please try again.';
      if (status === 409) return 'An account with this email already exists.';
      if (status === 500) return 'Server error. Please try again later.';
      return detail || 'Something went wrong. Please try again.';
    };

    try {
      if (activeTab === 'login') {
        const response = await fetch(`${API_BASE_URL}/professors/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password 
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const friendlyMessage = getFriendlyError(response.status, data.message || data.detail);
          throw new Error(friendlyMessage);
        }

        if (data.code === 200 && data.data?.access_token) {
          const { access_token } = data.data;
          onLoginSuccess(access_token, 'professor');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/professors/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const friendlyMessage = getFriendlyError(response.status, data.message || data.detail);
          throw new Error(friendlyMessage);
        }

        if (data.code === 201) {
          const loginResponse = await fetch(`${API_BASE_URL}/professors/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: formData.email, 
              password: formData.password 
            }),
          });

          const loginData = await loginResponse.json().catch(() => ({}));

          if (!loginResponse.ok) {
            const friendlyMessage = getFriendlyError(loginResponse.status, loginData.message || loginData.detail);
            throw new Error(friendlyMessage);
          }

          if (loginData.code === 200 && loginData.data?.access_token) {
            const { access_token } = loginData.data;
            onLoginSuccess(access_token, 'professor');
          } else {
            throw new Error(loginData.message || 'Login failed after signup');
          }
        } else {
          throw new Error(data.message || 'Signup failed');
        }
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isLoginFormValid, isSignupFormValid, formData, onLoginSuccess]);

  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent transition-all text-gray-900"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent transition-all text-gray-900"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            onClick={handleOpenForgotPassword}
            className="text-sm font-medium text-accent hover:text-accent"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={!isLoginFormValid || isLoading}
          className={`w-full py-3 rounded-lg font-medium text-white bg-accent 
            ${isLoginFormValid && !isLoading ? 'hover:bg-accent' : 'opacity-70 cursor-not-allowed'}
            flex items-center justify-center transition-all duration-300`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Login to Account'
          )}
        </button>
      </form>
    </motion.div>
  );

  const renderSignupForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1 relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent transition-all text-gray-900"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent transition-all text-gray-900"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent transition-all text-gray-900"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent transition-all text-gray-900"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
          )}
        </div>

        <PasswordRequirements password={formData.password} />

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={toggleTermsAccepted}
              required
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-600">
              I agree to the <a href="#" className="text-accent hover:text-accent">Terms of Service</a> and <a href="#" className="text-accent hover:text-accent">Privacy Policy</a>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isSignupFormValid || isLoading}
          className={`w-full py-3 rounded-lg font-medium text-white bg-accent 
            ${isSignupFormValid && !isLoading ? 'hover:bg-accent' : 'opacity-70 cursor-not-allowed'}
            flex items-center justify-center gap-2 transition-all`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Create Account
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );

  return (
    <>
      <div className={`bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto border border-gray-200/50 relative overflow-hidden ${isForgotPasswordOpen ? 'filter blur-sm' : ''}`}>
        <MinimalBackground />
        
        <div className="relative z-10">
          <div className="mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-accent transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to role selection
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'login' ? 'Professor Login' : 'Create Professor Account'}
              </h2>
            </div>
          </div>

          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? renderLoginForm() : renderSignupForm()}
          </AnimatePresence>
        </div>
        
      </div>

      <AnimatePresence>
        {isForgotPasswordOpen && (
          <ForgotPasswordModal 
            isOpen={isForgotPasswordOpen}
            onClose={handleCloseForgotPassword}
            userType="professor"
          />
        )}
      </AnimatePresence>
    </>
  );
};


export default ProfessorLogin;