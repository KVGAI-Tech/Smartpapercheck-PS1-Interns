import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}

            {isLast || !item.to ? (
              <span className="text-blue-600 font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className="text-gray-500 hover:text-gray-700 transition-colors transform hover:scale-105"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
