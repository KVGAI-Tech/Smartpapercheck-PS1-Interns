import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Square, Circle, 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Edit2, Trash2, AlertCircle
} from 'lucide-react';

const PDFViewer = ({ file }) => {
  const viewer = useRef(null);
  const [error, setError] = useState(null);
  const [instance, setInstance] = useState(null);
  const errorTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  const [annotationType, setAnnotationType] = useState('');
  const [annotationName, setAnnotationName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [marks, setMarks] = useState('');
  const [markingType, setMarkingType] = useState('full');
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [annotationsLog, setAnnotationsLog] = useState([]);
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [annotationError, setAnnotationError] = useState('');
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPDF() {
      if (!viewer.current || !file) return;

      try {
        const pdftron = await import('@pdftron/webviewer');
        if (!pdftron.default) throw new Error('WebViewer failed to load');

        const fileUrl = file instanceof Blob ? URL.createObjectURL(file) : file;

        const webviewerConfig = {
          path: '/lib',
          initialDoc: fileUrl,
          filename: file.name,
          licenseKey: 'demo:1737980970463:7e94d79703000000006b95fe72c07e05732c7f3f685b9fa85fc7862ef9',
          enableAnnotations: true,
          isReadOnly: false,
          fullAPI: true
        };

        if (instance) return;

        const webviewerInstance = await pdftron.default(
          webviewerConfig,
          viewer.current
        );

        setInstance(webviewerInstance);

        const { Core } = webviewerInstance;
        const { documentViewer, annotationManager } = Core;
        annotationManager.addEventListener('annotationChanged', (annotations, action) => {
          if (action === 'add') {
            const newAnnotation = annotations[0];
            if (newAnnotation.Subject === 'Rectangle' || newAnnotation.Subject === 'Circle') {
              setSelectedAnnotation(newAnnotation);
              setIsEditing(false);
              setAnnotationType(newAnnotation.Subject);
              setAnnotationName('');
              setKeyword('');
              setMarks('');
              setMarkingType('full');
              setAnnotationError('');
            }
          }
        });
        annotationManager.addEventListener('annotationSelected', (annotations) => {
          if (annotations.length > 0) {
            const selected = annotations[0];
            const logEntry = annotationsLog.find(a => a.id === selected.Id);
            if (logEntry) {
              setActiveAnnotationId(selected.Id);
              selected.StrokeColor = new Core.Annotations.Color(0, 150, 255); 
            } else {
              selected.StrokeColor = new Core.Annotations.Color(255, 170, 0);
            }
            annotationManager.redrawAnnotation(selected);
          } else {
            setActiveAnnotationId(null);
          }
        });

        documentViewer.addEventListener('documentLoaded', () => {
          if (!isMounted) return;
          const pageCount = documentViewer.getPageCount();
          setTotalPages(pageCount);
          setCurrentPage(documentViewer.getCurrentPage());
        });

        documentViewer.addEventListener('pageNumberUpdated', (pageNumber) => {
          if (!isMounted) return;
          setCurrentPage(pageNumber);
        });

        await documentViewer.loadDocument(fileUrl);

      } catch (err) {
        if (!isMounted) return;
        console.error('PDFViewer error:', err);
        setError(err.message);
      }
    }

    loadPDF();

    return () => {
      isMounted = false;
      if (instance?.Core?.documentViewer) {
        instance.Core.documentViewer.closeDocument();
      }
      if (file instanceof Blob) {
        URL.revokeObjectURL(file);
      }
    };
  }, [file]);

  const validateAnnotation = () => {
    if (!annotationName || !keyword || !marks) {
      setAnnotationError('Please fill in all required fields');
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setAnnotationError('');
      }, 5000);
      return false;
    }
    setAnnotationError('');
    return true;
  };

  const handleAnnotationSave = () => {
    if (!validateAnnotation() || !selectedAnnotation) return;

    const annotationData = {
      id: selectedAnnotation.Id,
      name: annotationName,
      type: annotationType,
      keyword,
      marks: parseFloat(marks),
      markingType,
      pageNumber: currentPage,
      timestamp: new Date().toISOString()
    };

    if (isEditing) {
      setAnnotationsLog(prev => prev.map(a => 
        a.id === selectedAnnotation.Id ? annotationData : a
      ));
    } else {
      setAnnotationsLog(prev => [...prev, annotationData]);
    }

    if (instance) {
      const { Core, annotationManager } = instance;
      const annotation = annotationManager.getAnnotationById(selectedAnnotation.Id);
      if (annotation) {
        annotation.StrokeColor = new Core.Annotations.Color(0, 150, 255);
        annotationManager.redrawAnnotation(annotation);
      }
    }

    resetAnnotationForm();
  };

  const handleLogEntryClick = (annotation, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!instance) return;
    
    const { Core, annotationManager } = instance;
    const target = annotationManager.getAnnotationById(annotation.id);
    
    if (target) {
      Core.documentViewer.setCurrentPage(annotation.pageNumber);
      annotationManager.selectAnnotation(target);
      setSelectedAnnotation(target);
      setAnnotationType(annotation.type);
      setAnnotationName(annotation.name);
      setKeyword(annotation.keyword);
      setMarks(annotation.marks.toString());
      setMarkingType(annotation.markingType);
      setIsEditing(true);
      setAnnotationError('');
      
      target.StrokeColor = new Core.Annotations.Color(0, 150, 255);
      annotationManager.redrawAnnotation(target);
    }
  };

  const handleDeleteAnnotation = (annotationToDelete, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!instance) return;

    const { annotationManager } = instance;
    const target = annotationManager.getAnnotationById(annotationToDelete.id);
    if (target) {
      annotationManager.deleteAnnotation(target);
      setAnnotationsLog(prev => prev.filter(a => a.id !== annotationToDelete.id));
      
      if (selectedAnnotation?.Id === annotationToDelete.id) {
        resetAnnotationForm();
      }
    }
  };

  const resetAnnotationForm = (shouldRemoveAnnotation = false) => {
    if (shouldRemoveAnnotation && selectedAnnotation && instance) {
      const { annotationManager } = instance;
      annotationManager.deleteAnnotation(selectedAnnotation);
    }

    setAnnotationType('');
    setAnnotationName('');
    setKeyword('');
    setMarks('');
    setMarkingType('full');
    setAnnotationError('');
    setSelectedAnnotation(null);
    setIsEditing(false);
    setActiveAnnotationId(null);
  };

  return (
<div className="flex h-screen">

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <button 
                className={`p-2 rounded ${annotationType === 'Rectangle' ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                onClick={() => setAnnotationType('Rectangle')}
              >
                <Square className="w-4 h-4" />
              </button>
              <button 
                className={`p-2 rounded ${annotationType === 'Circle' ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                onClick={() => setAnnotationType('Circle')}
              >
                <Circle className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg" 
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg" 
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg" 
                onClick={() => instance?.Core?.documentViewer?.setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">{currentPage} / {totalPages}</span>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg" 
                onClick={() => instance?.Core?.documentViewer?.setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Finish
          </button>
        </div>

        <div className="flex-1 relative">
          <div ref={viewer} className="absolute inset-0" />
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50/90">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-red-600">Error: {error}</p>
              </div>
            </div>
          )}
          
          {annotationError && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{annotationError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-96 bg-white border-l flex flex-col h-full">
        {selectedAnnotation ? (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {isEditing ? 'Edit Annotation' : 'New Annotation'}
              </h3>
              <button 
                onClick={() => resetAnnotationForm(true)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name *</label>
                <input
                  type="text"
                  value={annotationName}
                  onChange={(e) => setAnnotationName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Type *</label>
                <select 
                  value={annotationType}
                  onChange={(e) => setAnnotationType(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Type</option>
                  <option value="Answer">Answer</option>
                  <option value="Figure">Figure</option>
                  <option value="Text">Text</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Keywords *</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keywords"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Marks *</label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Marking Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="full"
                      checked={markingType === 'full'}
                      onChange={(e) => setMarkingType(e.target.value)}
                    />
                    <span className="text-sm">Full</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="partial"
                      checked={markingType === 'partial'}
                      onChange={(e) => setMarkingType(e.target.value)}
                    />
                    <span className="text-sm">Partial</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleAnnotationSave}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Annotations</h3>
            <p className="text-sm text-gray-500 mt-1">
              {annotationsLog.length} {annotationsLog.length === 1 ? 'annotation' : 'annotations'} created
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {annotationsLog.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No annotations yet</p>
              <p className="text-xs mt-1">Use the annotation tools to mark the PDF</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {annotationsLog.map((annotation) => (
                <div 
                  key={annotation.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer
                    ${activeAnnotationId === annotation.id 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  onClick={() => handleLogEntryClick(annotation)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{annotation.name}</h4>
                      <p className="text-sm text-gray-500">Type: {annotation.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleLogEntryClick(annotation, e)}
                        className="p-1.5 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                        title="Edit annotation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAnnotation(annotation, e)}
                        className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                        title="Delete annotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Keyword:</span>
                      <span className="ml-1 text-gray-900">{annotation.keyword}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Marks:</span>
                      <span className="ml-1 text-gray-900">{annotation.marks}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Page:</span>
                      <span className="ml-1 text-gray-900">{annotation.pageNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Marking:</span>
                      <span className="ml-1 text-gray-900 capitalize">{annotation.markingType}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    Added {new Date(annotation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;