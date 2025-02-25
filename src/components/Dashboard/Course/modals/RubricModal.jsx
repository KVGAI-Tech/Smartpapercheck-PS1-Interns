import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Plus, Save, Sparkles, AlertCircle, 
  Bot, BrainCircuit, Lightbulb, Zap,
  Trash2, Edit2, Database, Cpu,
  Circle, FileText, Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_URL = 'https://api.whyujjwal.com/api';

const GenerateLoader = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-6">
    <div className="relative">
      <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 animate-[spin_3s_linear_infinite]">
        <div className="w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-[spin_2s_linear_infinite]" />
      </div>
      
      <div className="absolute inset-0 animate-[spin_5s_linear_infinite]">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 p-2 bg-blue-100 rounded-lg">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-100 rounded-lg">
          <BrainCircuit className="w-5 h-5 text-purple-600" />
        </div>
      </div>
      <div className="absolute inset-0 animate-[spin_6s_linear_infinite]">
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-2 bg-green-100 rounded-lg">
          <Cpu className="w-5 h-5 text-green-600" />
        </div>
      </div>
      <div className="absolute inset-0 animate-[spin_3.5s_linear_infinite_reverse]">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-100 rounded-lg">
          <Database className="w-5 h-5 text-yellow-600" />
        </div>
      </div>
    </div>

    <div className="text-center space-y-2">
      <h3 className="text-lg font-medium text-gray-900 animate-pulse">
        Generating Smart Rubrics
      </h3>
      <p className="text-sm text-gray-500">
        Analyzing question patterns and generating evaluation criteria...
      </p>
    </div>

    <div className="w-full max-w-md space-y-3">
      {['Processing', 'Analyzing', 'Finalizing'].map((label, index) => (
        <div key={label} className="flex items-center gap-3 text-sm">
          <Zap className="w-4 h-4 text-blue-500" />
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
              style={{
                width: `${Math.min(100, (index + 1) * 33)}%`,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} 
            />
          </div>
          <span className="text-gray-500 min-w-[60px]">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

const RubricItem = ({ item, index, onDelete, onUpdate }) => (
  <Card className="group hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-blue-500 fill-current" />
              <h4 className="font-medium text-gray-900">Rubric Item {index + 1}</h4>
            </div>
            <button
              onClick={() => onDelete(index)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 text-gray-400" />
                Description
              </label>
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => onUpdate(index, { ...item, description: e.target.value })}
                placeholder="Enter criteria description..."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Settings className="w-4 h-4 text-gray-400" />
                  Weight
                </label>
                <input
                  type="number"
                  value={item.weight || 0}
                  onChange={(e) => onUpdate(index, { ...item, weight: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Circle className="w-4 h-4 text-gray-400" />
                  Max Marks
                </label>
                <input
                  type="number"
                  value={item.max_marks || 0}
                  onChange={(e) => onUpdate(index, { ...item, max_marks: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lightbulb className="w-4 h-4 text-gray-400" />
              Reasoning
            </label>
            <textarea
              value={item.reasoning || ''}
              onChange={(e) => onUpdate(index, { ...item, reasoning: e.target.value })}
              placeholder="Explain the reasoning behind this criteria..."
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Edit2 className="w-4 h-4 text-gray-400" />
              Grading Guidelines
            </label>
            <textarea
              value={item.grading_guidelines || ''}
              onChange={(e) => onUpdate(index, { ...item, grading_guidelines: e.target.value })}
              placeholder="Provide specific guidelines for grading..."
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
  
const QuestionCard = ({ 
  question, 
  isSelected, 
  onSelect, 
  onGenerate, 
  showGenerateButton, 
  isGenerating 
}) => (
  <div
    className={`
      w-full rounded-lg transition-all duration-300 overflow-hidden
      ${isSelected 
        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
        : 'hover:bg-gray-50 border border-transparent'
      }
    `}
  >
    <div className="p-4">
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
          `}>
            {question.question_number}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
              Question {question.question_number}
            </h4>
            {question.domain && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                {question.domain}
              </span>
            )}
          </div>
        </div>
        {showGenerateButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerate(e);
            }}
            disabled={isGenerating}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-colors whitespace-nowrap
              ${isSelected 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'text-gray-500 hover:bg-gray-100'
              }
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        )}
      </div>
      
      {isSelected && (
        <div className="mt-3 pl-11">
          <p className="text-sm text-gray-600 line-clamp-2">
            {question.question_text}
          </p>
        </div>
      )}
    </div>
  </div>
);

const RubricModal = ({ 
  isOpen, 
  onClose, 
  examId, 
  onSave = () => {}, 
  questions: inputQuestions = []
}) => {
  const questions = useMemo(() => {
    return Array.isArray(inputQuestions) ? inputQuestions : [];
  }, [inputQuestions]);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [rubricItems, setRubricItems] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRubricEditor, setShowRubricEditor] = useState(false);

  useEffect(() => {
    if (isOpen && questions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(questions[0].question_number);
    }
  }, [isOpen, questions, selectedQuestion]);

  useEffect(() => {
    if (selectedQuestion) {
      const currentQuestion = questions.find(q => q.question_number === selectedQuestion);
      if (currentQuestion) {
        setRubricItems(currentQuestion.rubric_items || []);
        setFeedback(currentQuestion.problem_feedback || '');
        setShowRubricEditor(currentQuestion.rubric_items && currentQuestion.rubric_items.length > 0);
      }
    }
  }, [selectedQuestion, questions]);

  const handleDeleteRubricItem = (index) => {
    setRubricItems(items => items.filter((_, i) => i !== index));
  };

  const handleAddRubricItem = () => {
    const currentQuestion = questions.find(q => q.question_number === selectedQuestion);
    const maxMarks = currentQuestion?.max_marks || 10;

    setRubricItems(prev => [
      ...prev,
      {
        description: '',
        weight: 0.25,
        max_marks: Math.floor(maxMarks / 4),
        reasoning: '',
        grading_guidelines: ''
      }
    ]);
    
    if (!showRubricEditor) {
      setShowRubricEditor(true);
    }
  };

  const handleUpdateRubricItem = (index, updatedItem) => {
    setRubricItems(items => {
      const newItems = [...items];
      newItems[index] = updatedItem;
      return newItems;
    });
  };

  const generateRubric = async (questionNumber, e) => {
    e?.preventDefault();
    setIsGenerating(true);
    setError('');
    setShowRubricEditor(false);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/exams/${examId}/questions/${questionNumber}/rubric/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
        }
    }
  );
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!response.ok) {
    fallbackGenerateRubric(questionNumber);
    return;
  }
  
  const data = await response.json();
  if (data.code === 200) {
    setRubricItems(data.data.rubric_items || []);
    setFeedback(data.data.problem_feedback || '');
    setShowRubricEditor(true);
  } else {
    throw new Error(data.message || 'Failed to generate rubric');
  }
} catch (err) {
  console.error("Error generating rubric:", err);
  fallbackGenerateRubric(questionNumber);
} finally {
  setIsGenerating(false);
}
};

const fallbackGenerateRubric = (questionNumber) => {
try {
  const questionData = questions.find(q => q.question_number === questionNumber);
  if (!questionData) {
    throw new Error('Question not found');
  }
  
  const maxMarks = questionData.max_marks || 10;
  
  const generatedRubricItems = [
    {
      description: "Correct setup of the problem",
      weight: 0.3,
      max_marks: Math.round(maxMarks * 0.3),
      reasoning: "Students need to demonstrate understanding of the fundamental concepts",
      grading_guidelines: "Check for proper identification of variables and initial setup"
    },
    {
      description: "Mathematical accuracy",
      weight: 0.4,
      max_marks: Math.round(maxMarks * 0.4),
      reasoning: "Computational accuracy is essential for reaching the correct solution",
      grading_guidelines: "Verify calculations and solution method"
    },
    {
      description: "Clear explanation and analysis",
      weight: 0.3,
      max_marks: Math.round(maxMarks * 0.3),
      reasoning: "Students should demonstrate ability to explain their reasoning",
      grading_guidelines: "Look for well-structured explanations and appropriate justifications"
    }
  ];
  
  setRubricItems(generatedRubricItems);
  setFeedback("This question tests the student's understanding of fundamental concepts and application of mathematical principles. Look for clear problem-solving approach and accurate implementation.");
  setShowRubricEditor(true);
} catch (err) {
  setError('Failed to generate rubric. Please create a rubric manually using the "Add Item" button.');
} finally {
  setIsGenerating(false);
}
};

const handleSave = async () => {
if (!selectedQuestion) {
  setError('No question selected');
  return;
}

setIsLoading(true);
setError('');

try {
  const response = await fetch(
    `${API_BASE_URL}/exams/${examId}/questions/${selectedQuestion}/rubric`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rubric_items: rubricItems,
        problem_feedback: feedback
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.code === 200) {
    await onSave(data.data);
    onClose();
  } else {
    throw new Error(data.message || 'Failed to save rubric');
  }
} catch (err) {
  console.error("Error saving rubric:", err);
  setError('Failed to save rubric: ' + (err.message || 'Unknown error'));
} finally {
  setIsLoading(false);
}
};

const selectedQuestionData = selectedQuestion ? 
questions.find(q => q.question_number === selectedQuestion) : null;

if (!isOpen) return null;

if (!questions || questions.length === 0) {
return (
  <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-50" onClick={onClose}>
    <div className="h-screen p-4 md:p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Generate Rubrics</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
          <p className="text-gray-500 mb-6">
            Please upload a question paper first before generating rubrics.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

return (
<div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-50">
  <div className="h-screen p-4 md:p-6 flex items-center justify-center">
    <div className="w-full max-w-[1400px] h-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Question Rubric Generator</h2>
          <p className="text-sm text-gray-500 mt-1">Create and customize grading criteria</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 xl:w-96 border-r bg-white flex flex-col">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Questions</h3>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                {questions.length} Questions
              </span>
            </div>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-2 pr-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.question_number}
                    question={question}
                    isSelected={selectedQuestion === question.question_number}
                    onSelect={() => setSelectedQuestion(question.question_number)}
                    onGenerate={(e) => generateRubric(question.question_number, e)}
                    showGenerateButton={
                      selectedQuestion === question.question_number
                    }
                    isGenerating={isGenerating}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {selectedQuestionData && (
                <div className="mb-6 bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">Question Details</h3>
                  </div>
                  <p className="text-gray-700">{selectedQuestionData.question_text}</p>
                </div>
              )}

              {isGenerating ? (
                <GenerateLoader />
              ) : showRubricEditor ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">Rubric Items</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-lg">
                        {rubricItems.length} items
                      </span>
                    </div>
                    <button
                      onClick={handleAddRubricItem}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {rubricItems.map((item, index) => (
                      <RubricItem
                        key={index}
                        item={item}
                        index={index}
                        onDelete={handleDeleteRubricItem}
                        onUpdate={handleUpdateRubricItem}
                      />
                    ))}
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                        <h4 className="font-medium text-gray-900">Problem Feedback</h4>
                      </div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="Enter general feedback for this question..."
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm max-w-md w-full space-y-6">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 bg-blue-100 rounded-xl rotate-6"></div>
                      <div className="absolute inset-0 bg-blue-50 rounded-xl -rotate-3"></div>
                      <div className="relative bg-white rounded-xl p-4 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Generate Smart Rubric
                      </h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Click 'Generate' to create an AI-powered grading rubric with evaluation criteria.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-4">
                      <button
                        onClick={(e) => selectedQuestion && generateRubric(selectedQuestion, e)}
                        disabled={!selectedQuestion || isGenerating}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                          transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Rubric
                      </button>

                      <button
                        onClick={handleAddRubricItem}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                          transition-colors font-medium text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Create Manually
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showRubricEditor && (
            <div className="border-t bg-white p-4 shadow-lg">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Circle className="w-4 h-4" />
                  <span>Total Items: {rubricItems.length}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>Total Weight: {rubricItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover-bg-gray-100 rounded-lg transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading || rubricItems.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Rubric</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-animate {
  background: linear-gradient(-45deg, #4f46e5, #3b82f6, #0ea5e9, #4f46e5);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default RubricModal;