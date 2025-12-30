import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        const hasLink = !!item.to;
        const hasClick = typeof item.onClick === "function";

        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}

            {isLast || (!hasLink && !hasClick) ? (
              <span className="text-blue-600 font-medium">{item.label}</span>
            ) : hasLink ? (
              <Link
                to={item.to}
                state={item.state}
                className="text-gray-500 hover:text-gray-700 transition-colors transform hover:scale-105"
              >
                {item.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="text-gray-500 hover:text-gray-700 transition-colors transform hover:scale-105"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
