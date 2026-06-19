import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../BaseURL";

const Hero = ({ scrollToDemo }) => {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const backgroundShapes = [
    {
      size: "h-32 w-32",
      color: "bg-accent/10",
      top: "10%",
      left: "5%",
      animationDelay: 0,
    },
    {
      size: "h-48 w-48",
      color: "bg-accent/10",
      top: "15%",
      right: "8%",
      animationDelay: 1,
    },
    {
      size: "h-64 w-64",
      color: "bg-accent/5",
      bottom: "10%",
      left: "15%",
      animationDelay: 2,
    },
    {
      size: "h-24 w-24",
      color: "bg-accent/10",
      bottom: "25%",
      right: "20%",
      animationDelay: 1.5,
    },
  ];

  return (
    <section className="min-h-screen pt-24 lg:pt-28 px-4 md:px-8 relative overflow-hidden bg-white">
      {backgroundShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-xl ${shape.size} ${shape.color} z-0`}
          style={{
            top: shape.top || "auto",
            left: shape.left || "auto",
            right: shape.right || "auto",
            bottom: shape.bottom || "auto",
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            delay: shape.animationDelay,
          }}
        />
      ))}

      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full opacity-10 bg-grid-pattern" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 pt-16 md:pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE - Text and CTA */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-accent/10 rounded-full px-4 py-2 text-xs sm:text-sm font-medium"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-accent rounded-full w-2 h-2 animate-pulse"></div>
              <span className="text-gray-700">
                Built with Explainable AI · Powered by LLMs · Trusted by Institutions
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              Revolutionizing Answer Script <br className="hidden xl:block" />
              Evaluation with AI & LLMs
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              Smart Paper Check automates and explains grading of handwritten answer
              scripts using cutting-edge Vision-Language Models & Agentic AI Workflows.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <motion.button
                onClick={() => navigate("/auth")}
                className="group flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 px-8 py-4 rounded-full text-white font-medium text-base transition-all duration-300 shadow-lg shadow-accent/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HiOutlineRocketLaunch className="text-white text-xl" />
                <span>Request a Product Demo</span>
              </motion.button>
              
              <motion.button
                onClick={scrollToDemo}
                className="group flex items-center justify-center gap-2 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 shadow-sm px-8 py-4 rounded-full text-gray-800 font-medium text-base transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlay className="text-accent group-hover:scale-110 transition-transform duration-300" />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

          </div>

          {/* RIGHT SIDE - Video Component */}
          <motion.div
            className="relative lg:ml-auto w-full"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative pt-6 pb-6">
              <motion.div
                className="absolute top-0 right-4 bg-accent/90 backdrop-blur px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                AI-Powered Processing
              </motion.div>
              
              <motion.div
                className="bg-white p-3 rounded-3xl shadow-2xl border border-gray-100/50 relative overflow-hidden group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="rounded-2xl object-cover w-full h-auto aspect-[16/10] shadow-inner"
                >
                  <source src="/api/public/landing-video?v=2" type="video/mp4" />
                </video>
              </motion.div>
              
              <motion.div
                className="absolute bottom-2 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-gray-800 text-sm font-bold shadow-xl border border-gray-100 z-10 flex items-center gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Real-time Analytics
              </motion.div>
            </div>
          </motion.div>
          
        </div>
      </div>

      {}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" />
    </section>
  );
};

export default Hero;
