import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

const FAQItem = ({ question, answer, isOpen, toggleOpen, index }) => {
  return (
    <motion.div
      className="border-b border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.button
        className="py-5 w-full flex justify-between items-center text-left group focus:outline-none rounded-lg transition-colors duration-200 hover:bg-gray-100/60 px-3 -mx-3 origin-left"
        onClick={toggleOpen}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Left accent bar for open item */}
        <div className="flex items-start gap-3 pr-4 flex-1 min-w-0">
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0 transition-all duration-300"
            style={{
              backgroundColor: isOpen ? "#166D70" : "transparent",
            }}
          />
          <h3
            className="text-lg font-medium transition-colors duration-200"
            style={{ color: isOpen ? "#166D70" : "#1f2937" }}
          >
            {question}
          </h3>
        </div>
        <motion.div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{
            backgroundColor: isOpen ? "rgba(22, 109, 112, 0.1)" : "transparent",
          }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiChevronDown className="w-5 h-5 text-accent" />
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5 pl-7 text-gray-600 text-base leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Does it support handwritten diagrams?",
      answer: "Yes, Smart Paper Check is equipped with advanced Vision-Language Models that can interpret not only handwritten text but also diagrams, equations, and tables. Our system recognizes different diagram types and evaluates them based on technical accuracy and relevance to the question."
    },
    {
      question: "How accurate is the evaluation?",
      answer: "Smart Paper Check achieves over 90% correlation with expert evaluators. Our AI models are continuously trained on academic content and refined based on feedback from education professionals. For subjective questions, the system provides explanation for each score, allowing instructors to review or override when necessary."
    },
    {
      question: "Can I manually override scores?",
      answer: "Absolutely. While Smart Paper Check provides automated evaluations, we understand the importance of human oversight. Instructors can review and modify any AI-generated score with a simple interface. Each change you make helps train the system to better align with your specific grading style over time."
    },
    {
      question: "Is data stored securely?",
      answer: "Data security is our top priority. All scripts are encrypted both in transit and at rest using industry-standard protocols. We are compliant with major educational data protection regulations, implement strict access controls, and provide data retention options that put you in control of how long information is stored."
    },
    {
      question: "Do you integrate with LMS platforms?",
      answer: "Yes, Smart Paper Check offers seamless integration with popular Learning Management Systems including Canvas, Moodle, Blackboard, and Google Classroom. Our API and built-in connectors allow for automatic assignment creation, script uploading, and grade synchronization, minimizing administrative overhead."
    },
    {
      question: "What types of questions can Smart Paper Check evaluate?",
      answer: "Smart Paper Check can evaluate a wide range of question types including short answers, long-form essays, numerical problems, diagrams, proofs, and case analyses. The system adapts to different subjects from humanities to STEM fields, with specialized capabilities for mathematical notation, scientific diagrams, and domain-specific terminology."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about Smart Paper Check's capabilities and features
          </p>
        </motion.div>

        <div className="bg-gray-50 shadow-sm border border-gray-100 rounded-xl p-4 sm:p-6">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => setOpenIndex(openIndex === index ? -1 : index)}
              index={index}
            />
          ))}
        </div>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <p className="text-gray-600">
            Still have questions? <a href="#contact" className="text-accent font-medium hover:text-accent transition-colors duration-200">Contact us</a> for more information
          </p>
        </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 