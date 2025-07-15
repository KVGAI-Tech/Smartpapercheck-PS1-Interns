import { motion } from "framer-motion";
import { BarChart, ClipboardList } from "lucide-react";

const SidebarTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
          activeTab === "annotations"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setActiveTab("annotations")}
      >
        <span className="flex items-center justify-center gap-2">
          <ClipboardList size={18} />
          <span>Annotations</span>
        </span>
        {activeTab === "annotations" && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        )}
      </button>

      <button
        className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
          activeTab === "assessment"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setActiveTab("assessment")}
      >
        <span className="flex items-center justify-center gap-2">
          <BarChart size={18} />
          <span>Assessment</span>
        </span>
        {activeTab === "assessment" && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        )}
      </button>
    </div>
  );
};

export default SidebarTabs;
