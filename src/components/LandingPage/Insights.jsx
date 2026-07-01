import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineChartSquareBar,
  HiArrowRight,
  HiOutlineLightningBolt,
} from "react-icons/hi";

/* ── Data ───────────────────────────────────────────────────────────────── */
const HBAR_DATA = [
  { label: "History",  value: 90 },
  { label: "Calculus", value: 85 },
  { label: "Physics",  value: 72 },
  { label: "Algebra",  value: 65 },
  { label: "Chem",     value: 58 },
  { label: "Biology",  value: 45 },
];

const HMAP_ROWS = ["Structure", "Content", "Analysis", "Evidence", "Language"];
const HMAP_COLS = ["Q1", "Q2", "Q3", "Q4"];
const HEATMAP_GRID = [
  0.90, 0.40, 0.70, 0.20,
  0.50, 0.88, 0.30, 0.65,
  0.75, 0.25, 0.92, 0.55,
  0.60, 0.95, 0.42, 0.70,
  0.35, 0.62, 0.85, 0.18,
];

const RINGS = [
  { label: "Pass Rate", value: 92, color: "var(--accent-color)",   r: 38 },
  { label: "Avg Score", value: 75, color: "rgba(22,109,112,0.55)", r: 27 },
  { label: "Top Marks", value: 58, color: "rgba(22,109,112,0.28)", r: 16 },
];

/* ── Chart 1 — Horizontal bar chart ────────────────────────────────────── */
const StrengthChart = () => (
  <div className="h-full w-full flex flex-col justify-center gap-3 p-5">
    {HBAR_DATA.map(({ label, value }, i) => (
      <div key={label} className="flex items-center gap-3">
        <span className="text-[10px] text-gray-400 w-14 text-right shrink-0 font-semibold uppercase tracking-wide">
          {label}
        </span>
        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                value >= 80
                  ? "linear-gradient(to right, rgba(22,109,112,0.5), var(--accent-color))"
                  : value >= 60
                  ? "linear-gradient(to right, rgba(22,109,112,0.25), rgba(22,109,112,0.65))"
                  : "linear-gradient(to right, rgba(22,109,112,0.12), rgba(22,109,112,0.38))",
              boxShadow: value >= 80 ? "0 0 8px rgba(22,109,112,0.45)" : "none",
            }}
            initial={{ width: 0 }}
            whileInView={{ width: `${value}%` }}
            transition={{ duration: 0.85, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          />
        </div>
        <motion.span
          className="text-[11px] font-bold text-accent w-8 shrink-0 text-right"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.09 }}
          viewport={{ once: true }}
        >
          {value}%
        </motion.span>
      </div>
    ))}
  </div>
);

/* ── Chart 2 — Labelled heatmap ─────────────────────────────────────────── */
const HeatmapChart = () => (
  <div className="h-full w-full flex flex-col p-4 gap-2">
    <div className="flex gap-1.5 pl-[68px]">
      {HMAP_COLS.map((col) => (
        <div key={col} className="flex-1 text-center">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            {col}
          </span>
        </div>
      ))}
    </div>

    <div className="flex-1 flex flex-col gap-1.5">
      {HMAP_ROWS.map((row, ri) => (
        <div key={row} className="flex items-center gap-1.5 flex-1">
          <span className="text-[9px] text-gray-400 font-semibold w-16 text-right pr-2 shrink-0 truncate uppercase tracking-wide">
            {row}
          </span>
          {HMAP_COLS.map((_, ci) => {
            const intensity = HEATMAP_GRID[ri * 4 + ci];
            return (
              <motion.div
                key={ci}
                className="flex-1 h-full rounded-lg"
                style={{
                  minHeight: 22,
                  background: `rgba(22,109,112,${intensity})`,
                  boxShadow:
                    intensity > 0.7
                      ? `0 0 8px rgba(22,109,112,${(intensity * 0.5).toFixed(2)})`
                      : "none",
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (ri * 4 + ci) * 0.02 }}
                viewport={{ once: true }}
              />
            );
          })}
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 pl-[68px] mt-1">
      <span className="text-[9px] text-gray-400 font-medium">Low</span>
      <div
        className="flex-1 h-1 rounded-full"
        style={{
          background: "linear-gradient(to right, rgba(22,109,112,0.1), rgba(22,109,112,1))",
        }}
      />
      <span className="text-[9px] text-gray-400 font-medium">High</span>
    </div>
  </div>
);

/* ── Chart 3 — Multi-ring donut ─────────────────────────────────────────── */
const PerformanceChart = () => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const passRate = 92;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-5 px-6 py-6">
      {/* Single large circle */}
      <div className="relative w-56 h-56 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(22,109,112,0.6)" />
              <stop offset="100%" stopColor="rgba(22,109,112,1)" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="rgba(22,109,112,0.08)"
            strokeWidth="7"
          />
          {/* Filled arc */}
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="url(#arcGrad)"
            strokeLinecap="round"
            strokeWidth="7"
            filter="url(#ring-glow)"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: circ * (1 - passRate / 100) }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            viewport={{ once: true }}
          />
        </svg>

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-extrabold text-gray-900 leading-none tracking-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            92%
          </motion.span>
          <motion.span
            className="text-[10px] text-gray-400 mt-1.5 font-semibold uppercase tracking-[0.18em]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            viewport={{ once: true }}
          >
            pass rate
          </motion.span>
        </div>
      </div>

      {/* Legend below */}
      <div className="w-full flex flex-col gap-3">
        {RINGS.map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
            viewport={{ once: true }}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: color, boxShadow: `0 0 5px ${color}` }}
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                <span className="text-[13px] font-extrabold text-accent">{value}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${value}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.6 + i * 0.12 }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ── Card ───────────────────────────────────────────────────────────────── */
const InsightCard = ({ icon: Icon, title, description, chart, index, featured = false, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`group relative flex flex-col rounded-2xl overflow-hidden border bg-white transition-all duration-300 ${
      featured
        ? "border-accent/25 shadow-[0_4px_32px_rgba(22,109,112,0.1)] hover:shadow-[0_8px_48px_rgba(22,109,112,0.18)]"
        : "border-gray-200 shadow-sm hover:border-accent/35 hover:shadow-[0_8px_36px_rgba(22,109,112,0.14)]"
    } ${className}`}
  >
    {/* Hover bloom */}
    <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-accent/[0.07] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.025] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

    {/* Card header */}
    <div className="p-6 pb-5 relative">
      <div className="flex items-start justify-between mb-4">
        {/* Subtle index number */}
        <span className="text-[10px] font-bold text-gray-200 tracking-[0.2em] tabular-nums select-none">
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            featured
              ? "bg-accent/15 border border-accent/25 shadow-[0_0_16px_rgba(22,109,112,0.2)]"
              : "bg-accent/10 border border-accent/15 group-hover:bg-accent/18 group-hover:border-accent/25"
          }`}
        >
          <Icon className="w-[18px] h-[18px] text-accent" />
        </div>
      </div>

      <h3 className="text-[15px] font-bold text-gray-900 mb-2 tracking-tight leading-snug">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>
    </div>

    {/* Thin divider */}
    <div className="mx-6 h-px bg-gray-100" />

    {/* Chart area */}
    <div
      className={`flex-1 mx-5 my-5 rounded-xl overflow-hidden bg-gray-50/70 border border-gray-100/80 ${
        featured ? "min-h-[280px]" : "min-h-[200px]"
      }`}
    >
      {chart}
    </div>
  </motion.div>
);

/* ── Card data ──────────────────────────────────────────────────────────── */
const CARDS = [
  {
    icon: HiOutlineChartBar,
    title: "Student Strength Analysis",
    description: "Identify each student's strengths and improvement areas across topics and concepts.",
    chart: <StrengthChart />,
  },
  {
    icon: HiOutlineChartPie,
    title: "Rubric-to-Score Heatmaps",
    description: "Visualize how rubric components drive scores, spotting patterns at a glance.",
    chart: <HeatmapChart />,
  },
  {
    icon: HiOutlineChartSquareBar,
    title: "Class Performance Overview",
    description: "Comprehensive class-wide analytics with progression tracking and key metrics.",
    chart: <PerformanceChart />,
  },
];

const FOOTER_STATS = [
  "3 analytics modules",
  "Real-time data",
  "Exportable reports",
  "Per-student breakdowns",
];

/* ── Section ────────────────────────────────────────────────────────────── */
const Insights = () => {
  const navigate = useNavigate();

  return (
    <section
      id="insights"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[480px] h-[480px] bg-accent/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[480px] h-[480px] bg-accent/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* ── Header — split layout ───────────────────────────────────────── */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Left: label + heading */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3.5 py-1.5 text-[13px] text-accent font-semibold mb-5 shadow-sm">
              <HiOutlineLightningBolt className="w-3.5 h-3.5" />
              Analytics
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Get Powerful{" "}
              <span
                className="text-accent"
                style={{ textShadow: "0 0 28px rgba(22,109,112,0.35)" }}
              >
                Insights
              </span>{" "}
              From Every Answer
            </h2>
          </div>

          {/* Right: description + CTA */}
          <div className="flex flex-col gap-5 lg:items-end lg:text-right max-w-xs">
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Transform evaluation data into actionable insights that reveal student
              performance and learning patterns.
            </p>
            <motion.button
              className="group bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-7 rounded-full shadow-md hover:shadow-[0_0_36px_rgba(22,109,112,0.45)] inline-flex items-center gap-2.5 transition-all duration-300 self-start lg:self-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              onClick={() => navigate("/auth")}
            >
              Explore All Analytics
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </div>


        </motion.div>

        {/* ── Bento grid ─────────────────────────────────────────────────── */}
        {/*
            Desktop layout (3-col grid):
            [ Strength  (col 1–2, row 1) ] [ Performance (col 3, rows 1–2) ]
            [ Heatmap   (col 1–2, row 2) ] [ ...continues...               ]
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Strength — wide left, row 1 */}
          <div className="md:col-span-2">
            <InsightCard {...CARDS[0]} index={0} />
          </div>

          {/* Performance — tall right column, spans 2 rows */}
          <div className="md:row-span-2 md:col-start-3 md:row-start-1 flex flex-col">
            <InsightCard {...CARDS[2]} index={2} featured className="flex-1" />
          </div>

          {/* Heatmap — wide left, row 2 */}
          <div className="md:col-span-2">
            <InsightCard {...CARDS[1]} index={1} />
          </div>
        </div>

        {/* ── Footer stats strip ─────────────────────────────────────────── */}
        <motion.div
          className="mt-10 pt-7 border-t border-gray-100 flex flex-wrap items-center gap-x-7 gap-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          viewport={{ once: true }}
        >
          {FOOTER_STATS.map((stat, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-[12px] text-gray-400 font-medium"
            >
              <span className="w-1 h-1 rounded-full bg-accent/50 inline-block shrink-0" />
              {stat}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Insights;
