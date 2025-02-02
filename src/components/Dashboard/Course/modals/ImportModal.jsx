import React from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';


const Modal = ({ title, children, onClose, footer }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black opacity-50" />
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const ImportModal = ({ isOpen, onClose, onImport, type = "Data" }) => {
  if (!isOpen) return null;

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            onImport(results.data);
            onClose();
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      };
      reader.readAsText(file);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </button>
    </>
  );

  return (
    <Modal
      title={`Import ${type}`}
      onClose={onClose}
      footer={footer}
    >
      <div className="space-y-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file.type === "text/csv") {
              handleFileUpload(file);
            }
          }}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            Drag and drop your CSV file here, or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </label>
          </p>
          <p className="text-xs text-gray-400 mt-2">Supported format: CSV</p>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;