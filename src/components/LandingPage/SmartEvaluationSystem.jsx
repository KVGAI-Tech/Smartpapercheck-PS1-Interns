import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileText,
  MessageSquareText,
  ScanLine,
} from "lucide-react";

const features = [
  {
    title: "Handwritten Text Recognition",
    desc: "Digitize and process student handwriting instantly from scanned answer scripts.",
    icon: FileText,
    metric: "OCR + VLM",
  },
  {
    title: "Diagram & Equation Evaluation",
    desc: "Accurately interpret complex sketches, technical graphs, and mathematical equations.",
    icon: ScanLine,
    metric: "Visual reasoning",
  },
  {
    title: "Automated Feedback Generation",
    desc: "Provide students with step-by-step reasoning and personalized feedback for every grade.",
    icon: MessageSquareText,
    metric: "Explainable notes",
  },
  {
    title: "Comprehensive Analytics",
    desc: "Track institutional performance, visualize cohort trends, and identify knowledge gaps.",
    icon: BarChart3,
    metric: "Course insights",
  },
];

const workflowSteps = [
  { label: "Script uploaded", value: "PDF / scan" },
  { label: "AI evaluation", value: "Rubric aligned" },
  { label: "Professor review", value: "Audit ready" },
];

const scoreRows = [
  { question: "Q1", score: "8.5/10", width: "85%" },
  { question: "Q2", score: "7/10", width: "70%" },
  { question: "Q3", score: "9/10", width: "90%" },
];

const stats = [
  { value: "4", label: "core engines" },
  { value: "100%", label: "rubric trace" },
  { value: "24/7", label: "batch ready" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const SmartEvaluationSystem = () => {
  return (
    <section className="w-full scroll-mt-24 py-20 md:py-24 bg-white relative z-10 overflow-hidden border-y border-slate-100">
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(22,109,112,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(22,109,112,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 md:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent shadow-sm">
              <BrainCircuit className="h-4 w-4" />
              Smart Evaluation System
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
              A polished grading workflow built for{" "}
              <span className="text-accent">speed, fairness, and clarity</span>
            </h2>

            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Everything you need to automate academic grading with complete
              transparency and human-level accuracy.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-accent/15 bg-accent/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
                    Evaluation flow
                  </p>
                  <p className="text-base font-semibold text-slate-800">
                    From script upload to reviewed feedback in one traceable path
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-white text-sm font-bold text-accent">
                      {index + 1}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {step.label}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-slate-500">
                        {step.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Live Evaluation Console
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Answer Script: PHY-204 Midterm
                  </p>
                </div>
                <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                  92% complete
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[0.92fr_1.08fr]">
                <div className="border-b border-slate-100 bg-slate-50/60 p-5 md:border-b-0 md:border-r">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-3 w-12 rounded-full bg-accent/20" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="h-3 w-full rounded-full bg-slate-100" />
                      <div className="h-3 w-10/12 rounded-full bg-slate-100" />
                      <div className="h-3 w-8/12 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-6 rounded-xl border border-accent/20 bg-accent/[0.03] p-3">
                      <div className="h-16 rounded-lg border border-dashed border-accent/25 bg-white" />
                      <div className="mt-3 h-3 w-2/3 rounded-full bg-accent/20" />
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="h-2.5 w-11/12 rounded-full bg-slate-100" />
                      <div className="h-2.5 w-7/12 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                        Rubric matched
                      </p>
                      <h3 className="mt-1 text-2xl font-extrabold text-slate-950">
                        24.5 / 30
                      </h3>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
                      <BrainCircuit className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {scoreRows.map((row) => (
                      <div key={row.question}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-700">
                            {row.question}
                          </span>
                          <span className="font-bold text-slate-900">
                            {row.score}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full rounded-full bg-accent"
                            initial={{ width: 0 }}
                            whileInView={{ width: row.width }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            viewport={{ once: true }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <MessageSquareText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Feedback summary
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          Strong conceptual answer with one missing diagram label
                          and a calculation step flagged for review.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {features.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_44px_rgba(22,109,112,0.14)]"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                    {item.metric}
                  </span>
                </div>

                <h4 className="mt-6 text-xl font-extrabold text-slate-950 transition-colors duration-300 group-hover:text-accent">
                  {item.title}
                </h4>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SmartEvaluationSystem;
