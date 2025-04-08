import React from "react";
import { motion } from "framer-motion";
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";

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
      name: "SmartQnA",
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

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0B1011] to-[#101618]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-white/90 text-sm">
              <span className="mr-2">🌟</span>
              <span>Comparison</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Edge</span> Over Others
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            See how SmartQnA stands out from traditional evaluation platforms with our cutting-edge AI technologies
          </p>
        </motion.div>

        <motion.div 
          className="overflow-x-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <table className="min-w-full rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-5 text-left text-sm font-semibold text-white/90">Features</th>
                {competitors.map((competitor, idx) => (
                  <th 
                    key={idx} 
                    className={`px-6 py-5 text-center text-sm font-semibold ${
                      competitor.highlight 
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500" 
                        : "text-white/90"
                    }`}
                  >
                    {competitor.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {features.map((feature, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={rowIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}
                >
                  <td className="px-6 py-5 text-sm text-white">{feature}</td>
                  {competitors.map((competitor, colIdx) => (
                    <td key={colIdx} className="px-6 py-5 text-center">
                      {competitor.features[rowIdx] ? (
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            competitor.highlight 
                              ? "bg-gradient-to-r from-teal-500/20 to-blue-500/20" 
                              : "bg-white/5"
                          }`}>
                            <HiOutlineCheck className={`w-5 h-5 ${
                              competitor.highlight 
                                ? "text-teal-400" 
                                : "text-white/60"
                            }`} />
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5">
                            <HiOutlineX className="w-5 h-5 text-white/40" />
                          </span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="inline-block py-4 px-6 rounded-lg bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-white/10">
            <p className="text-white/70">
              SmartQnA combines the power of LLMs and Vision-Language Models to deliver a comprehensive evaluation experience that traditional platforms simply can't match.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default USP; 