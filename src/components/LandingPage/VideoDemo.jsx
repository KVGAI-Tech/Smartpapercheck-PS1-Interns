import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';

const VideoDemo = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  // Use the actual YouTube video ID
  const videoId = "3egoZx6St5Y";
  
  return (
    <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-accent/10 text-gray-800 text-sm shadow-sm">
              <span className="mr-2">🎥</span>
              <span>Product Demo</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            See <span className="text-accent">Smart Paper Check</span> in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Watch how Smart Paper Check transforms handwritten copies into fully graded evaluations with feedback in minutes.
          </p>
        </motion.div>

        <motion.div 
          className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {!videoPlaying ? (
            <div className="absolute inset-0 bg-accent/10">
              <div className="absolute inset-0 bg-[url('https://img.youtube.com/vi/3egoZx6St5Y/maxresdefault.jpg')] bg-cover bg-center opacity-80" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.button
                  className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-lg"
                  onClick={() => setVideoPlaying(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FaPlay className="text-white text-2xl ml-1" />
                </motion.button>
                <p className="text-gray-800 text-xl mt-6 font-medium bg-white/70 px-4 py-2 rounded-full shadow-sm">
                  Click to watch demo
                </p>
              </div>
            </div>
          ) : (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/3egoZx6St5Y?autoplay=1&rel=0&modestbranding=1`}
              title="Smart Paper Check Demo Video"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone"
              allowFullScreen
            ></iframe>
          )}
        </motion.div>

        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="bg-white shadow-md border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900">Lightning Fast</h3>
            <p className="text-gray-600">
              Process hundreds of scripts in minutes, not days. Save valuable time for teaching.
            </p>
          </div>
          
          <div className="bg-white shadow-md border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900">Highly Accurate</h3>
            <p className="text-gray-600">
              AI models trained specifically for academic evaluation with continuous learning.
            </p>
          </div>
          
          <div className="bg-white shadow-md border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900">Detailed Insights</h3>
            <p className="text-gray-600">
              Get comprehensive analytics on student performance and learning progress.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo; 