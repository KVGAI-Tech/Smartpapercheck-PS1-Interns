import React, { useState, useCallback } from 'react';
import { 
  X, Upload, Download, FileUp, File,
  CheckCircle, AlertCircle, ChevronDown,
  FileText
} from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    }
  };

  const downloadTemplate = (type) => {
    console.log(`Downloading ${type} template`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Question Paper</h2>
            <p className="mt-1 text-sm text-gray-500">Upload your exam question paper in PDF or Word format</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : selectedFile 
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center px-6 py-12 cursor-pointer"
            >
              {selectedFile ? (
                <>
                  <div className="p-3 bg-green-100 rounded-xl mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                  <p className="mt-1 text-sm text-green-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Choose a different file
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-gray-100 rounded-xl mb-4 group-hover:bg-gray-200">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF or Word files up to 10MB
                  </p>
                </>
              )}
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Download Templates</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Use our pre-designed templates to create your question paper
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => downloadTemplate('word')}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 
                  hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Word Template</p>
                  <p className="text-xs text-gray-500">.docx format</p>
                </div>
              </button>

              <button
                onClick={() => downloadTemplate('pdf')}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 
                  hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                  <File className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">PDF Template</p>
                  <p className="text-xs text-gray-500">.pdf format</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 
              transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 ${
              selectedFile
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FileUp className="w-4 h-4" />
            Upload Paper
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;