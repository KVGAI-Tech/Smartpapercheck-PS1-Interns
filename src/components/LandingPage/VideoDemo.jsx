import React, { useState, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { TRANSITION, hoverCard, viewportOnce } from './motion';

// ─── Accent color ───────────────────────────────────────────────
const ACCENT = "#166D70";

// ─── Chapters ───────────────────────────────────────────────────
const chapters = [
  { label: 'Introduction', emoji: '🎯', timestamp: '0:00', seconds: 0   },
  { label: 'The Problem',  emoji: '⚠️', timestamp: '0:16', seconds: 16  },
  { label: 'AI Solution',  emoji: '🤖', timestamp: '0:40', seconds: 40  },
  { label: 'How It Works', emoji: '⚙️', timestamp: '1:17', seconds: 77  },
  { label: 'For TAs',      emoji: '👩‍🏫', timestamp: '1:57', seconds: 117 },
  { label: 'Get Started',  emoji: '🚀', timestamp: '2:27', seconds: 147 },
];

// ─── Animated Icons ─────────────────────────────────────────────
const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <motion.path d="M13 2L4.5 13.5H11L10 22L19.5 10H13L13 2Z" fill={ACCENT} opacity={0.15} />
    <motion.path d="M13 2L4.5 13.5H11L10 22L19.5 10H13L13 2Z" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    <motion.path
      d="M13 2L4.5 13.5H11L10 22L19.5 10H13L13 2Z"
      fill={ACCENT}
      animate={{ opacity: [0, 0.7, 0, 0, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 0.4 }}
    />
  </svg>
);

const MagnifierIcon = ({ hovered }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round">
    <motion.g
      animate={hovered ? { scale: [1, 1.25, 1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 1.6, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
      style={{ originX: "10px", originY: "10px", transformBox: "fill-box" }}
    >
      <circle cx="10" cy="10" r="7" />
      <motion.line x1="10" y1="7" x2="10" y2="13" strokeWidth="1.2"
        animate={hovered ? { opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <motion.line x1="7" y1="10" x2="13" y2="10" strokeWidth="1.2"
        animate={hovered ? { opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1.6, repeat: Infinity, delay: 0.1 }}
      />
    </motion.g>
    <line x1="15.5" y1="15.5" x2="21" y2="21" strokeWidth="2" />
  </svg>
);

const InsightsIcon = ({ hovered, inView }) => {
  const shouldAnimate = inView || hovered;
  const bars = [
    { x: 3,  width: 5, fullHeight: 10, delay: 0    },
    { x: 11, width: 5, fullHeight: 16, delay: 0.12 },
    { x: 19, width: 5, fullHeight: 8,  delay: 0.24 },
  ];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="1" y1="22" x2="23" y2="22" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
      {bars.map((bar, i) => (
        <motion.rect
          key={i} x={bar.x} width={bar.width} rx="1" fill={ACCENT} stroke="none"
          initial={{ y: 22, height: 0 }}
          animate={shouldAnimate ? { y: 22 - bar.fullHeight, height: bar.fullHeight } : { y: 22, height: 0 }}
          transition={{ duration: 0.55, delay: bar.delay, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────
const StatCard = ({ emoji, iconType, title, description, hovered, onHover, onLeave, inView }) => {
  const renderIcon = () => {
    switch (iconType) {
      case 'lightning': return <LightningIcon />;
      case 'magnifier': return <MagnifierIcon hovered={hovered} />;
      case 'insights':  return <InsightsIcon hovered={hovered} inView={inView} />;
      default: return <span className="text-2xl">{emoji}</span>;
    }
  };
  return (
    <motion.div
      className="bg-white border rounded-xl p-6 transition-all duration-300 cursor-default h-full flex flex-col"
      style={{
        border: hovered ? `1.5px solid ${ACCENT}` : "1.5px solid #f3f4f6",
        boxShadow: hovered
          ? `0 0 0 3px rgba(22,109,112,0.10), 0 4px 20px rgba(22,109,112,0.10)`
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
      }}
      {...hoverCard}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
    >
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-medium mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600" style={{ fontWeight: 300, lineHeight: "1.7", letterSpacing: "0.012em" }}>
        {description}
      </p>
    </motion.div>
  );
};

// ─── Cursor Sparkle ──────────────────────────────────────────────
const CursorSparkle = ({ sparkles }) => (
  <>
    {sparkles.map(s => (
      <motion.div
        key={s.id}
        className="absolute rounded-full pointer-events-none"
        style={{ left: s.x, top: s.y, width: 6, height: 6, backgroundColor: ACCENT, zIndex: 20 }}
        initial={{ opacity: 0.8, scale: 1 }}
        animate={{ opacity: 0, scale: 0, y: -10 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    ))}
  </>
);

// ─── Ripple ──────────────────────────────────────────────────────
const Ripple = ({ ripples }) => (
  <>
    {ripples.map(r => (
      <motion.div
        key={r.id}
        className="absolute rounded-full pointer-events-none border-2"
        style={{ left: r.x - 40, top: r.y - 40, width: 80, height: 80, borderColor: ACCENT, zIndex: 20 }}
        initial={{ opacity: 0.8, scale: 0.2 }}
        animate={{ opacity: 0, scale: 3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    ))}
  </>
);

// ─── Chapter Button ──────────────────────────────────────────────
const ChapterButton = ({ chapter, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2"
    style={{
      background: isActive ? ACCENT : "white",
      color: isActive ? "white" : "#4b5563",
      borderColor: isActive ? ACCENT : "#e5e7eb",
      boxShadow: isActive ? `0 2px 12px rgba(22,109,112,0.25)` : "none",
      fontWeight: isActive ? 500 : 400,
      letterSpacing: "0.01em",
    }}
  >
    <span>{chapter.emoji}</span>
    <span>{chapter.label}</span>
    <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>{chapter.timestamp}</span>
  </button>
);



// ─── Main Component ──────────────────────────────────────────────
const VideoDemo = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const statsRef = useRef(null);
  const thumbnailRef = useRef(null);
  const sparkleCountRef = useRef(0);
  const rippleCountRef = useRef(0);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  const videoId = "3egoZx6St5Y";

  const getEmbedSrc = () =>
    `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${chapters[activeChapter].seconds}&rel=0&modestbranding=1`;

  const handleMouseMove = useCallback((e) => {
    if (videoPlaying) return;
    const rect = thumbnailRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    sparkleCountRef.current += 1;
    const id = sparkleCountRef.current;
    setSparkles(prev => [...prev.slice(-10), { id, x, y }]);
    setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 650);
  }, [videoPlaying]);

  const handleThumbnailClick = useCallback((e) => {
    const rect = thumbnailRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rippleCountRef.current += 1;
    const id = rippleCountRef.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 950);
    setVideoPlaying(true);
  }, []);

  const handleChapterClick = (index) => {
    setActiveChapter(index);
    setVideoPlaying(true);
  };

  const stats = [
    { iconType: 'lightning', emoji: '⚡', title: 'Lightning Fast',    description: 'Process hundreds of scripts in minutes, not days. Save valuable time for teaching.' },
    { iconType: 'magnifier', emoji: '🔍', title: 'Highly Accurate',   description: 'AI models trained specifically for academic evaluation with continuous learning.' },
    { iconType: 'insights',  emoji: '📊', title: 'Detailed Insights', description: 'Get comprehensive analytics on student performance and learning progress.' },
  ];

  return (
    <section id="demo" className="py-20 md:py-28 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto">

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
              <span className="mr-2">🎥</span>
              <span>Product Demo</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
            See <span className="text-accent">Smart Paper Check</span> in Action
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Watch how Smart Paper Check transforms handwritten copies into fully graded evaluations with feedback in minutes.
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={TRANSITION}
          viewport={viewportOnce}
        >
          {!videoPlaying ? (
            <div
              ref={thumbnailRef}
              className="absolute inset-0 cursor-pointer select-none"
              onMouseMove={handleMouseMove}
              onClick={handleThumbnailClick}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')`,
                  opacity: 0.82,
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
              <Ripple ripples={ripples} />
              <CursorSparkle sparkles={sparkles} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="absolute rounded-full border-2"
                    style={{ borderColor: ACCENT, width: 90, height: 90 }}
                    animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute rounded-full border-2"
                    style={{ borderColor: ACCENT, width: 90, height: 90 }}
                    animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                  />
                  <motion.div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg z-10"
                    style={{ backgroundColor: ACCENT }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Play className="text-white w-6 h-6 ml-1" fill="white" />
                  </motion.div>
                </div>
                <motion.p
                  className="mt-6 text-sm font-medium px-5 py-2 rounded-full shadow-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.75)", color: "#1f2937", letterSpacing: "0.02em" }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ✨ Click anywhere to play — or jump to a chapter below
                </motion.p>
              </div>
            </div>
          ) : (
            <iframe
              key={`${activeChapter}-${videoPlaying}`}
              className="absolute top-0 left-0 w-full h-full"
              src={getEmbedSrc()}
              title="Smart Paper Check Demo Video"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </motion.div>

        {/* Chapter Selector */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSITION, delay: 0.1 }}
          viewport={viewportOnce}
        >
          {chapters.map((chapter, index) => (
            <ChapterButton
              key={chapter.label}
              chapter={chapter}
              isActive={activeChapter === index}
              onClick={() => handleChapterClick(index)}
            />
          ))}
        </motion.div>

        {/* Stat Cards */}
        <div ref={statsRef} className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="h-full"
              initial={{ opacity: 0, y: 24 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...TRANSITION, delay: index * 0.08 }}
            >
              <StatCard
                emoji={stat.emoji}
                iconType={stat.iconType}
                title={stat.title}
                description={stat.description}
                hovered={hoveredCard === index}
                onHover={() => setHoveredCard(index)}
                onLeave={() => setHoveredCard(null)}
                inView={statsInView}
              />
            </motion.div>
          ))}
        </div>

        </div>
      </div>
    </section>
  );
};

export default VideoDemo;
