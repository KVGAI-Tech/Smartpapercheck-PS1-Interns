import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlineChat, HiOutlineCheck } from "react-icons/hi";
import { FiSend } from "react-icons/fi";
import { TRANSITION, hoverLift, viewportOnce } from "./motion";

const RadarGraphic = () => (
  <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center my-8 shrink-0">
    {/* Concentric Circles */}
    <div className="absolute inset-0 rounded-full border border-accent/30"></div>
    <div className="absolute inset-10 rounded-full border border-accent/20"></div>
    <div className="absolute inset-20 rounded-full border border-accent/10"></div>
    <div className="absolute inset-[110px] rounded-full border border-accent/5"></div>

    {/* Center Element */}
    <div className="absolute w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center z-10 border border-gray-50">
      <img src="https://i.pravatar.cc/150?img=68" alt="Center Avatar" className="w-10 h-10 rounded-full" />
    </div>

    {/* Floating Avatars */}
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-4 left-10 w-11 h-11 bg-white rounded-full shadow-lg p-0.5"
    >
      <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" className="w-full h-full rounded-full" />
    </motion.div>

    <motion.div
      animate={{ y: [0, 15, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-10 right-10 w-12 h-12 bg-white rounded-full shadow-lg p-0.5"
    >
      <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-full h-full rounded-full" />
    </motion.div>

    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 -left-3 w-9 h-9 bg-white rounded-full shadow-lg p-0.5"
    >
      <img src="https://i.pravatar.cc/150?img=47" alt="Avatar" className="w-full h-full rounded-full" />
    </motion.div>

    <motion.div
      animate={{ y: [0, 12, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-2 right-1/4 w-8 h-8 bg-white rounded-full shadow-lg p-0.5"
    >
      <img src="https://i.pravatar.cc/150?img=59" alt="Avatar" className="w-full h-full rounded-full" />
    </motion.div>

    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-6 left-1/4 w-7 h-7 bg-white rounded-full shadow-lg p-0.5"
    >
      <img src="https://i.pravatar.cc/150?img=60" alt="Avatar" className="w-full h-full rounded-full" />
    </motion.div>
  </div>
);

const ContactInfoCard = () => (
  <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 relative z-10">
    <a href="mailto:info@smart-qna.com" className="flex items-center gap-4 text-gray-800 hover:text-accent transition-colors group cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
        <svg className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="font-semibold text-base">info@smart-qna.com</span>
    </a>
    <div className="flex items-center gap-4 text-gray-800 hover:text-accent transition-colors group cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
        <svg className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      </div>
      <span className="font-semibold text-base">Live Chat (24/7)</span>
    </div>
  </div>
);

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
    <section id="contact" className="py-20 md:py-28 bg-gray-50 flex flex-col justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={TRANSITION}
          viewport={viewportOnce}
        >
          <div className="flex justify-center mb-3">
            <motion.div
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-accent/10 text-gray-800 text-base shadow-md font-semibold tracking-wide gap-2"
              {...hoverLift}
            >
              <HiOutlineMail className="w-5 h-5 text-accent" />
              <span>Contact Us</span>
            </motion.div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">
            Let's start a <span className="text-accent">Conversation</span>
          </h2>
          <p className="text-base text-gray-700 max-w-2xl mx-auto font-medium">
            Fill in the blanks below to send us a quick message. We'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TRANSITION, delay: 0.1 }}
          viewport={viewportOnce}
          className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Left Column - Visuals & Info */}
          <div className="w-full lg:w-[45%] bg-gray-50/50 p-8 lg:p-12 relative flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-gray-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent"></div>
            <RadarGraphic />
            <ContactInfoCard />
          </div>

          {/* Right Column - Form */}
          <div className="w-full lg:w-[55%] p-8 sm:p-10 lg:p-14 bg-white relative z-10">
            <div className="mb-8 text-center lg:text-left">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Get in Touch</h3>
            </div>

            {isSubmitted ? (
              <motion.div
                className="flex flex-col items-center justify-center py-16 h-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 ring-8 ring-accent/5">
                  <HiOutlineCheck className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Message Delivered!</h3>
                <p className="text-gray-600 text-center text-lg max-w-md leading-relaxed font-medium">
                  Thanks for reaching out. A member of our team will be in touch with you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 bg-white text-gray-900 font-medium placeholder-gray-500 outline-none shadow-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 bg-white text-gray-900 font-medium placeholder-gray-500 outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Institution */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Your institution name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 bg-white text-gray-900 font-medium placeholder-gray-500 outline-none shadow-sm"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((roleOption) => (
                      <button
                        key={roleOption.id}
                        type="button"
                        onClick={() => handleRoleSelect(roleOption.id)}
                        className={`px-4 py-2.5 rounded-xl border transition-all duration-300 text-sm font-semibold flex items-center
                          ${formData.role === roleOption.id
                            ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 shadow-sm'}`}
                      >
                        {roleOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="What's on your mind? (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 bg-white text-gray-900 font-medium placeholder-gray-500 outline-none resize-none shadow-sm"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-center lg:justify-end">
                  <motion.button
                    type="submit"
                    disabled={isLoading || !formData.role} // Require role selection
                    {...hoverLift}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-lg shadow-md flex items-center gap-2 transition-all duration-300 min-w-[180px] justify-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>

        </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 