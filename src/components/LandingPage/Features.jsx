import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useRef } from "react";
import {
  HiOutlineDatabase,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineTranslate,
  HiOutlineUpload,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { TRANSITION, hoverLift, viewportOnce } from "./motion";

// ─── Accent color ───────────────────────────────────────────────
const ACCENT = "#166D70";

// ─── Floating Dots Background ───────────────────────────────────
const DOT_CONFIG = [
  { x: 5,  y: 10, size: 7,  duration: 6,   delay: 0   },
  { x: 15, y: 75, size: 5,  duration: 8,   delay: 1   },
  { x: 25, y: 35, size: 9,  duration: 7,   delay: 0.5 },
  { x: 35, y: 88, size: 6,  duration: 9,   delay: 2   },
  { x: 45, y: 20, size: 8,  duration: 6.5, delay: 1.5 },
  { x: 55, y: 60, size: 5,  duration: 8,   delay: 0.8 },
  { x: 65, y: 15, size: 10, duration: 7.5, delay: 2.5 },
  { x: 72, y: 80, size: 6,  duration: 6,   delay: 1.2 },
  { x: 82, y: 45, size: 8,  duration: 9,   delay: 0.3 },
  { x: 90, y: 90, size: 5,  duration: 7,   delay: 1.8 },
  { x: 10, y: 55, size: 6,  duration: 8.5, delay: 3   },
  { x: 92, y: 25, size: 7,  duration: 6,   delay: 0.6 },
];

const FloatingDots = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {DOT_CONFIG.map((dot, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: dot.size, height: dot.size, backgroundColor: ACCENT, opacity: 0.12 }}
        animate={{ y: [-10, 10, -10], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

// ─── BENEFITS Animated Icons ─────────────────────────────────────

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <motion.g
      style={{ originX: "12px", originY: "12px" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    >
      <line x1="12" y1="12" x2="12" y2="5" strokeWidth="1.8" strokeLinecap="round" />
    </motion.g>
    <motion.g
      style={{ originX: "12px", originY: "12px" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
    >
      <line x1="12" y1="12" x2="12" y2="8" strokeWidth="2.2" strokeLinecap="round" />
    </motion.g>
    <circle cx="12" cy="12" r="1.2" fill={ACCENT} stroke="none" />
  </svg>
);

const ScaleIcon = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <motion.g
      animate={{ rotate: hovered ? 0 : -18 }}
      transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 12 }}
      style={{ originX: "12px", originY: "7px", transformBox: "fill-box" }}
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <motion.g animate={{ y: hovered ? 0 : -3 }} transition={{ duration: 0.7, type: "spring" }}>
        <line x1="4" y1="7" x2="4" y2="11" stroke={ACCENT} strokeWidth="1.4" />
        <path d="M1.5 11 Q4 13.5 6.5 11" strokeWidth="1.4" />
      </motion.g>
      <motion.g animate={{ y: hovered ? 0 : 3 }} transition={{ duration: 0.7, type: "spring" }}>
        <line x1="20" y1="7" x2="20" y2="11" stroke={ACCENT} strokeWidth="1.4" />
        <path d="M17.5 11 Q20 13.5 22.5 11" strokeWidth="1.4" />
      </motion.g>
    </motion.g>
  </svg>
);

const FeedbackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={ACCENT} strokeWidth="1.8" />
    <line x1="8" y1="9" x2="16" y2="9" stroke={ACCENT} strokeWidth="1.4" />
    <line x1="8" y1="12" x2="13" y2="12" stroke={ACCENT} strokeWidth="1.4" />
    <motion.circle
      cx="19" cy="4" r="3"
      fill="#22c55e"
      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const AnalyticsIcon = ({ hovered, inView }) => {
  const shouldAnimate = inView || hovered;
  const bars = [
    { x: 3,  width: 5, fullHeight: 10, delay: 0   },
    { x: 11, width: 5, fullHeight: 16, delay: 0.1 },
    { x: 19, width: 5, fullHeight: 8,  delay: 0.2 },
  ];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="1" y1="22" x2="23" y2="22" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x={bar.x}
          width={bar.width}
          rx="1"
          fill={ACCENT}
          stroke="none"
          initial={{ y: 22, height: 0 }}
          animate={shouldAnimate
            ? { y: 22 - bar.fullHeight, height: bar.fullHeight }
            : { y: 22, height: 0 }
          }
          transition={{ duration: 0.55, delay: bar.delay, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
};

// ─── FEATURES Animated Icons ─────────────────────────────────────

const VLMIcon = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
    <motion.line
      x1="5" x2="19"
      stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2"
      animate={{ y1: [9, 20, 9], y2: [9, 20, 9], opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: hovered ? 0 : 0.5 }}
    />
  </svg>
);

const RubricIcon = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v4c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 9v4c0 1.66 4.03 3 9 3s9-1.34 9-3V9" />
    <path d="M3 13v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4" />
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={hovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      style={{ originX: "18px", originY: "4px", transformBox: "fill-box" }}
    >
      <circle cx="18" cy="4" r="4" fill={ACCENT} stroke="none" />
      <polyline points="16 4 17.5 5.5 20 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  </svg>
);

const DiagramIcon = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
    <motion.rect
      x="6" y="6" width="12" height="12" rx="1"
      stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={hovered ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    />
  </svg>
);

const BatchIcon = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {[4, 2, 0].map((offset, i) => (
      <motion.rect
        key={i}
        x={4 + offset} y={4 + offset} width="14" height="16" rx="2"
        fill="white" stroke={ACCENT} strokeWidth="1.5"
        animate={hovered ? { y: offset - 3, opacity: 1 - i * 0.15 } : { y: offset, opacity: 1 - i * 0.15 }}
        transition={{ duration: 0.35, delay: i * 0.08, type: "spring", stiffness: 200 }}
      />
    ))}
    <motion.g
      animate={hovered ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <line x1="12" y1="10" x2="12" y2="16" stroke={ACCENT} strokeWidth="1.8" />
      <polyline points="9 13 12 10 15 13" stroke={ACCENT} strokeWidth="1.8" fill="none" />
    </motion.g>
  </svg>
);

const MultilingualIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <motion.ellipse
      cx="12" cy="12" rx="4" ry="10"
      stroke={ACCENT} strokeWidth="1.4" fill="none"
      animate={{ rx: [4, 8, 1, 4] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.2" strokeDasharray="2 2" />
  </svg>
);

// ─── Flip Card ───────────────────────────────────────────────────
const FlipCard = ({ iconType, title, description, backDetail, index, className = "" }) => {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const renderIcon = () => {
    switch (iconType) {
      case "clock":        return <ClockIcon />;
      case "scale":        return <ScaleIcon hovered={hovered && !flipped} />;
      case "feedback":     return <FeedbackIcon />;
      case "analytics":    return <AnalyticsIcon hovered={hovered && !flipped} inView={inView} />;
      case "vlm":          return <VLMIcon hovered={hovered && !flipped} />;
      case "rubric":       return <RubricIcon hovered={hovered && !flipped} />;
      case "diagram":      return <DiagramIcon hovered={hovered && !flipped} />;
      case "batch":        return <BatchIcon hovered={hovered && !flipped} />;
      case "multilingual": return <MultilingualIcon />;
      default:             return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`min-h-56 cursor-pointer ${className}`}
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ ...TRANSITION, delay: index * 0.08 }}
      viewport={viewportOnce}
      onClick={() => setFlipped(!flipped)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label={`${title} — click to ${flipped ? "hide" : "see"} details`}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d", minHeight: "14rem" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 18 }}
      >
        {/* Front */}
        <motion.div
          className="absolute inset-0 bg-white rounded-xl p-6 flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            border: hovered && !flipped ? `1.5px solid ${ACCENT}` : "1.5px solid #f3f4f6",
            boxShadow: hovered && !flipped
              ? `0 0 0 3px rgba(22,109,112,0.12), 0 4px 24px rgba(22,109,112,0.12)`
              : "0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          }}
        >
          <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center mb-3">
            {renderIcon()}
          </div>

          {/* ✅ Inter (Tailwind default) — Sora removed */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

          <p className="text-gray-500 text-sm flex-grow" style={{ fontFamily: "'Sora', sans-serif", lineHeight: "1.65", letterSpacing: "0.01em" }}>{description}</p>
          <p className="text-accent text-xs font-medium mt-3 flex items-center gap-1" style={{ fontFamily: "'Sora', sans-serif" }}>
            <span>Tap to learn more</span>
            <motion.span
              animate={hovered && !flipped ? { x: [0, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.5, repeat: hovered && !flipped ? Infinity : 0 }}
            >→</motion.span>
          </p>
        </motion.div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-accent rounded-xl p-6 shadow-md flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            {/* ✅ Inter (Tailwind default) — Sora removed */}
            <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>

            <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: "'Sora', sans-serif", lineHeight: "1.7", letterSpacing: "0.01em" }}>{backDetail}</p>
          </div>
          <p className="text-white/60 text-xs font-medium mt-4 flex items-center gap-1" style={{ fontFamily: "'Sora', sans-serif" }}>
            <span>←</span><span>Tap to go back</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const Features = ({
  timeImage, unbiasedImage, feedbackImage, analyticsImage,
  VLMImage, rubrikImage, diagramImage, batchPDFImage, multilingualImage,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("features");
  const [ctaHovered, setCtaHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const features = [
    {
      iconType: "vlm",
      title: "VLM Grading",
      description: "Vision-Language Models understand both text and visual elements in handwritten answers.",
      backDetail: "Our VLMs are fine-tuned on academic handwriting across subjects, enabling accurate reading of cursive text, equations, and mixed-content responses.",
    },
    {
      iconType: "rubric",
      title: "Auto Rubric Generation",
      description: "AI creates detailed grading rubrics from your question papers or model answers.",
      backDetail: "Upload a question paper or a model answer and the system auto-generates a structured rubric with point breakdowns. Professors can edit, approve, and reuse rubrics across batches.",
    },
    {
      iconType: "diagram",
      title: "Diagram Recognition",
      description: "Advanced image recognition evaluates diagrams, tables, and equations in student responses.",
      backDetail: "Whether it's a circuit diagram, a labeled anatomy sketch, or a data table — our recognition engine evaluates visual content with the same precision as text.",
    },
    {
      iconType: "batch",
      title: "Batch PDF Processing",
      description: "Upload multiple answer scripts in PDF format for efficient bulk processing.",
      backDetail: "Submit entire exam batches as a single PDF. The system auto-separates scripts, aligns pages, and processes hundreds of submissions in parallel.",
    },
    {
      iconType: "multilingual",
      title: "Multilingual Support",
      description: "Coming soon: Evaluate answers written in multiple languages with equal accuracy.",
      backDetail: "We are actively training models on regional language handwriting to support institutions across India and beyond. Early access available on request.",
    },
  ];

  const benefits = [
    {
      iconType: "clock",
      title: "Saves 80%+ Time",
      description: "Drastically reduce evaluation time with AI-powered grading that maintains accuracy.",
      backDetail: "What used to take days now takes minutes. Our AI processes handwritten scripts at scale, freeing educators to focus on teaching rather than marking.",
    },
    {
      iconType: "scale",
      title: "Unbiased Evaluation",
      description: "Ensure fair grading with explainable AI that follows precise rubrics for every answer.",
      backDetail: "Every script is evaluated against the same rubric with zero fatigue bias. Our AI provides full reasoning for every mark awarded so professors can review and trust the grade.",
    },
    {
      iconType: "feedback",
      title: "Auto-Feedback",
      description: "Generate detailed, personalized feedback for students automatically with each evaluation.",
      backDetail: "Each student receives tailored comments on what they got right, where they went wrong, and how to improve — generated instantly alongside the grade.",
    },
    {
      iconType: "analytics",
      title: "Comprehensive Analytics",
      description: "Gain valuable insights into student performance and track progress over time.",
      backDetail: "From class-wide heatmaps to individual student trajectories, our analytics dashboard helps educators identify knowledge gaps early and act on them.",
    },
  ];

  const tabs = [
    { key: "features", label: "Features", count: features.length },
    { key: "benefits", label: "Benefits", count: benefits.length },
  ];

  const activeItems = activeTab === "features" ? features : benefits;

  return (
    <section id="features" className="relative py-20 md:py-28 bg-white overflow-hidden px-4 sm:px-6 lg:px-8">
      <FloatingDots />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={TRANSITION}
          viewport={viewportOnce}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">🧰</span>
              <span>Features & Benefits</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Why <span className="text-accent">Smart Paper Check</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered features to streamline grading, course management, and
            script evaluation — efficient, accurate, and effortless.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSITION, delay: 0.1 }}
          viewport={viewportOnce}
        >
          <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  activeTab === tab.key ? "text-white" : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "0.02em" }}
              >
                {activeTab === tab.key && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative z-10">
                  {tab.label}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hint */}
        <motion.p
          className="text-center text-gray-400 text-sm mb-8"
          style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "0.02em" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSITION, delay: 0.2 }}
          viewport={viewportOnce}
        >
          Click any card to explore more details
        </motion.p>

        {/* Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className={`grid grid-cols-1 md:grid-cols-2 ${

              activeTab === "benefits" ? "lg:grid-cols-4" : "lg:grid-cols-6"
            } gap-6 lg:gap-8`}
            
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {activeItems.map((item, index) => {
              const isFeatures = activeTab === "features";
              const cardClass = isFeatures
                ? `lg:col-span-2${index === 3 ? " lg:col-start-2" : ""}`
                : "";
              return (
                <FlipCard
                  key={item.title}
                  className={cardClass}
                  iconType={item.iconType}
                  title={item.title}
                  description={item.description}
                  backDetail={item.backDetail}
                  index={index}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ─── CTA Banner ─────────────────────────────────────────── */}
        <motion.div
          className="mt-20 relative py-16 px-8 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(22,109,112,0.04)",
            border: ctaHovered ? `1.5px solid ${ACCENT}` : "1.5px solid rgba(22,109,112,0.12)",
            boxShadow: ctaHovered
              ? `0 0 0 3px rgba(22,109,112,0.10), 0 4px 32px rgba(22,109,112,0.13)`
              : "0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={TRANSITION}
          viewport={viewportOnce}
          onHoverStart={() => setCtaHovered(true)}
          onHoverEnd={() => setCtaHovered(false)}
        >
          {/* Soft blobs */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-accent/10 blur-xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-accent/10 blur-xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            {/* Text */}
            <div className="mb-6 md:mb-0 md:mr-8">
              {/* ✅ Inter (Tailwind default) — Sora removed */}
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                Ready to transform your evaluation process?
              </h3>

              <p
                className="text-gray-600 max-w-xl"
                style={{ fontFamily: "'Sora', sans-serif", lineHeight: "1.65", letterSpacing: "0.01em" }}
              >
                Join leading institutions already using Smart Paper Check to save
                time and improve assessment quality.
              </p>
            </div>

            {/* Button */}
            <motion.button
              className="relative overflow-hidden px-8 py-3 rounded-full text-white font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                fontFamily: "'Sora', sans-serif",
                letterSpacing: "0.03em",
                background: ACCENT,
                boxShadow: btnHovered
                  ? `0 6px 24px rgba(22,109,112,0.38), 0 2px 8px rgba(22,109,112,0.22)`
                  : `0 2px 10px rgba(22,109,112,0.22)`,
                transition: "box-shadow 0.25s ease",
              }}
              {...hoverLift}
              onHoverStart={() => setBtnHovered(true)}
              onHoverEnd={() => setBtnHovered(false)}
              onClick={() => navigate("/auth")}
            >
              {/* Shimmer sweep */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)",
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPosition: "200% 0" }}
                animate={btnHovered
                  ? { backgroundPosition: ["-200% 0", "200% 0"] }
                  : { backgroundPosition: "200% 0" }
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* Label + animated arrow */}
              <span className="relative z-10 flex items-center gap-2">
                Get Started Today
                <motion.span
                  animate={btnHovered ? { x: [0, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.5, repeat: btnHovered ? Infinity : 0, ease: "easeInOut" }}
                  style={{ display: "inline-block" }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </div>
        </motion.div>
        {/* ─── End CTA Banner ──────────────────────────────────────── */}

      </div>
    </section>
  );
};

export default Features;
