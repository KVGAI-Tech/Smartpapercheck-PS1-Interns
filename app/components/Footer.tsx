// components/Footer.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="w-full bg-blue-900 text-white py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold mb-4">DataMBA</h2>
          <p className="mb-4">
            Revolutionizing business education with cutting-edge datasets tailored for MBA programs. Empower your learning with real-world data.
          </p>
          <div className="flex space-x-4">
            {/* Font Awesome Icons for social media */}
            <a href="#" aria-label="Facebook" className="hover:text-blue-400 transition-colors duration-300">
              <FontAwesomeIcon icon={faFacebookF} size="lg" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition-colors duration-300">
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-400 transition-colors duration-300">
              <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul>
            <li className="mb-2"><a href="#" className="hover:underline">Home</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Features</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Pricing</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="mb-2">Email: info@datamba.com</p>
          <p className="mb-2">Phone: +1 234 567 890</p>
          <p>Address: 123 Data Street, Business City, Country</p>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6 text-center">
        <p>&copy; 2024 DataMBA. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
