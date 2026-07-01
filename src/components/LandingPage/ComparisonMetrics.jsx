import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate as animateValue } from "framer-motion";
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTrendingUp,
  HiArrowRight,
  HiCheck,
} from "react-icons/hi";

const ACCURACY_FEATURES = [
  "Text Recognition",
  "Diagram Analysis",
  "Equation Grading",
  "Handwriting OCR",
];

const metrics = [
  {
    title: "Time Savings",
    traditional: "8–10 hours",
    smartQnA: "15–20 minutes",
    improvement: "100%",
  },
  {
    title: "Grading Consistency",
    traditional: "Varies by grader",
    smartQnA: "99% consistent",
    improvement: "High",
  },
  {
    title: "Feedback Detail",
    traditional: "Limited",
    smartQnA: "Comprehensive",
    improvement: "5× more detailed",
  },
  {
    title: "Analytics Depth",
    traditional: "Basic",
    smartQnA: "In-depth",
    improvement: "10× more insights",
  },
  {
    title: "Cost per Exam",
    traditional: "$15–20",
    smartQnA: "$3–5",
    improvement: "75%",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const polarToCartesian = (cx, cy, radius, angleDeg) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
};

const SpinningHand = ({ cx, cy, length, color, width = 2.5, duration = 1 }) => {
  const deg = useMotionValue(0);
  const x2 = useTransform(deg, (d) => cx + length * Math.cos(((d - 90) * Math.PI) / 180));
  const y2 = useTransform(deg, (d) => cy + length * Math.sin(((d - 90) * Math.PI) / 180));

  useEffect(() => {
    const controls = animateValue(deg, [0, 360], { duration, ease: "linear", repeat: Infinity });
    return () => controls.stop();
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return <motion.line x1={cx} y1={cy} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
};

const ClockHand = ({ cx, cy, length, angle, color, width = 2.5, animate = false, delay = 0, continuous = false, duration = 1.1 }) => {
  if (continuous) {
    return <SpinningHand cx={cx} cy={cy} length={length} color={color} width={width} duration={duration} />;
  }

  const end = polarToCartesian(cx, cy, length, angle);

  if (!animate) {
    return <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  }

  return (
    <motion.line
      x1={cx}
      y1={cy}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      initial={{ x2: cx, y2: cy - length * 0.2 }}
      whileInView={{ x2: end.x, y2: end.y }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
      viewport={{ once: true }}
    />
  );
};

const DayDialClock = ({ days, size = 132 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const handAngle = (days / 7) * 360;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-sm shrink-0"
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={radius + 8} fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={radius} fill="white" stroke="#d1d5db" strokeWidth="1.5" />

      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * 360;
        const outer = polarToCartesian(cx, cy, radius - 2, angle);
        const inner = polarToCartesian(cx, cy, radius - 12, angle);
        return (
          <g key={i}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text
              x={polarToCartesian(cx, cy, radius - 22, angle).x}
              y={polarToCartesian(cx, cy, radius - 22, angle).y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-[8px] font-semibold"
            >
              D{i + 1}
            </text>
          </g>
        );
      })}

      <ClockHand cx={cx} cy={cy} length={radius - 18} color="#6b7280" width={3} continuous duration={15} />
      <circle cx={cx} cy={cy} r={5} fill="#6b7280" />
      <circle cx={cx} cy={cy} r={2.5} fill="white" />
    </svg>
  );
};

const MinuteClock = ({ minutes, size = 132 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = (minutes / 720) * 360;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-sm shrink-0"
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={radius + 8} fill="rgba(22,109,112,0.06)" stroke="rgba(22,109,112,0.25)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={radius} fill="white" stroke="var(--accent-color)" strokeWidth="1.5" />

      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360;
        const outer = polarToCartesian(cx, cy, radius - 2, angle);
        const inner = polarToCartesian(cx, cy, radius - (i % 3 === 0 ? 12 : 7), angle);
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={i % 3 === 0 ? "var(--accent-color)" : "rgba(22,109,112,0.35)"}
            strokeWidth={i % 3 === 0 ? 2 : 1.2}
            strokeLinecap="round"
          />
        );
      })}

      <ClockHand cx={cx} cy={cy} length={radius - 28} color="var(--accent-color)" width={2.5} continuous duration={30} />
      <ClockHand cx={cx} cy={cy} length={radius - 14} color="var(--accent-color)" width={3} continuous duration={2.5} />
      <circle cx={cx} cy={cy} r={5} fill="var(--accent-color)" />
      <circle cx={cx} cy={cy} r={2.5} fill="white" />
    </svg>
  );
};

const ComparisonMetrics = () => {
  const navigate = useNavigate();

  return (
    <section id="comparison" className="py-20 md:py-28 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
            Evaluation in <span className="text-accent">Minutes</span>, Not Days
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Smart Paper Check revolutionizes answer script evaluation with unprecedented speed and accuracy.
          </p>
        </motion.div>

        {/* Highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {/* Time reduction */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="group relative bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 shadow-sm hover:shadow-[0_12px_40px_rgba(22,109,112,0.28)] hover:border-accent/40 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-accent/[0.02] pointer-events-none rounded-2xl" />

            <div className="relative">
              <div className="flex items-start gap-4 mb-7">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors shadow-sm">
                  <HiOutlineClock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">
                    Evaluation Time Reduction
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    From{" "}
                    <span className="font-semibold text-gray-700">3–4 days</span>{" "}
                    down to{" "}
                    <span className="font-semibold text-accent">
                      10–20 minutes
                    </span>{" "}
                    per batch — a dramatic shift in turnaround.
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-center gap-2 sm:gap-4 py-2">
                <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-none">
                  <DayDialClock days={5.5} />
                  <p className="mt-3 text-xl font-extrabold text-gray-800 text-center leading-tight tracking-tight">
                    5.5 days
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-700 text-center leading-snug">
                    Traditional Method
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-gray-400 text-center leading-snug">
                    Manual evaluation
                  </p>
                </div>

                <div className="flex flex-col items-center shrink-0 px-0.5 sm:px-1 pt-10">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600 tracking-wide">VS</span>
                  </div>
                  <HiOutlineTrendingUp className="w-4 h-4 text-accent mt-2" />
                </div>

                <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-none">
                  <MinuteClock minutes={15} />
                  <p className="mt-3 text-xl font-extrabold text-accent text-center leading-tight tracking-tight">
                    15 min
                  </p>
                  <p className="mt-1 text-sm font-bold text-accent text-center leading-snug">
                    Smart Paper Check
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-gray-400 text-center leading-snug">
                    AI-powered evaluation
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 text-center sm:text-left">
                  Same workload —{" "}
                  <span className="font-bold text-gray-900">528× faster</span>{" "}
                  turnaround
                </p>
                <span className="inline-flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                  <HiOutlineClock className="w-3.5 h-3.5" />
                  100% time saved
                </span>
              </div>
            </div>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="group relative bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 shadow-sm hover:shadow-[0_12px_40px_rgba(22,109,112,0.28)] hover:border-accent/40 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-accent/[0.02] pointer-events-none rounded-2xl" />

            <div className="relative flex flex-col flex-1">
              <div className="flex items-start gap-4 mb-7">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors shadow-sm">
                  <HiOutlineCheckCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">
                    Exceptional Accuracy
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Industry-leading precision across handwritten answers,
                    diagrams, and equations.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 flex-1">
                <div className="relative flex-1 flex items-center justify-center">
                  <div className="absolute w-56 h-56 rounded-full bg-accent/10 blur-2xl" />
                  <svg className="w-56 h-56 sm:w-72 sm:h-72 -rotate-90 relative" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="var(--accent-color)"
                      strokeLinecap="round"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 40}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      whileInView={{
                        strokeDashoffset: 2 * Math.PI * 40 * 0.1,
                      }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-extrabold text-accent leading-none tracking-tight">
                      90%
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-gray-400 mt-2 font-semibold uppercase tracking-widest">
                      Accuracy
                    </span>
                  </div>
                </div>

                <div className="flex flex-col w-64 shrink-0 gap-2.5">
                  {ACCURACY_FEATURES.map((feature, idx) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: 14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.38, delay: 0.3 + idx * 0.09 }}
                      viewport={{ once: true }}
                      className="flex flex-1 items-center gap-3.5 bg-gradient-to-r from-accent/[0.06] to-transparent border border-accent/15 rounded-xl px-4 py-3 hover:from-accent/[0.15] hover:border-accent/50 hover:shadow-[0_4px_18px_rgba(22,109,112,0.22)] transition-all"
                    >
                      <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 shadow-sm">
                        <HiCheck className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span className="text-base font-medium text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              <span className="text-accent">Smart Paper Check</span> vs.
              Traditional Grading
            </h3>
            <p className="text-gray-500 text-sm font-medium mt-2">
              Side-by-side performance across key evaluation metrics
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-gray-200 shadow-md overflow-hidden bg-white">
            <table className="min-w-full">
              <thead>
                <tr className="bg-accent text-white">
                  <th className="py-4 px-6 text-left text-sm font-bold tracking-wider uppercase">
                    Metric
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-bold tracking-wider uppercase">
                    Traditional Grading
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-bold tracking-wider uppercase">
                    Smart Paper Check
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-bold tracking-wider uppercase">
                    Improvement
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.map((metric, index) => (
                  <motion.tr
                    key={metric.title}
                    className="hover:bg-accent/[0.07] hover:ring-2 hover:ring-inset hover:ring-accent/40 transition-all duration-200"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.07 }}
                    viewport={{ once: true }}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 text-base tracking-tight">
                      {metric.title}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-500 text-base font-medium">
                      {metric.traditional}
                    </td>
                    <td className="py-4 px-6 text-center font-medium text-accent text-base">
                      {metric.smartQnA}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium tracking-wide">
                        {metric.improvement}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-accent/50 hover:shadow-[0_8px_28px_rgba(22,109,112,0.22)] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 tracking-tight">{metric.title}</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold tracking-wide">
                    {metric.improvement}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Traditional</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {metric.traditional}
                    </p>
                  </div>
                  <div className="rounded-xl bg-accent/[0.06] border border-accent/15 p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Smart Paper Check</p>
                    <p className="text-sm font-bold text-accent">{metric.smartQnA}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-gray-500 italic text-xs sm:text-sm text-center mt-5">
            *Based on data collected from 50+ educational institutions using
            Smart Paper Check
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-2xl border border-accent/15 bg-accent/10 p-8 sm:p-10 text-center overflow-hidden hover:border-accent/40 hover:bg-accent/[0.15] hover:shadow-[0_12px_40px_rgba(22,109,112,0.22)] transition-all duration-300"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-accent/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-7 max-w-2xl mx-auto">
              Smart Paper Check&apos;s Vision-Language Models understand complex
              handwritten answers, diagrams, and equations with human-level
              comprehension but machine-level efficiency.
            </p>

            <motion.button
              className="bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-7 rounded-full shadow-md hover:shadow-[0_6px_32px_rgba(22,109,112,0.6)] inline-flex items-center gap-2 transition-shadow"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              onClick={() => navigate("/auth")}
            >
              See How It Works
              <HiArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonMetrics;
