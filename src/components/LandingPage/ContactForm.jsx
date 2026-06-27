import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineCheck } from "react-icons/hi";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    role: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          institution: "",
          role: "",
          message: ""
        });
      }, 5000);
    }, 1500);
  };

  const roles = [
    { id: "professor", label: "Professor" },
    { id: "admin", label: "Admin" },
    { id: "it", label: "IT Pro" },
    { id: "other", label: "Other" }
  ];

  return (
    <section id="contact" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white flex flex-col justify-center min-h-[calc(100vh-80px)]">
      
      <div className="max-w-4xl mx-auto w-full relative z-10">

        {/* Section Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-accent font-medium text-xs shadow-sm ring-1 ring-accent/20">
              <span className="mr-2">📩</span>
              <span>Contact Us</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">
            Let's start a <span className="text-accent">Conversation</span>
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Fill in the blanks below to send us a quick message. We'd love to hear from you.
          </p>
        </motion.div>

        {/* The Interactive Letter Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200/60 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
            
            {/* Elegant corner accent */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>

            {isSubmitted ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 ring-8 ring-accent/5">
                  <HiOutlineCheck className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Delivered!</h3>
                <p className="text-gray-500 text-center text-lg max-w-md leading-relaxed">
                  Thanks for reaching out. A member of our team will be in touch with you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="text-xl sm:text-2xl lg:text-3xl text-gray-800 font-light leading-relaxed sm:leading-[3rem] lg:leading-[4rem] tracking-tight">
                  Hi Smart Paper Check team, my name is 
                  <div className="inline-grid items-baseline mx-2 align-baseline min-w-[6rem]">
                    <span className="invisible col-start-1 row-start-1 whitespace-pre px-2 font-medium">
                      {formData.name || "your name"}
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="your name"
                      className="col-start-1 row-start-1 w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-accent text-accent font-medium focus:ring-0 px-2 transition-all duration-300 placeholder-gray-300 focus:outline-none focus:bg-gray-50/50 rounded-t-lg text-left"
                    />
                  </div>
                  and I'm from 
                  <div className="inline-grid items-baseline mx-2 align-baseline min-w-[10rem]">
                    <span className="invisible col-start-1 row-start-1 whitespace-pre px-2 font-medium">
                      {formData.institution || "your institution"}
                    </span>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="your institution"
                      className="col-start-1 row-start-1 w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-accent text-accent font-medium focus:ring-0 px-2 transition-all duration-300 placeholder-gray-300 focus:outline-none focus:bg-gray-50/50 rounded-t-lg text-left"
                    />
                  </div>. 
                  
                  I'm reaching out because I am a 
                  <span className="inline-flex flex-wrap gap-2 mx-2 align-middle my-1">
                    {roles.map((roleOption) => (
                      <button
                        key={roleOption.id}
                        type="button"
                        onClick={() => handleRoleSelect(roleOption.id)}
                        className={`px-4 py-1.5 rounded-full border transition-all duration-300 text-base sm:text-lg font-medium leading-none flex items-center
                          ${formData.role === roleOption.id 
                            ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 transform scale-105' 
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'}`}
                      >
                        {roleOption.label}
                      </button>
                    ))}
                  </span>. 
                  
                  You can reply to me at 
                  <div className="inline-grid items-baseline mx-2 align-baseline min-w-[14rem]">
                    <span className="invisible col-start-1 row-start-1 whitespace-pre px-2 font-medium">
                      {formData.email || "your email address"}
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your email address"
                      className="col-start-1 row-start-1 w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-accent text-accent font-medium focus:ring-0 px-2 transition-all duration-300 placeholder-gray-300 focus:outline-none focus:bg-gray-50/50 rounded-t-lg text-left"
                    />
                  </div>.
                  
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mt-2 lg:mt-4">
                    <span className="whitespace-nowrap">In short,</span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="what's on your mind? (optional)"
                      rows="1"
                      className="flex-1 w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-accent text-accent font-medium focus:ring-0 px-2 py-1 transition-all duration-300 placeholder-gray-300 resize-none focus:outline-none focus:bg-gray-50/50 rounded-t-lg text-left overflow-hidden"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 lg:mt-10 flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-accent/20 flex items-center justify-center transition-all duration-300 text-lg group"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                       <span className="flex items-center gap-2">
                         Send Message 
                         <span className="group-hover:translate-x-1 transition-transform">→</span>
                       </span>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Elegant Support Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 lg:mt-12 flex justify-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 bg-white shadow-md border border-gray-200 rounded-3xl sm:rounded-full px-8 py-5 text-gray-800 font-semibold text-base sm:text-lg">
             
             <a href="mailto:info@smart-qna.com" className="flex items-center gap-3 hover:text-accent transition-colors group cursor-pointer pr-2 sm:pr-0">
               <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                 <svg className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
               </div>
               <span>info@smart-qna.com</span>
             </a>

             <div className="w-full h-[1px] sm:w-[1px] sm:h-8 bg-gray-200"></div>
             
             <div className="flex items-center gap-3 hover:text-accent transition-colors group cursor-pointer pl-2 sm:pl-0">
               <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                 <svg className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                 </svg>
               </div>
               <span>Live Chat (24/7)</span>
             </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactForm; 