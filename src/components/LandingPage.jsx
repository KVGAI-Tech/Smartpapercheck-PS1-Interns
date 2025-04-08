import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

import Navbar from './LandingPage/Navbar';
import Hero from './LandingPage/Hero';
import Clientele from './LandingPage/Clientele';
import Testimonials from './LandingPage/Testimonials';
import VideoDemo from './LandingPage/VideoDemo';
import Features from './LandingPage/Features';
import USP from './LandingPage/USP';
import Insights from './LandingPage/Insights';
import Pricing from './LandingPage/Pricing';
import FAQ from './LandingPage/FAQ';
import ContactForm from './LandingPage/ContactForm';
import Footer from './LandingPage/Footer';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const demoRef = useRef(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#0B1011";
    document.body.style.color = "#ffffff";
    
    const preloadImages = [
      '/logo_smartqna.png',
      '/check.png'
    ];
    
    let loadedCount = 0;
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 100);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.log(`Failed to preload image: ${src}`);
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 100);
        }
      };
    });
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    
    document.documentElement.classList.add('landing-page-html');
    
    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('landing-page-html');
    };
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ 
        backgroundColor: "#0B1011", 
        color: "#ffffff", 
        height: "100vh", 
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem"
      }}>
        <div>Loading Smart QnA...</div>
      </div>
    );
  }

  return (
    <div className="landing-page overflow-x-hidden bg-[#0B1011] text-white">
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
        <Features />
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