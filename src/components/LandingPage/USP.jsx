import React from "react";
import { motion } from "framer-motion";
import { HiOutlineCheck, HiOutlineX, HiSparkles } from "react-icons/hi";
import { TRANSITION, hoverCard, viewportOnce } from "./motion";

const USP = () => {
  const features = [
    "Explainable AI",
    "Multimodal Grading",
    "Instant Feedback",
    "Talent Analytics",
    "Diagram Recognition",
    "Batch Processing"
  ];

  const competitors = [
    {
      name: "Smart Paper Check",
      features: [true, true, true, true, true, true],
      highlight: true
    },
    {
      name: "Mettl",
      features: [false, false, true, true, false, true]
    },
    {
      name: "Moodle",
      features: [false, false, false, true, false, true]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: TRANSITION }
  };

  const textVariants = {
    hidden: { x: 0 },
    show: { x: 0 },
    hover: { x: 6, transition: { type: "spring", stiffness: 400, damping: 25 } }
  };

  const checkVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 10 } },
    hover: { scale: 1.15, rotate: 5, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={TRANSITION}
          viewport={viewportOnce}
        >
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-accent uppercase tracking-[0.2em] text-sm font-mono font-bold">
              <HiSparkles className="w-5 h-5" />
              <span>Comparison</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
            Our <span className="text-accent relative inline-block font-serif italic pr-2">
              Edge
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/50 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path 
                  d="M -2 5 Q 50 14 102 2" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                />
              </svg>
            </span> Over Others
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how Smart Paper Check stands out from traditional evaluation platforms with our cutting-edge AI technologies.
          </p>
        </motion.div>

        <div className="relative">
          {/* Highlight column background */}
          <div className="absolute top-0 bottom-0 left-[33%] w-[22%] bg-accent/[0.03] border border-accent/20 rounded-2xl shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)] -z-10 pointer-events-none hidden md:block" />

          <motion.div 
            className="w-full rounded-2xl shadow-xl bg-white/50 backdrop-blur-sm border border-gray-100 overflow-visible"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <div className="w-full overflow-x-auto pb-4 -mb-4">
              <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-6 text-left text-sm font-bold text-gray-500 uppercase tracking-wider bg-transparent w-1/3 font-mono">Features</th>
                  {competitors.map((competitor, idx) => (
                    <th 
                      key={idx} 
                      className={`px-6 py-6 text-center ${
                        competitor.highlight 
                          ? "text-accent bg-accent/[0.02]" 
                          : "text-gray-600 bg-transparent"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] uppercase tracking-widest font-bold text-accent/80 mb-1 font-mono ${competitor.highlight ? "opacity-100" : "opacity-0 invisible"}`}>
                          Recommended
                        </span>
                        <span className={`font-serif tracking-tight ${competitor.highlight ? "text-2xl font-black" : "text-xl font-bold"}`}>
                          {competitor.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {features.map((feature, rowIdx) => (
                  <motion.tr 
                    key={rowIdx} 
                    variants={rowVariants}
                    whileHover="hover"
                    className="relative group transition-all duration-300 hover:bg-white hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:z-10"
                  >
                    <td className="px-6 py-5 text-base font-semibold text-gray-900 rounded-l-xl relative">
                      <motion.span variants={textVariants} className="inline-block relative z-10 group-hover:text-accent">
                        {feature}
                      </motion.span>
                    </td>
                    {competitors.map((competitor, colIdx) => (
                      <td 
                        key={colIdx} 
                        className={`px-6 py-5 text-center ${competitor.highlight ? "bg-accent/[0.02]" : ""}`}
                      >
                        {competitor.features[rowIdx] ? (
                          <div className="flex justify-center">
                            <motion.div 
                              variants={checkVariants}
                              whileHover="hover"
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-full cursor-default ${
                                competitor.highlight 
                                  ? "bg-accent/10 shadow-sm border border-accent/20" 
                                  : "bg-gray-100"
                              }`}
                            >
                              <HiOutlineCheck className={`w-6 h-6 ${
                                competitor.highlight 
                                  ? "text-accent" 
                                  : "text-gray-500"
                              }`} />
                            </motion.div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50/40"
                            >
                              <HiOutlineX className="w-5 h-5 text-red-300" />
                            </motion.div>
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="w-0 p-0 rounded-r-xl"></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSITION, delay: 0.4 }}
          viewport={viewportOnce}
        >
          <motion.div
            {...hoverCard}
            className="inline-block py-6 px-8 rounded-2xl bg-gradient-to-r from-white to-gray-50 border border-accent/20 shadow-lg shadow-accent/5 hover:shadow-accent/10 transition-all duration-300 cursor-default"
          >
            <p className="text-gray-800 font-medium text-base sm:text-lg">
              Smart Paper Check combines the power of <span className="font-semibold text-accent">LLMs</span> and <span className="font-semibold text-accent">Vision-Language Models</span> to deliver a comprehensive evaluation experience that traditional platforms simply can't match.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default USP; 