import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" }
  ];

  const socialLinks = [
    { 
      name: "Twitter",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-800">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start pb-20">
          {/* Left: Main Links */}
          <motion.div className="w-full md:w-1/3 mb-12 md:mb-0" variants={itemVariants}>
            <ul className="space-y-6">
              {quickLinks.map((link, index) => (
                <li key={index} className="group">
                  <a 
                    href={link.href} 
                    className="inline-flex items-center text-xl md:text-3xl font-light text-gray-800 hover:text-teal-600 transition-colors duration-300"
                  >
                    {link.name}
                    <motion.span 
                      className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-teal-600"
                      initial={{ x: -10 }}
                      whileHover={{ x: 5 }}
                      animate={{ x: 0 }}
                    >
                      →
                    </motion.span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Info Columns */}
          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-12">
            {/* About Platform */}
            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 mb-6">About</h4>
              <p className="text-base text-gray-600 leading-relaxed font-light">
                AI-powered script evaluation platform for universities and educational institutions.
              </p>
            </motion.div>
            
            {/* Contact Us */}
            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 mb-6">Contact</h4>
              <ul className="space-y-5 text-base">
                <li className="text-gray-600">
                  <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">Email</span>
                  <a href="mailto:info@smart-qna.com" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
                    info@smart-qna.com
                  </a>
                </li>
                <li className="text-gray-600">
                  <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">Support</span>
                  <a href="mailto:support@smart-qna.com" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
                    support@smart-qna.com
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Location */}
            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 mb-6">Location</h4>
              <p className="text-base text-gray-600 leading-relaxed font-light">
                Rajasthan, India
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <motion.div 
          className="pt-10 flex flex-col md:flex-row justify-between items-center border-t border-gray-200"
          variants={itemVariants}
        >
          
          {/* Logo (Back to Orbit) */}
          <motion.div 
            className="flex items-center mb-6 md:mb-0 cursor-pointer group"
            onClick={scrollToTop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Back to Orbit 🚀"
          >
            <img 
              src="/logo_smartqna.png" 
              alt="Smart Paper Check Logo" 
              className="h-8 mr-3 transition-transform group-hover:-translate-y-1 duration-300" 
            />
            <div className="font-medium text-2xl text-gray-900 group-hover:text-teal-700 transition-colors duration-300">
              Smart<span className="font-light italic text-teal-600"> Paper Check</span>
            </div>
          </motion.div>

          {/* Socials */}
          <div className="flex space-x-8 mb-6 md:mb-0">
            {socialLinks.map((link, index) => (
              <motion.a 
                key={index} 
                href={link.href}
                className="text-gray-800 hover:text-teal-600 transition-colors duration-300"
                aria-label={link.name}
                whileHover={{ y: -4, scale: 1.1 }}
              >
                {link.icon}
              </motion.a>
            ))}
          </div>

          {/* Copyright & Slogan */}
          <div className="flex flex-col md:items-end text-center md:text-right">
            <p className="text-gray-500 text-sm mb-2 font-light">
              &copy; {new Date().getFullYear()} Smart Paper Check by KVGAI Tech Pvt. Ltd. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
              Revolutionizing educational assessment with AI
            </p>
          </div>

        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;