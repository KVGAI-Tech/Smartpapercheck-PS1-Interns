import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { HiOutlineCurrencyRupee, HiOutlineClock, HiOutlineShieldCheck, HiArrowRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const AnimatedCounter = ({ target, suffix = "", prefix = "", duration = 2, inView }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest).toLocaleString();
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) {
      const numericTarget = parseInt(target.replace(/,/g, ""), 10);
      const controls = animate(count, numericTarget, {
        duration,
        ease: "easeOut",
      });
      const unsubscribe = rounded.on("change", (v) => setDisplay(v));
      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [inView]);

  return (
    <span>
      {prefix}{display}{suffix}
    </span>
  );
};

const highlights = [
  {
    icon: HiOutlineCurrencyRupee,
    title: "TA Cost Savings",
    main: "20,000",
    mainPrefix: "₹",
    mainSuffix: "/semester (India)",
    sub: "$30/hour (US)",
    desc: "Automated grading at a fraction of the cost.",
    linkTo: "pricing",
  },
  {
    icon: HiOutlineClock,
    title: "Time Savings",
    main: "500",
    mainPrefix: "",
    mainSuffix: " scripts in 5 min",
    desc: "Instant results, no bottlenecks. Grade a full batch simultaneously.",
    linkTo: "features",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Accuracy & Fairness",
    main: "1",
    mainPrefix: "",
    mainSuffix: "-3% (by design)",
    sub: "Undergrades only",
    desc: "AI flags bad handwriting and ambiguous answers for manual review. Ensures no unfair overgrading.",
    linkTo: "https://docs.smart-qna.com/intro",
  },
];

// Consistent accent color from the project
const ACCENT = "#166D70";
const ACCENT_LIGHT = "rgba(22, 109, 112, 0.10)";
const ACCENT_BORDER = "rgba(22, 109, 112, 0.20)";
const ACCENT_SHADOW = "rgba(22, 109, 112, 0.15)";
const ACCENT_ICON_BG = "rgba(22, 109, 112, 0.12)";

export default function LandingHighlights() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeCard, setActiveCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setActiveCard(index);
  };

  const handleLearnMore = (linkTo) => {
    // External URL
    if (linkTo.startsWith("http")) {
      window.open(linkTo, "_blank", "noopener,noreferrer");
      return;
    }
    if (linkTo === "pricing" || linkTo === "features" || linkTo === "faq") {
      // Scroll to section on the same page
      const sectionId = linkTo;
      const el = document.querySelector(`[data-section="${sectionId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    // Navigate to a different page
    navigate(`/${linkTo}`);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section ref={sectionRef} className="w-full py-20 relative overflow-hidden bg-white">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(22,109,112,0.06) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative blurs */}
      <motion.div
        className="absolute -top-20 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(22,109,112,0.08), transparent)', filter: 'blur(80px)' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(22,109,112,0.06), transparent)', filter: 'blur(80px)' }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Numbers That{' '}
            <span className="text-accent">
              Speak
            </span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            See why institutions choose AI-powered evaluation over manual paper checking
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {highlights.map((h, i) => {
            const IconComponent = h.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="relative group cursor-default"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setActiveCard(null)}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              >
                {/* Card */}
                <div
                  className="relative rounded-3xl p-7 sm:p-8 pb-16 h-full flex flex-col gap-4 overflow-hidden transition-all duration-500"
                  style={{
                    background: activeCard === i
                      ? 'linear-gradient(135deg, rgba(22,109,112,0.06), rgba(22,109,112,0.02))'
                      : 'rgba(255,255,255,0.9)',
                    border: activeCard === i
                      ? `1.5px solid ${ACCENT_BORDER}`
                      : '1px solid rgba(229,231,235,0.8)',
                    boxShadow: activeCard === i
                      ? `0 24px 64px ${ACCENT_SHADOW}, 0 8px 24px rgba(0,0,0,0.06)`
                      : '0 4px 16px rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Cursor follow spotlight */}
                  <AnimatePresence>
                    {activeCard === i && (
                      <motion.div
                        className="absolute pointer-events-none rounded-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        style={{
                          width: 200,
                          height: 200,
                          left: mousePos.x - 100,
                          top: mousePos.y - 100,
                          background: `radial-gradient(circle, ${ACCENT_LIGHT}, transparent 70%)`,
                          filter: 'blur(20px)',
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Top row: icon + title */}
                  <div className="flex items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: ACCENT_ICON_BG,
                          boxShadow: activeCard === i ? `0 4px 16px ${ACCENT_SHADOW}` : 'none',
                        }}
                        animate={activeCard === i ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="w-6 h-6 text-accent" />
                      </motion.div>
                      <span className="text-lg font-bold text-gray-900">{h.title}</span>
                    </div>
                  </div>

                  {/* Animated number */}
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-800">
                      {isInView ? (
                        <AnimatedCounter
                          target={h.main}
                          prefix={h.mainPrefix}
                          suffix={h.mainSuffix}
                          duration={2 + i * 0.3}
                          inView={isInView}
                        />
                      ) : (
                        `${h.mainPrefix}0${h.mainSuffix}`
                      )}
                    </div>
                    {h.sub && (
                      <motion.div
                        className="text-base font-semibold mt-1 text-gray-500"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.8 + i * 0.15 }}
                      >
                        {h.sub}
                      </motion.div>
                    )}
                  </div>

                  {/* Separator with animated gradient */}
                  <motion.div
                    className="h-px w-full rounded-full relative z-10"
                    style={{
                      background: activeCard === i
                        ? `linear-gradient(90deg, transparent, ${ACCENT_BORDER}, transparent)`
                        : 'rgba(229,231,235,0.8)',
                    }}
                  />

                  {/* Description */}
                  <motion.p
                    className="text-base text-gray-600 leading-relaxed relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                  >
                    {h.desc}
                  </motion.p>

                  {/* Bottom hover action - absolutely positioned so it doesn't affect card height */}
                  <AnimatePresence>
                    {activeCard === i && (
                      <motion.div
                        className="absolute bottom-4 left-7 flex items-center gap-1 text-xs font-medium z-10 text-accent cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleLearnMore(h.linkTo)}
                      >
                        <span>Learn more</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <HiArrowRight className="w-3 h-3" />
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Decorative corner accent */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT_LIGHT}, transparent)`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}