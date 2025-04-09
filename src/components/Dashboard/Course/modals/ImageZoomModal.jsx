import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageZoomModal = ({ isOpen, onClose, imageUrl, title }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative bg-gray-900 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-medium text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <div 
              className="transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img 
                src={imageUrl} 
                alt={title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-700 flex justify-center">
            <div className="flex bg-gray-800 p-2 rounded-full shadow-xl">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                title="Zoom out"
                disabled={zoomLevel <= 0.5}  
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors mx-1"
                title="Reset zoom"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                title="Zoom in"
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageZoomModal;