import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

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
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 
        ${type === "success" ? "bg-blue-600" : "bg-red-500"} text-white`}
    >
      {type === "success" ? (
        <CheckCircle size={20} />
      ) : (
        <AlertTriangle size={20} />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
