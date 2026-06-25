import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Building2,
  Calculator,
  Clock,
  TrendingDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Small reusable count-up number (animates smoothly between values)  */
/* ------------------------------------------------------------------ */
const AnimatedNumber = ({
  value,
  duration = 0.6,
  format = (v) => Math.round(v).toLocaleString(),
}) => {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const cur = from + (to - from) * eased;
      displayRef.current = cur;
      setDisplay(cur);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        displayRef.current = to;
        setDisplay(to);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format(display)}</>;
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const plans = [
  {
    id: "tutor",
    name: "Tutor",
    icon: GraduationCap,
    tagline: "For individual tutors & teachers",
    monthly: 29,
    annual: 23,
    scripts: "Up to 200 scripts / month",
    cta: "Start Free Trial",
    highlight: false,
    features: [
      { text: "AI evaluation of handwritten scripts", included: true },
      { text: "Rubric-based grading", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Email support", included: true },
      { text: "Multi-language support", included: false },
      { text: "API & LMS integration", included: false },
    ],
  },
  {
    id: "institute",
    name: "Coaching Institute",
    icon: Sparkles,
    tagline: "For growing coaching centres",
    monthly: 99,
    annual: 79,
    scripts: "Up to 1,500 scripts / month",
    cta: "Get Started",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Everything in Tutor", included: true },
      { text: "Advanced department analytics", included: true },
      { text: "Diagram & equation grading", included: true },
      { text: "Multi-language support", included: true },
      { text: "Priority support", included: true },
      { text: "API & LMS integration", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    tagline: "For universities & institutions",
    monthly: null, // custom pricing
    annual: null,
    scripts: "Unlimited scripts",
    cta: "Contact Sales",
    highlight: false,
    features: [
      { text: "Everything in Coaching Institute", included: true },
      { text: "Unlimited scripts & seats", included: true },
      { text: "Full API & LMS integration", included: true },
      { text: "Custom AI model tuning", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA & on-prem options", included: true },
    ],
  },
];

// Feature comparison matrix (true | false | string label)
const matrix = [
  { feature: "AI script evaluation", tutor: true, institute: true, enterprise: true },
  { feature: "Rubric-based grading", tutor: true, institute: true, enterprise: true },
  { feature: "Department analytics", tutor: "Basic", institute: "Advanced", enterprise: "Advanced" },
  { feature: "Diagram & equation grading", tutor: false, institute: true, enterprise: true },
  { feature: "Multi-language support", tutor: false, institute: true, enterprise: true },
  { feature: "API & LMS integration", tutor: false, institute: false, enterprise: true },
  { feature: "Custom AI model tuning", tutor: false, institute: false, enterprise: true },
  { feature: "Support", tutor: "Email", institute: "Priority", enterprise: "Dedicated" },
];

// Cost estimator constants
const MANUAL_RATE = 15; // $ per script, manual grading
const MANUAL_MINUTES = 8; // minutes per script, manual grading
const ourRate = (n) => (n <= 200 ? 4 : n <= 1500 ? 2.5 : 1.5); // volume discount

const recommendPlan = (n) =>
  n <= 200 ? "Tutor" : n <= 1500 ? "Coaching Institute" : "Enterprise";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const cardsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const featureList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};
const featureItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

/* Floating background blobs (same idiom as Hero) */
const blobs = [
  { size: "h-40 w-40", pos: { top: "8%", left: "4%" }, delay: 0 },
  { size: "h-56 w-56", pos: { top: "20%", right: "6%" }, delay: 1.5 },
  { size: "h-32 w-32", pos: { bottom: "12%", left: "12%" }, delay: 1 },
];

/* ------------------------------------------------------------------ */
/*  Cell renderer for the comparison matrix                            */
/* ------------------------------------------------------------------ */
const MatrixCell = ({ value }) => {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/10">
        <Check className="w-4 h-4 text-accent" strokeWidth={3} />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
        <X className="w-4 h-4 text-gray-400" strokeWidth={3} />
      </span>
    );
  return <span className="text-sm font-medium text-gray-700">{value}</span>;
};

/* ================================================================== */
const Pricing = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly"); // "monthly" | "annual"
  const [volume, setVolume] = useState(500);
  const [showCompare, setShowCompare] = useState(false);

  const VOL_MIN = 50;
  const VOL_MAX = 3000;
  const pct = ((volume - VOL_MIN) / (VOL_MAX - VOL_MIN)) * 100;

  const ourCost = Math.round(volume * ourRate(volume));
  const manualCost = volume * MANUAL_RATE;
  const savings = Math.max(manualCost - ourCost, 0);
  const hoursSaved = Math.round((volume * MANUAL_MINUTES) / 60);
  const recommended = recommendPlan(volume);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Slider styling scoped to this section (uses --pct set inline) */}
      <style>{`
        .pricing-slider {
          -webkit-appearance: none; appearance: none;
          height: 8px; border-radius: 9999px; outline: none;
          background: linear-gradient(to right,
            var(--accent-color) var(--pct, 50%), #e5e7eb var(--pct, 50%)) !important;
        }
        .pricing-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 22px; height: 22px; border-radius: 9999px;
          background: #fff; border: 3px solid var(--accent-color);
          box-shadow: 0 2px 10px rgba(22,109,112,.45); cursor: pointer;
          transition: transform .15s ease;
        }
        .pricing-slider::-webkit-slider-thumb:hover { transform: scale(1.18); }
        .pricing-slider::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 9999px;
          background: #fff; border: 3px solid var(--accent-color);
          box-shadow: 0 2px 10px rgba(22,109,112,.45); cursor: pointer;
        }
        .pricing-slider::-moz-range-track { background: transparent; }
      `}</style>

      {/* Floating accent blobs */}
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl bg-accent/5 ${b.size} z-0`}
          style={b.pos}
          animate={{ y: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
        />
      ))}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">💸</span>
              <span>Pricing</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-gray-900">
            Simple & <span className="text-accent">Scalable</span> Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Flexible plans designed to fit institutions of all sizes—pay for what you need,
            scale as you grow.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative inline-flex bg-gray-100 rounded-full p-1">
              {[
                { id: "monthly", label: "Monthly" },
                { id: "annual", label: "Annual" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBilling(opt.id)}
                  className="relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                >
                  {billing === opt.id && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-accent rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={billing === opt.id ? "text-white" : "text-gray-600"}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <AnimatePresence>
              {billing === "annual" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                >
                  <TrendingDown className="w-3 h-3" /> Save 20%
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Plan cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
          variants={cardsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billing === "annual" ? plan.annual : plan.monthly;
            return (
              <motion.div
                key={plan.id}
                variants={cardItem}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  plan.highlight
                    ? "bg-white border-2 border-accent shadow-2xl shadow-accent/20 lg:scale-105 z-10"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {/* Most Popular ribbon */}
                {plan.badge && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold shadow-lg"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {plan.badge}
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      plan.highlight ? "bg-accent text-white" : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.tagline}</p>

                {/* Price */}
                <div className="mb-1 min-h-[64px] flex items-end">
                  {price === null ? (
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-semibold text-gray-500 mb-1">$</span>
                      <span className="text-5xl font-bold text-gray-900 leading-none">
                        <AnimatedNumber value={price} />
                      </span>
                      <span className="text-gray-500 mb-1">/mo</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-accent mb-6 h-4">
                  {price !== null && billing === "annual" ? "billed annually" : ""}
                </p>

                <div className="text-sm font-medium text-gray-700 mb-6 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  {plan.scripts}
                </div>

                {/* Features */}
                <motion.ul
                  className="space-y-3 mb-8 flex-1"
                  variants={featureList}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {plan.features.map((f, i) => (
                    <motion.li key={i} variants={featureItem} className="flex items-start gap-2.5">
                      {f.included ? (
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={2.5} />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" strokeWidth={2.5} />
                      )}
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>
                        {f.text}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* CTA */}
                <motion.button
                  onClick={() => navigate("/auth")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3 rounded-full font-medium transition-colors duration-300 ${
                    plan.highlight
                      ? "bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent/90"
                      : "bg-white text-accent border-2 border-accent hover:bg-accent/5"
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ---------------- Cost estimator (volume slider) ---------------- */}
        <motion.div
          className="mt-20 max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 p-8 sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Estimate your savings</h3>
          </div>
          <p className="text-gray-600 mb-8">
            Drag the slider to see how much Smart Paper Check saves you versus manual grading.
          </p>

          {/* Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-medium text-gray-600">Scripts per month</span>
              <span className="text-2xl font-bold text-accent">
                <AnimatedNumber value={volume} duration={0.3} />
                {volume >= VOL_MAX ? "+" : ""}
              </span>
            </div>
            <input
              type="range"
              min={VOL_MIN}
              max={VOL_MAX}
              step={50}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="pricing-slider w-full cursor-pointer"
              style={{ "--pct": `${pct}%` }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{VOL_MIN}</span>
              <span>{VOL_MAX}+</span>
            </div>
          </div>

          {/* Live results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-white border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Smart Paper Check
              </div>
              <div className="text-3xl font-bold text-accent">
                $<AnimatedNumber value={ourCost} duration={0.4} />
              </div>
              <div className="text-xs text-gray-500 mt-1">est. / month</div>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1 flex items-center justify-center gap-1">
                <TrendingDown className="w-3 h-3" /> You save
              </div>
              <div className="text-3xl font-bold text-green-600">
                $<AnimatedNumber value={savings} duration={0.4} />
              </div>
              <div className="text-xs text-gray-500 mt-1">vs manual grading</div>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Time saved
              </div>
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedNumber value={hoursSaved} duration={0.4} />h
              </div>
              <div className="text-xs text-gray-500 mt-1">of grading / month</div>
            </div>
          </div>

          {/* Savings bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Manual cost: ${manualCost.toLocaleString()}</span>
              <span>Our cost: ${ourCost.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${manualCost ? (ourCost / manualCost) * 100 : 0}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="text-center text-gray-700">
            Recommended plan:{" "}
            <span className="font-semibold text-accent">{recommended}</span>
          </div>
        </motion.div>

        {/* ---------------- Comparison matrix (expandable) ---------------- */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center">
            <motion.button
              onClick={() => setShowCompare((s) => !s)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-800 font-medium shadow-sm hover:border-accent/40"
            >
              {showCompare ? "Hide" : "Compare"} all plan features
              <motion.span animate={{ rotate: showCompare ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {showCompare && (
              <motion.div
                key="matrix"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto mt-8">
                  <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
                    <thead>
                      <tr className="bg-accent text-white">
                        <th className="py-4 px-6 text-left">Feature</th>
                        <th className="py-4 px-6 text-center">Tutor</th>
                        <th className="py-4 px-6 text-center">Coaching Institute</th>
                        <th className="py-4 px-6 text-center">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {matrix.map((row, index) => (
                        <motion.tr
                          key={row.feature}
                          className="hover:bg-accent/5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                          <td className="py-4 px-6 text-center">
                            <MatrixCell value={row.tutor} />
                          </td>
                          <td className="py-4 px-6 text-center bg-accent/5">
                            <MatrixCell value={row.institute} />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <MatrixCell value={row.enterprise} />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust strip + custom plan */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-8 text-sm text-gray-500">
            {["No setup fees", "Cancel anytime", "Trusted by 50+ institutions"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>
          <div className="inline-block py-4 px-6 rounded-lg bg-accent/5 border border-accent/10 shadow-sm">
            <p className="text-gray-700">
              Need a custom plan?{" "}
              <button
                onClick={() => navigate("/auth")}
                className="text-accent font-medium hover:underline"
              >
                Contact us
              </button>{" "}
              for a tailored solution that fits your specific requirements.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
