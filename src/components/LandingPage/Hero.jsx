import { motion, useReducedMotion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Rocket, ChevronRight, Volume2, VolumeX, Settings, Maximize2 } from "lucide-react";

const T = {
  headline:      "#0a5254",
  headlineBold:  "#0d6e72",
  body:          "#4b6b6b",
  muted:         "rgba(80,100,100,0.62)",
  accent:        "#166D70",
  accentDeep:    "#0a5254",
  accentLight:   "#1aa8a8",
  cardFill:      "#ffffff",
  cardBorder:    "rgba(22,109,112,0.10)",
  cardShadow:    "0 18px 44px rgba(22,109,112,0.10), 0 4px 12px rgba(0,0,0,0.04)",
  paperFill:     "#fafaf7",
  paperBorder:   "rgba(0,0,0,0.07)",
  videoTint:     "#e7f5f3",
};

const SPRING = { type: "spring", stiffness: 90, damping: 20 };
const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "Inter, system-ui, sans-serif";

function InteractiveGrid({ mouseX, mouseY }) {
  const reduce = useReducedMotion();
  const glowBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(circle 380px at ${x}px ${y}px, rgba(22,109,112,0.06) 0%, transparent 70%)`
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: [
          "linear-gradient(rgba(22,109,112,0.14) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(22,109,112,0.14) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "60px 60px",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.15) 92%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.15) 92%)",
      }} />
      {!reduce && (
        <motion.div style={{ position: "absolute", inset: 0, background: glowBg }} />
      )}
    </div>
  );
}

function NotebookContent({ detail = "front" }) {
  if (detail === "back") {
    return (
      <svg viewBox="0 0 230 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
        {[80, 110, 140, 170, 200, 230, 260].map((y, i) => (
          <path key={i}
            d={`M 36 ${y} q 18 -2 36 0 t 36 0 t ${40 + (i * 7) % 30} 1`}
            stroke="rgba(20,40,42,0.32)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        ))}
      </svg>
    );
  }
  if (detail === "middle") {
    return (
      <svg viewBox="0 0 230 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
        <text x="36" y="56" fontSize="7.5" fontWeight="700" fontFamily="Georgia, serif" fill="rgba(20,40,42,0.55)">
          12. Wave Equation
        </text>
        {[78, 96, 114, 150, 168, 222, 240, 258].map((y, i) => (
          <path key={i}
            d={`M 36 ${y} q 16 -2 32 0 t 32 0 t ${30 + (i * 11) % 40} 1`}
            stroke="rgba(20,40,42,0.42)" strokeWidth="0.85" fill="none" strokeLinecap="round" />
        ))}
        <text x="86" y="138" fontSize="8" fontFamily="Georgia, serif" fontStyle="italic" fill="rgba(20,40,42,0.6)">
          dy/dx = sin(x) · cos(x)
        </text>
        <text x="36" y="200" fontSize="7.5" fontWeight="700" fontFamily="Georgia, serif" fill="rgba(20,40,42,0.55)">
          14. Continuity
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 230 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
      <line x1="158" y1="20" x2="216" y2="20" stroke="rgba(60,70,80,0.45)" strokeWidth="0.7" />
      <line x1="158" y1="32" x2="216" y2="32" stroke="rgba(60,70,80,0.45)" strokeWidth="0.7" />

      <text x="36" y="62" fontSize="8" fontWeight="700" fontFamily="Georgia, serif" fill="rgba(20,40,42,0.7)">
        19. Thermodynamic Equilibrium
      </text>
      {[76, 90].map((y, i) => (
        <path key={`a${i}`}
          d={`M 36 ${y} q 18 -2 36 0 t 36 0 t ${40 + i * 18} 1 t ${30 - i * 8} -1`}
          stroke="rgba(20,40,42,0.5)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      ))}
      <text x="78" y="112" fontSize="9" fontFamily="Georgia, serif" fontStyle="italic" fill="rgba(20,40,42,0.62)">
        F = ½ ∫(a + b)·dx
      </text>
      <path d="M 36 128 q 22 -2 44 0 t 60 1 t 70 -1" stroke="rgba(20,40,42,0.5)" strokeWidth="0.9" fill="none" strokeLinecap="round" />

      <text x="86" y="148" fontSize="8" fontFamily="Georgia, serif" fontStyle="italic" fill="rgba(20,40,42,0.6)">
        ∫₀^∞ e^(−x²) dx
      </text>
      <rect x="156" y="138" width="36" height="14" fill="none" stroke="rgba(20,40,42,0.4)" strokeWidth="0.5" />
      <text x="160" y="148" fontSize="6.5" fontFamily="Georgia, serif" fill="rgba(20,40,42,0.55)">= √π/2</text>

      <text x="36" y="180" fontSize="8" fontWeight="700" fontFamily="Georgia, serif" fill="rgba(20,40,42,0.7)">
        21. General Solution Method
      </text>
      {[194, 208, 222].map((y, i) => (
        <path key={`b${i}`}
          d={`M 36 ${y} q 16 -2 32 0 t 38 0 t ${42 + i * 12} 1`}
          stroke="rgba(20,40,42,0.5)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      ))}
      <text x="56" y="240" fontSize="9" fontFamily="Georgia, serif" fontStyle="italic" fill="rgba(20,40,42,0.6)">
        x² + 2x − 3 = (x+3)(x−1)
      </text>

      <text x="36" y="262" fontSize="8" fontWeight="700" fontFamily="Georgia, serif" fill="rgba(20,40,42,0.7)">
        23. Boundary Conditions
      </text>
      {[276, 290].map((y, i) => (
        <path key={`c${i}`}
          d={`M 36 ${y} q 14 -2 30 0 t 36 0 t ${30 + i * 16} 1`}
          stroke="rgba(20,40,42,0.5)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function NotebookSheet({ rotate, x, y, z, detail, delay }) {
  const reduce = useReducedMotion();
  return (
    <div
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: "clamp(220px, 17vw, 340px)",
        height: "clamp(307px, 23.7vw, 474px)",
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        zIndex: z,
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, rotate: rotate - 4 }}
        animate={{ opacity: 1, y: 0, rotate }}
        transition={{ ...SPRING, delay }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#fdfdf7",
          borderRadius: "6px",
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 14px 32px rgba(20,40,42,0.13), 0 3px 8px rgba(20,40,42,0.06)",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(rgba(110,140,170,0) 17px, rgba(110,140,170,0.22) 17px, rgba(110,140,170,0.22) 18px, rgba(110,140,170,0) 18px)",
          backgroundSize: "100% 18px",
        }}
      >
        <div style={{
          position: "absolute", left: "28px", top: 0, bottom: 0,
          width: "1px", background: "rgba(210,60,60,0.55)",
        }} />
        <div style={{
          position: "absolute", left: "29px", top: 0, bottom: 0,
          width: "1px", background: "rgba(210,60,60,0.18)",
        }} />

        <NotebookContent detail={detail} />

        <svg viewBox="0 0 30 30" style={{
          position: "absolute", bottom: "-1px", right: "-1px",
          width: "30px", height: "30px", display: "block",
        }} aria-hidden="true">
          <path d="M 30 0 L 30 30 L 0 30 Q 16 30 22 22 Q 30 16 30 0 Z"
                fill="#fdfdf7" stroke="rgba(0,0,0,0.10)" strokeWidth="0.5" />
          <path d="M 30 0 L 22 22 Q 30 16 30 0 Z"
                fill="rgba(0,0,0,0.06)" />
        </svg>
      </motion.div>
    </div>
  );
}

function ScannedAnswerCard() {
  const reduce = useReducedMotion();
  const sheets = [
    { rotate: -9, x: -26, y: 8,  z: 1, detail: "back",   delay: 0.55 },
    { rotate: -4, x: -10, y: 2,  z: 2, detail: "middle", delay: 0.62 },
    { rotate:  5, x: 14,  y: 6,  z: 3, detail: "front",  delay: 0.70 },
  ];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.5 }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "clamp(260px, 18vw, 340px)",
        margin: "0 auto",
        height: "clamp(360px, 27vw, 540px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: "clamp(320px, 24vw, 520px)",
        height: "clamp(320px, 24vw, 520px)",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse 60% 50% at center, rgba(22,109,112,0.18), rgba(22,109,112,0.04) 55%, transparent 75%)",
        filter: "blur(8px)",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {sheets.map((s) => (
        <NotebookSheet key={s.z} {...s} />
      ))}
    </motion.div>
  );
}

function VideoProcessingCard() {
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovering, setHovering] = useState(false);
  const videoRef = useRef(null);
  const barRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime  = () => {
      if (v.duration && !isNaN(v.duration) && v.duration > 0) {
        setProgress(v.currentTime / v.duration);
      }
    };
    v.addEventListener("play",  onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    setIsMuted(v.muted);
    setIsPlaying(!v.paused);
    return () => {
      v.removeEventListener("play",  onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else          v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const seekFrom = useCallback((clientX) => {
    const v = videoRef.current;
    const bar = barRef.current;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setProgress(pct);
  }, []);

  const handleBarMouseDown = useCallback((e) => {
    seekFrom(e.clientX);
    const onMove = (ev) => seekFrom(ev.clientX);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [seekFrom]);

  const cardRef = useRef(null);
  const toggleFullscreen = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      (el.requestFullscreen?.() || el.webkitRequestFullscreen?.()).catch?.(() => {});
    }
  }, []);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING, delay: 0.65 }}
      style={{ position: "relative", width: "100%", maxWidth: "clamp(420px, 36vw, 660px)", margin: "0 auto" }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.85 }}
        style={{
          position: "absolute",
          top: "-22px",
          left: "50%",
          transform: "translateX(-50%)",
          background: T.accent,
          color: "#fff",
          padding: "9px 22px",
          borderRadius: "100px",
          fontFamily: SANS,
          fontSize: "0.875rem",
          fontWeight: 600,
          letterSpacing: "-0.005em",
          boxShadow: "0 8px 22px rgba(22,109,112,0.32)",
          whiteSpace: "nowrap",
          zIndex: 4,
        }}
      >
        AI Powered Processing
      </motion.div>

      <div ref={cardRef} style={{
        background: T.videoTint,
        borderRadius: "20px",
        border: `1px solid ${T.cardBorder}`,
        boxShadow: T.cardShadow,
        padding: "28px 20px 18px",
        position: "relative",
      }}>
        <div
          onClick={videoError ? undefined : togglePlay}
          role={videoError ? undefined : "button"}
          tabIndex={videoError ? undefined : 0}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          onKeyDown={(e) => {
            if (videoError) return;
            if (e.key === " " || e.key === "Enter") { e.preventDefault(); togglePlay(); }
          }}
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
            background: "#dceeed",
            aspectRatio: "16/10",
            cursor: videoError ? "default" : "pointer",
            boxShadow: "inset 0 0 0 1px rgba(22,109,112,0.10)",
          }}
        >
          <video
            ref={videoRef}
            src="/zernyx-smart-paper-check.mp4"
            poster="/video-thumbnail.png"
            loop playsInline preload="metadata"
            onError={() => setVideoError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {videoError && (
            <div style={{
              position: "absolute", inset: 0,
              background: "#dceeed",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 240 180" style={{ width: "85%", height: "85%" }} aria-hidden="true">
                <rect x="20" y="20" width="200" height="140" rx="6" fill="rgba(255,255,255,0.7)" stroke="rgba(22,109,112,0.35)" strokeWidth="1.5" />
                <text x="40" y="55" fill="rgba(22,109,112,0.7)" fontFamily="Georgia, serif" fontSize="11" fontStyle="italic">
                  integral e^(-x^2) dx
                </text>
                <text x="40" y="78" fill="rgba(22,109,112,0.65)" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic">
                  lim (1 + 1/n)^n = e
                </text>
                <text x="40" y="100" fill="rgba(22,109,112,0.6)" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic">
                  x^2 + 2x - 3 = (x+3)(x-1)
                </text>
                <rect x="160" y="105" width="48" height="38" fill="none" stroke="rgba(22,109,112,0.5)" strokeWidth="1.2" />
                <line x1="160" y1="105" x2="208" y2="143" stroke="rgba(22,109,112,0.5)" strokeWidth="1.2" />
              </svg>
            </div>
          )}

          <AnimatePresence>
            {!isPlaying && !videoError && (
              <motion.div
                key="play-overlay"
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                  background: "rgba(10,40,42,0.22)",
                }}
              >
                <div style={{
                  width: "88px", height: "88px",
                  borderRadius: "50%",
                  background: T.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 12px 32px rgba(22,109,112,0.45)",
                }}>
                  <Play size={36} color="#fff" fill="#fff" style={{ marginLeft: "4px" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "14px",
          marginTop: "14px", padding: "0 6px",
        }}>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: T.accent, border: "none", padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(22,109,112,0.32)",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            {isPlaying
              ? <Pause size={14} color="#fff" fill="#fff" />
              : <Play  size={14} color="#fff" fill="#fff" style={{ marginLeft: "1px" }} />
            }
          </button>

          <div
            ref={barRef}
            onMouseDown={handleBarMouseDown}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            role="slider"
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            tabIndex={0}
            style={{
              flex: 1,
              height: "18px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div style={{
              width: "100%",
              height: hovering ? "6px" : "4px",
              background: "rgba(22,109,112,0.16)",
              borderRadius: "4px",
              position: "relative",
              overflow: "visible",
              transition: "height 0.15s ease",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0,
                height: "100%",
                width: `${progress * 100}%`,
                background: T.accent,
                borderRadius: "4px",
              }} />
              <div style={{
                position: "absolute",
                top: "50%",
                left: `${progress * 100}%`,
                transform: "translate(-50%, -50%)",
                width: hovering ? "14px" : "11px",
                height: hovering ? "14px" : "11px",
                borderRadius: "50%",
                background: T.accent,
                boxShadow: "0 2px 6px rgba(22,109,112,0.45)",
                transition: "width 0.15s ease, height 0.15s ease",
              }} />
            </div>
          </div>

          <ControlIconButton
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted
              ? <VolumeX size={15} color={T.accent} strokeWidth={2} />
              : <Volume2 size={15} color={T.accent} strokeWidth={2} />
            }
          </ControlIconButton>

          <ControlIconButton aria-label="Settings">
            <Settings size={15} color={T.accent} strokeWidth={2} />
          </ControlIconButton>

          <ControlIconButton onClick={toggleFullscreen} aria-label="Fullscreen">
            <Maximize2 size={14} color={T.accent} strokeWidth={2} />
          </ControlIconButton>
        </div>
      </div>
    </motion.div>
  );
}

function ControlIconButton({ children, onClick, "aria-label": ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: "30px", height: "30px", borderRadius: "50%",
        background: "transparent",
        border: "none",
        padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,109,112,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function ScoreCircle({ value }) {
  const reduce = useReducedMotion();
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (c * value) / 100;
  return (
    <div style={{ position: "relative", width: "56px", height: "56px", flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(22,109,112,0.12)" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none"
          stroke={T.accent} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.95 }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.9rem", fontWeight: 700, color: T.headline, letterSpacing: "-0.02em",
      }}>
        {value}
      </div>
    </div>
  );
}

function GradeReportCard() {
  const reduce = useReducedMotion();
  const questions = [
    { n: 1, label: "Define geometric series",         awarded: 8, total: 8 },
    { n: 2, label: "Convergence conditions",          awarded: 7, total: 8 },
    { n: 3, label: "Worked example proof",            awarded: 8, total: 9 },
  ];
  const earned = questions.reduce((s, q) => s + q.awarded, 0);
  const max    = questions.reduce((s, q) => s + q.total,   0);
  const score  = Math.round((earned / max) * 100);
  const confidence = 94;
  const sectionLabel = {
    fontSize: "0.62rem", color: T.muted, fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase",
  };
  const divider = {
    borderTop: "1px solid rgba(22,109,112,0.10)",
    margin: "14px 0 12px",
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.75 }}
      style={{
        background: T.cardFill,
        borderRadius: "16px",
        border: `1px solid ${T.cardBorder}`,
        boxShadow: T.cardShadow,
        padding: "clamp(14px, 1.3vw, 22px)",
        fontFamily: SANS,
        width: "100%",
        maxWidth: "clamp(310px, 22vw, 400px)",
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.7rem", color: T.muted, fontWeight: 500, marginBottom: "2px" }}>Student</div>
          <div style={{ fontSize: "0.95rem", color: T.headline, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Aarav Mehta
          </div>
          <div style={{ fontSize: "0.72rem", color: T.body, marginTop: "6px", fontWeight: 500 }}>
            Mathematics &middot; Sequences &amp; Series
          </div>
          <div style={{ fontSize: "0.68rem", color: T.muted, marginTop: "2px", fontWeight: 500 }}>
            Set A &middot; Term Exam &middot; 25 marks
          </div>
        </div>
        <ScoreCircle value={score} />
      </div>

      <div style={divider} />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={sectionLabel}>AI Grading Confidence</span>
          <span style={{ fontSize: "0.72rem", color: T.headline, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {confidence}%
          </span>
        </div>
        <div style={{ height: "5px", background: "rgba(22,109,112,0.12)", borderRadius: "3px", overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", background: T.accent, borderRadius: "3px" }}
            initial={reduce ? { width: `${confidence}%` } : { width: "0%" }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 1.0 }}
          />
        </div>
      </div>

      <div style={divider} />

      <div>
        <div style={{ ...sectionLabel, marginBottom: "8px" }}>Question Analysis</div>
        {questions.map((q) => {
          const ok = q.awarded === q.total;
          return (
            <div key={q.n} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "5px 0",
              borderBottom: "1px solid rgba(22,109,112,0.06)",
            }}>
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                background: ok ? "rgba(22,109,112,0.14)" : "rgba(216,124,80,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: ok ? T.accent : "#d87c50",
                }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: T.headline, fontWeight: 600, flexShrink: 0 }}>Q{q.n}.</span>
              <span style={{
                fontSize: "0.7rem", color: T.body, fontWeight: 500,
                flex: 1, minWidth: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {q.label}
              </span>
              <span style={{
                fontSize: "0.7rem",
                color: ok ? T.headline : "#c66f44",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}>
                {q.awarded}/{q.total}
              </span>
            </div>
          );
        })}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 0 0", marginTop: "2px",
        }}>
          <span style={{ ...sectionLabel }}>Total</span>
          <span style={{ fontSize: "0.8rem", color: T.accent, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {earned}/{max}
            <span style={{ color: T.muted, fontSize: "0.65rem", fontWeight: 600, marginLeft: "6px" }}>
              ({score}%)
            </span>
          </span>
        </div>
      </div>

    </motion.div>
  );
}

function FlowArrow({ delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="hero-flow-arrow"
      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay }}
      style={{
        flexShrink: 0,
        width: "36px", height: "36px",
        borderRadius: "50%",
        background: "rgba(22,109,112,0.08)",
        border: "1px solid rgba(22,109,112,0.16)",
        display: "flex", alignItems: "center", justifyContent: "center",
        alignSelf: "center",
      }}
    >
      <ChevronRight size={16} color={T.accent} strokeWidth={2.2} />
    </motion.div>
  );
}

function PanelLabel({ children, withArrow = false }) {
  return (
    <div style={{
      marginTop: "12px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      fontFamily: SANS,
      fontSize: "0.85rem",
      fontWeight: 500,
      color: T.body,
      letterSpacing: "-0.005em",
    }}>
      <span>{children}</span>
      {withArrow && <ChevronRight size={13} color={T.accent} strokeWidth={2} />}
    </div>
  );
}

function FlowSection() {
  return (
    <div
      className="hero-flow-grid"
      style={{
        width: "100%",
        maxWidth: "clamp(960px, 78vw, 1500px)",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr auto 1.6fr auto 1.05fr",
        alignItems: "stretch",
        gap: "clamp(0.75rem, 2.2vw, 2.5rem)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", paddingTop: "24px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ScannedAnswerCard />
        </div>
        <PanelLabel>Scanned Answer Sheets</PanelLabel>
      </div>

      <FlowArrow delay={0.95} />

      <div style={{ display: "flex", flexDirection: "column", paddingTop: "24px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <VideoProcessingCard />
        </div>
      </div>

      <FlowArrow delay={1.05} />

      <div style={{ display: "flex", flexDirection: "column", paddingTop: "24px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GradeReportCard />
        </div>
        <PanelLabel>Structured Digital Grade Report</PanelLabel>
      </div>
    </div>
  );
}

const Hero = ({ scrollToDemo }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  }, [mouseX, mouseY]);

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
        position: "relative",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <style>{`
        @media (max-width: 1199px) {
          .hero-flow-grid {
            grid-template-columns: 1fr !important;
            gap: 2.25rem !important;
          }
          .hero-flow-arrow {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .hero-headline {
            white-space: normal !important;
          }
        }
      `}</style>

      <InteractiveGrid mouseX={mouseX} mouseY={mouseY} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(5.5rem, 7.5vw, 8rem) clamp(1rem, 2.5vw, 1.75rem) clamp(2.5rem, 4vw, 4rem)",
          position: "relative",
          zIndex: 1,
          gap: "clamp(1.75rem, 3.5vw, 3rem)",
          textAlign: "center",
        }}
      >
        <motion.div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%", maxWidth: "720px", minWidth: 0 }}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        >
          <motion.h1
            className="hero-headline"
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: SPRING } }}
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.5rem, 3.6vw, 3rem)",
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              color: T.headline,
              margin: 0,
              width: "100%",
              wordBreak: "normal",
              overflowWrap: "break-word",
            }}
          >
            Academic Evaluation,{" "}
            <span style={{
              fontWeight: 800,
              color: T.headlineBold,
              fontStyle: "normal",
            }}>
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: SPRING } }}
            style={{
              fontFamily: SANS,
              fontSize: "clamp(0.95rem, 1.7vw, 1.0625rem)",
              lineHeight: 1.65,
              color: T.body,
              maxWidth: "62ch",
              margin: 0,
            }}
          >
            Smart Paper Check automates and explains grading of handwritten answer scripts using
            cutting-edge Vision-Language Models &amp; Agentic AI Workflows.
          </motion.p>
        </motion.div>

        <FlowSection />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 1.15 }}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            flexWrap: "wrap", justifyContent: "center",
            marginTop: "0.5rem",
          }}
        >
          <motion.button
            onClick={() => navigate("/auth")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96, y: 1 }}
            transition={SPRING}
            aria-label="Request a Product Demo"
            style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              background: T.accent,
              color: "#fff",
              padding: "13px 26px",
              borderRadius: "100px",
              border: "none",
              fontWeight: 600, fontSize: "0.9375rem",
              cursor: "pointer",
              fontFamily: SANS,
              letterSpacing: "-0.01em",
              boxShadow: "0 8px 24px rgba(22,109,112,0.28), 0 2px 6px rgba(0,0,0,0.07)",
              minHeight: "46px",
              whiteSpace: "nowrap",
            }}
          >
            <Rocket size={15} strokeWidth={1.8} />
            Request a Product Demo
          </motion.button>

          <motion.button
            onClick={scrollToDemo}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            aria-label="Watch Demo"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "transparent",
              color: T.accent,
              padding: "13px 22px",
              borderRadius: "100px",
              border: "1.5px solid rgba(22,109,112,0.32)",
              fontWeight: 500, fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: SANS,
              letterSpacing: "-0.005em",
              minHeight: "46px",
              transition: "background 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(22,109,112,0.05)";
              e.currentTarget.style.borderColor = "rgba(22,109,112,0.50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(22,109,112,0.32)";
            }}
          >
            <Play size={13} fill="currentColor" strokeWidth={0} />
            Watch Demo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
