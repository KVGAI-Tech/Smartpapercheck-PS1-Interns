import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, X, AlertCircle, FileText, 
  CheckCircle, Download, ArrowRight
} from 'lucide-react';
import Papa from 'papaparse';

const ImportModal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  onImport = () => {}, 
  type = "data",
  title = null,
  allowedTypes = ['text/csv'],
  maxSize = 5 * 1024 * 1024, 
  templates = [],
  isImporting = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const resetState = () => {
    setSelectedFile(null);
    setError('');
    setPreview(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file) => {
    if (!file) {
      setError('Please select a file');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      setError(`Please upload a ${allowedTypes.map(t => t.split('/')[1]).join(' or ')} file`);
      return false;
    }

    if (file.size > maxSize) {
      setError(`File size should be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return false;
    }

    setError('');
    return true;
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 5, 
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('Error parsing CSV file'));
            return;
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleFileSelect = async (file) => {
    if (!validateFile(file)) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    
    try {
      if (file.type === 'text/csv') {
        const previewData = await parseCSV(file);
        setPreview(previewData);
      }
    } catch (error) {
      setError('Error parsing file. Please check the file format.');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      await onImport(selectedFile);
      resetState();
      onClose();
    } catch (error) {
      setError(error.message || 'Error importing file');
    }
  };

  const downloadTemplate = (template) => {
    console.log('Downloading template:', template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="fixed inset-0" 
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {title || `Import ${type}`}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload your data file in CSV format
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-lg 
                hover:bg-gray-100 transition-colors"
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
              className={`relative border-2 border-dashed rounded-xl transition-all duration-200 
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : selectedFile 
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={allowedTypes.join(',')}
                onChange={handleFileInput}
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
                    <p className="text-sm font-medium text-green-600">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-sm text-green-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        resetState();
                      }}
                      className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Choose a different file
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-gray-100 rounded-xl mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(' or ')} files up to {Math.round(maxSize / (1024 * 1024))}MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 
                px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {preview && preview.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {Object.keys(preview[0]).map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, i) => (
                            <td
                              key={i}
                              className="px-3 py-2 whitespace-nowrap text-sm text-gray-600"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {templates.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Download Templates
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                    Use our pre-designed templates to create your data file
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => downloadTemplate(template)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 
                        hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.format}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 
                transition-colors"
              disabled={isImporting}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 ${
                selectedFile && !isImporting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Import {type}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;