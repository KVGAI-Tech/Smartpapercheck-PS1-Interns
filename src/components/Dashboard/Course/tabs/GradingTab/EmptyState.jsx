import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ message, icon }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 text-gray-400">
        {icon}
      </div>
      <p className="text-gray-500 text-lg">{message}</p>
    </motion.div>
  );
};

export default EmptyState;
