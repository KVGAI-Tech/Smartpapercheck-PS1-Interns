import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Upload, Trash2, 
  FileText, AlertCircle
} from 'lucide-react';

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
    answerText: '',
    domain: ''
  }]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingQuestions.length > 0) {
      const formattedQuestions = existingQuestions.map((q, index) => ({
        id: index + 1,
        question: null,
        questionPreview: '',
        questionUrl: q.question_file_url || '',
        answer: null,
        answerPreview: '',
        answerUrl: q.answer?.answer_file_url || '',
        marks: q.max_marks || '',
        questionText: q.question_text || '',
        answerText: q.answer?.answer_text || '',
        domain: q.domain || ''
      }));
      setQuestions(formattedQuestions);
    }
  }, [existingQuestions]);

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
    setQuestions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        question: null,
        questionPreview: '',
        questionUrl: '',
        answer: null,
        answerPreview: '',
        answerUrl: '',
        marks: '',
        questionText: '',
        answerText: '',
        domain: ''
      }
    ]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const validateQuestions = () => {
    const invalidQuestions = questions.filter(q => {
      const hasQuestionFile = q.question || q.questionUrl;
      const hasAnswerFile = q.answer || q.answerUrl;
      return !hasQuestionFile || !hasAnswerFile || !q.marks || !q.questionText || !q.domain;
    });
    
    if (invalidQuestions.length > 0) {
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
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        try {
          if (q.question) {
            const questionFormData = new FormData();
            questionFormData.append('question_number', (i + 1).toString());
            questionFormData.append('file_type', 'question');
            questionFormData.append('file', q.question);
            questionFormData.append('answer_text', '');
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
            answerFormData.append('answer_text', q.answerText || '');
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

      onClose();
    } catch (error) {
      setError(error.message || 'Failed to upload questions');
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
        <div className="relative group">
          <img
            src={url}
            alt={`${title} from server`}
            className="w-full aspect-video object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 
            transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={() => onFileChange(questionId, type, null)}
              className="p-2 bg-red-600 text-white rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return preview ? (
      <div className="relative group">
        <img
          src={preview}
          alt={`${title} preview`}
          className="w-full aspect-video object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 
          transition-opacity rounded-lg flex items-center justify-center">
          <button
            onClick={() => onFileChange(questionId, type, null)}
            className="p-2 bg-red-600 text-white rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    ) : (
      <label className="block w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed 
        border-gray-300 hover:border-blue-500 cursor-pointer transition-colors p-4 
        flex flex-col items-center justify-center">
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">
          Click to upload {title.toLowerCase()} image
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(questionId, type, e.target.files[0])}
        />
      </label>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload Questions & Solutions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {questions.map((q, index) => (
              <div 
                key={q.id} 
                className="p-6 bg-gray-50 rounded-xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <FileText className="w-5 h-5" />
                    <span>Question {index + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Image *
                    </label>
                    <QuestionDisplay 
                      type="question"
                      data={q}
                      onFileChange={handleFileChange}
                      questionId={q.id}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Image *
                    </label>
                    <QuestionDisplay 
                      type="answer"
                      data={q}
                      onFileChange={handleFileChange}
                      questionId={q.id}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(question => 
                            question.id === q.id 
                              ? { ...question, questionText: e.target.value }
                              : question
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter question text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domain *
                      </label>
                      <input
                        type="text"
                        value={q.domain}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(question => 
                            question.id === q.id 
                              ? { ...question, domain: e.target.value }
                              : question
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter domain (e.g., Algebra, Geometry)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Text
                      </label>
                      <textarea
                        value={q.answerText}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(question => 
                            question.id === q.id 
                              ? { ...question, answerText: e.target.value }
                              : question
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter answer text (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marks *
                      </label>
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) => {
                          setQuestions(prev => prev.map(question => 
                            question.id === q.id 
                              ? { ...question, marks: e.target.value }
                              : question
                          ));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter marks"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5 mx-auto" />
              Add Another Question
            </button>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                'Upload Questions'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadQnAModal;