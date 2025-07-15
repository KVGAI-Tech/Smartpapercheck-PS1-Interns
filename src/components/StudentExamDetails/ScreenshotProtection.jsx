import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const ScreenshotProtection = ({ active, studentInfo }) => {
  if (!active) return null;

  const watermarkText = studentInfo
    ? `${studentInfo.name} (${studentInfo.roll_number}) - SCREENSHOT DETECTED - UNAUTHORIZED`
    : "SCREENSHOT DETECTED - UNAUTHORIZED";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, index) => (
          <div
            key={index}
            className="absolute text-red-500 text-opacity-80 font-bold text-xl select-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(-${30 + Math.random() * 15}deg)`,
            }}
          >
            {watermarkText}
          </div>
        ))}
      </div>
      <Lock className="text-red-500 w-20 h-20 mb-6" />
      <p className="text-white text-2xl font-bold mb-2">
        Screenshots Are Not Allowed
      </p>
      <p className="text-white text-lg">
        This is a secure document protected by screenshot detection.
      </p>
    </motion.div>
  );
};

export default ScreenshotProtection;
