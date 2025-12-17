import React from "react";
import { motion } from "framer-motion";

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">💸</span>
              <span>Pricing</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Simple & <span className="text-accent">Scalable</span> Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Flexible pricing plans designed to fit institutions of all sizes—pay for what you need, scale as you grow.
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          whileHover={{ y: -6 }}
        >
          <div className="relative rounded-2xl overflow-hidden bg-accent/5 border border-accent/20 shadow-lg">
            <div className="p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Pricing will be revealed soon
              </h3>
              <p className="text-gray-700">
                We’re finalizing the best plan options for tutors, coaching institutes, and institutions.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="inline-block py-4 px-6 rounded-lg bg-accent/5 border border-accent/10 shadow-sm">
            <p className="text-gray-700">
              Need a custom plan? <span className="text-accent font-medium">Contact us</span> for a tailored solution that fits your specific requirements.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;