import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMenu, HiX } from 'react-icons/hi';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const options = [
    { name: "Home", link: "/" },
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "FAQ", link: "#faq" },
    { name: "Contact", link: "#contact" },
    { name: "Docs", link: "/" }
  ];

  return (
    <div className="lg:hidden">
      <button
        className="p-2 rounded-md bg-teal-100 text-teal-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiOutlineMenu className="w-6 h-6" />
        )}
      </button>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-xl z-50"
      >
        <div className="p-6 text-gray-900">
          <div className="flex justify-between items-center mb-8">
            <img 
              src="/logo_smartqna.png" 
              alt="SmartQnA Logo" 
              className="h-8"
            />
            <button onClick={() => setIsOpen(false)}>
              <HiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {options.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="block py-3 px-4 border-l-2 border-transparent hover:border-teal-500 hover:bg-teal-50 rounded-r-lg transition-all duration-200 text-lg text-gray-800"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
          
          <div className="mt-8 space-y-4">
            <a 
              href="https://blog.smart-qna.com/"
              className="w-full py-3 px-6 border border-blue-500 text-blue-600 rounded-md text-lg font-medium hover:bg-blue-50 transition-colors duration-200 block text-center"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
            >
             Blogs
            </a>

            <button 
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 py-3 px-6 rounded-md text-lg font-medium hover:opacity-90 transition-opacity duration-200 text-white"
              onClick={() => {
                setIsOpen(false);
                navigate('/auth');
              }}
            >
              Request Demo
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const options = [
    { name: "Home", link: "/" },
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "FAQ", link: "#faq" },
    { name: "Contact", link: "#contact" },
    { name: "Docs", link: "/" },
  ];

  return (
    <motion.nav 
      className={`fixed w-full py-4 px-4 lg:px-12 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <img 
            src="/logo_smartqna.png" 
            alt="SmartQnA Logo" 
            className="h-8 mr-3" 
          />
          <div className="font-medium text-2xl md:text-2xl text-gray-900">
            Smart<span className="font-light italic text-teal-600">QnA</span>
          </div>
        </motion.div>

        <div className="hidden lg:flex items-center space-x-6">
          {options.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.link}
              className="font-medium py-2 px-3 text-base text-gray-700 hover:text-teal-600 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          <motion.a 
            href="https://blog.smart-qna.com/"
            className="py-2 px-6 border border-blue-500 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Blogs
          </motion.a>

          <motion.button 
            className="bg-gradient-to-r from-teal-500 to-blue-500 py-2 px-6 rounded-md font-medium text-white hover:opacity-90 transition-opacity duration-200 shadow-md"
            onClick={() => navigate('/auth')}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Request Demo
          </motion.button>
        </div>

        <MobileMenu />
      </div>
    </motion.nav>
  );
};

export default Navbar;