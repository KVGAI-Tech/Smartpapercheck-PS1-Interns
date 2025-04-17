import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Clientele from "./LandingPage/Clientele";
import Testimonials from "./LandingPage/Testimonials";
import VideoDemo from "./LandingPage/VideoDemo";
import Features from "./LandingPage/Features";
import USP from "./LandingPage/USP";
import Insights from "./LandingPage/Insights";
import Pricing from "./LandingPage/Pricing";
import FAQ from "./LandingPage/FAQ";
import ContactForm from "./LandingPage/ContactForm";
import Footer from "./LandingPage/Footer";

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

    document.documentElement.classList.add("landing-page-html");

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove("landing-page-html");
    };
  }, []);

  if (!isLoaded) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          color: "#212529",
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
        }}
      >
        <div>Loading Smart QnA...</div>
      </div>
    );
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
