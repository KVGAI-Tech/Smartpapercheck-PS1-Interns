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
  const [evalProgress, setEvalProgress] = useState(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(false);
  const pollTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      pollingRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, []);

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
      pollingRef.current = true;
      const formData = new FormData();
      formData.append('zip_file', zipFile);

      const uploadPromise = fetch(
        `${API_BASE_URL}/exams/${courseId}/exams/${examId}/upload-answers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        }
      );

      // While the upload/evaluation request is in-flight, poll evaluation progress
      // every few seconds so we can show a real progress bar.
      const pollIntervalMs = 3000;

      const pollProgress = async () => {
        if (!pollingRef.current) return;
        try {
          const progressResp = await fetch(
            `${API_BASE_URL}/exams/${courseId}/exams/${examId}/evaluation-progress`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
            }
          );

          if (progressResp.ok) {
            const progressJson = await progressResp.json();
            if (progressJson?.code === 200 && progressJson.data) {
              const next = progressJson.data;
              setEvalProgress(next);
              if (
                typeof next?.total_students === 'number' &&
                next.total_students > 0 &&
                typeof next?.evaluated_students === 'number' &&
                next.evaluated_students >= next.total_students
              ) {
                pollingRef.current = false;
                if (pollTimeoutRef.current) {
                  clearTimeout(pollTimeoutRef.current);
                  pollTimeoutRef.current = null;
                }
                return;
              }
            }
          }
        } catch (e) {
          // Swallow progress errors; main upload call will surface real issues
          console.error('Progress polling error:', e);
        } finally {
          if (pollingRef.current) {
            pollTimeoutRef.current = setTimeout(pollProgress, pollIntervalMs);
          }
        }
      };

      // Start polling without blocking the upload
      pollProgress();

      const response = await uploadPromise;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 200) {
        pollingRef.current = false;
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
          pollTimeoutRef.current = null;
        }
        setUploadResults(data.data);
        setEvalProgress(null);
        toast.success(`Successfully processed ${data.data.total_processed} answer sheets!`, { id: loadingToast });
        
        if (onUploadSuccess) {
          onUploadSuccess(data.data);
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      pollingRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      toast.error('Failed to upload answer sheets: ' + (error.message || 'Unknown error'), { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    pollingRef.current = false;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setZipFile(null);
    setUploadResults(null);
    setEvalProgress(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 bg-accent/10 rounded-xl flex-shrink-0">
            <FileArchive className="w-6 h-6 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">Upload Answer Sheets</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload a single <span className="font-medium text-gray-700">.zip</span> with student folders and per-question images.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!uploadResults ? (
          <>
          {isUploading && (
            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              {(() => {
                const total = evalProgress?.total_students || 0;
                const evaluated = evalProgress?.evaluated_students || 0;
                const uploadedOnly = evalProgress?.uploaded_students || 0;
                const uploadedOrEvaluated = uploadedOnly + evaluated;

                // Phase 1: upload + processing (creating answer docs)
                const inUploadPhase = total > 0 && uploadedOrEvaluated < total;

                if (!evalProgress || total === 0) {
                  // No progress yet: show generic uploading state
                  return (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Uploading ZIP and processing answer sheets (step 1/2)...</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">This may take a while for large ZIP files.</p>
                      </div>
                    </div>
                  );
                }

                if (inUploadPhase) {
                  const percent = Math.min(((uploadedOrEvaluated / total) * 100) || 0, 100);
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          <p className="text-sm font-medium text-gray-900">Step 1/2 · Uploading & processing answer sheets...</p>
                        </div>
                        <p className="text-xs text-gray-700">
                          {uploadedOrEvaluated} / {total} students uploaded
                        </p>
                      </div>
                      <div>
                        <div className="h-2 w-full rounded-full bg-blue-100 overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-600">
                          Once all uploads are processed, automatic evaluation will start (step 2/2).
                        </p>
                      </div>
                    </>
                  );
                }

                // Phase 2: all uploads done, now evaluating
                const evalPercent = Math.min(evalProgress.percent_complete || 0, 100);
                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <p className="text-sm font-medium text-gray-900">Step 2/2 · Evaluating answer sheets...</p>
                      </div>
                      <p className="text-xs text-gray-700">
                        {evaluated} / {total} students evaluated
                      </p>
                    </div>
                    <div>
                      <div className="h-2 w-full rounded-full bg-blue-100 overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{ width: `${evalPercent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-600">
                        This may take a few minutes for larger classes. You can continue working while evaluation completes.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <FolderOpen className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">ZIP structure (required)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep the folder names consistent so the system can match student IDs and question numbers.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-accent/10 to-white border-b border-gray-200">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <FileArchive className="w-4 h-4 text-accent" />
                      <span>Example</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/70 border border-gray-200 text-gray-600">zip tree</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 font-mono text-xs overflow-auto">
                    <div className="space-y-1 text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-accent" />
                        <span className="font-semibold">answers.zip</span>
                      </div>
                      <div className="ml-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-gray-800">├── student_id-1/</span>
                        </div>
                        <div className="ml-8 space-y-1">
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-amber-500" />
                            <span>│   ├── Ans1/</span>
                          </div>
                          <div className="ml-12 space-y-1">
                            <div className="flex items-center gap-2">
                              <Image className="w-3 h-3 text-emerald-600" />
                              <span>│   │   ├── Ans1-1.png</span>
                              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Q1 • page 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Image className="w-3 h-3 text-emerald-600" />
                              <span>│   │   └── Ans1-2.png</span>
                              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Q1 • page 2</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-amber-500" />
                            <span>│   ├── Ans2/</span>
                          </div>
                          <div className="ml-12">
                            <div className="flex items-center gap-2">
                              <Image className="w-3 h-3 text-emerald-600" />
                              <span>│   │   └── Ans2-1.png</span>
                              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Q2 • page 1</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-gray-800">└── student_id-2/</span>
                        </div>
                        <div className="ml-8">
                          <span className="text-gray-400">...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">Rules</h4>
                      <ul className="mt-2 space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Folder: <code className="bg-white px-2 py-0.5 rounded text-xs">student_id-{'{number}'}</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Question folder: <code className="bg-white px-2 py-0.5 rounded text-xs">Ans1</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">Ans2</code>…</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>File name: <code className="bg-white px-2 py-0.5 rounded text-xs">Ans1-1.png</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">Ans2-1.jpg</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Supported: PNG, JPG, JPEG</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700">Missing question folder = Question unattempted</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : zipFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-accent/40 hover:bg-accent/5'
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
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-accent' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragging ? 'Drop ZIP file here' : 'Upload Answer Sheets ZIP'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your ZIP file here, or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    Choose ZIP File
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
          </>
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
              className="w-full px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!uploadResults && (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!zipFile || isUploading}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
