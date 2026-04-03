import React from 'react';
import { FolderOpen, Pencil, Trash2 } from 'lucide-react';

const menuItems = [
  { key: 'open', label: 'Open', icon: FolderOpen },
  { key: 'rename', label: 'Rename', icon: Pencil },
  { key: 'delete', label: 'Delete', icon: Trash2, destructive: true },
];

const ContextMenu = ({ visible, x = 0, y = 0, onAction }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-[60] min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl shadow-gray-300/40"
      style={{ left: x, top: y }}
      role="menu"
    >
      {menuItems.map(({ key, label, icon: Icon, destructive }) => (
        <button
          key={key}
          type="button"
          onClick={() => onAction(key)}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
            destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
          }`}
          role="menuitem"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
