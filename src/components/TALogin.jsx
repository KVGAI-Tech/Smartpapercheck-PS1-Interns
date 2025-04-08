import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, Users, ChevronRight } from 'lucide-react';

const AnimatedGradientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            linear-gradient(45deg, rgba(147, 51, 234, 0.3) 0%, rgba(167, 139, 250, 0.3) 100%),
            radial-gradient(circle at 90% 20%, rgba(199, 210, 254, 0.4), transparent 40%),
            radial-gradient(circle at 10% 80%, rgba(186, 230, 253, 0.4), transparent 40%)
          `,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      />
    </div>
  );
};

const GridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-gray-50 opacity-80" />
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%239333ea' stroke-width='0.5' fill='none' fill-rule='evenodd' stroke-opacity='0.1'%3E%3Cpath d='M0 0h60v60H0z' /%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} />
    </div>
  );
};


const GlowingDots = () => {
  const dots = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 4 + 3
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(dot => (
        <motion.div
          key={dot.id}
          className="absolute bg-purple-400 rounded-full blur-xl"
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.left}%`,
            top: `${dot.top}%`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const TALogin = ({ onBack, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(null);

  
  const formFieldVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" },
    blur: { scale: 1, boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = () => {
    return formData.email && formData.password && validateEmail(formData.email);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    
    
    setTimeout(() => {
      
      const mockToken = "mock-ta-token-" + Math.random().toString(36).substring(2);
      
      
      onLoginSuccess(mockToken, 'ta');
      
      setIsLoading(false);
    }, 800); 
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-200/50 relative overflow-hidden">
      {}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-fuchsia-600"></div>
      <AnimatedGradientBackground />
      <GridBackground />
      <GlowingDots />
      
      <div className="relative z-10">
        <div className="mb-6">
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
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
            Teaching Assistant Login
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
          >
            <Users className="h-6 w-6 text-white" />
          </motion.div>
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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-1.5"
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <motion.div 
              className="relative"
              variants={formFieldVariants}
              animate={currentFocus === 'email' ? 'focus' : 'blur'}
            >
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setCurrentFocus('email')}
                onBlur={() => setCurrentFocus(null)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                placeholder="Enter your email"
              />
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-1.5"
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <motion.div 
              className="relative"
              variants={formFieldVariants}
              animate={currentFocus === 'password' ? 'focus' : 'blur'}
            >
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setCurrentFocus('password')}
                onBlur={() => setCurrentFocus(null)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                placeholder="Enter your password"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Forgot Password?
            </button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!isFormValid() || isLoading}
            className={`w-full py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-purple-500 to-fuchsia-600 
              ${isFormValid() && !isLoading ? 'hover:from-purple-600 hover:to-fuchsia-700 shadow-lg shadow-purple-500/20' : 'opacity-70 cursor-not-allowed'}
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
              <span className="flex items-center">
                Login to Account
                <ChevronRight className="ml-2 w-5 h-5" />
              </span>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default TALogin;