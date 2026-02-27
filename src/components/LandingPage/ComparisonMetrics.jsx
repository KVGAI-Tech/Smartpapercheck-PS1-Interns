import React from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineLightningBolt } from "react-icons/hi";

const ComparisonMetrics = () => {
  const navigate = useNavigate();
  
  const metrics = [
    {
      title: "Time Savings",
      traditional: "8-10 hours",
      smartQnA: "15-20 Minutes",
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
      improvement: "5x more detailed",
    },
    {
      title: "Analytics Depth",
      traditional: "Basic",
      smartQnA: "In-depth",
      improvement: "10x more insights",
    },
    {
      title: "Cost per Exam",
      traditional: "$15-20",
      smartQnA: "$3-5",
      improvement: "75%",
    },
  ];

  return (
    <section id="comparison" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm mb-4">
            <span className="mr-2">📊</span>
            <span>Performance Metrics</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-gray-900">
            Evaluation in <span className="text-accent">Minutes</span>, Not Days
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Smart Paper Check revolutionizes answer script evaluation with unprecedented speed and accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                <HiOutlineClock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Evaluation Time Reduction</h3>
            </div>

            <p className="text-gray-600 mb-8">
              Smart Paper Check reduces evaluation time from <span className="font-medium">5-6 days</span> to just <span className="font-medium text-accent">10-20 minutes</span>, saving over 100% of time spent on grading.
            </p>

            <div className="flex flex-col relative h-64">
              <div className="flex justify-between items-end relative mb-4">
                <div className="flex flex-col items-center w-1/3">
                  <div className="bg-gray-200 w-24 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-700">5.5</div>
                      <div className="text-gray-600">days</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-medium text-gray-800">Traditional Method</div>
                    <div className="text-sm text-gray-500">Manual Evaluation</div>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-sm text-gray-700">VS</span>
                  </div>
                </div>

                <div className="flex flex-col items-center w-1/3">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-accent">15</div>
                    <div className="text-gray-600">Minutes</div>

                  </div>
                  <div className="bg-accent text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    100% Time Saved
                  </div>
                  <div className="mt-8 text-center">
                    <div className="font-medium text-gray-800">Smart Paper Check</div>
                    <div className="text-sm text-gray-500">AI-Powered Evaluation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                <HiOutlineCheckCircle className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Exceptional Accuracy</h3>
            </div>

            <p className="text-gray-600 mb-8">
              Achieve <span className="font-medium text-accent">90% accuracy</span> with our AI-powered evaluation system that understands complex answers and diagrams.
            </p>

            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg className="w-56 h-56" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeLinecap="round"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset="28.3"
                    transform="rotate(-90 50 50)"
                  />
                </svg>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-4xl font-bold text-accent">90%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>

                <div className="absolute top-5 right-5 bg-accent/10 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-accent text-lg">%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {["Text Recognition", "Diagram Analysis", "Equation Grading", "Handwriting OCR"].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          className="overflow-x-auto mt-16 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
            <span className="text-accent">Smart Paper Check</span> vs. Traditional Grading
          </h3>
          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead>
              <tr className="bg-accent text-white">
                <th className="py-4 px-6 text-left">Metric</th>
                <th className="py-4 px-6 text-center">Traditional Grading</th>
                <th className="py-4 px-6 text-center">Smart Paper Check</th>
                <th className="py-4 px-6 text-center">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <motion.tr
                  key={index}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {metric.title}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    {metric.traditional}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-accent">
                    {metric.smartQnA}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      {metric.improvement}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-center">
            <p className="text-gray-600 italic text-sm">
              *Based on data collected from 50+ educational institutions using Smart Paper Check
            </p>
          </div>
        </motion.div>

        <div className="bg-accent/10 rounded-xl p-8 text-center max-w-4xl mx-auto">
          <p className="text-gray-700 mb-6">
            Smart Paper Check's Vision-Language Models understand complex handwritten answers, diagrams, and equations with human-level comprehension but machine-level efficiency.
          </p>

          <motion.button
            className="bg-accent hover:bg-accent text-white font-medium py-2 px-5 rounded-full shadow-sm inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => navigate('/auth')}
          >
            <span>See How It Works</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </motion.button>        
        </div>
      </div>
    </section>
  );
};

export default ComparisonMetrics;