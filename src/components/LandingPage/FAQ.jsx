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
      viewport={{ once: true }}
    >
      <motion.button
        className="py-5 w-full flex justify-between items-center text-left"
        onClick={toggleOpen}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiChevronDown className="w-5 h-5 text-teal-600" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pb-5 text-gray-600">
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
      answer: "Yes, SmartQnA is equipped with advanced Vision-Language Models that can interpret not only handwritten text but also diagrams, equations, and tables. Our system recognizes different diagram types and evaluates them based on technical accuracy and relevance to the question."
    },
    {
      question: "How accurate is the evaluation?",
      answer: "SmartQnA achieves over 90% correlation with expert evaluators. Our AI models are continuously trained on academic content and refined based on feedback from education professionals. For subjective questions, the system provides explanation for each score, allowing instructors to review or override when necessary."
    },
    {
      question: "Can I manually override scores?",
      answer: "Absolutely. While SmartQnA provides automated evaluations, we understand the importance of human oversight. Instructors can review and modify any AI-generated score with a simple interface. Each change you make helps train the system to better align with your specific grading style over time."
    },
    {
      question: "Is data stored securely?",
      answer: "Data security is our top priority. All scripts are encrypted both in transit and at rest using industry-standard protocols. We are compliant with major educational data protection regulations, implement strict access controls, and provide data retention options that put you in control of how long information is stored."
    },
    {
      question: "Do you integrate with LMS platforms?",
      answer: "Yes, SmartQnA offers seamless integration with popular Learning Management Systems including Canvas, Moodle, Blackboard, and Google Classroom. Our API and built-in connectors allow for automatic assignment creation, script uploading, and grade synchronization, minimizing administrative overhead."
    },
    {
      question: "What types of questions can SmartQnA evaluate?",
      answer: "SmartQnA can evaluate a wide range of question types including short answers, long-form essays, numerical problems, diagrams, proofs, and case analyses. The system adapts to different subjects from humanities to STEM fields, with specialized capabilities for mathematical notation, scientific diagrams, and domain-specific terminology."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">❓</span>
              <span>FAQ</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Questions</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about SmartQnA's capabilities and features
          </p>
        </motion.div>

        <div className="bg-gray-50 shadow-sm border border-gray-100 rounded-xl p-2 sm:p-6">
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
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600">
            Still have questions? <a href="#contact" className="text-teal-600 font-medium hover:text-teal-700 transition-colors duration-200">Contact us</a> for more information
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ; 