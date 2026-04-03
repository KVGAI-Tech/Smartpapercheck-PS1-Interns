import React from 'react';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items = [], onNavigate }) => (
  <div className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
    {items.map((crumb, index) => (
      <React.Fragment key={`${crumb.type}-${crumb.id ?? 'root'}`}>
        {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        <button
          type="button"
          onClick={() => onNavigate(crumb)}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            index === items.length - 1
              ? 'bg-gray-100 text-gray-900'
              : 'hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          {crumb.name}
        </button>
      </React.Fragment>
    ))}
  </div>
);

export default Breadcrumbs;
