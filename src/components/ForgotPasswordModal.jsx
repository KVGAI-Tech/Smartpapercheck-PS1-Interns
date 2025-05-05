import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../BaseURL';

const ForgotPasswordModal = ({ isOpen, onClose, userType }) => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  const themeColors = userType === 'professor' 
    ? {
        primary: 'blue-600',
        primaryHover: 'blue-700',
        primaryLight: 'blue-100',
        secondary: 'indigo-600',
        focus: 'ring-blue-500 focus:border-blue-500',
        success: 'green-500',
        successText: 'green-600'
      }
    : {
        primary: 'green-600',
        primaryHover: 'green-700',
        primaryLight: 'green-100',
        secondary: 'emerald-600',
        focus: 'ring-green-500 focus:border-green-500',
        success: 'green-500',
        successText: 'green-600'
      };

  const resetForm = useCallback(() => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setOtpTimer(0);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const validateEmail = useCallback((email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const validatePassword = useCallback((password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return {
      isValid: hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isLongEnough,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      isLongEnough
    };
  }, []);

  const startOtpTimer = useCallback(() => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email
        }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        setStep(2);
        startOtpTimer();
      } else {
        throw new Error(data.message || 'Failed to send reset instructions');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail, startOtpTimer]);

  const handleResendOtp = useCallback(async () => {
    if (otpTimer > 0) return;
    await handleSendOtp();
  }, [otpTimer, handleSendOtp]);

  const handleVerifyOtp = useCallback(() => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    setError('');
    setStep(3);
    
  }, [otp]);

  const handleResetPassword = useCallback(async () => {
    const passwordValidation = validatePassword(newPassword);
    
    if (!passwordValidation.isValid) {
      setError('Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otp_code: otp,
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        setStep(4);
      } else {
        throw new Error(data.message || 'Failed to reset password. Please check your verification code and try again.');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, newPassword, confirmPassword, validatePassword]);

  const renderEmailStep = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-gray-800">Reset Your Password</h3>
      <p className="text-gray-600 text-sm">
        Enter your email address and we'll send you a verification code to reset your password.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:${themeColors.focus} transition-all text-gray-900`}
            placeholder="Enter your email"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSendOtp}
          disabled={!validateEmail(email) || isLoading}
          className={`px-6 py-2 rounded-lg font-medium text-white bg-${themeColors.primary} hover:bg-${themeColors.primaryHover} ${!validateEmail(email) || isLoading ? 'opacity-70 cursor-not-allowed' : ''} transition-colors`}
        >
          {isLoading ? (
            <>
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            </>
          ) : (
            'Send Verification Code'
          )}
        </button>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-5">
      <div className="flex items-center mb-2">
        <button
          onClick={() => setStep(1)}
          className="p-1 mr-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-semibold text-gray-800">Enter Verification Code</h3>
      </div>
      
      <p className="text-gray-600 text-sm">
        We've sent a 6-digit verification code to <span className="font-medium">{email}</span>. 
        The code will expire in 10 minutes.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-1.5">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
        <input
          id="otp"
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setOtp(value);
          }}
          className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:${themeColors.focus} transition-all text-gray-900 tracking-wider text-center font-mono text-lg`}
          placeholder="000000"
        />
      </div>
      
      <div className="flex items-center justify-center text-sm">
        <button
          onClick={handleResendOtp}
          disabled={otpTimer > 0 || isLoading}
          className={`flex items-center ${
            otpTimer > 0 ? 'text-gray-400 cursor-not-allowed' : `text-${themeColors.primary} hover:text-${themeColors.primaryHover}`
          } transition-colors`}
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Resend Code {otpTimer > 0 ? `(${otpTimer}s)` : ''}
        </button>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || isLoading}
          className={`px-6 py-2 rounded-lg font-medium text-white bg-${themeColors.primary} hover:bg-${themeColors.primaryHover} ${otp.length !== 6 || isLoading ? 'opacity-70 cursor-not-allowed' : ''} transition-colors`}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => {
    const passwordValidation = validatePassword(newPassword);
    
    return (
      <div className="space-y-5">
        <div className="flex items-center mb-2">
          <button
            onClick={() => setStep(2)}
            className="p-1 mr-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-800">Create New Password</h3>
        </div>
        
        <p className="text-gray-600 text-sm">
          Enter your new password. Make sure it's secure and you'll remember it.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:${themeColors.focus} transition-all text-gray-900`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {newPassword && (
          <div className={`bg-${themeColors.primaryLight}/30 p-3 rounded-lg space-y-2`}>
            <div className="text-sm font-medium text-gray-700">Password Requirements:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className={`h-1.5 w-1.5 rounded-full ${passwordValidation.isLongEnough ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
                <span className={`text-xs ${passwordValidation.isLongEnough ? 'text-green-600' : 'text-red-500'}`}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center">
                <div className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
                <span className={`text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center">
                <div className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
                <span className={`text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                  One lowercase letter
                </span>
              </div>
              <div className="flex items-center">
                <div className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
                <span className={`text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                  One number
                </span>
              </div>
              <div className="flex items-center">
                <div className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-red-300'} mr-1.5`}></div>
                <span className={`text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-500'}`}>
                  One special character
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:${themeColors.focus} transition-all text-gray-900`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResetPassword}
            disabled={!passwordValidation.isValid || newPassword !== confirmPassword || isLoading}
            className={`px-6 py-2 rounded-lg font-medium text-white bg-${themeColors.primary} hover:bg-${themeColors.primaryHover} ${!passwordValidation.isValid || newPassword !== confirmPassword || isLoading ? 'opacity-70 cursor-not-allowed' : ''} transition-colors`}
          >
            {isLoading ? (
              <>
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="space-y-5 text-center py-6">
      <div className={`h-20 w-20 mx-auto rounded-full flex items-center justify-center bg-${themeColors.primaryLight} text-${themeColors.primary}`}>
        <CheckCircle className="h-10 w-10" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800">Password Reset Successful</h3>
      
      <p className="text-gray-600 text-sm">
        Your password has been reset successfully. You can now login with your new password.
      </p>
      
      <div className="pt-4">
        <button
          onClick={handleClose}
          className={`px-6 py-3 rounded-lg font-medium text-white bg-${themeColors.primary} hover:bg-${themeColors.primaryHover} transition-colors`}
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && renderEmailStep()}
            {step === 2 && renderOtpStep()}
            {step === 3 && renderPasswordStep()}
            {step === 4 && renderSuccessStep()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default React.memo(ForgotPasswordModal);