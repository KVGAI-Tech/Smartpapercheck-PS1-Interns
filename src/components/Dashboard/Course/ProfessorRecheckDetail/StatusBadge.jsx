import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;

  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      bgColor = "bg-accent/10";
      textColor = "text-accent";
      icon = <CheckCircle className="w-4 h-4" />;
      break;
    case "partial":
    case "in_review":
      bgColor = "bg-accent/10";
      textColor = "text-accent";
      icon = <AlertCircle className="w-4 h-4" />;
      break;
    case "rejected":
      bgColor = "bg-accent/10";
      textColor = "text-accent";
      icon = <XCircle className="w-4 h-4" />;
      break;
    case "pending":
    default:
      bgColor = "bg-accent/10";
      textColor = "text-accent";
      icon = <AlertCircle className="w-4 h-4" />;
      break;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${bgColor} ${textColor} shadow-sm border border-white/20`}
    >
      {icon}
      <span className="font-medium">
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
      </span>
    </motion.span>
  );
};

export default StatusBadge;
