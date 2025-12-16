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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">🌟</span>
              <span>Comparison</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Our <span className="text-accent">Edge</span> Over Others
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
          <table className="min-w-full rounded-xl overflow-hidden shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800">Features</th>
                {competitors.map((competitor, idx) => (
                  <th 
                    key={idx} 
                    className={`px-6 py-5 text-center text-sm font-semibold ${
                      competitor.highlight 
                        ? "text-accent" 
                        : "text-gray-800"
                    }`}
                  >
                    {competitor.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {features.map((feature, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-5 text-sm text-gray-800">{feature}</td>
                  {competitors.map((competitor, colIdx) => (
                    <td key={colIdx} className="px-6 py-5 text-center">
                      {competitor.features[rowIdx] ? (
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            competitor.highlight 
                              ? "bg-accent/10 shadow-sm" 
                              : "bg-gray-100"
                          }`}>
                            <HiOutlineCheck className={`w-5 h-5 ${
                              competitor.highlight 
                                ? "text-accent" 
                                : "text-gray-600"
                            }`} />
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <HiOutlineX className="w-5 h-5 text-gray-400" />
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
          <div className="inline-block py-4 px-6 rounded-lg bg-accent/5 border border-accent/20 shadow-sm">
            <p className="text-gray-700">
              SmartQnA combines the power of LLMs and Vision-Language Models to deliver a comprehensive evaluation experience that traditional platforms simply can't match.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default USP; 