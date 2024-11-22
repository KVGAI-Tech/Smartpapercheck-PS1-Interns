// components/Footer.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Smart QnA</h2>
          <p className="mb-4">
            Revolutionizing answer script evaluation with AI-powered solutions.
            Automate grading, generate feedback, and empower educators with
            Aviator.
          </p>
          <div className="flex space-x-4 mt-4">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-indigo-400 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faFacebookF} size="lg" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-indigo-400 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-indigo-400 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-indigo-400 transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
          <ul>
            <li className="mb-2">
              <a href="#" className="hover:underline hover:text-indigo-400">
                Home
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline hover:text-indigo-400">
                Features
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline hover:text-indigo-400">
                Pricing
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:underline hover:text-indigo-400">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
          <p className="mb-2">
            <strong>Email:</strong> support@smartqna.com
          </p>
          <p className="mb-2">
            <strong>Phone:</strong> +91 738 888 9308
          </p>
          <p>
            <strong>Address:</strong> BITS Pilani, Pilani Campus, Rajasthan, India
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6 text-center">
        <p>&copy; 2024 Smart QnA. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;