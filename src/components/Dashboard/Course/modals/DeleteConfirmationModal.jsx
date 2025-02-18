import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="fixed inset-0" 
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
          {footer && (
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ 
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  title = "Confirm Deletion",
  message = null,
  itemType = 'item',
  itemName = '',
  isDeleting = false
}) => {
  const formatItemType = (type) => {
    if (!type) return 'item';
    return type.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  };

  const displayType = formatItemType(itemType);
  const displayName = itemName || displayType;

  const defaultMessage = `Are you sure you want to delete this ${displayType}? This action cannot be undone.`;

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isDeleting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
          border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={isDeleting}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border 
          border-transparent rounded-lg hover:bg-red-700 focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50
          flex items-center gap-2"
      >
        {isDeleting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </>
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete {displayName}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message || defaultMessage}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;