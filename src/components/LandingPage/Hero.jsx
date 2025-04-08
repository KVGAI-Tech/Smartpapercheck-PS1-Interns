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
    <section className="min-h-screen pt-24 lg:pt-28 px-4 md:px-12 relative overflow-hidden">
      {/* Animated Background Shapes */}
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
      
      {/* Grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full opacity-20 bg-grid-pattern" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center justify-center pt-16 md:pt-28">
        {/* Badge */}
        <motion.div
          className="flex items-center gap-2 mb-6 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full px-4 py-2 text-sm font-medium"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="bg-gradient-to-r from-teal-400 to-blue-500 rounded-full w-2 h-2 animate-pulse"></div>
          <span className="text-white">Built with Explainable AI · Powered by LLMs · Trusted by Institutions</span>
        </motion.div>
        
        {/* Headline */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-100 to-white"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Revolutionizing Answer Script <br className="hidden md:block" /> 
          Evaluation with AI & LLMs 🧠📄
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p 
          className="text-lg md:text-xl text-center text-white/80 max-w-4xl mb-12"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          SmartQnA automates and explains grading of handwritten answer scripts using 
          cutting-edge Vision-Language Models & Agentic AI Workflows.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-16"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.button
            onClick={scrollToDemo}
            className="group flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full text-white font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlay className="text-teal-400 group-hover:text-white transition-colors duration-300" />
            <span>Watch Demo</span>
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/auth')}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 px-8 py-4 rounded-full text-white font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiOutlineRocketLaunch className="text-white" />
            <span>Request a Product Demo</span>
          </motion.button>
        </motion.div>
        
        {/* Animated Visual */}
        <motion.div
          className="relative w-full max-w-4xl aspect-video bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl overflow-hidden shadow-2xl shadow-teal-900/20"
          custom={4}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-4/5 h-4/5 border-2 border-dashed border-white/30 rounded-lg overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-[url('/public/papers-bg.jpg')] bg-cover bg-center opacity-40"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
              />
              
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <div className="animate-pulse w-16 h-16 rounded-full bg-teal-500/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-teal-500/50 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-teal-500"></div>
                  </div>
                </div>
                <p className="text-white/70 text-center font-light">
                  AI processing handwritten answers...
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B1011] to-transparent z-10" />
    </section>
  );
};

export default Hero;
