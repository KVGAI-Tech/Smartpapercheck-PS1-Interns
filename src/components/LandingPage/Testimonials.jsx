
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaQuoteLeft } from "react-icons/fa";

const CARD_WIDTH = 300;
const CARD_GAP = 28;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

const TESTIMONIALS = [
  {
    quote: "Smart Paper Check saves us hours every exam season. The consistency and accuracy in grading has been truly remarkable.",
    name: "Prof. Saurabh Gandh",
    designation: "Asst. Prof. Computer Science",
    institute: "IIT Jodhpur, Jodhpur, India",
    avatar: "/images/testimonials/sharma.jpeg",
    accent: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    quote: "The AI rubric generator brings unprecedented consistency in marking across our department.",
    name: "Prof. Vinay Chamola",
    designation: "Associate Prof, Electronics",
    institute: "BITS Pilani",
    avatar: "/images/testimonials/patel.jpeg",
    accent: "#14B8A6",
    bg: "rgba(20,184,166,0.08)",
  },
  {
    quote: "We've reduced our grading time by 80% and improved feedback quality with Smart Paper Check's automated evaluation system.",
    name: "Dr. Vikas Hassija",
    designation: "Associate Prof, CSIT",
    institute: "KIIT",
    avatar: "/images/testimonials/gupta.jpeg",
    accent: "#A855F7",
    bg: "rgba(168,85,247,0.08)",
  },
  {
    quote: "The detailed analytics for each student has revolutionized how we approach curriculum improvements.",
    name: "Dr. Saharsh Agarwal",
    designation: "Assistant Professor",
    institute: "Indian School of Business",
    avatar: "/images/testimonials/singh.jpeg",
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
  },
];

const n = TESTIMONIALS.length;

export default function Testimonials() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const paused = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.offsetWidth));
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Compute card sizes dynamically so it scales on mobile viewports without clipping
  const cardWidth = containerWidth > 0 ? Math.min(300, containerWidth - 32) : 300;
  const cardGap = containerWidth > 0 && containerWidth < 480 ? 16 : 28;

  const getX = useCallback(
    (index, cw) => {
      const currentCw = cw ?? containerWidth;
      const currentCardWidth = currentCw > 0 ? Math.min(300, currentCw - 32) : 300;
      const currentCardGap = currentCw > 0 && currentCw < 480 ? 16 : 28;
      const currentCardStep = currentCardWidth + currentCardGap;
      return currentCw / 2 - (index * currentCardStep + currentCardWidth / 2);
    },
    [containerWidth]
  );

  // Move the track whenever activeIndex or containerWidth changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track || containerWidth === 0) return;
    track.style.transition = "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)";
    track.style.transform = `translateX(${getX(activeIndex)}px)`;
  }, [activeIndex, containerWidth, getX]);

  // Ping-pong every 5 s
  useEffect(() => {
    if (containerWidth === 0) return;
    const id = setInterval(() => {
      if (paused.current) return;
      setActiveIndex((prev) => {
        const next = prev + directionRef.current;
        if (next >= n - 1) directionRef.current = -1;
        if (next <= 0) directionRef.current = 1;
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [containerWidth]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">🧑‍🏫</span><span>Trusted by Educators</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
            What <span className="text-accent">Professors Are Saying</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hear from faculty members who've transformed their evaluation process with Smart Paper Check
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          style={{ overflow: "hidden", width: "100%", padding: "40px 0" }}
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${cardGap}px`,
              width: "max-content",
              willChange: "transform",
            }}
          >
            {TESTIMONIALS.map((t, i) => {
              const active = i === activeIndex;
              return (
                <div
                  key={i}
                  style={{
                    width: `${cardWidth}px`,
                    flexShrink: 0,
                    transform: active ? "scale(1.08)" : "scale(0.87)",
                    opacity: active ? 1 : 0.5,
                    zIndex: active ? 20 : 1,
                    transition: "transform 0.75s cubic-bezier(0.22,1,0.36,1), opacity 0.75s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setActiveIndex(i);
                    paused.current = true;
                    setTimeout(() => { paused.current = false; }, 8000);
                  }}
                >
                  <div style={{
                    background: active ? t.bg : "#ffffff",
                    border: `2px solid ${active ? t.accent : "#e5e7eb"}`,
                    borderRadius: "24px",
                    padding: "24px",
                    minHeight: "290px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: active
                      ? `0 16px 48px -8px ${t.accent}40, 0 4px 16px rgba(0,0,0,0.08)`
                      : "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "background 0.5s, border-color 0.5s, box-shadow 0.5s",
                  }}>
                    <div style={{ flex: 1 }}>
                      <FaQuoteLeft style={{ color: t.accent, opacity: active ? 0.8 : 0.3, fontSize: active ? "22px" : "16px", marginBottom: "12px", transition: "all 0.4s" }} />
                      <p style={{ color: active ? "#111827" : "#6b7280", fontSize: active ? "1rem" : "0.875rem", lineHeight: "1.65", fontWeight: active ? 500 : 400, margin: 0, transition: "all 0.4s" }}>
                        {t.quote}
                      </p>
                    </div>
                    <div style={{ height: "1px", background: active ? `${t.accent}30` : "#f3f4f6", margin: "16px 0", transition: "background 0.5s" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", padding: "2px", background: active ? t.accent : "#e5e7eb", flexShrink: 0, transition: "background 0.5s" }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 600, color: "#374151" }}>
                          {t.avatar
                            ? <img src={t.avatar} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; e.target.parentNode.textContent = t.name.charAt(0); }} />
                            : t.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{t.name}</p>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280" }}>{t.designation}</p>
                        <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 500, color: t.accent, marginTop: "2px" }}>📍 {t.institute}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
          {TESTIMONIALS.map((t, i) => (
            <button
              key={i}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => {
                setActiveIndex(i);
                paused.current = true;
                setTimeout(() => { paused.current = false; }, 8000);
              }}
              style={{
                width: i === activeIndex ? "24px" : "8px",
                height: "8px",
                borderRadius: "9999px",
                background: i === activeIndex ? TESTIMONIALS[activeIndex].accent : "#d1d5db",
                border: "none", padding: 0, cursor: "pointer",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "36px", color: "#9ca3af", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span>🏅</span><span>Join 1000+ educators who trust Smart Paper Check</span><span>🏅</span>
        </div>

      </div>
    </section>
  );
}