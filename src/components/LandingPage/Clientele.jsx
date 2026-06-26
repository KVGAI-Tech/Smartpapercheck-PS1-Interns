import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Clientele.css';

const Clientele = () => {
  const clients = [
    { 
      name: 'BITS Pilani', 
      logo: '/bitspilani.png',
    },
    { 
      name: 'IIT Delhi', 
      logo: '/iitdelhi.png',
    },
    { 
      name: 'ISB', 
      logo: '/isb.png',
    },
    { 
      name: 'IIM Bangalore', 
      logo: '/iimbangalore.png',
    }
  ];

  // Duplicate for seamless infinite scroll (need enough to fill viewport + scroll distance)
  const scrollClients = [...clients, ...clients, ...clients, ...clients, ...clients, ...clients];

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 2,
  }));

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf9 40%, #ecfdf5 100%)' }}
    >
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: `rgba(22, 109, 112, ${0.1 + Math.random() * 0.15})`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(22, 109, 112, 0.3), transparent 70%)', filter: 'blur(60px)' }}
      />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Heading with animated gradient */}
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Trusted by{' '}
            <span 
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #166D70, #10b981, #0d9488, #166D70)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 4s ease infinite',
              }}
            >
              Global Leaders
              <motion.div
                className="absolute -bottom-1 left-0 h-1 rounded-full"
                style={{ background: 'linear-gradient(90deg, #166D70, #10b981)' }}
                initial={{ width: 0 }}
                animate={isInView ? { width: '100%' } : {}}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              />
            </span>
            <br />
            in Education
          </motion.h2>

          <motion.p 
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Leading academic institutions and organizations use Smart Paper Check to streamline assessments.
          </motion.p>
        </motion.div>

        {/* Logo Marquee - Clean, no cards */}
        <motion.div
          className="relative mb-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #f0fdf9, transparent)' }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #f0fdf9, transparent)' }}
          />

          <div className="overflow-hidden py-6">
            <div className="clientele-marquee-track">
              {scrollClients.map((client, index) => (
                <motion.div
                  key={index}
                  className="clientele-marquee-item flex flex-col items-center gap-3 cursor-default group"
                  whileHover={{ scale: 1.1, y: -6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {/* Logo - no card wrapper */}
                  <div className="h-20 w-28 sm:h-24 sm:w-36 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-full max-w-full object-contain transition-all group-hover:drop-shadow-lg"
                      style={{
                        filter: 'grayscale(20%) opacity(0.85)',
                        transition: 'filter 0.4s ease, transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.filter = 'grayscale(0%) opacity(1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.filter = 'grayscale(20%) opacity(0.85)';
                      }}
                      onError={(e) => {
                        e.target.style.opacity = "0";
                      }}
                    />
                  </div>

                  {/* Name only */}
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                    {client.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(22,109,112,0.06), rgba(16,185,129,0.06))',
              border: '1px solid rgba(22,109,112,0.15)',
              backdropFilter: 'blur(10px)',
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 32px rgba(22,109,112,0.12)',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => navigate('/auth')}
          >
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Join our growing list of partners and transform your evaluation process
            </p>
            <motion.span 
              className="text-accent text-xl"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
};

export default Clientele;