import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay } from "react-icons/fa";
import { HiOutlineRocketLaunch } from "react-icons/hi2";

const Hero = ({ scrollToDemo }) => {
  const navigate = useNavigate();
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };
  
  const backgroundShapes = [
    { size: 'h-32 w-32', color: 'bg-teal-500/10', top: '10%', left: '5%', animationDelay: 0 },
    { size: 'h-48 w-48', color: 'bg-blue-500/10', top: '15%', right: '8%', animationDelay: 1 },
    { size: 'h-64 w-64', color: 'bg-indigo-500/5', bottom: '10%', left: '15%', animationDelay: 2 },
    { size: 'h-24 w-24', color: 'bg-teal-500/10', bottom: '25%', right: '20%', animationDelay: 1.5 },
  ];
  
  return (
    <section className="min-h-screen pt-24 lg:pt-28 px-4 md:px-12 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {backgroundShapes.map((shape, index) => (
        <motion.div 
          key={index}
          className={`absolute rounded-full blur-xl ${shape.size} ${shape.color} z-0`}
          style={{
            top: shape.top || 'auto',
            left: shape.left || 'auto',
            right: shape.right || 'auto',
            bottom: shape.bottom || 'auto',
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            delay: shape.animationDelay,
          }}
        />
      ))}
      
      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full opacity-10 bg-grid-pattern" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center justify-center pt-16 md:pt-28">
        <motion.div
          className="flex items-center gap-2 mb-6 bg-gradient-to-r from-teal-200 to-blue-100 rounded-full px-4 py-2 text-sm font-medium"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="bg-gradient-to-r from-teal-400 to-blue-500 rounded-full w-2 h-2 animate-pulse"></div>
          <span className="text-gray-700">Built with Explainable AI · Powered by LLMs · Trusted by Institutions</span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-teal-800 to-gray-900"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Revolutionizing Answer Script <br className="hidden md:block" /> 
          Evaluation with AI & LLMs
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-center text-gray-700 max-w-4xl mb-12"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          SmartQnA automates and explains grading of handwritten answer scripts using 
          cutting-edge Vision-Language Models & Agentic AI Workflows.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-16"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.button
            onClick={scrollToDemo}
            className="group flex items-center justify-center gap-2 bg-gray-100 border border-gray-200 hover:bg-gray-200 shadow-sm px-8 py-4 rounded-full text-gray-800 font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlay className="text-teal-600 group-hover:text-teal-700 transition-colors duration-300" />
            <span>Watch Demo</span>
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/auth')}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 px-8 py-4 rounded-full text-white font-medium transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiOutlineRocketLaunch className="text-white" />
            <span>Request a Product Demo</span>
          </motion.button>
        </motion.div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="order-2 md:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Evaluation System</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-teal-100 p-1 rounded-full mr-2 mt-1">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">AI-powered handwritten text recognition</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-teal-100 p-1 rounded-full mr-2 mt-1">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">Advanced diagram and equation evaluation</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-teal-100 p-1 rounded-full mr-2 mt-1">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">Detailed automated feedback generation</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-teal-100 p-1 rounded-full mr-2 mt-1">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">Comprehensive analytics dashboard</span>
                </li>
              </ul>
            </div>
          </motion.div>
          
          {}
          <motion.div 
            className="order-1 md:order-2 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute -top-5 -right-5 bg-yellow-100 px-3 py-1 rounded-lg text-yellow-700 text-sm font-medium shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                AI-Powered
              </motion.div>
              <motion.div
                className="bg-gradient-to-r from-gray-100 to-white p-2 rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src="../../../public/Screenshot 2025-05-02 at 1.45.52 PM.png" 
                  alt="SmartQnA Dashboard" 
                  className="rounded-xl object-cover w-full h-auto"
                />
              </motion.div>
              <motion.div 
                className="absolute -bottom-5 -left-5 bg-blue-100 px-3 py-1 rounded-lg text-blue-700 text-sm font-medium shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                Real-time Analytics
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent z-10" />
    </section>
  );
};

export default Hero;
