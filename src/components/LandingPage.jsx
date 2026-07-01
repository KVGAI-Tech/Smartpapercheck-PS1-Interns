import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState, useRef } from "react";
import { HiArrowUp } from "react-icons/hi";

import Clientele from "./LandingPage/Clientele";
import ComparisonMetrics from "./LandingPage/ComparisonMetrics";
import ContactForm from "./LandingPage/ContactForm";
import DepartmentAnalytics from "./LandingPage/DepartmentAnalytics";
import FAQ from "./LandingPage/FAQ";
import Features from "./LandingPage/Features";
import Footer from "./LandingPage/Footer";
import Hero from "./LandingPage/Hero";
import Insights from "./LandingPage/Insights";
import Navbar from "./LandingPage/Navbar";
import Pricing from "./LandingPage/Pricing";
import SmartEvaluationSystem from "./LandingPage/SmartEvaluationSystem";
import Testimonials from "./LandingPage/Testimonials";
import USP from "./LandingPage/USP";
import VideoDemo from "./LandingPage/VideoDemo";
import LandingHighlights from "./LandingPage/LandingHighlights";

// ---------------------------------------------------------------------------
// Loading Animation (unchanged)
// ---------------------------------------------------------------------------
const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-white p-4">
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
              <div className="font-medium text-3xl sm:text-4xl md:text-5xl text-gray-900 text-center">
                Smart
                <span className="font-light italic text-accent">
                  Paper Check
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pulse Circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10"
          initial={{ width: 20, height: 20 }}
          animate={{
            width: ["20px", "200px", "20px"],
            height: ["20px", "200px", "20px"],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary Pulse Circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10"
          initial={{ width: 20, height: 20 }}
          animate={{
            width: ["20px", "200px", "20px"],
            height: ["20px", "200px", "20px"],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Loading Text */}
      <div className="mt-10">
        <motion.div
          className="flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Animating Dots */}
          <div className="text-gray-600 text-base font-medium">Loading</div>
          <motion.span
            className="text-accent flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="text-base"
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
          </motion.span>
        </motion.div>
      </div>

      {/* Document Animation */}
      <div className="mt-6 relative">
        <motion.div
          className="absolute w-14 h-18 rounded-md bg-white shadow-md border border-gray-100"
          initial={{ x: -50, y: 0, rotate: -5, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: -5, opacity: 0.9 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          className="absolute w-14 h-18 rounded-md bg-white shadow-md border border-gray-100"
          initial={{ x: -25, y: 0, rotate: 2, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 2, opacity: 0.9 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        <motion.div
          className="relative w-14 h-18 rounded-md bg-accent/5 shadow-md border border-gray-100 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="w-8 h-2 bg-accent rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: "70%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mt-10 w-56 sm:w-64 bg-gray-200 rounded-full h-1 overflow-hidden">
        <motion.div
          className="h-1 rounded-full bg-accent"
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

// ---------------------------------------------------------------------------
// Section IDs used for navigation (order matches page layout)
// ---------------------------------------------------------------------------
const SECTION_IDS = [
  "home",
  "smart-evaluation",
  "clientele",
  "highlights",
  "analytics",
  "comparison",
  "testimonials",
  "demo",
  "features",
  "usp",
  "insights",
  "pricing",
  "faq",
  "contact",
];

// Only these IDs appear in the navbar — used for active-section tracking
const NAV_SECTION_IDS = ["home", "features", "pricing", "faq", "contact"];

// ---------------------------------------------------------------------------
// Scroll-to-top button
// ---------------------------------------------------------------------------
const ScrollToTopButton = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        className="scroll-to-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.25 }}
        aria-label="Scroll to top"
      >
        <HiArrowUp className="w-5 h-5" />
      </motion.button>
    )}
  </AnimatePresence>
);

// ---------------------------------------------------------------------------
// Main Landing Page
// ---------------------------------------------------------------------------
const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Track when a user clicks a nav link so we can temporarily ignore scroll events
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Centralised scroll function — replaces all per-section refs
  const scrollToSection = useCallback((sectionId) => {
    // Immediately set active section and ignore scroll events
    setActiveSection(sectionId);
    isNavigatingRef.current = true;
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Re-enable scroll tracking after a generous fallback timeout 
    // (in case the scroll event stops firing entirely or they are already at the section)
    navigationTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 2000);

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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

  // ---- Image preloading & initial load ----
  useEffect(() => {
    document.body.style.backgroundColor = "#ffffff";
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

  // ---- Restore scroll position & persist on scroll ----
  useEffect(() => {
    if (isLoaded) {
      const savedScroll = sessionStorage.getItem("landingScrollPos");
      if (savedScroll) {
        // Wait a tick for the DOM to fully render the heavy components
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 0);
      }
      
      const handleScroll = () => {
        sessionStorage.setItem("landingScrollPos", window.scrollY.toString());
      };
      
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isLoaded]);

  // ---- Scroll-based active-section tracking + scroll-to-top visibility ----
  useEffect(() => {
    if (!isLoaded) return;

    const NAVBAR_HEIGHT = 100; // px offset for the fixed navbar

    const handleScroll = () => {
      // Show / hide scroll-to-top
      setShowScrollTop(window.scrollY > 600);

      // Detect when scrolling completely stops
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100); // 100ms without scroll events means scrolling has stopped

      // Determine which navigable section is currently in view
      // Skip if we are currently programmatic scrolling (user clicked a nav link)
      if (isNavigatingRef.current) return;

      const scrollY = window.scrollY + NAVBAR_HEIGHT;

      // Build an array of { id, top } for each nav section
      const sectionPositions = NAV_SECTION_IDS
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return { id, top: el.offsetTop };
        })
        .filter(Boolean);

      if (sectionPositions.length === 0) return;

      // Find the last section whose top is above the current scroll position
      let current = sectionPositions[0].id;
      for (const section of sectionPositions) {
        if (scrollY >= section.top) {
          current = section.id;
        } else {
          break;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoaded]);

  if (!isLoaded) {
    return <LoadingAnimation />;
  }

  return (
    <div
      className="landing-page overflow-x-hidden bg-white text-[#212529]"
      id="home"
    >
      <div className="relative">
        <Navbar
          scrollToSection={scrollToSection}
          activeSection={activeSection}
        />
        <Hero scrollToDemo={() => scrollToSection("demo")} />
      </div>

      <div id="smart-evaluation" className="landing-section">
        <SmartEvaluationSystem />
      </div>

      <motion.div
        id="clientele"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Clientele />
      </motion.div>

      <motion.div
        id="highlights"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <LandingHighlights />
      </motion.div>

      <motion.div
        id="analytics"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <DepartmentAnalytics />
      </motion.div>

      <motion.div
        id="comparison"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <ComparisonMetrics />
      </motion.div>

      <motion.div
        id="testimonials"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Testimonials />
      </motion.div>

      <motion.div
        id="demo"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <VideoDemo />
      </motion.div>

      <motion.div
        id="features"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        data-section="features"
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
        id="usp"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <USP />
      </motion.div>

      <motion.div
        id="insights"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Insights />
      </motion.div>

      <motion.div
        id="pricing"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        data-section="pricing"
      >
        <Pricing />
      </motion.div>

      <motion.div
        id="faq"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <FAQ />
      </motion.div>

      <motion.div
        id="contact"
        className="landing-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <ContactForm />
      </motion.div>

      <Footer scrollToSection={scrollToSection} />

      <ScrollToTopButton visible={showScrollTop} />
    </div>
  );
};

export default LandingPage;
