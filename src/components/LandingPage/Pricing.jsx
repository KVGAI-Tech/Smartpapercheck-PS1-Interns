import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineCheck, HiOutlineArrowRight } from "react-icons/hi";

// PricingCard Component
const PricingCard = ({ plan, isPopular, features, price, type, description, index }) => {
  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${
        isPopular 
          ? "bg-gradient-to-b from-teal-50 to-blue-50 border border-teal-200 shadow-lg" 
          : "bg-white border border-gray-100 shadow-md"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
            MOST POPULAR
          </div>
        </div>
      )}
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              isPopular ? "text-teal-600" : "text-gray-800"
            }`}>
              {plan}
            </h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700">
            {type}
          </div>
        </div>
        
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-800">₹{price}</span>
          <span className="text-gray-500 ml-2">per script</span>
        </div>
        
        <div className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start">
              <span className="flex-shrink-0 mr-3 mt-1">
                <HiOutlineCheck className={`w-5 h-5 ${
                  isPopular ? "text-teal-600" : "text-blue-600"
                }`} />
              </span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        
        <motion.button
          className={`w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 ${
            isPopular 
              ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Get Started</span>
          <HiOutlineArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const PricingToggle = ({ activeType, setActiveType }) => {
  return (
    <div className="inline-flex p-1 bg-gray-100 rounded-lg shadow-sm">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          activeType === 'b2c' 
            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm' 
            : 'text-gray-700 hover:text-gray-900'
        }`}
        onClick={() => setActiveType('b2c')}
      >
        Tutors/Coaching
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          activeType === 'b2b' 
            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm' 
            : 'text-gray-700 hover:text-gray-900'
        }`}
        onClick={() => setActiveType('b2b')}
      >
        Institutions
      </button>
    </div>
  );
};

const Pricing = () => {
  const [pricingType, setPricingType] = useState('b2c');

  const b2cPlans = [
    {
      plan: "Starter",
      price: "5",
      type: "Small Batches",
      description: "Perfect for tutors with small batches and simple evaluations",
      features: [
        "Basic AI evaluation",
        "Text-only assessment",
        "Per script pricing",
        "Standard feedback",
        "24-hour turnaround"
      ],
      isPopular: false
    },
    {
      plan: "Professional",
      price: "10",
      type: "Medium Batches",
      description: "Ideal for coaching institutes with comprehensive script evaluation needs",
      features: [
        "Advanced AI evaluation",
        "Handwritten script analysis",
        "Detailed feedback generation",
        "Basic analytics",
        "Priority processing",
        "12-hour turnaround"
      ],
      isPopular: true
    },
    {
      plan: "Premium",
      price: "15",
      type: "Complex Scripts",
      description: "For advanced evaluations with diagrams and complex answer scripts",
      features: [
        "Advanced diagram recognition",
        "Multiple language support",
        "Customizable rubrics",
        "Comprehensive feedback",
        "Advanced analytics",
        "6-hour turnaround"
      ],
      isPopular: false
    }
  ];

  const b2bPlans = [
    {
      plan: "Institutional Basic",
      price: "Custom",
      type: "Departments",
      description: "For individual departments or small institutions",
      features: [
        "Bulk evaluation discount",
        "Department dashboard",
        "Customizable interface",
        "API integration",
        "Priority support"
      ],
      isPopular: false
    },
    {
      plan: "Institutional Pro",
      price: "Custom",
      type: "Universities",
      description: "Complete evaluation solution for universities and large institutions",
      features: [
        "Enterprise-grade security",
        "SLA guarantees",
        "Advanced LMS integration",
        "Custom workflows",
        "Dedicated account manager",
        "Technical implementation support"
      ],
      isPopular: true
    },
    {
      plan: "Enterprise",
      price: "Custom",
      type: "Custom",
      description: "Tailored solutions for educational boards and large-scale implementations",
      features: [
        "White-labeling options",
        "Custom AI model training",
        "Unlimited scripts",
        "Highest priority processing",
        "On-premise deployment option",
        "24/7 dedicated support"
      ],
      isPopular: false
    }
  ];

  const plans = pricingType === 'b2c' ? b2cPlans : b2bPlans;

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">💸</span>
              <span>Pricing</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Simple & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Scalable</span> Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Flexible pricing plans designed to fit institutions of all sizes—pay for what you need, scale as you grow.
          </p>
          
          <div className="mb-12">
            <PricingToggle activeType={pricingType} setActiveType={setPricingType} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan.plan}
              price={plan.price}
              type={plan.type}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              index={index}
            />
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="inline-block py-4 px-6 rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 shadow-sm">
            <p className="text-gray-700">
              Need a custom plan? <span className="text-teal-600 font-medium">Contact us</span> for a tailored solution that fits your specific requirements.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;