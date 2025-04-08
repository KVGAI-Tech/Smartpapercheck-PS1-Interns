import React from "react";
import { motion } from "framer-motion";
import { 
  HiOutlineClock, 
  HiOutlineScale, 
  HiOutlineChatAlt2, 
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineDatabase,
  HiOutlinePhotograph,
  HiOutlineUpload,
  HiOutlineTranslate
} from "react-icons/hi";

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </motion.div>
  );
};

const Features = () => {
  const benefits = [
    {
      icon: <HiOutlineClock className="w-6 h-6 text-teal-400" />,
      title: "Saves 80%+ Time",
      description: "Drastically reduce evaluation time with AI-powered grading that maintains accuracy and consistency."
    },
    {
      icon: <HiOutlineScale className="w-6 h-6 text-blue-400" />,
      title: "Unbiased Evaluation",
      description: "Ensure fair and consistent grading with explainable AI that follows precise rubrics for every answer."
    },
    {
      icon: <HiOutlineChatAlt2 className="w-6 h-6 text-purple-400" />,
      title: "Auto-Feedback",
      description: "Generate detailed, personalized feedback for students automatically with each evaluation."
    },
    {
      icon: <HiOutlineChartBar className="w-6 h-6 text-teal-400" />,
      title: "Comprehensive Analytics",
      description: "Gain valuable insights into student performance, identify trends, and track progress over time."
    }
  ];

  const features = [
    {
      icon: <HiOutlineDocumentText className="w-6 h-6 text-teal-400" />,
      title: "VLM Grading",
      description: "Vision-Language Models understand both text and visual elements in handwritten answers."
    },
    {
      icon: <HiOutlineDatabase className="w-6 h-6 text-blue-400" />,
      title: "Auto Rubric Generation",
      description: "AI creates detailed grading rubrics from your question papers or model answers."
    },
    {
      icon: <HiOutlinePhotograph className="w-6 h-6 text-purple-400" />,
      title: "Diagram Recognition",
      description: "Advanced image recognition evaluates diagrams, tables, and equations in student responses."
    },
    {
      icon: <HiOutlineUpload className="w-6 h-6 text-teal-400" />,
      title: "Batch PDF Processing",
      description: "Upload multiple answer scripts in PDF format for efficient bulk processing."
    },
    {
      icon: <HiOutlineTranslate className="w-6 h-6 text-blue-400" />,
      title: "Multilingual Support",
      description: "Coming soon: Evaluate answers written in multiple languages with equal accuracy."
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-white/90 text-sm">
              <span className="mr-2">🧰</span>
              <span>Features & Benefits</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">SmartQnA</span>?
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            AI-powered features to streamline grading, course management, and script evaluation— efficient, accurate, and effortless.
          </p>
        </motion.div>

        <div className="mb-24">
          <motion.h3 
            className="text-2xl font-medium mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Benefits</span>
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <FeatureCard
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                index={index}
              />
            ))}
          </div>
        </div>

        <div>
          <motion.h3 
            className="text-2xl font-medium mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Features</span>
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>

        <motion.div 
          className="mt-20 relative py-16 px-8 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {/* Background blur elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-teal-500/20 blur-xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-500/20 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl font-bold mb-2">Ready to transform your evaluation process?</h3>
              <p className="text-white/70 max-w-xl">
                Join leading institutions already using SmartQnA to save time and improve assessment quality.
              </p>
            </div>
            <motion.button 
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 px-8 py-3 rounded-full text-white font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;