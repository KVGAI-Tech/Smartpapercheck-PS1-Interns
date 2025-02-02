import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  XCircle,
  GraduationCap,
  Brain,
  LineChart
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-4 group hover:bg-white/10 p-3 rounded-xl transition-all duration-300"
  >
    <motion.div 
      className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="h-6 w-6 text-white" />
    </motion.div>
    <span className="text-lg text-white group-hover:text-white/90 transition-colors">
      {text}
    </span>
  </motion.div>
);

const InputField = ({ 
  icon: Icon, 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  label,
  error,
  showPasswordToggle,
  onTogglePassword,
  showPassword
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-2"
  >
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.01 }}
      whileFocus={{ scale: 1.01 }}
    >
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-12 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border-2 
          ${error ? 'border-red-300' : 'border-gray-200'} rounded-lg 
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 
          transition-all duration-300 hover:border-gray-300`}
        placeholder={placeholder}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 
            hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    </motion.div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-red-500 flex items-center gap-1"
      >
        <XCircle className="h-4 w-4" />
        {error}
      </motion.p>
    )}
  </motion.div>
);

const HeartbeatLine = ({ className }) => (
  <motion.div 
    className={`absolute w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent ${className}`}
    animate={{
      opacity: [0.2, 0.5, 0.2],
      scaleY: [1, 1.5, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character');
    }
    if (!/\d/.test(password)) {
      errors.push('One number');
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    
    if (name === 'password' || name === 'confirmPassword') {
      const newErrors = { ...validationErrors };
      
      if (name === 'password') {
        const passwordErrors = validatePassword(value);
        if (passwordErrors.length > 0) {
          newErrors.password = `Missing: ${passwordErrors.join(', ')}`;
        } else {
          delete newErrors.password;
        }
        
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
      }
      
      if (name === 'confirmPassword') {
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
      }
      
      setValidationErrors(newErrors);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password && validateEmail(formData.email);
    }
    return formData.name && 
           formData.email && 
           formData.password && 
           formData.confirmPassword && 
           validateEmail(formData.email) && 
           Object.keys(validationErrors).length === 0 &&
           formData.password === formData.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        
        
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/');
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Brain, text: "Automated grading assistance", delay: 0.2 },
    { icon: GraduationCap, text: "Intelligent question analysis", delay: 0.4 },
    { icon: LineChart, text: "Real-time performance insights", delay: 0.6 }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-teal-50 to-white overflow-hidden">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-1/2 bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700 p-8 lg:p-16 
            flex flex-col justify-between relative overflow-hidden"
        >
          <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-4 mb-12 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">SmartQnA</h1>
            </motion.div>

            <div className="space-y-12 mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
                  Your Smart Teaching<br />Assistant
                </h2>
                <p className="text-xl text-white/90">
                  Streamline your teaching and assessment process
                </p>
              </motion.div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </div>
            </div>
          </div>

          <HeartbeatLine className="top-1/4" />
          <HeartbeatLine className="top-1/2" />
          <HeartbeatLine className="top-3/4" />
        </motion.div>

        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center"
        >
          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-between items-center mb-12">
              <motion.h2 
                className="text-3xl font-bold text-gray-800"
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </motion.h2>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ name: '', email: '', password: '' });
                }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {isLogin ? 'Need an account?' : 'Already have an account?'}
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 text-red-500 bg-red-50 p-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <InputField
                    key="name"
                    icon={User}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    label="Full Name"
                  />
                )}
              </AnimatePresence>

              <InputField
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                label="Email Address"
              />

              <InputField
                icon={Lock}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                label="Password"
                error={validationErrors.password}
                showPasswordToggle
                onTogglePassword={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
              />

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <InputField
                    key="confirmPassword"
                    icon={Lock}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    label="Confirm Password"
                    error={validationErrors.confirmPassword}
                    showPasswordToggle
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    showPassword={showConfirmPassword}
                  />
                )}
              </AnimatePresence>

              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 space-y-2 bg-gray-50 p-4 rounded-lg"
                >
                  <div className="font-medium">Password must contain:</div>
                  <ul className="space-y-1">
                    {[
                      { req: formData.password.length >= 8, text: 'At least 8 characters' },
                      { req: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                      { req: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                      { req: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' },
                      { req: /\d/.test(formData.password), text: 'One number' },
                      { req: formData.password === formData.confirmPassword && formData.confirmPassword, text: 'Passwords match' }
                    ].map((requirement, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${requirement.req ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>{requirement.text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={!isFormValid() || isLoading}
                whileHover={{ scale: isFormValid() && !isLoading ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid() && !isLoading ? 0.98 : 1 }}
                className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg
                  flex items-center justify-center gap-3 transition-all duration-300
                  ${!isFormValid() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg'}`}
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
