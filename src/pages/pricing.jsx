import React from 'react';
import Navbar from '../components/LandingPage/navbar';
import Footer from '../components/LandingPage/Footer';
import DatasetPricing from '../components/LandingPage/DatasetPricing';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <Navbar />
      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Select the perfect plan for your institution's needs
            </p>
          </div>
        </section>
        <DatasetPricing />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage; 