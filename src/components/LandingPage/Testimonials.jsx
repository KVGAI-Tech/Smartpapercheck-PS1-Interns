import React from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

const TestimonialCard = ({ quote, name, designation, avatar, index }) => {
  return (
    <motion.div 
      className="bg-white shadow-md border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1
      }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start mb-4">
        <div className="mr-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-teal-500 to-blue-500 p-0.5 shadow-md">
            <div className="bg-gray-50 w-full h-full rounded-full overflow-hidden">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium">
                  {name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{designation}</p>
        </div>
      </div>
      
      <div className="relative">
        <FaQuoteLeft className="absolute -top-2 -left-1 text-teal-300 text-xl" />
        <p className="text-gray-700 pl-5 pr-5 py-2">
          {quote}
        </p>
        <FaQuoteRight className="absolute -bottom-2 -right-1 text-teal-300 text-xl" />
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "SmartQnA saves us hours every exam season. The consistency and accuracy in grading has been truly remarkable.",
      name: "Dr. Sharma",
      designation: "Professor, Computer Science",
      avatar: "/testimonials/prof1.jpg"
    },
    {
      quote: "The AI rubric generator brings unprecedented consistency in marking across our department.",
      name: "Dr. Patel",
      designation: "Department Head, Engineering",
      avatar: "/testimonials/prof2.jpg"
    },
    {
      quote: "We've reduced our grading time by 80% and improved feedback quality with SmartQnA's automated evaluation system.",
      name: "Prof. Gupta",
      designation: "Associate Professor, Mathematics",
      avatar: "/testimonials/prof3.jpg"
    },
    {
      quote: "The detailed analytics for each student has revolutionized how we approach curriculum improvements.",
      name: "Dr. Singh",
      designation: "Dean of Academics",
      avatar: "/testimonials/prof4.jpg"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
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
              <span className="mr-2">🧑‍🏫</span>
              <span>Trusted by Educators</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            What <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Professors Are Saying</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from faculty members who've transformed their evaluation process with SmartQnA
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              designation={testimonial.designation}
              avatar={testimonial.avatar}
              index={index}
            />
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button 
            className="bg-white border border-gray-200 hover:bg-gray-100 px-8 py-3 rounded-full text-gray-800 font-medium transition-colors duration-300 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Read More Testimonials
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials; 