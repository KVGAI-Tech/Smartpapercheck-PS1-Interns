import React from 'react';
import { motion } from 'framer-motion';

const Clientele = () => {
  const clients = [
    { 
      name: 'BITS Pilani', 
      logo: '/bitspilani.png',
      type: 'institution'
    },
    { 
      name: 'IIT Delhi', 
      logo: '/iitdelhi.png',
      type: 'institution'
    },
    { 
      name: 'ISB', 
      logo: '/isb.png',
      type: 'institution'
    },
    { 
      name: 'IIM Bangalore', 
      logo: '/iimbangalore.png',
      type: 'institution'
    }
  ];

  const fadeInUpItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
      }
    }
  };

  const hoverAnimation = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }
    }
  };

  const logoAnimation = {
    rest: { y: 0 },
    hover: { 
      y: [-5, 0, -5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
              <span className="mr-2">🏛️</span>
              <span>Leading Institutions</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Trusted by <span className="text-accent">Global Leaders</span> in Education
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Leading academic institutions and organizations use SmartQnA to streamline assessments.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {clients.map((client, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              variants={fadeInUpItem}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <motion.div 
                className="h-28 w-44 flex items-center justify-center bg-white shadow-md border border-gray-100 rounded-xl p-4 mb-3 hover:shadow-lg transition-all duration-300"
                variants={hoverAnimation}
              >
                <motion.div 
                  className="relative h-20 w-full flex items-center justify-center"
                  variants={logoAnimation}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-36 rounded bg-accent/5" />
                  </div>
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-h-full max-w-full object-contain relative z-10"
                    onError={(e) => {
                      e.target.style.opacity = "0";
                    }}
                  />
                </motion.div>
              </motion.div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-800">{client.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  {client.type === 'institution' ? 'Institution' : 
                   client.type === 'incubator' ? 'Incubator' : 'Award'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-accent/5 border border-accent/20 shadow-sm">
            <p className="text-gray-700 text-sm">
              Join our growing list of partners and transform your evaluation process
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Clientele; 