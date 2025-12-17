import React, { useState, useEffect, useRef } from 'react';

import ReactDOM from 'react-dom'; 
import { 
  X, Plus, Upload, Trash2, 
  FileText, ArrowUp, ArrowDown,
  CheckCircle, Maximize, Minimize,
  File, FilePlus, Upload as UploadIcon,
  AlertCircle
} from 'lucide-react';

const UploadQnAModal = ({
  isOpen, onClose, examId, onSubmit, existingQuestions = [] }) => {

  const [questions, setQuestions] = useState([{
    id: 1,
    questionType: 'image',
    answerType: 'image',
    question: null,
    questionPreview: '',
    questionUrl: '',
    answer: null,
    answerPreview: '',
    answerUrl: '',
    marks: '',
    questionText: 'test-question',
    questionBody: '',
    answerText: 'test-answer',
    answerBody: '',
    domain: 'General',
    isExisting: false,
    num_rubric_items: 3,
    professorInstructions: ''
  }]);

  const [goldenPdfFile, setGoldenPdfFile] = useState(null);
  const [questionPdfFile, setQuestionPdfFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('standard'); 

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activePasteTargetRef = useRef(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const modalRef = useRef(null);
  const questionRefs = useRef({});
  const dropZoneRefs = useRef({});
  const modalRootRef = useRef(null);

  useEffect(() => {

    if (isOpen) {
      if (!modalRootRef.current) {
        const modalRoot = document.createElement('div');
        
        Object.assign(modalRoot.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)', 
          zIndex: '9999', 
        });
        
        document.body.appendChild(modalRoot);
        modalRootRef.current = modalRoot;
      }
      
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        if (modalRootRef.current) {
          document.body.removeChild(modalRootRef.current);
          modalRootRef.current = null;
        }
        
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setGoldenPdfFile(null);
      setQuestionPdfFile(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (existingQuestions && existingQuestions.length > 0) {
      const formattedQuestions = existingQuestions.map((q, index) => ({
        id: index + 1,
        questionType: q.question_type || q.question_format || (q.question_file_url ? 'image' : 'text'),
        answerType: q.answer_type || (q.answer_file_url ? 'image' : 'text'),
        question: null,
        questionPreview: '',
        questionUrl: q.question_file_url || '',
        answer: null,
        answerPreview: '',
        answerUrl: q.answer_file_url || '',
        marks: q.max_marks || '',
        questionText: q.question_text || 'test-question',
        questionBody: q.question_body || '',
        answerText: q.answer_text || 'test-answer',
        answerBody: q.answer_body || '',
        domain: q.domain || 'General',
        isExisting: true, 
        questionNumber: q.question_number,
        num_rubric_items: q.num_rubric_items || 3,
        professorInstructions: q.professor_instructions || ''
      }));
      setQuestions(formattedQuestions);
    } else {
      setQuestions([{
        id: 1,
        questionType: 'image',
        answerType: 'image',
        question: null,
        questionPreview: '',
        questionUrl: '',
        answer: null,
        answerPreview: '',
        answerUrl: '',
        marks: '',
        questionText: 'test-question',
        questionBody: '',
        answerText: 'test-answer',
        answerBody: '',
        domain: 'General',
        isExisting: false,
        num_rubric_items: 3,
        professorInstructions: ''
      }]);
    }
  }, [existingQuestions]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalPaste = (e) => {
      const target = activePasteTargetRef.current;
      if (!target) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((it) => it.type?.startsWith('image/'));
      if (!imageItem) return;

      e.preventDefault();
      const pastedFile = imageItem.getAsFile();
      if (!pastedFile) return;

      handleFileChange(target.questionId, target.type, pastedFile);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isOpen]);

  const handleFileChange = (questionId, type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === questionId 
              ? {
                  ...q,
                  [type]: file,
                  [`${type}Preview`]: reader.result,
                  [`${type}Url`]: '' 
                }
              : q
          )
        );
      };
      reader.readAsDataURL(file);
    } else {
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === questionId 
            ? {
                ...q,
                [type]: null,
                [`${type}Preview`]: '',
                [`${type}Url`]: ''
              }
            : q
        )
      );
    }
  };

  const addQuestion = () => {
    const newId = questions.length + 1;
    setQuestions(prev => [
      ...prev,
      {
        id: newId,
        questionType: 'image',
        answerType: 'image',
        question: null,
        questionPreview: '',
        questionUrl: '',
        answer: null,
        answerPreview: '',
        answerUrl: '',
        marks: '',
        questionText: 'test-question',
        questionBody: '',
        answerText: 'test-answer',
        answerBody: '',
        domain: 'General',
        isExisting: false,
        num_rubric_items: 3,
        professorInstructions: ''
      }
    ]);
    
    setCurrentQuestionIndex(questions.length);
    
    setTimeout(() => {
      scrollToQuestion(newId);
    }, 100);
  };

  const scrollToQuestion = (id) => {
    if (questionRefs.current[id]) {
      questionRefs.current[id].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      const indexToRemove = questions.findIndex(q => q.id === id);
      const newQuestions = questions.filter(q => q.id !== id);
      
      setQuestions(newQuestions);
      
      if (currentQuestionIndex >= indexToRemove && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
  };

  const navigateQuestion = (direction) => {
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = Math.max(0, currentQuestionIndex - 1);
    } else {
      newIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
    }
    
    setCurrentQuestionIndex(newIndex);
    
    if (questionRefs.current[questions[newIndex].id]) {
      scrollToQuestion(questions[newIndex].id);
    }
  };

  const validateQuestions = () => {
    if (uploadMode === 'golden-pdf') {
      if (!questionPdfFile) {
        setError('Please upload a question paper PDF');
        return false;
      }
      if (!goldenPdfFile) {
        setError('Please upload a golden answer script PDF');
        return false;
      }
      setError('');
      return true;
    }

    const invalidQuestions = questions.filter(q => {
      const hasQuestionFile = q.question || q.questionUrl;
      const hasAnswerFile = q.answer || q.answerUrl;

      const missingQuestionImage = ['image', 'both'].includes(q.questionType || 'image') ? !hasQuestionFile : false;
      const missingQuestionText = ['text', 'both'].includes(q.questionType || 'image') ? !q.questionBody : false;
      const missingAnswerImage = ['image', 'both'].includes(q.answerType || 'image') ? !hasAnswerFile : false;
      const missingAnswerText = ['text', 'both'].includes(q.answerType || 'image') ? !q.answerBody : false;

      return missingQuestionImage || missingQuestionText || missingAnswerImage || missingAnswerText || !q.marks;
    });
    
    if (invalidQuestions.length > 0) {
      const firstInvalidIndex = questions.findIndex(q => q.id === invalidQuestions[0].id);
      setCurrentQuestionIndex(firstInvalidIndex);
      scrollToQuestion(invalidQuestions[0].id);
      setError('Please fill in all required fields for each question');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuestions()) return;
    setIsSubmitting(true);
    setError('');
    
    try {
      if (uploadMode === 'golden-pdf') {
        const pdfFormData = new FormData();
        if (questionPdfFile) {
          pdfFormData.append('question_pdf', questionPdfFile);
        }
        if (goldenPdfFile) {
          pdfFormData.append('golden_pdf', goldenPdfFile);
        }

        await onSubmit(examId, pdfFormData);
      } else {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];

          const questionNumber = q.questionNumber || i + 1;
          const hasQuestionFile = q.question || q.questionUrl;
          const hasAnswerFile = q.answer || q.answerUrl;

          const shouldSendQuestion = (q.questionType && q.questionType !== 'image') || q.question || (!q.questionUrl && ['image', 'both'].includes(q.questionType || 'image'));
          const shouldSendAnswer = (q.answerType && q.answerType !== 'image') || q.answer || (!q.answerUrl && ['image', 'both'].includes(q.answerType || 'image'));

          try {
            if (shouldSendQuestion) {
              const questionFormData = new FormData();
              questionFormData.append('question_number', questionNumber.toString());
              questionFormData.append('file_type', 'question');
              questionFormData.append('max_marks', q.marks);
              questionFormData.append('question_type', q.questionType || 'image');
              questionFormData.append('question_body', q.questionBody || '');
              questionFormData.append('question_text', 'test-question');
              questionFormData.append('domain', 'General');
              questionFormData.append('answer_text', 'test-answer');
              
              // Add rubric configuration fields
              questionFormData.append('num_rubric_items', (q.num_rubric_items || 3).toString());
              if (q.professorInstructions && q.professorInstructions.trim()) {
                questionFormData.append('professor_instructions', q.professorInstructions.trim());
              }
              
              if (['image', 'both'].includes(q.questionType || 'image') && q.question) {
                questionFormData.append('file', q.question);
              } else if (['image', 'both'].includes(q.questionType || 'image') && !hasQuestionFile) {
                throw new Error('Question image is required');
              }
              await onSubmit(examId, questionFormData);
            }

            if (shouldSendAnswer) {
              const answerFormData = new FormData();
              answerFormData.append('question_number', questionNumber.toString());
              answerFormData.append('file_type', 'answer');
              answerFormData.append('answer_type', q.answerType || 'image');
              answerFormData.append('answer_body', q.answerBody || '');
              answerFormData.append('answer_text', 'test-answer');
              answerFormData.append('question_text', 'test-question');
              answerFormData.append('max_marks', q.marks);
              answerFormData.append('domain', 'General');
              if (['image', 'both'].includes(q.answerType || 'image') && q.answer) {
                answerFormData.append('file', q.answer);
              } else if (['image', 'both'].includes(q.answerType || 'image') && !hasAnswerFile) {
                throw new Error('Answer image is required');
              }
              await onSubmit(examId, answerFormData);
            }
          } catch (error) {
            const errorMessage = error.message || 'Error uploading question';
            setError(`Error uploading question ${questionNumber}: ${errorMessage}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
  
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to upload files');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const QuestionDisplay = ({ type, data, onFileChange, questionId }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const preview = data[`${type}Preview`];
    const url = data[`${type}Url`];
    const title = type === 'question' ? 'Question' : 'Answer';
    const dropZoneId = `${type}-${questionId}`;
    
    const dropZoneRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
        setIsDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        
        if (file.type.match('image.*')) {
          onFileChange(questionId, type, file);
        } else {
          setError(`Please upload an image file for ${title}`);
        }
      }
    };

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((it) => it.type?.startsWith('image/'));
      if (!imageItem) return;

      e.preventDefault();
      const pastedFile = imageItem.getAsFile();
      if (pastedFile) {
        onFileChange(questionId, type, pastedFile);
      }
    };
    
    if (url || preview) {
      const src = preview || url;
      return (
        <div className="relative group h-full min-h-[200px] border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-sm">
          <img
            src={src}
            alt={`${title} preview`}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFileChange(questionId, type, null);
              }}
              className="p-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-red-600 hover:scale-110 transition-all"
              aria-label={`Remove ${title} image`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div 
          ref={dropZoneRef}
          className={`w-full min-h-[200px] border ${isDragActive || isActive ? 'border-blue-500 bg-blue-50/30' : 'border-dashed border-gray-300 bg-gray-50'} 
            rounded-lg hover:border-blue-500 hover:bg-blue-50/10 transition-all duration-300 
            flex flex-col items-center justify-center cursor-pointer relative outline-none`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => {
            setIsActive(true);
            activePasteTargetRef.current = { questionId, type };
            setTimeout(() => dropZoneRef.current?.focus(), 0);
          }}
          onBlur={() => setIsActive(false)}
          tabIndex={0}
          role="button"
        >
          <Upload className={`w-8 h-8 ${isDragActive || isActive ? 'text-blue-500' : 'text-gray-400'} mb-2`} />
          <span className={`text-sm ${isDragActive || isActive ? 'text-blue-600 font-medium' : 'text-gray-500'} text-center`}>
            {isDragActive ? `Drop ${title.toLowerCase()} here` : `Click to focus, then paste (Ctrl+V) or use Upload button`}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActive(true);
              activePasteTargetRef.current = { questionId, type };
              setTimeout(() => dropZoneRef.current?.focus(), 0);
              fileInputRef.current?.click();
            }}
            className="mt-3 h-[40px] w-[110px] px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
            Upload
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileChange(questionId, type, e.target.files[0]);
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            aria-label={`Upload ${title} image`}
          />

          <span className="text-xs text-gray-400 mt-3">
            JPG, PNG or GIF recommended
          </span>
        </div>
      </div>
    );
  };

  const PdfUploader = ({ title, file, setFile, icon: Icon }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const dropZoneRef = useRef(null);

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
        setIsDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          setFile(file);
        } else {
          setError(`${title} must be a PDF file`);
        }
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {title} <span className="text-red-500">*</span>
        </label>
        {file ? (
          <div className="relative border border-gray-200 rounded-lg bg-white p-4 group transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <File className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                aria-label={`Remove ${title}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={dropZoneRef}
            className={`w-full h-32 border ${isDragActive ? 'border-blue-500 bg-blue-50/30' : 'border-dashed border-gray-300 bg-gray-50'} 
              rounded-lg hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer transition-all duration-300 
              flex flex-col items-center justify-center relative`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'} mb-2 ${isDragActive ? '' : 'animate-pulse'}`} />
            <span className={`text-sm ${isDragActive ? 'text-blue-600 font-medium' : 'text-gray-500'} text-center`}>
              {isDragActive ? `Drop PDF here` : `Drag & drop ${title} or click to upload`}
            </span>
            <span className="text-xs text-gray-400 mt-2">
              PDF format required
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onClick={e => e.stopPropagation()}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === 'application/pdf') {
                  setFile(file);
                } else if (file) {
                  setError(`${title} must be a PDF file`);
                }
              }}
              aria-label={`Upload ${title}`}
            />
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const ModalContent = (
    <div 
      className={`relative bg-white shadow-xl max-h-[90vh] w-full flex flex-col
        transform transition-all duration-300 ease-in-out 
        ${isFullscreen 
          ? 'max-w-full h-screen rounded-none' 
          : 'max-w-5xl h-auto rounded-lg m-4'}`}
      style={{ zIndex: 10000 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-medium text-gray-900">Upload Questions & Solutions</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-sm font-medium text-gray-700">Upload Method:</div>
          <div className="flex gap-4">
            <button
              onClick={() => setUploadMode('standard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
                ${uploadMode === 'standard' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200'
                }`}
            >
              <UploadIcon className="w-4 h-4" />
              <span>Question by Question</span>
            </button>
            <button
              onClick={() => setUploadMode('golden-pdf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
                ${uploadMode === 'golden-pdf' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200'
                }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>Golden PDF</span>
            </button>
          </div>
        </div>
      </div>

      {uploadMode === 'standard' && (
        <>
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-6 py-2 sticky top-[57px] z-10">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Navigate:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateQuestion('prev')}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center justify-center p-1 rounded transition-colors ${
                    currentQuestionIndex === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Go to previous question"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={() => navigateQuestion('next')}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className={`flex items-center justify-center p-1 rounded transition-colors ${
                    currentQuestionIndex === questions.length - 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Go to next question"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1 py-1 px-3 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
          
          <div className="px-6 pt-4 pb-2">
            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md flex items-start animate-fadeIn">
              <span className="text-blue-500 mr-2">💡</span>
              <span>
                <strong>Tip:</strong> Upload clear images of questions and model answers. 
                Add detailed domain information to improve automated grading.
              </span>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="px-6 pt-3 pb-0 animate-slideDown">
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {uploadMode === 'golden-pdf' ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FilePlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">PDF Upload Mode</h3>
              </div>

              <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md flex items-start animate-fadeIn">
                <span className="text-blue-500 mr-2">💡</span>
                <span>
                  <strong>Tip:</strong> Upload a complete PDF question paper and a corresponding 
                  golden answer script. The system will use these PDFs for automated grading.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <PdfUploader 
                  title="Question Paper PDF" 
                  file={questionPdfFile}
                  setFile={setQuestionPdfFile}
                  icon={FileText}
                />

                <PdfUploader 
                  title="Golden Answer Script PDF" 
                  file={goldenPdfFile}
                  setFile={setGoldenPdfFile}
                  icon={File}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                id={`question-${question.id}`}
                ref={el => questionRefs.current[question.id] = el}
                className={`p-6 rounded-lg transition-all duration-300 animate-fadeIn
                  ${index === currentQuestionIndex 
                    ? 'bg-white border border-gray-200 shadow-sm' 
                    : 'bg-white border border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Question {index + 1}
                      {question.isExisting && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Existing
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Question Type:</span>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, questionType: 'image' } : q))}
                        className={`px-3 py-1 text-sm transition-colors ${question.questionType === 'image' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        type="button"
                      >
                        Image
                      </button>
                      <button
                        onClick={() => setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, questionType: 'text', question: null, questionPreview: '', questionUrl: '' } : q))}
                        className={`px-3 py-1 text-sm transition-colors ${question.questionType === 'text' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        type="button"
                      >
                        Text
                      </button>
                      <button
                        onClick={() => setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, questionType: 'both' } : q))}
                        className={`px-3 py-1 text-sm transition-colors ${question.questionType === 'both' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        type="button"
                      >
                        Both
                      </button>
                    </div>
                  </div>

                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      aria-label="Remove question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {['image', 'both'].includes(question.questionType || 'image') && (
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-600">
                      Question Image <span className="text-red-500">*</span>
                    </label>
                    <QuestionDisplay 
                      type="question"
                      data={question}
                      onFileChange={handleFileChange}
                      questionId={question.id}
                    />
                  </div>
                )}

                {['text', 'both'].includes(question.questionType || 'image') && (
                  <div className="mb-6 space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Question Body <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question.questionBody}
                      onChange={(e) => {
                        setQuestions(prev => prev.map(q => 
                          q.id === question.id 
                            ? { ...q, questionBody: e.target.value }
                            : q
                        ));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all duration-200"
                      rows={4}
                      placeholder="Enter question text"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">Answer Type:</span>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, answerType: 'image' } : q))}
                      className={`px-3 py-1 text-sm transition-colors ${question.answerType === 'image' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                      type="button"
                    >
                      Image
                    </button>
                    <button
                      onClick={() => setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, answerType: 'text', answer: null, answerPreview: '', answerUrl: '' } : q))}
                      className={`px-3 py-1 text-sm transition-colors ${question.answerType === 'text' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                      type="button"
                    >
                      Text
                    </button>
                    <button
                      onClick={() => setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, answerType: 'both' } : q))}
                      className={`px-3 py-1 text-sm transition-colors ${question.answerType === 'both' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                      type="button"
                    >
                      Both
                    </button>
                  </div>
                </div>

                {['image', 'both'].includes(question.answerType || 'image') && (
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-600">
                      Answer Image <span className="text-red-500">*</span>
                    </label>
                    <QuestionDisplay 
                      type="answer"
                      data={question}
                      onFileChange={handleFileChange}
                      questionId={question.id}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Answer Body
                    </label>
                    {['text', 'both'].includes(question.answerType || 'image') ? (
                      <textarea
                        value={question.answerBody}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q => 
                            q.id === question.id 
                              ? { ...q, answerBody: e.target.value }
                              : q
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all duration-200"
                        rows={3}
                        placeholder="Enter answer text"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Answer text is optional for image-only answers.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => {
                        setQuestions(prev => prev.map(q => 
                          q.id === question.id 
                            ? { ...q, marks: e.target.value }
                            : q
                        ));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Enter marks"
                    />
                  </div>
                </div>

                {/* Rubric Configuration Section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Rubric Configuration</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Number of Rubric Items
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={question.num_rubric_items}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 3;
                          const clampedValue = Math.min(Math.max(value, 2), 10);
                          setQuestions(prev => prev.map(q => 
                            q.id === question.id 
                              ? { ...q, num_rubric_items: clampedValue }
                              : q
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500">Choose between 2-10 rubric items (default: 3)</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Professor Instructions (Optional)
                      </label>
                      <textarea
                        value={question.professorInstructions}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q => 
                            q.id === question.id 
                              ? { ...q, professorInstructions: e.target.value }
                              : q
                          ));
                        }}
                        maxLength={2000}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all duration-200"
                        rows={3}
                        placeholder="Optional: Guide AI rubric generation (e.g., 'Focus on problem-solving steps', 'Weight mathematical rigor higher')"
                      />
                      <p className="text-xs text-gray-500">
                        {question.professorInstructions?.length || 0}/2000 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg 
                hover:border-blue-500 hover:bg-blue-50/10 transition-colors duration-300 
                flex items-center justify-center gap-2 group"
              aria-label="Add another question"
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-blue-600 font-medium">Add Another Question</span>
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between sticky bottom-0 z-20">
        <div className="text-sm text-gray-500">
          {uploadMode === 'golden-pdf' 
            ? 'Ready to upload PDF files' 
            : `${questions.length} ${questions.length === 1 ? 'question' : 'questions'} to upload`
          }
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium transition-all duration-300
              ${isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'}`}
            type="button"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Upload {uploadMode === 'golden-pdf' ? 'PDFs' : 'Questions'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return modalRootRef.current ? ReactDOM.createPortal(
    ModalContent,
    modalRootRef.current
  ) : null;
};

const addStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-slideDown {
      animation: slideDown 0.4s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
};


addStyles();

export default UploadQnAModal
