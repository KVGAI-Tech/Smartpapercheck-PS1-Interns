import React from 'react';
import { motion } from 'framer-motion';

const Clientele = () => {
  const clients = [
    { 
      name: 'WILP BITS Pilani', 
      logo: '/clients/bits-pilani.png',
      type: 'institution'
    },
    { 
      name: 'PIEDS', 
      logo: '/clients/pieds.png',
      type: 'incubator'
    },
    { 
      name: 'Campus Fund', 
      logo: '/clients/campus-fund.png',
      type: 'incubator'
    },
    { 
      name: 'FutureX', 
      logo: '/clients/futurex.png',
      type: 'incubator'
    },
    // Add more clients as needed
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0B1011] to-[#101618]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Trusts Us</span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Leading academic programs and EdTech organizations are using SmartQnA to streamline assessments.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {clients.map((client, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center justify-center"
              variants={fadeInUpItem}
            >
              <div className="h-24 w-full flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-3 hover:bg-white/10 transition-all duration-300">
                <div className="relative h-16 w-full flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Placeholder colored div when image fails to load */}
                    <div className="h-12 w-32 rounded bg-gradient-to-r from-teal-500/30 to-blue-500/30" />
                  </div>
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-h-full max-w-full object-contain relative z-10"
                    onError={(e) => {
                      e.target.style.opacity = "0";
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">{client.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  client.type === 'institution' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : client.type === 'incubator' 
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
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
          <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-blue-500/20">
            <p className="text-white/80 text-sm">
              Join our growing list of partners and transform your evaluation process
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Clientele; 