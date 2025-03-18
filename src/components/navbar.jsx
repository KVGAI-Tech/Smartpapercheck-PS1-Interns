import React from "react";
import { Link } from "react-router-dom";
import { config, library } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faChartBar,
  faBrain,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

config.autoAddCss = false;
library.add(faChartBar, faBrain, faUsers);

const Navbar = () => {
  return (
    <nav className="w-full z-50 mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <img src="/logo.png" alt="Company Logo" className="h-8" />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <div className="relative group">
                <button className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 ease-in-out">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <a
                      href="#features"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon="chart-bar" className="mr-2" /> Data
                      Analytics
                    </a>
                    <a
                      href="#features"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon="brain" className="mr-2" /> AI
                      Integration
                    </a>
                    <a
                      href="#features"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon="users" className="mr-2" />{" "}
                      Collaboration Tools
                    </a>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <button className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Use Cases
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 ease-in-out">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <a
                      href="#use-cases"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Business Schools
                    </a>
                    <a
                      href="#use-cases"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Research Institutions
                    </a>
                    <a
                      href="#use-cases"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Corporate Training
                    </a>
                  </div>
                </div>
              </div>
              <Link
                to="/pricing"
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/resources"
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Resources
              </Link>
              <Link
                to="/contact"
                className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <Link
              to="/auth"
              className="bg-white text-blue-900 px-4 py-2 rounded-md text-sm font-medium mr-2"
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 