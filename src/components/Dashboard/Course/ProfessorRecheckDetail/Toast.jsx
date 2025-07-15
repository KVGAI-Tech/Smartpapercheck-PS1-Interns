import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";

const Toast = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 
        ${
          type === "success"
            ? "bg-gradient-to-r from-blue-600 to-blue-700"
            : "bg-gradient-to-r from-red-500 to-red-600"
        } text-white`}
    >
      {type === "success" ? (
        <CheckCircle size={22} />
      ) : (
        <AlertCircle size={22} />
      )}
      <span className="font-medium">{message}</span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white"
      >
        <X size={18} />
      </motion.button>
    </motion.div>
  );
};

export default Toast;
