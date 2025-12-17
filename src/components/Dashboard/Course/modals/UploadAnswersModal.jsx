import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, FileArchive, CheckCircle, AlertTriangle, 
  Folder, FolderOpen, Image, AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../../BaseURL';

const UploadAnswersModal = ({ isOpen, onClose, courseId, examId, onUploadSuccess }) => {
  const [zipFile, setZipFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }
    setZipFile(file);
    setUploadResults(null);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!zipFile) {
      toast.error('Please select a ZIP file first');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading answer sheets...');

    try {
      const formData = new FormData();
      formData.append('zip_file', zipFile);

      const response = await fetch(
        `${API_BASE_URL}/exams/${courseId}/exams/${examId}/upload-answers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 200) {
        setUploadResults(data.data);
        toast.success(`Successfully processed ${data.data.total_processed} answer sheets!`, { id: loadingToast });
        
        if (onUploadSuccess) {
          onUploadSuccess(data.data);
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload answer sheets: ' + (error.message || 'Unknown error'), { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setZipFile(null);
    setUploadResults(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileArchive className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Student Answer Sheets</h2>
            <p className="text-sm text-gray-500">Upload a ZIP file with question-wise answers</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!uploadResults ? (
          <div className="space-y-6">
            {/* Structure Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <FolderOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📦 Required ZIP Structure
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your ZIP file must follow this exact folder structure for proper processing:
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 font-mono text-sm border border-blue-100">
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">answers.zip</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-yellow-500" />
                      <span>├── student_id-1/</span>
                    </div>
                    <div className="ml-8 space-y-1">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-yellow-500" />
                        <span>│   ├── Ans1/</span>
                      </div>
                      <div className="ml-12 space-y-1">
                        <div className="flex items-center gap-2">
                          <Image className="w-3 h-3 text-green-500" />
                          <span className="text-xs">│   │   ├── Ans1-1.png</span>
                          <span className="text-xs text-gray-400">← Q1, Page 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="w-3 h-3 text-green-500" />
                          <span className="text-xs">│   │   └── Ans1-2.png</span>
                          <span className="text-xs text-gray-400">← Q1, Page 2</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-yellow-500" />
                        <span>│   ├── Ans2/</span>
                      </div>
                      <div className="ml-12">
                        <div className="flex items-center gap-2">
                          <Image className="w-3 h-3 text-green-500" />
                          <span className="text-xs">│   │   └── Ans2-1.png</span>
                          <span className="text-xs text-gray-400">← Q2, Page 1</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-yellow-500" />
                        <span>│   └── Ans3/</span>
                      </div>
                      <div className="ml-12">
                        <div className="flex items-center gap-2">
                          <Image className="w-3 h-3 text-green-500" />
                          <span className="text-xs">│       └── Ans3-1.png</span>
                          <span className="text-xs text-gray-400">← Q3, Page 1</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-yellow-500" />
                      <span>└── student_id-2/</span>
                    </div>
                    <div className="ml-8">
                      <span className="text-gray-400">...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">⚠️ Important Rules:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Folder name: <code className="bg-white px-2 py-0.5 rounded text-xs">student_id-{'{number}'}</code> (e.g., student_id-1, student_id-101)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Question folder: <code className="bg-white px-2 py-0.5 rounded text-xs">Ans1</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">Ans2</code>, etc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Image name: <code className="bg-white px-2 py-0.5 rounded text-xs">Ans1-1.png</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">Ans2-1.jpg</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Supported formats: PNG, JPG, JPEG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-red-600">Missing question folder = Question not attempted (0 marks)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : zipFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {zipFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileArchive className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{zipFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setZipFile(null)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragging ? 'Drop ZIP file here' : 'Upload Answer Sheets ZIP'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your ZIP file here, or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Choose ZIP File
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload Results */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">✅ Upload Complete</h3>
                  <p className="text-sm text-gray-600">
                    Processed {uploadResults.total_processed} students
                    {uploadResults.total_failed > 0 && `, ${uploadResults.total_failed} failed`}
                  </p>
                </div>
              </div>
            </div>

            {uploadResults.warnings && uploadResults.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">⚠️ Warnings:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {uploadResults.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempted
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unattempted
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {uploadResults.processed?.map((student, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                          <div className="text-xs text-gray-500">ID: {student.student_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.roll_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                            {student.attempted_questions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            student.unattempted_questions > 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {student.unattempted_questions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            student.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setUploadResults(null)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!uploadResults && (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!zipFile || isUploading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Answer Sheets
              </>
            )}
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default UploadAnswersModal;
