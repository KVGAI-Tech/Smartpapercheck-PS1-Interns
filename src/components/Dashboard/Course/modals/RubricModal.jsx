import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom'; 
import {
    X, Plus, Save, Sparkles, AlertCircle,
    Bot, BrainCircuit, Lightbulb, Zap,
    Trash2, Edit2, Database, Cpu,
    Circle, FileText, Settings, Minimize2, Maximize2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { toast } from 'react-hot-toast';

import { API_BASE_URL } from '../../../../BaseURL';
const GenerateLoader = () => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 space-y-6"
    >
        <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 p-1 animate-[spin_8s_linear_infinite]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse" />
                </div>
            </div>

            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow-lg"
                >
                    <Bot className="w-5 h-5 text-blue-600" />
                </motion.div>
            </motion.div>
            
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg shadow-lg"
                >
                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                </motion.div>
            </motion.div>
            
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg shadow-lg"
                >
                    <Cpu className="w-5 h-5 text-green-600" />
                </motion.div>
            </motion.div>
            
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg shadow-lg"
                >
                    <Database className="w-5 h-5 text-yellow-600" />
                </motion.div>
            </motion.div>
        </div>

        <div className="text-center space-y-2">
            <motion.h3 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
            >
                Generating Smart Rubrics
            </motion.h3>
            <p className="text-sm text-gray-500">
                Analyzing question patterns and generating evaluation criteria...
            </p>
        </div>

        <div className="w-full max-w-md space-y-3">
            {['Processing', 'Analyzing', 'Finalizing'].map((label, index) => (
                <motion.div 
                    key={label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-3 text-sm"
                >
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                        <Zap className="w-4 h-4 text-blue-500" />
                    </motion.div>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.min(100, (index + 1) * 33)}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
                            style={{
                                boxShadow: "0 0 10px rgba(66, 153, 225, 0.5)"
                            }}
                        />
                    </div>
                    <span className="text-gray-500 min-w-[60px]">{label}</span>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

const AutoGrowTextarea = ({ value, onChange, placeholder, rows, className, ...props }) => {
    const textareaRef = useRef(null);
    
    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);
    
    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm min-h-[80px] ${className || ''}`}
            style={{ resize: "none", overflowY: "hidden" }}
            {...props}
        />
    );
};

const RubricItem = ({ item, index, onDelete, onUpdate }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        exit={{ opacity: 0, y: -20 }}
        layout
    >
        <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.div 
                whileHover={{ scale: 1.01 }}
                className="relative z-10"
            >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, rotate: 180 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Circle className="w-4 h-4 text-blue-500 fill-current" />
                                    </motion.div>
                                    <h4 className="font-medium text-gray-900">Rubric Item {index + 1}</h4>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDelete(index)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
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
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
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
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
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
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Lightbulb className="w-4 h-4 text-gray-400" />
                                    Reasoning
                                </label>
                                <AutoGrowTextarea
                                    value={item.reasoning || ''}
                                    onChange={(e) => onUpdate(index, { ...item, reasoning: e.target.value })}
                                    placeholder="Explain the reasoning behind this criteria..."
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                    Grading Guidelines
                                </label>
                                <AutoGrowTextarea
                                    value={item.grading_guidelines || ''}
                                    onChange={(e) => onUpdate(index, { ...item, grading_guidelines: e.target.value })}
                                    placeholder="Provide specific guidelines for grading..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </motion.div>
        </Card>
    </motion.div>
);

const QuestionCard = ({
    question,
    isSelected,
    onSelect,
    onGenerate,
    onEditRubric,
    showGenerateButton,
    isGenerating,
    hasRubric
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        whileHover={{ x: 5 }}
        className={`
            w-full rounded-lg transition-all duration-300 overflow-hidden
            ${isSelected
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
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
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${isSelected 
                                ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }
                        `}
                    >
                        {question.question_number}
                    </motion.div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                Question {question.question_number}
                            </h4>
                        </div>
                        {question.domain && (
                            <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded text-xs text-gray-600"
                            >
                                {question.domain}
                            </motion.span>
                        )}
                    </div>
                </div>
                {showGenerateButton && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hasRubric ? onEditRubric(question.question_number) : onGenerate(e);
                        }}
                        disabled={isGenerating}
                        className={`
                            flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                            transition-colors whitespace-nowrap shadow-sm
                            ${isSelected
                                ? hasRubric
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-md'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md'
                                : 'text-gray-500 hover:bg-gray-100'
                            }
                            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {hasRubric ? (
                            <>
                                <Edit2 className="w-4 h-4" />
                                Edit Rubric
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            {isSelected && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-11"
                >
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {question.question_text}
                    </p>
                </motion.div>
            )}
        </div>
    </motion.div>
);

const RubricModal = ({
    isOpen,
    onClose,
    examId,
    onSave = () => { },
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
    const [isMaximized, setIsMaximized] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [generatedQuestionsCount, setGeneratedQuestionsCount] = useState(0);
    const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
    const previousHeight = useRef(null);
    const modalContentRef = useRef(null);
    const modalRootRef = useRef(null);
    
    
    const hasRubric = (questionNumber) => {
        const question = questions.find(q => q.question_number === questionNumber);
        return question &&
            ((question.rubric && question.rubric.rubric_items && question.rubric.rubric_items.length > 0) ||
                (question.rubric_items && question.rubric_items.length > 0));
    };
    
    const modalSpring = useSpring({
        transform: isMaximized 
            ? 'scale(1)' 
            : isAnimating 
                ? 'scale(0.97)' 
                : 'scale(1)',
        opacity: isAnimating ? 0.9 : 1,
        config: { tension: 300, friction: 20 }
    });
    
    const headerSpring = useSpring({
        background: isMaximized 
            ? 'linear-gradient(to right, #f8fafc, #eff6ff)' 
            : 'linear-gradient(to right, #ffffff, #ffffff)',
        config: { duration: 300 }
    });

    
    const anyQuestionsNeedRubrics = useMemo(() => {
        return questions.some(question => !hasRubric(question.question_number));
    }, [questions]);
    
    useEffect(() => {
        if (isOpen) {
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
                backgroundColor: 'rgba(17, 24, 39, 0.4)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)', 
                zIndex: '99999', 
                overflow: 'hidden'
            });
            
            document.body.appendChild(modalRoot);
            modalRootRef.current = modalRoot;
            
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
        if (isOpen && questions.length > 0 && !selectedQuestion) {
            setSelectedQuestion(questions[0].question_number);
        }
    }, [isOpen, questions, selectedQuestion]);

    useEffect(() => {
        if (selectedQuestion) {
            const currentQuestion = questions.find(q => q.question_number === selectedQuestion);
            if (currentQuestion) {
                if (currentQuestion.rubric && currentQuestion.rubric.rubric_items) {
                    setRubricItems(currentQuestion.rubric.rubric_items || []);
                    setFeedback(currentQuestion.rubric.problem_feedback || '');
                } else {
                    setRubricItems(currentQuestion.rubric_items || []);
                    setFeedback(currentQuestion.problem_feedback || '');
                }

                const hasRubricItems =
                    (currentQuestion.rubric && currentQuestion.rubric.rubric_items &&
                        currentQuestion.rubric.rubric_items.length > 0) ||
                    (currentQuestion.rubric_items && currentQuestion.rubric_items.length > 0);

                setShowRubricEditor(hasRubricItems);
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

    const toggleMaximize = () => {
        if (!isAnimating) {
            setIsAnimating(true);

            setTimeout(() => {
                setIsMaximized(!isMaximized);
                setIsAnimating(false);
            }, 300);
        }
    };

    
    const handleEditRubric = (questionNumber) => {
        const questionData = questions.find(q => q.question_number === questionNumber);
        if (questionData) {
            setSelectedQuestion(questionNumber);
            
            
            if (questionData.rubric && questionData.rubric.rubric_items) {
                setRubricItems(questionData.rubric.rubric_items || []);
                setFeedback(questionData.rubric.problem_feedback || '');
            } else {
                setRubricItems(questionData.rubric_items || []);
                setFeedback(questionData.problem_feedback || '');
            }
            
            setShowRubricEditor(true);
        }
    };

    
    const generateAllRubrics = async () => {
        if (isGenerating) return;
        
        
        const questionsWithoutRubrics = questions.filter(question => !hasRubric(question.question_number));
        
        
        if (questionsWithoutRubrics.length === 0) {
            toast.success('All questions already have rubrics!');
            return;
        }
        
        setIsGenerating(true);
        setError('');
        setShowRubricEditor(false);
        
        const loadingToast = toast.loading('Generating rubrics for all questions...');
        setTotalQuestionsCount(questionsWithoutRubrics.length);
        setGeneratedQuestionsCount(0);
        
        try {
            
            const promises = questionsWithoutRubrics.map((question, index) => 
                fetch(
                    `${API_BASE_URL}/exams/${examId}/questions/${question.question_number}/rubric`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )
                .then(async response => {
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    setGeneratedQuestionsCount(prev => prev + 1);
                    
                    if (!response.ok) {
                        return { 
                            questionNumber: question.question_number, 
                            success: false,
                            data: null
                        };
                    }
                    
                    return response.json().then(data => {
                        if (data.code === 200) {
                            return {
                                questionNumber: question.question_number,
                                success: true,
                                data: data.data
                            };
                        } else {
                            return {
                                questionNumber: question.question_number,
                                success: false,
                                data: null
                            };
                        }
                    });
                })
                .catch(err => {
                    console.error(`Error generating rubric for question ${question.question_number}:`, err);
                    setGeneratedQuestionsCount(prev => prev + 1);
                    return {
                        questionNumber: question.question_number,
                        success: false,
                        data: null
                    };
                })
            );
            
            
            const results = await Promise.all(promises);
            
            
            let successCount = 0;
            let failCount = 0;
            
            
            const updatedQuestions = [...questions];
            
            for (const result of results) {
                if (result.success) {
                    successCount++;
                    
                    
                    const questionIndex = updatedQuestions.findIndex(q => q.question_number === result.questionNumber);
                    if (questionIndex !== -1) {
                        updatedQuestions[questionIndex].rubric = result.data;
                        updatedQuestions[questionIndex].rubric_items = result.data.rubric_items;
                        updatedQuestions[questionIndex].problem_feedback = result.data.problem_feedback;
                    }
                } else {
                    failCount++;
                    
                    
                    const fallbackRubric = createFallbackRubric(result.questionNumber);
                    
                    
                    const questionIndex = updatedQuestions.findIndex(q => q.question_number === result.questionNumber);
                    if (questionIndex !== -1 && fallbackRubric) {
                        updatedQuestions[questionIndex].rubric_items = fallbackRubric.rubricItems;
                        updatedQuestions[questionIndex].problem_feedback = fallbackRubric.feedback;
                    }
                }
            }
            
            
            if (successCount > 0) {
                toast.success(`Successfully generated ${successCount} rubrics!`, { id: loadingToast });
            }
            
            if (failCount > 0) {
                toast.error(`Failed to generate ${failCount} rubrics. Using fallback generator.`);
            }
            
            
            if (questionsWithoutRubrics.length > 0) {
                const firstQuestion = questionsWithoutRubrics[0].question_number;
                setSelectedQuestion(firstQuestion);
                
                
                const selectedQuestionData = updatedQuestions.find(q => q.question_number === firstQuestion);
                if (selectedQuestionData) {
                    setRubricItems(selectedQuestionData.rubric_items || []);
                    setFeedback(selectedQuestionData.problem_feedback || '');
                    setShowRubricEditor(true);
                }
            }
            
        } catch (err) {
            console.error("Error generating all rubrics:", err);
            toast.error('Failed to generate rubrics. Please try again.', { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    const generateRubric = async (questionNumber, e) => {
        e?.preventDefault();
        setIsGenerating(true);
        setError('');
        setShowRubricEditor(false);
        
        const loadingToast = toast.loading('Generating smart rubric...');

        try {
            const response = await fetch(
                `${API_BASE_URL}/exams/${examId}/questions/${questionNumber}/rubric`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await new Promise(resolve => setTimeout(resolve, 3000));

            if (!response.ok) {
                toast.error('Using fallback rubric generator', { id: loadingToast });
                fallbackGenerateRubric(questionNumber);
                return;
            }

            const data = await response.json();
            if (data.code === 200) {
                setRubricItems(data.data.rubric_items || []);
                setFeedback(data.data.problem_feedback || '');
                setShowRubricEditor(true);
                toast.success('Rubric generated successfully!', { id: loadingToast });
            } else {
                throw new Error(data.message || 'Failed to generate rubric');
            }
        } catch (err) {
            console.error("Error generating rubric:", err);
            toast.error('Using fallback rubric generator', { id: loadingToast });
            fallbackGenerateRubric(questionNumber);
        } finally {
            setIsGenerating(false);
        }
    };

    
    const createFallbackRubric = (questionNumber) => {
        const questionData = questions.find(q => q.question_number === questionNumber);
        if (!questionData) {
            return null;
        }

        const maxMarks = questionData.max_marks || 10;
        
        const rubricItems = [
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

        const feedback = "This question tests the student's understanding of fundamental concepts and application of mathematical principles. Look for clear problem-solving approach and accurate implementation.";
        
        return { rubricItems, feedback };
    };

    const fallbackGenerateRubric = (questionNumber) => {
        try {
            const fallbackRubric = createFallbackRubric(questionNumber);
            
            if (!fallbackRubric) {
                toast.error('Question not found');
                throw new Error('Question not found');
            }
            
            toast.success('Creating default rubric items');

            setRubricItems(fallbackRubric.rubricItems);
            setFeedback(fallbackRubric.feedback);
            setShowRubricEditor(true);
        } catch (err) {
            setError('Failed to generate rubric. Please create a rubric manually using the "Add Item" button.');
            toast.error('Failed to generate rubric. Please create a rubric manually.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!selectedQuestion) {
            setError('No question selected');
            toast.error('No question selected');
            return;
        }

        setIsLoading(true);
        setError('');
        
        const loadingToast = toast.loading('Saving rubric...');

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
                toast.success('Rubric saved successfully!', { id: loadingToast });
                onClose();
            } else {
                throw new Error(data.message || 'Failed to save rubric');
            }
        } catch (err) {
            console.error("Error saving rubric:", err);
            setError('Failed to save rubric: ' + (err.message || 'Unknown error'));
            toast.error('Failed to save rubric: ' + (err.message || 'Unknown error'), { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedQuestionData = selectedQuestion ?
        questions.find(q => q.question_number === selectedQuestion) : null;

    if (!isOpen) return null;

    if (!questions || questions.length === 0) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Generate Rubrics</h3>
                        <motion.button 
                            whileHover={{ rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </motion.button>
                    </div>

                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-8"
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20, 
                                delay: 0.3 
                            }}
                            className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
                        >
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </motion.div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                        <p className="text-gray-500 mb-6">
                            Please upload a question paper first before generating rubrics.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                            Close
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>,
            modalRootRef.current || document.body
        );
    }

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                >
                    <animated.div
                        style={modalSpring}
                        className={`
                            bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden
                            ${isMaximized
                                ? 'fixed inset-0 w-full h-full max-w-none max-h-none rounded-none'
                                : 'w-full max-w-[1400px] h-[90vh] max-h-[900px]'}
                        `}
                    >
                        <animated.div 
                            style={headerSpring}
                            className="flex items-center justify-between px-6 py-4 border-b"
                        >
                            <div className="flex-1 overflow-hidden">
                                <motion.h2 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 truncate"
                                >
                                    Question Rubric Generator
                                </motion.h2>
                                <motion.p 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-sm text-gray-500 mt-1 truncate"
                                >
                                    Create and customize grading criteria
                                </motion.p>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMaximize();
                                    }}
                                    className="p-2 rounded-lg transition-colors"
                                    aria-label={isMaximized ? "Restore" : "Maximize"}
                                >
                                    {isMaximized ?
                                        <Minimize2 className="w-5 h-5 text-gray-500" /> :
                                        <Maximize2 className="w-5 h-5 text-gray-500" />
                                    }
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "#f3f4f6" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                    }}
                                    className="p-2 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </motion.button>
                            </div>
                        </animated.div>

                        <div className="flex-1 flex overflow-hidden" ref={modalContentRef}>
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="w-80 xl:w-96 border-r bg-white flex flex-col overflow-hidden"
                            >
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-900">Questions</h3>
                                        <motion.span 
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded text-xs text-blue-600 font-medium"
                                        >
                                            {questions.length} Questions
                                        </motion.span>
                                    </div>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={generateAllRubrics}
                                        disabled={isGenerating || !anyQuestionsNeedRubrics}
                                        className={`
                                            w-full mb-4 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-sm font-medium
                                            ${(isGenerating || !anyQuestionsNeedRubrics) 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all duration-300'
                                            }
                                        `}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full" 
                                                />
                                                <span>Generating All ({generatedQuestionsCount}/{totalQuestionsCount})</span>
                                            </>
                                        ) : !anyQuestionsNeedRubrics ? (
                                            <>
                                                <Circle className="w-4 h-4" />
                                                <span>All Rubrics Generated</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                <span>Generate All Rubrics</span>
                                            </>
                                        )}
                                    </motion.button>
                                    
                                    <ScrollArea className="flex-1 pr-4">
                                        <motion.div 
                                            variants={{
                                                hidden: { opacity: 0 },
                                                show: {
                                                    opacity: 1,
                                                    transition: {
                                                        staggerChildren: 0.07
                                                    }
                                                }
                                            }}
                                            initial="hidden"
                                            animate="show"
                                            className="space-y-2"
                                        >
                                            {questions.map((question) => (
                                                <QuestionCard
                                                    key={question.question_number}
                                                    question={question}
                                                    isSelected={selectedQuestion === question.question_number}
                                                    onSelect={() => setSelectedQuestion(question.question_number)}
                                                    onGenerate={(e) => generateRubric(question.question_number, e)}
                                                    onEditRubric={handleEditRubric}
                                                    showGenerateButton={selectedQuestion === question.question_number}
                                                    isGenerating={isGenerating}
                                                    hasRubric={hasRubric(question.question_number)}
                                                />
                                            ))}
                                        </motion.div>
                                    </ScrollArea>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 bg-gradient-to-br from-gray-50 to-white flex flex-col overflow-hidden"
                            >
                                <div className="flex-1 overflow-y-auto">
                                    <div className="max-w-4xl mx-auto p-6">
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm"
                                                >
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                    <p>{error}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {selectedQuestionData && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    className="mb-6 bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FileText className="w-5 h-5 text-blue-500" />
                                                        <h3 className="font-medium text-gray-900">Question Details</h3>
                                                    </div>
                                                    <p className="text-gray-700">{selectedQuestionData.question_text}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence mode="wait">
                                            {isGenerating ? (
                                                <GenerateLoader key="loader" />
                                            ) : showRubricEditor ? (
                                                <motion.div 
                                                    key="editor"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-medium text-gray-900">Rubric Items</h3>
                                                            <motion.span 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-lg font-medium"
                                                            >
                                                                {rubricItems.length} items
                                                            </motion.span>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleAddRubricItem}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Add Item
                                                        </motion.button>
                                                    </div>

                                                    <AnimatePresence>
                                                        <motion.div className="space-y-4">
                                                            {rubricItems.map((item, index) => (
                                                                <RubricItem
                                                                    key={index}
                                                                    item={item}
                                                                    index={index}
                                                                    onDelete={handleDeleteRubricItem}
                                                                    onUpdate={handleUpdateRubricItem}
                                                                />
                                                            ))}
                                                        </motion.div>
                                                    </AnimatePresence>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                                                    >
                                                        <Card className="overflow-hidden border-t-4 border-t-blue-500">
                                                            <CardContent className="p-6 space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Edit2 className="w-4 h-4 text-blue-500" />
                                                                    <h4 className="font-medium text-gray-900">Problem Feedback</h4>
                                                                </div>
                                                                <AutoGrowTextarea
                                                                    value={feedback}
                                                                    onChange={(e) => setFeedback(e.target.value)}
                                                                    rows={4}
                                                                    className="w-full px-4 py-3"
                                                                    placeholder="Enter general feedback for this question..."
                                                                />
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="empty"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="h-full flex flex-col items-center justify-center py-12 text-center"
                                                >
                                                    <motion.div 
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2, type: "spring" }}
                                                        className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm max-w-md w-full space-y-6"
                                                    >
                                                        <motion.div 
                                                            animate={{ 
                                                                rotate: [0, 5, -5, 0],
                                                            }}
                                                            transition={{
                                                                duration: 4,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }}
                                                            className="relative w-16 h-16 mx-auto"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl rotate-6 opacity-40"></div>
                                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl -rotate-3 opacity-60"></div>
                                                            <div className="relative bg-white rounded-xl p-4 flex items-center justify-center">
                                                                <Sparkles className="w-8 h-8 text-indigo-500" />
                                                            </div>
                                                        </motion.div>

                                                        <div>
                                                            <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                                                                Generate Smart Rubric
                                                            </h3>
                                                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                                                Click 'Generate' to create an AI-powered grading rubric with evaluation criteria.
                                                            </p>
                                                        </div>

                                                        <div className="pt-4 flex items-center justify-center gap-4">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => selectedQuestion && !hasRubric(selectedQuestion) && generateRubric(selectedQuestion, e)}
                                                                disabled={!selectedQuestion || isGenerating || hasRubric(selectedQuestion)}
                                                                className={`inline-flex items-center gap-2 px-6 py-3 ${
                                                                    !selectedQuestion || hasRubric(selectedQuestion) 
                                                                    ? 'bg-gray-100 text-gray-500' 
                                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg'
                                                                } rounded-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                <Sparkles className="w-4 h-4" />
                                                                Generate Rubric
                                                            </motion.button>

                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={handleAddRubricItem}
                                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 
                                                                transition-all font-medium text-sm"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Create Manually
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {showRubricEditor && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border-t bg-gradient-to-r from-gray-50 to-white p-4 shadow-lg"
                                    >
                                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <motion.div
                                                    animate={{ 
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <Circle className="w-4 h-4 text-blue-500" />
                                                </motion.div>
                                                <span>Total Items: {rubricItems.length}</span>
                                                <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                                                <span>Total Weight: {rubricItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0).toFixed(2)}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={onClose}
                                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.5)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSave}
                                                    disabled={isLoading || rubricItems.length === 0}
                                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg
                                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-md"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <motion.div 
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" 
                                                            />
                                                            <span>Saving Changes...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            <span>Save Rubric</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </animated.div>
                </motion.div>
            )}
        </AnimatePresence>,
        modalRootRef.current || document.body
    );
};

const injectStyles = () => {
    const styleSheet = document.getElementById('rubric-modal-styles');

    if (!styleSheet) {
        const style = document.createElement('style');
        style.id = 'rubric-modal-styles';
        style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }

      .animate-fadeOut {
        animation: fadeOut 0.3s ease-in forwards;
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-glow {
        animation: glow 2s ease-in-out infinite;
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
      
      .text-gradient {
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        background-image: linear-gradient(to right, #3b82f6, #4f46e5);
      }
      
      
      .glass {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }
      
      
      .shadow-transition {
        transition: box-shadow 0.3s ease;
      }
      
      .shadow-transition:hover {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      
      .card-hover {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
      }
      
      
      .button-glow {
        position: relative;
        overflow: hidden;
      }
      
      .button-glow::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
        transform: rotate(30deg);
        transition: transform 0.6s;
      }
      
      .button-glow:hover::after {
        transform: rotate(30deg) translate(100%, 100%);
      }
    `;
        document.head.appendChild(style);
    }
};

injectStyles();

export default RubricModal;