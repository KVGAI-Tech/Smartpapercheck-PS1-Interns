import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Clientele from "./LandingPage/Clientele";
import Testimonials from "./LandingPage/Testimonials";
import VideoDemo from "./LandingPage/VideoDemo";
import Features from "./LandingPage/Features";
import ComparisonMetrics from "./LandingPage/ComparisonMetrics";
import USP from "./LandingPage/USP";
import Insights from "./LandingPage/Insights";
import Pricing from "./LandingPage/Pricing";
import FAQ from "./LandingPage/FAQ";
import ContactForm from "./LandingPage/ContactForm";
import Footer from "./LandingPage/Footer";

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative">
        {/* Logo Container */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="font-medium text-4xl sm:text-5xl md:text-6xl text-gray-900">
                Smart
                <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                  QnA
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pulse Circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-200/20 to-blue-200/20"
          initial={{ width: 20, height: 20 }}
          animate={{ 
            width: ["20px", "240px", "20px"],
            height: ["20px", "240px", "20px"],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Secondary Pulse Circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-200/20 to-teal-200/20"
          initial={{ width: 20, height: 20 }}
          animate={{ 
            width: ["20px", "240px", "20px"],
            height: ["20px", "240px", "20px"],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Loading Text */}
      <div className="mt-12">
        <motion.div 
          className="flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Animating Dots */}
          <div className="text-gray-600 text-lg font-medium">Loading</div>
          <motion.div
            className="text-teal-500 flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="text-lg"
                initial={{ y: 0 }}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                .
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Document Animation */}
      <div className="mt-8 relative">
        <motion.div 
          className="absolute w-16 h-20 rounded-md bg-white shadow-md border border-gray-100"
          initial={{ x: -60, y: 0, rotate: -5, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: -5, opacity: 0.9 }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.div 
          className="absolute w-16 h-20 rounded-md bg-white shadow-md border border-gray-100"
          initial={{ x: -30, y: 0, rotate: 2, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 2, opacity: 0.9 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        
        <motion.div 
          className="relative w-16 h-20 rounded-md bg-gradient-to-r from-teal-50 to-blue-50 shadow-md border border-gray-100 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="w-10 h-2 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: "70%" }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 w-64 sm:w-80 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
          }}
        />
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const demoRef = useRef(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const prependHelper = (name) => `/images/landing/${name}.jpeg`;
  const analytics = prependHelper("analytics");
  const batchProcessing = prependHelper("batchProcessing");
  const customerSupport = prependHelper("customerSupport");
  const diagramRecognition = prependHelper("diagramRecognition");
  const feedback = prependHelper("feedback");
  const multilingualSupport = prependHelper("multilingualSupport");
  const rubrikGen = prependHelper("rubrikGen");
  const saveTime = prependHelper("saveTime");
  const unbiasedEval = prependHelper("unbiasedEval");
  const vlmGrading = prependHelper("vlmGrading");

  useEffect(() => {
    document.body.style.backgroundColor = "#f8f9fa";
    document.body.style.color = "#212529";

    const preloadImages = [
      "/logo_smartqna.png",
      "/check.png",
      "/placeholder-732pxX732px.png",
      analytics,
      batchProcessing,
      customerSupport,
      diagramRecognition,
      feedback,
      multilingualSupport,
      rubrikGen,
      saveTime,
      unbiasedEval,
      vlmGrading,
    ];

    let loadedCount = 0;

    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 3000); // Increased time to see the animation
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.log(`Failed to preload image: ${src}`);
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 3000); // Increased time to see the animation
        }
      };
    });
    const timer = setTimeout(() => setIsLoaded(true), 10000); // Increased timeout

    document.documentElement.classList.add("landing-page-html");

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove("landing-page-html");
    };
  }, []);

  if (!isLoaded) {
    return <LoadingAnimation />;
  }

  return (
    <div className="landing-page overflow-x-hidden bg-[#f8f9fa] text-[#212529]">
      <div className="relative">
        <Navbar />
        <Hero scrollToDemo={scrollToDemo} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Clientele />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <ComparisonMetrics />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Testimonials />
      </motion.div>

      <motion.div
        ref={demoRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <VideoDemo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Features
          analyticsImage={analytics}
          feedbackImage={feedback}
          timeImage={saveTime}
          unbiasedImage={unbiasedEval}
          VLMImage={vlmGrading}
          rubrikImage={rubrikGen}
          diagramImage={diagramRecognition}
          batchPDFImage={batchProcessing}
          multilingualImage={multilingualSupport}
        />
      </motion.div>


      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <USP />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Insights />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Pricing />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <FAQ />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <ContactForm />
      </motion.div>

      <Footer />
    </div>
  );
};

export default LandingPage;