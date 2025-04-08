import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineCheck, HiOutlineMail, HiOutlineOfficeBuilding, HiOutlineUserCircle, HiOutlineBriefcase } from "react-icons/hi";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    role: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0B1011] to-[#101618]">
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
              <span className="mr-2">📬</span>
              <span>Get in Touch</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">SmartQnA</span>?
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Schedule a personalized demo or sign up now to see how SmartQnA can transform your evaluation process
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-5xl mx-auto">
          <motion.div 
            className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <HiOutlineMail className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@smart-qna.com" className="text-white/70 hover:text-teal-400 transition-colors duration-200">
                    info@smart-qna.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Headquarters</p>
                  <p className="text-white/70">
                    New Delhi, India
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h4 className="font-medium mb-4">Follow us on social media</h4>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:p-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-semibold mb-6">Request a Demo</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiOutlineUserCircle className="text-white/50" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-white/30 text-white"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiOutlineMail className="text-white/50" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-white/30 text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-white/70 mb-1">
                    Institution
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiOutlineOfficeBuilding className="text-white/50" />
                    </div>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-white/30 text-white"
                      placeholder="Your institution or organization"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-white/70 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiOutlineBriefcase className="text-white/50" />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-white/30 text-white appearance-none"
                    >
                      <option value="" disabled className="bg-[#101618]">Select your role</option>
                      <option value="professor" className="bg-[#101618]">Professor</option>
                      <option value="administrator" className="bg-[#101618]">Administrator</option>
                      <option value="department-head" className="bg-[#101618]">Department Head</option>
                      <option value="teaching-assistant" className="bg-[#101618]">Teaching Assistant</option>
                      <option value="other" className="bg-[#101618]">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-3">
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 py-3 px-6 rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <span>Schedule a Demo</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center h-full py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-6">
                  <HiOutlineCheck className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                <p className="text-white/70 text-center mb-6">
                  We've received your request and our team will get in touch with you shortly.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-teal-400 hover:text-teal-300 transition-colors duration-200 font-medium"
                >
                  Submit another request
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 