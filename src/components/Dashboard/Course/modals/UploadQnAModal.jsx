import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Upload, Trash2, 
  FileText, ArrowUp, ArrowDown,
  CheckCircle, Maximize, Minimize,
  File, FilePlus, Upload as UploadIcon
} from 'lucide-react';
import { API_BASE_URL } from '../../../../BaseURL';

const UploadQnAModal = ({ isOpen, onClose, examId, onSubmit, existingQuestions = [] }) => {
  const [questions, setQuestions] = useState([{
    id: 1,
    question: null,
    questionPreview: '',
    questionUrl: '',
    answer: null,
    answerPreview: '',
    answerUrl: '',
    marks: '',
    questionText: '',
    answerText: 'answer',
    domain: ''
  }]);

  const [goldenPdfFile, setGoldenPdfFile] = useState(null);
  const [questionPdfFile, setQuestionPdfFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('standard'); 

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const modalRef = useRef(null);
  const questionRefs = useRef({});

  useEffect(() => {
    if (!isOpen) {
      setGoldenPdfFile(null);
      setQuestionPdfFile(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (existingQuestions.length > 0) {
      const formattedQuestions = existingQuestions.map((q, index) => ({
        id: index + 1,
        question: null,
        questionPreview: '',
        questionUrl: q.question_file_url || '',
        answer: "Answer",
        answerPreview: '',
        answerUrl: q.answer_file_url || '',
        marks: q.max_marks || '',
        questionText: q.question_text || '',
        answerText: q.answer?.answer_text || 'answer',
        domain: q.domain || ''
      }));
      setQuestions(formattedQuestions);
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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
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
        question: null,
        questionPreview: '',
        questionUrl: '',
        answer: null,
        answerPreview: '',
        answerUrl: '',
        marks: '',
        questionText: '',
        answerText: 'answer',
        domain: ''
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
      return !hasQuestionFile || !hasAnswerFile || !q.marks || !q.questionText || !q.domain;
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
    
    try {
      if (uploadMode === 'golden-pdf') {
        if (questionPdfFile) {
          const questionFormData = new FormData();
          questionFormData.append('question_pdf', questionPdfFile);
          
          try {
            await fetch(`${API_BASE_URL}/professors/courses/${examId}/exams/${examId}/question-pdf`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: questionFormData
            }).then(resp => {
              if (!resp.ok) throw new Error('Failed to upload question PDF');
              return resp.json();
            });
          } catch (error) {
            setError(`Error uploading question PDF: ${error.message}`);
            setIsSubmitting(false);
            return;
          }
        }
        
        if (goldenPdfFile) {
          const goldenFormData = new FormData();
          goldenFormData.append('golden_pdf', goldenPdfFile);
          
          try {
            await fetch(`${API_BASE_URL}/professors/courses/${examId}/exams/${examId}/golden-pdf`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: goldenFormData
            }).then(resp => {
              if (!resp.ok) throw new Error('Failed to upload golden answer PDF');
              return resp.json();
            });
          } catch (error) {
            setError(`Error uploading golden answer PDF: ${error.message}`);
            setIsSubmitting(false);
            return;
          }
        }
      } else {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          
          try {
            if (q.question) {
              const questionFormData = new FormData();
              questionFormData.append('question_number', (i + 1).toString());
              questionFormData.append('file_type', 'question');
              questionFormData.append('file', q.question);
              questionFormData.append('answer_text', q.answerText || 'answer');
              questionFormData.append('max_marks', q.marks);
              questionFormData.append('question_text', q.questionText);
              questionFormData.append('domain', q.domain);
              await onSubmit(examId, questionFormData);
            }
            
            if (q.answer) {
              const answerFormData = new FormData();
              answerFormData.append('question_number', (i + 1).toString());
              answerFormData.append('file_type', 'answer');
              answerFormData.append('file', q.answer);
              answerFormData.append('answer_text', q.answerText || 'answer');
              answerFormData.append('max_marks', q.marks);
              answerFormData.append('question_text', q.questionText);
              answerFormData.append('domain', q.domain);
              await onSubmit(examId, answerFormData);
            }
          } catch (error) {
            setError(`Error uploading question ${i + 1}: ${error.message}`);
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
    const preview = data[`${type}Preview`];
    const url = data[`${type}Url`];
    const title = type === 'question' ? 'Question' : 'Answer';

    if (url) {
      return (
        <div className="relative group h-full min-h-[200px] border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-sm">
          <img
            src={url}
            alt={`${title} from server`}
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

    return preview ? (
      <div className="relative group h-full min-h-[200px] border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-sm">
        <img
          src={preview}
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
    ) : (
      <label className="w-full min-h-[200px] border border-dashed border-gray-300 rounded-lg bg-gray-50 
        hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer transition-all duration-300 
        flex flex-col items-center justify-center">
        <Upload className="w-8 h-8 text-gray-400 mb-2 animate-pulse group-hover:animate-none" />
        <span className="text-sm text-gray-500 text-center">
          Click to upload {title.toLowerCase()} image
        </span>
        <span className="text-xs text-gray-400 mt-2">
          JPG, PNG or GIF recommended
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) {
              onFileChange(questionId, type, e.target.files[0]);
            }
          }}
          aria-label={`Upload ${title} image`}
        />
      </label>
    );
  };

  const PdfUploader = ({ title, file, setFile, icon: Icon }) => (
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
        <label className="w-full h-32 border border-dashed border-gray-300 rounded-lg bg-gray-50 
          hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer transition-all duration-300 
          flex flex-col items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400 mb-2 animate-pulse" />
          <span className="text-sm text-gray-500 text-center">
            Click to upload {title}
          </span>
          <span className="text-xs text-gray-400 mt-2">
            PDF format required
          </span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
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
        </label>
      )}
    </div>
  );

  const modalDisplayClasses = isOpen 
    ? "opacity-100 scale-100" 
    : "opacity-0 scale-95 pointer-events-none";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
      <div 
        ref={modalRef}
        className={`relative bg-white shadow-xl max-h-[90vh] w-full flex flex-col
          transform transition-all duration-300 ease-in-out ${modalDisplayClasses}
          ${isFullscreen 
            ? 'max-w-full h-screen rounded-none' 
            : 'max-w-5xl h-auto rounded-lg m-4'}`}
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
        )}

        {error && (
          <div className="px-6 pt-3 pb-0 animate-slideDown">
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
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

                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md flex items-start animate-fadeIn">
                  <span className="text-blue-500 mr-2">💡</span>
                  <span>
                    <strong>Tip:</strong> Upload a complete PDF question paper and a corresponding 
                    golden answer script. The system will use these PDFs for automated grading.
                  </span>
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
                      <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
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
  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
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
  
                    <div className="space-y-2">
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
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Question Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q => 
                            q.id === question.id 
                              ? { ...q, questionText: e.target.value }
                              : q
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Enter question text"
                      />
                    </div>
  
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Domain <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.domain}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q => 
                            q.id === question.id 
                              ? { ...q, domain: e.target.value }
                              : q
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Enter domain (e.g., Algebra, Geometry)"
                      />
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Answer Text
                      </label>
                      <textarea
                        value={question.answerText}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q => 
                            q.id === question.id 
                              ? { ...q, answerText: e.target.value }
                              : q
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all duration-200"
                        rows={3}
                        placeholder="Enter answer text (optional)"
                      />
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

                  {index === currentQuestionIndex && (
                    <div className="mt-6 bg-blue-50 text-blue-800 text-sm p-4 rounded-md flex items-start animate-fadeIn">
                      <span className="text-blue-500 mr-2">💡</span>
                      <span>
                        <strong>Tip:</strong> Upload clear images of questions and model answers. 
                        Add detailed domain information to improve automated grading.
                      </span>
                    </div>
                  )}
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
    </div>
  );
};


export default UploadQnAModal;