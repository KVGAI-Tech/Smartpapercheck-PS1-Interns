import React from "react";
import { motion } from "framer-motion";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";

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

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-1">
            <div className="flex items-center mb-6">
              <img 
                src="/logo_smartqna.png" 
                alt="Smart Paper Check Logo" 
                className="h-8 mr-3" 
              />
              <div className="font-medium text-xl text-gray-900">
                Smart<span className="font-light italic text-teal-600"> Paper Check</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              AI-powered script evaluation platform for universities and educational institutions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a 
                  key={index} 
                  href={link.href}
                  className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
                  aria-label={link.name}
                  whileHover={{ scale: 1.1 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-gray-900 font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-gray-900 font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-gray-600">
                <strong className="text-gray-900">Email:</strong><br />
                <a href="mailto:info@smart-qna.com" className="hover:text-teal-600 transition-colors duration-200">
                  info@smart-qna.com
                </a>
              </li>
              <li className="text-gray-600">
                <strong className="text-gray-900">Support:</strong><br />
                <a href="mailto:support@smart-qna.com" className="hover:text-teal-600 transition-colors duration-200">
                  support@smart-qna.com
                </a>
              </li>
              <li className="text-gray-600">
                <strong className="text-gray-900">Location:</strong><br />
                Rajasthan, India
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Smart Paper Check by KVGAI Tech Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs">
            Revolutionizing educational assessment with AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;