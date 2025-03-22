import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hamburger = ({ isOpen, onClick }) => {
  return (
    <button
      className="p-4 focus:outline-none"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label="Toggle menu"
    >
      <div className="space-y-2">
        <span
          className={`block h-0.5 w-6 bg-white transition-transform duration-300 
          ${isOpen ? "rotate-45 translate-y-2.5" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-opacity duration-300 
          ${isOpen ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-transform duration-300 
          ${isOpen ? "-rotate-45 -translate-y-2.5" : ""}`}
        />
      </div>
    </button>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const options = [
    { name: "Home", link: "/" },
    { name: "Resources", link: "/resources" },
    { name: "About Us", link: "/about" },
  ];

  return (
    <div className="md:hidden">
      <Hamburger isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      <div
        className={`fixed top-0 left-0 h-full w-full max-w-xs bg-gray-800/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 text-white">
          <h2 className="text-2xl font-bold mb-8">Menu</h2>
          <nav className="space-y-4">
            {options.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="block py-3 px-4 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 text-lg"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
          
          <a 
            href="https://www.blog.smart-qna.com/"
            className="mt-8 bg-blue-600 w-full py-3 px-6 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors duration-200 block text-center"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
          >
            Our Blogs
          </a>

          <button 
            className="mt-4 bg-teal-500 w-full py-3 px-6 rounded-lg text-lg font-medium hover:bg-teal-600 transition-colors duration-200"
            onClick={() => {
              setIsOpen(false);
              navigate('/auth');
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  
  const options = [
    { name: "Home", link: "/" },
    { name: "Resources", link: "/resources" },
    { name: "About Us", link: "/about" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 lg:px-12 py-8 w-full absolute top-0 left-0 z-20">
      <div className="font-medium text-2xl md:text-3xl">
        Smart <span className="font-normal italic">QnA</span>
      </div>

      <div className="hidden md:flex items-center">
        {options.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            className="font-medium py-2 px-6 text-base"
          >
            {item.name}
          </a>
        ))}
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <a 
          href="https://www.blog.smart-qna.com/"
          className="bg-blue-600 py-2 px-6 rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Our Blogs
        </a>

        <button 
          className="bg-teal-500 py-2 px-6 rounded-md text-sm md:text-base hover:bg-teal-600 transition-colors duration-200"
          onClick={() => navigate('/auth')}
        >
          Get Started
        </button>
      </div>

      <MobileMenu />
    </nav>
  );
};

export default Navbar;