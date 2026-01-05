import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom'; 
import {
    X, Plus, Save, Sparkles, AlertCircle,
    Bot, BrainCircuit, Lightbulb, Zap,
    Trash2, Edit2, Database, Cpu,
    Circle, FileText, Settings, Minimize2, Maximize2,
    AlertTriangle, CheckCircle, Hash
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
            <div className="w-24 h-24 rounded-full bg-accent/20 p-1 animate-[spin_8s_linear_infinite]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-accent/20 animate-pulse" />
                </div>
            </div>

            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 p-2 bg-accent/10 rounded-lg shadow-lg"
                >
                    <Bot className="w-5 h-5 text-accent" />
                </motion.div>
            </motion.div>
            
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-accent/10 rounded-lg shadow-lg"
                >
                    <BrainCircuit className="w-5 h-5 text-accent" />
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
                className="text-lg font-medium text-gray-900"
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
                        <Zap className="w-4 h-4 text-accent" />
                    </motion.div>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.min(100, (index + 1) * 33)}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className="h-full bg-accent rounded-full"
                            style={{
                                boxShadow: "0 0 10px rgba(var(--accent-rgb), 0.35)"
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
            className={`w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 shadow-sm min-h-[80px] ${className || ''}`}
            style={{ resize: "none", overflowY: "hidden" }}
            {...props}
        />
    );
};

const ValidationAlert = ({ validationErrors }) => {
    if (validationErrors.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 mt-2"></span>
                                <span>{error}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemDescription, itemIndex }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
                    >
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Rubric Item</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Item {itemIndex + 1}:</span> {itemDescription || 'Untitled rubric item'}
                    </p>
                    <p className="text-xs text-gray-500">
                        Are you sure you want to delete this rubric item? This will affect your total marks calculations.
                    </p>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Item
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};

const RubricItemEditor = ({ item, index, onUpdate, onDelete, validationErrors = [] }) => {
    const hasErrors = validationErrors.length > 0;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            exit={{ opacity: 0, y: -20 }}
            layout
        >
            <Card className={`group hover:shadow-xl transition-all duration-300 border-l-4 overflow-hidden relative ${
                hasErrors ? 'border-l-red-400 bg-red-50/30' : 'border-l-accent'
            }`}>
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                                            <Circle className={`w-4 h-4 ${hasErrors ? 'text-red-500' : 'text-accent'} fill-current`} />
                                        </motion.div>
                                        <h4 className="font-medium text-gray-900">Rubric Item {index + 1}</h4>
                                        {hasErrors && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                                            >
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>Issues</span>
                                            </motion.div>
                                        )}
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

                                {hasErrors && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                                    >
                                        <div className="text-sm text-red-700">
                                            {validationErrors.map((error, errorIndex) => (
                                                <div key={errorIndex} className="flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                                    <span>{error}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

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
                                            className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 shadow-sm ${
                                                validationErrors.some(error => error.includes('description')) 
                                                    ? 'border-red-300 bg-red-50' 
                                                    : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                                Alloted Marks
                                            </label>
                                            <input
                                                type="number"
                                                value={item.max_marks || 0}
                                                onChange={(e) => onUpdate(index, { ...item, max_marks: parseFloat(e.target.value) || 0 })}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 shadow-sm ${
                                                    validationErrors.some(error => error.includes('marks')) 
                                                        ? 'border-red-300 bg-red-50' 
                                                        : 'border-gray-200'
                                                }`}
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
};

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
                ? 'bg-accent/10 border border-accent/20 shadow-sm'
                : 'hover:bg-gray-50 border border-gray-200'
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
                                ? 'bg-accent text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }
                        `}
                    >
                        {question.question_number}
                    </motion.div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${isSelected ? 'text-accent' : 'text-gray-700'}`}>
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
                                    : 'bg-accent text-white hover:shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
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
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, index: null, itemDescription: '' });
    const [numRubricItems, setNumRubricItems] = useState(3);
    const [profInstructions, setProfInstructions] = useState('');
    const [showRubricSettings, setShowRubricSettings] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const previousHeight = useRef(null);
    const modalContentRef = useRef(null);
    const modalRootRef = useRef(null);
    
    // Updated strict validation logic
    const validation = useMemo(() => {
        const errors = [];
        const itemErrors = {};
        
        if (rubricItems.length === 0) {
            return { isValid: true, errors: [], itemErrors: {} };
        }

        const totalMaxMarks = rubricItems.reduce((sum, item) => sum + (parseFloat(item.max_marks) || 0), 0);
        const selectedQuestionData = questions.find(q => q.question_number === selectedQuestion);
        const questionMaxMarks = Math.abs(selectedQuestionData?.max_marks || 10);

        // STRICT: Total max marks must exactly equal question max marks
        if (Math.abs(totalMaxMarks - questionMaxMarks) > 0.01) {
            errors.push(`Total rubric marks (${totalMaxMarks.toFixed(2)}) must exactly equal question marks (${questionMaxMarks})`);
        }

        // Validate each rubric item
        rubricItems.forEach((item, index) => {
            const itemErrorsList = [];
            
            // Check description
            if (!item.description || item.description.trim() === '') {
                itemErrorsList.push('Description is required');
            }
            
            // Check max marks
            if (!item.max_marks || item.max_marks <= 0) {
                itemErrorsList.push('Max marks must be greater than 0.00');
            }
            
            if (itemErrorsList.length > 0) {
                itemErrors[index] = itemErrorsList;
                errors.push(`Item ${index + 1}: ${itemErrorsList.join(', ')}`);
            }
        });

        const isValid = errors.length === 0;
        
        return { isValid, errors, itemErrors, totalMaxMarks };
    }, [rubricItems, selectedQuestion, questions]);
    
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
        background: 'linear-gradient(to right, #ffffff, #ffffff)',
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

                // Load rubric settings
                setNumRubricItems(currentQuestion.num_rubric_items || rubricItems.length || 3);
                setProfInstructions(currentQuestion.professor_instructions || '');

                const hasRubricItems =
                    (currentQuestion.rubric && currentQuestion.rubric.rubric_items &&
                        currentQuestion.rubric.rubric_items.length > 0) ||
                    (currentQuestion.rubric_items && currentQuestion.rubric_items.length > 0);

                setShowRubricEditor(hasRubricItems);
                setShowRubricSettings(hasRubricItems);
            }
        }
    }, [selectedQuestion, questions]);

    const handleDeleteRubricItem = (index) => {
        const item = rubricItems[index];
        setDeleteConfirmation({
            show: true,
            index: index,
            itemDescription: item?.description || 'Untitled rubric item'
        });
    };

    const confirmDeleteRubricItem = () => {
        if (deleteConfirmation.index !== null) {
            setRubricItems(items => items.filter((_, i) => i !== deleteConfirmation.index));
            toast.success('Rubric item deleted successfully');
        }
        setDeleteConfirmation({ show: false, index: null, itemDescription: '' });
    };

    const cancelDeleteRubricItem = () => {
        setDeleteConfirmation({ show: false, index: null, itemDescription: '' });
    };

    const handleAddRubricItem = () => {
        const currentQuestion = questions.find(q => q.question_number === selectedQuestion);
        const maxMarks = Math.abs(currentQuestion?.max_marks || 10);
        const remainingItems = 4 - rubricItems.length;
        const currentTotalMarks = rubricItems.reduce((sum, item) => sum + (parseFloat(item.max_marks) || 0), 0);
        
        const suggestedMarks = remainingItems > 0 ? parseFloat(((maxMarks - currentTotalMarks) / remainingItems).toFixed(2)) : parseFloat((maxMarks / 4).toFixed(2));

        setRubricItems(prev => [
            ...prev,
            {
                description: '',
                max_marks: Math.max(0.01, suggestedMarks || parseFloat((maxMarks / 4).toFixed(2))),
                score_options: [],
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

    const buildScoreOptions = (questionMaxMarks, itemMaxMarks) => {
        const qm = Math.abs(parseFloat(questionMaxMarks) || 0);
        const mm = Math.abs(parseFloat(itemMaxMarks) || 0);
        if (!mm) return [0];

        // Round to nearest 0.5 to avoid long decimals.
        const q = (v) => Math.round(v * 2) / 2;

        if (mm > 3) {
            const opts = [mm, q(mm * 0.75), q(mm * 0.5), q(mm * 0.25), 0];
            return Array.from(new Set(opts.map(v => Number(v)))).sort((a, b) => b - a);
        }

        const mmQ = q(mm);
        if (mmQ < 1) {
            return Array.from(new Set([mmQ, 0].map(v => Number(v)))).sort((a, b) => b - a);
        }

        const opts = [];
        for (let v = mmQ; v >= 1 - 1e-9; v -= 0.5) {
            opts.push(q(v));
        }
        opts.push(0);
        return Array.from(new Set(opts.map(v => Number(v)))).sort((a, b) => b - a);
    };

    const normalizeRubricItemsForSave = () => {
        const selectedQuestionData = questions.find(q => q.question_number === selectedQuestion);
        const questionMaxMarks = Math.abs(selectedQuestionData?.max_marks || 10);
        return (rubricItems || []).map((item) => {
            const cleaned = { ...item };
            delete cleaned['wei' + 'ght'];
            cleaned.max_marks = Math.abs(parseFloat(cleaned.max_marks) || 0);
            cleaned.score_options = buildScoreOptions(questionMaxMarks, cleaned.max_marks);
            return cleaned;
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

        const maxMarks = Math.abs(questionData.max_marks || 10);
        
        const n = 3;
        const step = maxMarks <= 5 ? 0.5 : (Number.isInteger(maxMarks) ? 1 : 0.5);
        const totalUnits = Math.round(maxMarks / step);
        const base = Math.floor(totalUnits / n);
        const rem = totalUnits % n;
        const units = Array.from({ length: n }).map((_, idx) => base + (idx < rem ? 1 : 0));
        const marks = units.map((u) => u * step);

        const rubricItems = [
            {
                description: "Correct setup of the problem",
                max_marks: Number(marks[0]),
                score_options: buildScoreOptions(maxMarks, marks[0]),
                reasoning: "Students need to demonstrate understanding of the fundamental concepts",
                grading_guidelines: ""
            },
            {
                description: "Mathematical accuracy",
                max_marks: Number(marks[1]),
                score_options: buildScoreOptions(maxMarks, marks[1]),
                reasoning: "Computational accuracy is essential for reaching the correct solution",
                grading_guidelines: ""
            },
            {
                description: "Clear explanation and analysis",
                max_marks: Number(marks[2]),
                score_options: buildScoreOptions(maxMarks, marks[2]),
                reasoning: "Students should demonstrate ability to explain their reasoning",
                grading_guidelines: ""
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

    const handleUpdateRubricSettings = async (regenerate = false) => {
        if (!selectedQuestion) {
            toast.error('No question selected');
            return;
        }

        setIsRegenerating(true);
        const loadingToast = toast.loading(regenerate ? 'Regenerating rubric with new settings...' : 'Updating rubric settings...');

        try {
            const response = await fetch(
                `${API_BASE_URL}/exams/${examId}/questions/${selectedQuestion}/rubric-settings`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        num_rubric_items: numRubricItems,
                        professor_instructions: profInstructions.trim() || undefined,
                        regenerate_rubric: regenerate
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === 200) {
                if (regenerate && data.data.rubric) {
                    setRubricItems(data.data.rubric.rubric_items || []);
                    setFeedback(data.data.rubric.problem_feedback || '');
                    setShowRubricEditor(true);
                }
                toast.success(regenerate ? 'Rubric regenerated successfully!' : 'Settings updated successfully!', { id: loadingToast });
            } else {
                throw new Error(data.message || 'Failed to update settings');
            }
        } catch (err) {
            console.error("Error updating rubric settings:", err);
            toast.error('Failed to update settings: ' + (err.message || 'Unknown error'), { id: loadingToast });
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleSave = async () => {
        if (!selectedQuestion) {
            setError('No question selected');
            toast.error('No question selected');
            return;
        }

        if (!validation.isValid) {
            setError('Please fix validation errors before saving');
            toast.error('Please fix validation errors before saving');
            return;
        }

        setIsLoading(true);
        setError('');
        
        const loadingToast = toast.loading('Saving rubric...');

        try {
            const normalizedItems = normalizeRubricItemsForSave();
            const response = await fetch(
                `${API_BASE_URL}/exams/${examId}/questions/${selectedQuestion}/rubric`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        rubric_items: normalizedItems,
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
        return (
            <>
                {ReactDOM.createPortal(
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
                                    className="px-4 py-2 bg-accent text-white rounded-xl hover:shadow-lg transition-all duration-300"
                                >
                                    Close
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>,
                    modalRootRef.current || document.body
                )}
                <DeleteConfirmationModal
                    isOpen={deleteConfirmation.show}
                    onClose={cancelDeleteRubricItem}
                    onConfirm={confirmDeleteRubricItem}
                    itemDescription={deleteConfirmation.itemDescription}
                    itemIndex={deleteConfirmation.index}
                />
            </>
        );
    }

    return (
        <>
            {ReactDOM.createPortal(
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
                            bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden
                            ${isMaximized
                                ? 'fixed inset-0 w-full h-full max-w-none max-h-none rounded-none'
                                : 'w-full max-w-6xl h-[92vh] max-h-[920px]'}
                        `}
                    >
                        <animated.div 
                            style={headerSpring}
                            className="flex items-center justify-between px-6 py-4 border-b border-gray-200"
                        >
                            <div className="flex-1 overflow-hidden">
                                <motion.h2 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-xl font-semibold text-gray-900 truncate"
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
                                className="w-80 xl:w-96 border-r border-gray-200 bg-white flex flex-col overflow-hidden"
                            >
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-900">Questions</h3>
                                        <motion.span 
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2 py-1 bg-accent/10 rounded-lg text-xs text-accent font-medium"
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
                                                : 'bg-accent text-white shadow-sm hover:shadow-md transition-all duration-300'
                                            }
                                        `}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full" 
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
                                className="flex-1 bg-gray-50 flex flex-col overflow-hidden"
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
                                            {!validation.isValid && validation.errors.length > 0 && showRubricEditor && (
                                                <ValidationAlert validationErrors={validation.errors} />
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
                                                    {/* Rubric Settings Section */}
                                                    {showRubricSettings && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-accent/5 border border-accent/15 rounded-2xl p-6"
                                                        >
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Settings className="w-5 h-5 text-accent" />
                                                                <h4 className="text-lg font-semibold text-gray-900">Rubric Configuration</h4>
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
                                                                        value={numRubricItems}
                                                                        onChange={(e) => {
                                                                            const value = parseInt(e.target.value) || 3;
                                                                            const clampedValue = Math.min(Math.max(value, 2), 10);
                                                                            setNumRubricItems(clampedValue);
                                                                        }}
                                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                                                                    />
                                                                    <p className="text-xs text-gray-500">Choose between 2-10 rubric items (default: 3)</p>
                                                                </div>

                                                                <div className="space-y-2 md:col-span-2">
                                                                    <label className="block text-sm font-medium text-gray-700">
                                                                        Professor Instructions (Optional)
                                                                    </label>
                                                                    <textarea
                                                                        value={profInstructions}
                                                                        onChange={(e) => setProfInstructions(e.target.value)}
                                                                        maxLength={2000}
                                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent resize-none transition-all duration-200"
                                                                        rows={3}
                                                                        placeholder="Optional: Guide AI rubric generation (e.g., 'Focus on problem-solving steps', 'Emphasize mathematical rigor')"
                                                                    />
                                                                    <p className="text-xs text-gray-500">
                                                                        {profInstructions?.length || 0}/2000 characters
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleUpdateRubricSettings(false)}
                                                                    disabled={isRegenerating}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                    Update Settings
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleUpdateRubricSettings(true)}
                                                                    disabled={isRegenerating}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:shadow-md transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isRegenerating ? (
                                                                        <>
                                                                            <motion.div 
                                                                                animate={{ rotate: 360 }}
                                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" 
                                                                            />
                                                                            Regenerating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Sparkles className="w-4 h-4" />
                                                                            Regenerate with New Settings
                                                                        </>
                                                                    )}
                                                                </motion.button>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-medium text-gray-900">Rubric Items</h3>
                                                            <motion.span 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="px-2 py-1 bg-accent/10 text-accent text-sm rounded-xl font-medium"
                                                            >
                                                                {rubricItems.length} items
                                                            </motion.span>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleAddRubricItem}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-xl hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Add Item
                                                        </motion.button>
                                                    </div>

                                                    <AnimatePresence>
                                                        <motion.div className="space-y-4">
                                                            {rubricItems.map((item, index) => (
                                                                <RubricItemEditor
                                                                    key={index}
                                                                    item={item}
                                                                    index={index}
                                                                    onDelete={handleDeleteRubricItem}
                                                                    onUpdate={handleUpdateRubricItem}
                                                                    validationErrors={validation.itemErrors[index] || []}
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
                                                        <Card className="overflow-hidden border-t-4 border-t-accent">
                                                            <CardContent className="p-6 space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Edit2 className="w-4 h-4 text-accent" />
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
                                                            <div className="absolute inset-0 bg-accent/30 rounded-xl rotate-6"></div>
                                                            <div className="absolute inset-0 bg-accent/20 rounded-xl -rotate-3"></div>
                                                            <div className="relative bg-white rounded-xl p-4 flex items-center justify-center">
                                                                <Sparkles className="w-8 h-8 text-accent" />
                                                            </div>
                                                        </motion.div>

                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
                                                                    : 'bg-accent text-white shadow-md hover:shadow-lg'
                                                                } rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                        className="border-t border-gray-200 bg-white p-4 shadow-lg"
                                    >
                                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                                                    <Circle className="w-4 h-4 text-accent" />
                                                    <div className="leading-tight">
                                                        <div className="text-xs text-gray-500">Items</div>
                                                        <div className="font-semibold text-gray-900">{rubricItems.length}</div>
                                                    </div>
                                                </div>

                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 ${
                                                    Math.abs(validation.totalMaxMarks - (selectedQuestionData?.max_marks || 10)) > 0.01 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {Math.abs(validation.totalMaxMarks - (selectedQuestionData?.max_marks || 10)) > 0.01 ? (
                                                        <AlertTriangle className="w-4 h-4" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    <div className="leading-tight">
                                                        <div className="text-xs text-gray-500">Total Marks</div>
                                                        <div className="font-semibold">
                                                            {validation.totalMaxMarks?.toFixed(2) || '0.00'}
                                                            <span className="text-xs text-gray-500 font-medium"> (Target {selectedQuestionData?.max_marks || 10})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={onClose}
                                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ 
                                                        scale: validation.isValid ? 1.05 : 1, 
                                                        boxShadow: validation.isValid ? "0 4px 12px rgba(var(--accent-rgb), 0.35)" : "" 
                                                    }}
                                                    whileTap={{ scale: validation.isValid ? 0.95 : 1 }}
                                                    onClick={handleSave}
                                                    disabled={isLoading || rubricItems.length === 0 || !validation.isValid}
                                                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-300 font-medium shadow-md whitespace-nowrap ${
                                                        isLoading || rubricItems.length === 0 || !validation.isValid
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-accent text-white hover:shadow-lg'
                                                    }`}
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
    )}
    
    <DeleteConfirmationModal
        isOpen={deleteConfirmation.show}
        onClose={cancelDeleteRubricItem}
        onConfirm={confirmDeleteRubricItem}
        itemDescription={deleteConfirmation.itemDescription}
        itemIndex={deleteConfirmation.index}
    />
        </>
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
        0%, 100% { box-shadow: 0 0 5px rgba(var(--accent-rgb), 0.35); }
        50% { box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.55); }
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
        background: linear-gradient(-45deg, rgba(var(--accent-rgb), 0.9), rgba(var(--accent-rgb), 0.6), rgba(var(--accent-rgb), 0.8), rgba(var(--accent-rgb), 0.9));
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
      }
      
      .text-gradient {
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        background-image: linear-gradient(to right, rgba(var(--accent-rgb), 0.95), rgba(var(--accent-rgb), 0.65));
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
        box-shadow: 0 10px 25px -5px rgba(var(--accent-rgb), 0.2);
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
