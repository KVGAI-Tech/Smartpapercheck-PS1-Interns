import React from "react";
import { motion } from "framer-motion";
import { 
  HiOutlineChartBar, 
  HiOutlineChartPie, 
  HiOutlineChartSquareBar,
  HiOutlineArrowSmUp 
} from "react-icons/hi";

const InsightCard = ({ icon, title, description, chart, index }) => {
  return (
    <motion.div
      className="relative overflow-hidden bg-white shadow-md border border-gray-100 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 flex items-center justify-center mr-3">
                {icon}
              </div>
              <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <div className="bg-gradient-to-r from-teal-100 to-blue-100 rounded-full px-2 py-1 text-xs flex items-center">
            <HiOutlineArrowSmUp className="text-teal-600 mr-1" />
            <span className="text-gray-800">Live</span>
          </div>
        </div>
      </div>
      
      {chart && (
        <div className="px-4 pb-4">
          <div className="h-40 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
            {chart}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StrengthChart = () => (
  <div className="relative h-full w-full p-2">
    <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
      {[65, 40, 85, 30, 55, 70, 50, 90, 60, 75].map((height, i) => (
        <div key={i} className="flex-1 mx-0.5 flex flex-col justify-end">
          <motion.div 
            className={`${
              height > 75 
                ? 'bg-teal-500' 
                : height > 50 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            } rounded-t-sm`}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            transition={{ duration: 1, delay: i * 0.1 }}
            viewport={{ once: true }}
          />
        </div>
      ))}
    </div>
    <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 text-center">
      <span className="text-xs text-gray-500">Student Strengths by Topic</span>
    </div>
  </div>
);

const HeatmapChart = () => (
  <div className="relative h-full w-full p-2">
    <div className="grid grid-cols-5 grid-rows-4 gap-1 h-full">
      {Array.from({ length: 20 }).map((_, i) => {
        const intensity = Math.random(); // 0 to 1
        let bgColor;
        
        if (intensity > 0.8) bgColor = 'bg-teal-500';
        else if (intensity > 0.6) bgColor = 'bg-teal-400';
        else if (intensity > 0.4) bgColor = 'bg-teal-300';
        else if (intensity > 0.2) bgColor = 'bg-teal-200';
        else bgColor = 'bg-teal-100';
        
        return (
          <motion.div 
            key={i}
            className={`${bgColor} rounded-sm`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
            viewport={{ once: true }}
          />
        );
      })}
    </div>
    <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 text-center">
      <span className="text-xs text-gray-500">Rubric-to-Score Heatmap</span>
    </div>
  </div>
);

const PerformanceChart = () => (
  <div className="relative h-full w-full p-2">
    <div className="flex justify-center items-center h-full">
      <div className="w-28 h-28 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#0ea5e9"
            strokeLinecap="round"
            strokeWidth="10"
            initial={{ strokeDasharray: "283 283", strokeDashoffset: 283 }}
            whileInView={{ strokeDashoffset: 70 }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true }}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.span 
            className="text-xl font-bold text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            viewport={{ once: true }}
          >
            75%
          </motion.span>
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 text-center">
      <span className="text-xs text-gray-500">Class Average Performance</span>
    </div>
  </div>
);

const Insights = () => {
  return (
    <section id="insights" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">📊</span>
              <span>Analytics</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Get Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Insights</span> From Every Answer
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform evaluation data into actionable insights with comprehensive analytics that help you understand student performance and learning patterns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InsightCard
            icon={<HiOutlineChartBar className="w-5 h-5 text-teal-600" />}
            title="Student Strength Analysis"
            description="Identify each student's strengths and areas for improvement across topics and concepts."
            chart={<StrengthChart />}
            index={0}
          />
          
          <InsightCard
            icon={<HiOutlineChartPie className="w-5 h-5 text-blue-600" />}
            title="Rubric-to-Score Heatmaps"
            description="Visualize how different rubric components contribute to overall scores, highlighting patterns."
            chart={<HeatmapChart />}
            index={1}
          />
          
          <InsightCard
            icon={<HiOutlineChartSquareBar className="w-5 h-5 text-purple-600" />}
            title="Class Performance Overview"
            description="Get a comprehensive view of your class's performance with detailed analytics and progression tracking."
            chart={<PerformanceChart />}
            index={2}
          />
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button 
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 px-8 py-3 rounded-full text-white font-medium shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Analytics Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Insights;