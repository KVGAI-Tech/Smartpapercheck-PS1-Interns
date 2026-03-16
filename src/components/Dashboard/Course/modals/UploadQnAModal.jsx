import React, { useState, useEffect, useRef } from 'react';

import ReactDOM from 'react-dom'; 
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { 
  X, Plus, Upload, Trash2, 
  FileText, ArrowUp, ArrowDown,
  CheckCircle, Maximize, Minimize,
  File, FilePlus, Upload as UploadIcon,
  AlertCircle, Loader2
} from 'lucide-react';

import { API_BASE_URL } from '../../../../BaseURL';

if (typeof window !== 'undefined' && !window.katex) {
  window.katex = katex;
}

class QuillErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const RichTextEditor = ({ value, onChange, placeholder, className, modules, formats }) => {
  const reactQuillRef = useRef(null);

  useEffect(() => {
    const quill = reactQuillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = (e) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;
      
      const items = clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image/') === 0) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (event) => {
              const range = quill.getSelection(true);
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, 'image', event.target.result, 'user');
              quill.setSelection(index + 1, 0, 'silent');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    quill.root.addEventListener('paste', handlePaste);
    return () => {
      quill.root.removeEventListener('paste', handlePaste);
    };
  }, []);

  const fallback = (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 focus:outline-none resize-none transition-all duration-200 min-h-[180px]"
      rows={6}
      placeholder={placeholder}
    />
  );

  return (
    <div className={className}>
      <QuillErrorBoundary fallback={fallback}>
        <ReactQuill
          ref={reactQuillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
        />
      </QuillErrorBoundary>
    </div>
  );
};

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
    questionText: '',
    questionBody: '',
    answerText: '',
    answerBody: '',
    domain: 'General',
    isExisting: false,
    num_rubric_items: 1,
    professorInstructions: '',
    aiCustomInstruction: ''
  }]);

  const [goldenPdfFile, setGoldenPdfFile] = useState(null);
  const [questionPdfFile, setQuestionPdfFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('standard'); 

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAiAnswerModal, setShowAiAnswerModal] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState('');
  const [aiPreviewAnswer, setAiPreviewAnswer] = useState('');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const modalRef = useRef(null);
  const questionRefs = useRef({});
  const dropZoneRefs = useRef({});
  const modalRootRef = useRef(null);

  const stripMarkdown = (text = '') => {
    if (!text) return '';
    let result = text;
    // Remove code fences and inline backticks
    result = result.replace(/```[\s\S]*?```/g, '');
    result = result.replace(/`([^`]+)`/g, '$1');
    // Remove common markdown heading/bullet prefixes while keeping content
    result = result.replace(/^\s{0,3}#{1,6}\s+/gm, '');
    result = result.replace(/^\s{0,3}[-*+]\s+/gm, '');
    result = result.replace(/^\s{0,3}\d+\.\s+/gm, '');
    // Remove horizontal rules (--- etc.)
    result = result.replace(/^\s*-{3,}\s*$/gm, '');
    // Unwrap lines that are just [ ... ] used as display wrappers
    result = result.replace(/^\s*\[(.*?)\]\s*$/gm, '$1');
    // Strip simple LaTeX inline and display math delimiters
    result = result.replace(/\\\((.*?)\\\)/g, '$1');
    result = result.replace(/\\\[(.*?)\\\]/g, '$1');
    // Remove common TeX helpers like boxed{...}, begin{aligned}, end{aligned}
    result = result.replace(/boxed\{/g, '');
    result = result.replace(/begin\{aligned\}/g, '');
    result = result.replace(/end\{aligned\}/g, '');
    // Remove emphasis markers
    result = result.replace(/\*\*(.*?)\*\*/g, '$1');
    result = result.replace(/\*(.*?)\*/g, '$1');
    result = result.replace(/__(.*?)__/g, '$1');
    result = result.replace(/_(.*?)_/g, '$1');
    // Remove remaining stray backslashes (e.g., from LaTeX commands)
    result = result.replace(/\\/g, '');
    // Normalize multiple blank lines
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim();
  };

  const isRichTextEmpty = (html = '') => {
    if (!html) return true;
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length === 0;
  };

  const richTextToPlainText = (html = '') => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const normalizeType = (value) => {
    if (!value) return '';
    return String(value).trim().toLowerCase();
  };

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

  const formulaSupported = React.useMemo(() => {
    try {
      const Quill = ReactQuill?.Quill;
      if (!Quill) return false;
      Quill.import('formats/formula');
      return typeof window !== 'undefined' && !!window.katex;
    } catch {
      return false;
    }
  }, []);

  const quillFormats = React.useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link',
    'image',
    ...(formulaSupported ? ['formula'] : []),
  ], [formulaSupported]);

  const quillModules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image', ...(formulaSupported ? ['formula'] : [])],
        ['clean'],
      ],
      handlers: {
        image: function imageHandler() {
          const quill = this.quill;
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = () => {
            const file = input.files && input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              const range = quill.getSelection(true);
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, 'image', reader.result, 'user');
              quill.setSelection(index + 1, 0, 'user');
            };
            reader.readAsDataURL(file);
          };
        },
      },
    },
  }), [formulaSupported]);

  const handleOpenAiAnswerModal = () => {
    setAiGenerationError('');
    setAiPreviewAnswer('');
    setShowAiAnswerModal(true);
  };

  const handleCloseAiAnswerModal = () => {
    if (isGeneratingAnswer) return;
    setAiGenerationError('');
    setAiPreviewAnswer('');
    setShowAiAnswerModal(false);
  };

  const handleGenerateAnswer = async () => {
    setAiGenerationError('');

    const questionImageUrl = activeQuestion.questionUrl || activeQuestion.questionPreview || '';
    const questionBody = activeQuestion.questionBody || '';
    const questionType = activeQuestion.questionType || 'image';

    const questionBodyPlain = richTextToPlainText(questionBody);

    if (!questionImageUrl && !questionBodyPlain.trim()) {
      setAiGenerationError('Please provide question text or upload a question image.');
      return;
    }

    setIsGeneratingAnswer(true);

    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/generate-answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: activeQuestion.domain || 'General',
          question_type: questionType,
          question_body: questionBodyPlain,
          question_image_url: questionImageUrl || null,
          max_marks: activeQuestion.marks ? Number(activeQuestion.marks) : null,
          custom_instruction: activeQuestion.aiCustomInstruction || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
        throw new Error(errorData.message || errorData.detail || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to generate answer');
      }

      const generatedRaw = data?.data?.answer || '';
      const generated = stripMarkdown(generatedRaw);
      if (!generated.trim()) {
        throw new Error('AI returned an empty answer');
      }
      setAiPreviewAnswer(generated);
    } catch (e) {
      setAiGenerationError(e?.message || 'Failed to generate answer');
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleApplyGeneratedAnswer = () => {
    const cleaned = (aiPreviewAnswer || '').trim();
    if (!cleaned) {
      setAiGenerationError('Generated answer is empty. Please generate again.');
      return;
    }

    setQuestions(prev => prev.map(q => {
      if (q.id !== activeQuestion.id) return q;
      const nextAnswerType = (q.answerType || 'image') === 'image' ? 'both' : (q.answerType || 'image');
      return {
        ...q,
        answerType: nextAnswerType,
        answerBody: cleaned,
      };
    }));

    setAiPreviewAnswer('');
    setAiGenerationError('');
    setShowAiAnswerModal(false);
  };

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
        questionText: q.question_text || '',
        questionBody: q.question_body || '',
        answerText: q.answer_text || '',
        answerBody: q.answer_body || '',
        domain: q.domain || 'General',
        isExisting: true, 
        questionNumber: q.question_number,
        num_rubric_items: q.num_rubric_items || 1,
        professorInstructions: q.professor_instructions || '',
        aiCustomInstruction: ''
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
        questionText: '',
        questionBody: '',
        answerText: '',
        answerBody: '',
        domain: 'General',
        isExisting: false,
        num_rubric_items: 1,
        professorInstructions: '',
        aiCustomInstruction: ''
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
        questionText: '',
        questionBody: '',
        answerText: '',
        answerBody: '',
        domain: 'General',
        isExisting: false,
        num_rubric_items: 3,
        professorInstructions: '',
        aiCustomInstruction: ''
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

      const questionType = normalizeType(q.questionType || 'image') || 'image';
      const answerType = normalizeType(q.answerType || 'image') || 'image';

      const missingQuestionImage = ['image', 'both'].includes(questionType) ? !hasQuestionFile : false;
      const missingQuestionText = ['text', 'both'].includes(questionType) ? isRichTextEmpty(q.questionBody) : false;
      const missingAnswerImage = ['image', 'both'].includes(answerType) ? !hasAnswerFile : false;
      const missingAnswerText = ['text', 'both'].includes(answerType) ? isRichTextEmpty(q.answerBody) : false;

      // Validate rubric items count
      const rubricCount = parseInt(q.num_rubric_items);
      const invalidRubricCount = isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10;

      return missingQuestionImage || missingQuestionText || missingAnswerImage || missingAnswerText || !q.marks || invalidRubricCount;
    });
    
    if (invalidQuestions.length > 0) {
      const firstInvalidIndex = questions.findIndex(q => q.id === invalidQuestions[0].id);
      const invalidQuestion = invalidQuestions[0];
      
      // Check if the issue is specifically with rubric count
      const rubricCount = parseInt(invalidQuestion.num_rubric_items);
      const invalidRubricCount = isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10;
      
      if (invalidRubricCount) {
        setError(`Number of rubric items must be between 1 and 10 (current: ${invalidQuestion.num_rubric_items || 'empty'})`);
      } else {
        setError('Please fill in all required fields for each question');
      }
      
      setCurrentQuestionIndex(firstInvalidIndex);
      scrollToQuestion(invalidQuestions[0].id);
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

          // Always send metadata updates (e.g., max marks) when an existing file URL exists.
          // Backend supports updating without re-uploading the file.
          const shouldSendQuestion = (q.questionType && q.questionType !== 'image') || hasQuestionFile;
          const shouldSendAnswer = (q.answerType && q.answerType !== 'image') || hasAnswerFile;

          try {
            if (shouldSendQuestion) {
              const questionFormData = new FormData();
              questionFormData.append('question_number', questionNumber.toString());
              questionFormData.append('file_type', 'question');
              questionFormData.append('max_marks', q.marks);
              questionFormData.append('question_type', q.questionType || 'image');
              questionFormData.append('question_body', q.questionBody || '');
              // Optional short title/label for the question
              questionFormData.append('question_text', q.questionText || '');
              questionFormData.append('domain', q.domain || 'General');
              // Optional short label for the answer
              questionFormData.append('answer_text', q.answerText || '');
              
              // Add rubric configuration fields
              questionFormData.append('num_rubric_items', (q.num_rubric_items || 1).toString());
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
              answerFormData.append('answer_text', q.answerText || '');
              answerFormData.append('question_text', q.questionText || '');
              answerFormData.append('max_marks', q.marks);
              answerFormData.append('domain', q.domain || 'General');
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
          className={`w-full min-h-[200px] border ${isDragActive || isActive ? 'border-accent bg-accent/10' : 'border-dashed border-gray-300 bg-gray-50'} 
            rounded-lg hover:border-accent hover:bg-accent/5 transition-all duration-300 
            flex flex-col items-center justify-center cursor-pointer relative outline-none`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => {
            setIsActive(true);
            setTimeout(() => dropZoneRef.current?.focus(), 0);
          }}
          onBlur={() => setIsActive(false)}
          tabIndex={0}
          role="button"
        >
          <Upload className={`w-8 h-8 ${isDragActive || isActive ? 'text-accent' : 'text-gray-400'} mb-2`} />
          <span className={`text-sm ${isDragActive || isActive ? 'text-accent font-medium' : 'text-gray-500'} text-center`}>
            {isDragActive ? `Drop ${title.toLowerCase()} here` : `Click to focus, then paste (Ctrl+V) or use Upload button`}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActive(true);
              setTimeout(() => dropZoneRef.current?.focus(), 0);
              fileInputRef.current?.click();
            }}
            className="mt-3 h-[40px] w-[110px] px-3 py-2 text-sm font-medium bg-accent text-white rounded-md shadow-sm hover:bg-accent transition-colors"
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
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <File className="w-6 h-6 text-accent" />
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
            className={`w-full h-32 border ${isDragActive ? 'border-accent bg-accent/10' : 'border-dashed border-gray-300 bg-gray-50'} 
              rounded-lg hover:border-accent hover:bg-accent/5 cursor-pointer transition-all duration-300 
              flex flex-col items-center justify-center relative`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon className={`w-8 h-8 ${isDragActive ? 'text-accent' : 'text-gray-400'} mb-2 ${isDragActive ? '' : 'animate-pulse'}`} />
            <span className={`text-sm ${isDragActive ? 'text-accent font-medium' : 'text-gray-500'} text-center`}>
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

  if (!isOpen || questions.length === 0) return null;

  const safeIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const activeQuestion = questions[safeIndex];
  const activeQuestionType = normalizeType(activeQuestion.questionType || 'image') || 'image';
  const activeAnswerType = normalizeType(activeQuestion.answerType || 'image') || 'image';

  const ModalContent = (
    <div 
      className={`upload-qna-modal relative bg-white shadow-xl w-full flex flex-col
        transform transition-all duration-300 ease-in-out 
        ${isFullscreen 
          ? 'max-w-full h-screen rounded-none' 
          : 'max-w-6xl max-h-[92vh] h-[92vh] rounded-2xl m-4 sm:m-6'}`}
      style={{ zIndex: 10000 }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .upload-qna-modal .question-body-quill .ql-container,
        .upload-qna-modal .answer-body-quill .ql-container {
          min-height: 180px;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .upload-qna-modal .question-body-quill .ql-editor,
        .upload-qna-modal .answer-body-quill .ql-editor {
          min-height: 180px;
        }
        .upload-qna-modal .question-body-quill .ql-toolbar,
        .upload-qna-modal .answer-body-quill .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .upload-qna-modal .ql-tooltip {
          z-index: 100 !important;
          left: 10px !important;
          right: auto !important;
        }
      `}</style>
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upload Questions & Solutions</h2>
            <p className="text-sm text-gray-500">Upload question images/text, answers, marks, and rubric configuration.</p>
          </div>
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
              className="flex items-center gap-1 py-1 px-3 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
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

      <div className="flex-1 min-h-0 px-6 py-4 bg-gray-50">
        {uploadMode === 'golden-pdf' ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FilePlus className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-medium text-gray-900">PDF Upload Mode</h3>
              </div>

              <div className="bg-accent/10 text-gray-800 text-sm p-4 rounded-xl flex items-start animate-fadeIn border border-accent/15">
                <span className="text-accent mr-2">💡</span>
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
          <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
            {/* Left: Question list panel with its own scroll */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Questions</p>
                  <p className="text-xs text-gray-500">Select a question to edit</p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-full text-left rounded-xl border transition-colors px-3 py-3 flex items-start gap-3
                        ${idx === currentQuestionIndex ? 'border-accent bg-accent/10' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold
                        ${idx === currentQuestionIndex ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">Question {idx + 1}</p>
                          {q.isExisting && (
                            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Existing</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {q.marks ? `${q.marks} marks` : 'Marks not set'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Editing panel with its own scroll */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Editing</p>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">Question {currentQuestionIndex + 1}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateQuestion('prev')}
                    disabled={currentQuestionIndex === 0}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentQuestionIndex === 0 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    type="button"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => navigateQuestion('next')}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentQuestionIndex === questions.length - 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    type="button"
                  >
                    Next
                  </button>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeQuestion.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                      type="button"
                      aria-label="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Question Type
                      </label>
                      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, questionType: 'text', question: null, questionPreview: '', questionUrl: '' } : q))}
                          className={`px-3 py-1.5 text-sm transition-colors ${activeQuestionType === 'text' ? 'bg-accent/10 text-accent' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          type="button"
                        >
                          Text
                        </button>
                        <button
                          onClick={() => setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, questionType: 'image' } : q))}
                          className={`px-3 py-1.5 text-sm transition-colors ${activeQuestionType === 'image' ? 'bg-accent/10 text-accent' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          type="button"
                        >
                          Image
                        </button>
                        <button
                          onClick={() => setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, questionType: 'both' } : q))}
                          className={`px-3 py-1.5 text-sm transition-colors ${activeQuestionType === 'both' ? 'bg-accent/10 text-accent' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          type="button"
                        >
                          Both
                        </button>
                      </div>
                    </div>

                    {['image', 'both'].includes(activeQuestionType) && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">
                          Question Image <span className="text-red-500">*</span>
                        </label>
                        <QuestionDisplay
                          type="question"
                          data={activeQuestion}
                          onFileChange={handleFileChange}
                          questionId={activeQuestion.id}
                        />
                      </div>
                    )}

                    {['text', 'both'].includes(activeQuestionType) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <label className="block text-sm font-medium text-gray-600">
                            Question Body <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            tabIndex={-1}
                            aria-hidden="true"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors border-gray-200 bg-white text-gray-900 opacity-0 pointer-events-none"
                          >
                            <img
                              src="/artificial-intelligence.png"
                              alt=""
                              className="w-5 h-5"
                            />
                            <span className="text-sm font-medium">Generate with AI</span>
                          </button>
                        </div>
                        <RichTextEditor
                          className="question-body-quill rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-all duration-200 bg-white"
                          value={activeQuestion.questionBody || ''}
                          onChange={(value) => {
                            setQuestions(prev => prev.map(q =>
                              q.id === activeQuestion.id
                                ? { ...q, questionBody: value }
                                : q
                            ));
                          }}
                          placeholder="Enter question text"
                          modules={quillModules}
                          formats={quillFormats}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Type
                      </label>
                      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, answerType: 'text', answer: null, answerPreview: '', answerUrl: '' } : q))}
                          className={`px-3 py-1.5 text-sm transition-colors ${activeAnswerType === 'text' ? 'bg-accent/10 text-accent' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          type="button"
                        >
                          Text
                        </button>
                        <button
                          onClick={() => setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, answerType: 'image' } : q))}
                          className={`px-3 py-1.5 text-sm transition-colors ${activeAnswerType === 'image' ? 'bg-accent/10 text-accent' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          type="button"
                        >
                          Image
                        </button>
                        <button
                          onClick={() => setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, answerType: 'both' } : q))}
                          className={`px-3 py-1.5 text-sm transition-colors ${activeAnswerType === 'both' ? 'bg-accent/10 text-accent' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          type="button"
                        >
                          Both
                        </button>
                      </div>
                    </div>

                    {['image', 'both'].includes(activeAnswerType) && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">
                          Answer Image <span className="text-red-500">*</span>
                        </label>
                        <QuestionDisplay
                          type="answer"
                          data={activeQuestion}
                          onFileChange={handleFileChange}
                          questionId={activeQuestion.id}
                        />
                      </div>
                    )}

                    {['text', 'both'].includes(activeAnswerType) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <label className="block text-sm font-medium text-gray-600">
                            Answer Body
                          </label>

                          {['text', 'both'].includes(activeAnswerType) && (
                            <button
                              type="button"
                              onClick={handleOpenAiAnswerModal}
                              disabled={isSubmitting}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-200 bg-white text-gray-900`}
                            >
                              <img
                                src="/artificial-intelligence.png"
                                alt="AI"
                                className="w-5 h-5"
                              />
                              <span className="text-sm font-medium">Generate with AI</span>
                            </button>
                          )}
                        </div>

                        <RichTextEditor
                          className="answer-body-quill rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-all duration-200 bg-white"
                          value={activeQuestion.answerBody || ''}
                          onChange={(value) => {
                            setQuestions(prev => prev.map(q =>
                              q.id === activeQuestion.id
                                ? { ...q, answerBody: value }
                                : q
                            ));
                          }}
                          placeholder="Enter answer text"
                          modules={quillModules}
                          formats={quillFormats}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Max Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={activeQuestion.marks}
                    onChange={(e) => {
                      setQuestions(prev => prev.map(q =>
                        q.id === activeQuestion.id
                          ? { ...q, marks: e.target.value }
                          : q
                      ));
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all duration-200 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="Enter max marks"
                  />
                </div>

                <div className="p-5 bg-accent/5 rounded-2xl border border-accent/15">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-accent" />
                    <h4 className="text-sm font-semibold text-gray-900">Rubric Configuration</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Number of Rubric Items
                      </label>
                      <input
                        type="text"
                        value={activeQuestion.num_rubric_items}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q =>
                            q.id === activeQuestion.id
                              ? { ...q, num_rubric_items: e.target.value }
                              : q
                          ));
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500">Enter number of rubric items (1-10, default: 1)</p>
                      {(() => {
                        const rubricCount = parseInt(activeQuestion.num_rubric_items);
                        const isInvalid = isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10;
                        if (isInvalid && activeQuestion.num_rubric_items !== '') {
                          return (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {isNaN(rubricCount) 
                                ? 'Please enter a valid number' 
                                : rubricCount < 1 
                                  ? `Minimum 1 rubric item required (current: ${rubricCount})`
                                  : `Maximum 10 rubric items allowed (current: ${rubricCount})`
                              }
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Professor Instructions (Optional)
                      </label>
                      <textarea
                        value={activeQuestion.professorInstructions}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(q =>
                            q.id === activeQuestion.id
                              ? { ...q, professorInstructions: e.target.value }
                              : q
                          ));
                        }}
                        maxLength={2000}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none resize-none transition-all duration-200"
                        rows={4}
                        placeholder="Optional: Guide AI rubric generation (e.g., 'Focus on problem-solving steps', 'Weight mathematical rigor higher')"
                      />
                      <p className="text-xs text-gray-500">
                        {activeQuestion.professorInstructions?.length || 0}/2000 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                : 'bg-accent text-white hover:bg-accent shadow-sm hover:shadow'}`}
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

      {showAiAnswerModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 bg-accent/10 rounded-xl flex-shrink-0">
                  <img src="/artificial-intelligence.png" alt="AI" className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">Generate Answer with AI</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Review the question and provide optional instructions.</p>
                </div>
              </div>

              <button
                onClick={handleCloseAiAnswerModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close"
                disabled={isGeneratingAnswer}
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Question Preview</h3>

                  {(['image', 'both'].includes(activeQuestion.questionType || 'image')) && (activeQuestion.questionPreview || activeQuestion.questionUrl) && (
                    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
                      <img
                        src={activeQuestion.questionPreview || activeQuestion.questionUrl}
                        alt="Question"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}

                  {(['text', 'both'].includes(activeQuestionType)) && !isRichTextEmpty(activeQuestion.questionBody || '') && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div
                        className="text-sm text-gray-800"
                        dangerouslySetInnerHTML={{ __html: activeQuestion.questionBody }}
                      />
                    </div>
                  )}

                  {!((activeQuestion.questionPreview || activeQuestion.questionUrl) || !isRichTextEmpty(activeQuestion.questionBody || '')) && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">Please add a question image or question text before generating.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Custom Instruction (Optional)</h3>
                  <textarea
                    value={activeQuestion.aiCustomInstruction || ''}
                    onChange={(e) => {
                      setQuestions(prev => prev.map(q =>
                        q.id === activeQuestion.id
                          ? { ...q, aiCustomInstruction: e.target.value }
                          : q
                      ));
                    }}
                    maxLength={2000}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none resize-none transition-all duration-200"
                    rows={8}
                    placeholder="Optional: e.g., 'Answer in bullet points', 'Show step-by-step working', 'Keep it concise'"
                    disabled={isGeneratingAnswer}
                  />
                  <p className="text-xs text-gray-500">{(activeQuestion.aiCustomInstruction || '').length}/2000 characters</p>

                  {aiGenerationError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                      <p className="text-sm text-rose-700">{aiGenerationError}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">AI Generated Answer Preview</h3>
                {isGeneratingAnswer && (
                  <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Generating answer…</p>
                      <p className="text-xs text-gray-600">This may take a few seconds.</p>
                    </div>
                  </div>
                )}
                {!isGeneratingAnswer && !aiPreviewAnswer && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Generated answer will appear here after you click Generate.</p>
                  </div>
                )}
                {aiPreviewAnswer && !isGeneratingAnswer && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{aiPreviewAnswer}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseAiAnswerModal}
                disabled={isGeneratingAnswer}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={aiPreviewAnswer && !isGeneratingAnswer ? handleApplyGeneratedAnswer : handleGenerateAnswer}
                disabled={isGeneratingAnswer}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {isGeneratingAnswer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : aiPreviewAnswer ? (
                  <>
                    <img src="/artificial-intelligence.png" alt="AI" className="w-5 h-5" />
                    Use this answer
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
