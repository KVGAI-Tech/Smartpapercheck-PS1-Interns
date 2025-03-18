import React from 'react';
import Navbar from './navbar.jsx';
import Footer from './Footer.jsx';
import Features from './Features.jsx';
import ProductFlow from './ProductFlow.jsx';
import HowItWorks from './HowItWorks.jsx';
import Impact from './Impact.jsx';
import CollegeShowcase from './CollegeShowcase.jsx';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <Navbar />
      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Transform Your Grading Experience
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Revolutionize answer script evaluation with AI-powered solutions.
              Save time, ensure consistency, and provide better feedback.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-white text-blue-900 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        <Features />
        <ProductFlow />
        <HowItWorks />
        <Impact />
        <CollegeShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage; 