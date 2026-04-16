import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom'; 
import {
    X, Plus, Save, Sparkles, AlertCircle,
    Bot, BrainCircuit, Lightbulb, Zap,
    Trash2, Edit2, Database, Cpu,
    Circle, FileText, Settings, Minimize2, Maximize2,
    AlertTriangle, CheckCircle, Hash, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { toast } from 'react-hot-toast';

import { API_BASE_URL } from '../../../../BaseURL';

/**
 * Strip HTML tags and decode common entities to produce clean plain text.
 * Works without a DOM parser so it is safe to call at module level.
 */
function htmlToPlainText(html) {
    if (!html || typeof html !== 'string') return '';
    return html
        // Replace block-level tags with newlines so sub-parts on separate lines stay separate
        .replace(/<\/?(p|div|br|li|tr|h[1-6])[^>]*>/gi, '\n')
        // Strip all remaining tags
        .replace(/<[^>]+>/g, '')
        // Decode common HTML entities
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&[a-z]+;/gi, ' ')
        // Collapse runs of whitespace / blank lines
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Parse structured sub-parts from plain-text question content.
 *
 * Detects patterns: (a), (b), (c) — the most common academic format.
 * Returns an array of { label, text, marks } objects.
 * marks is extracted from patterns like "[2 marks]", "(2 marks)", "2 marks" near the end of the part.
 * Returns [] if no sub-parts are found.
 */
function parseQuestionSubparts(plainText) {
    if (!plainText || typeof plainText !== 'string') return [];

    // Match (a), (b) ... (z) as sub-part delimiters
    const delimiterRe = /\(([a-zA-Z])\)/g;
    const positions = [];
    let m;
    while ((m = delimiterRe.exec(plainText)) !== null) {
        positions.push({ label: m[1].toLowerCase(), index: m.index, end: m.index + m[0].length });
    }

    if (positions.length < 2) return [];

    const marksRe = /[\[(]?\s*(\d+(?:\.\d+)?)\s*marks?\s*[\])]?/i;

    const subparts = positions.map((pos, i) => {
        const start = pos.end;
        const end = i + 1 < positions.length ? positions[i + 1].index : plainText.length;
        const rawText = plainText.slice(start, end).trim();

        // Extract marks if present
        const marksMatch = rawText.match(marksRe);
        const marks = marksMatch ? parseFloat(marksMatch[1]) : null;

        // Clean text: remove the marks annotation itself
        const text = rawText.replace(marksRe, '').trim();

        return { label: `(${pos.label})`, text, marks };
    });

    return subparts;
}

/**
 * Detect the number of sub-parts in a question text.
 * Strips HTML first, then counts (a)/(b)/(c) style delimiters.
 * Returns the detected count, or 0 if no sub-parts found.
 */
function detectSubpartCount(questionText, questionBody) {
    const plain = htmlToPlainText(`${questionText || ''}\n${questionBody || ''}`);
    if (!plain) return 0;
    const subparts = parseQuestionSubparts(plain);
    return subparts.length;
}

/**
 * Redistribute rubric item marks so they sum exactly to totalMarks.
 * Scales proportionally when the AI returns wrong totals (e.g. 16.01 vs 10),
 * then assigns the remainder to the last item to absorb rounding drift.
 * Every item is guaranteed to have marks > 0.
 */
function normalizeRubricMarks(rubrics, totalMarks) {
    if (!rubrics || rubrics.length === 0) return [];
    const qm = parseFloat(totalMarks) || 0;
    if (qm <= 0) return rubrics;

    const n = rubrics.length;
    const currentTotal = rubrics.reduce((s, r) => s + (parseFloat(r.max_marks) || 0), 0);

    // If already correct within floating-point tolerance, return as-is
    if (Math.abs(currentTotal - qm) < 0.005) return rubrics;

    let normalized;
    if (currentTotal > 0) {
        // Scale proportionally
        const scale = qm / currentTotal;
        let running = 0;
        normalized = rubrics.map((item, i) => {
            let marks;
            if (i === n - 1) {
                // Last item absorbs rounding remainder
                marks = Math.round((qm - running) * 100) / 100;
            } else {
                marks = Math.round(parseFloat(item.max_marks || 0) * scale * 100) / 100;
                running += marks;
            }
            return { ...item, max_marks: Math.max(0.01, marks) };
        });
    } else {
        // All items were 0 — distribute evenly
        const base = Math.floor((qm / n) * 100) / 100;
        let remaining = qm;
        normalized = rubrics.map((item, i) => {
            const marks = i === n - 1
                ? Math.round(remaining * 100) / 100
                : base;
            remaining -= base;
            return { ...item, max_marks: Math.max(0.01, marks) };
        });
    }

    return normalized;
}

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

const EmptyState = ({ onGenerate, onManual, isGenerating, selectedQuestion, hasRubric }) => (
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
                    onClick={onGenerate}
                    disabled={!selectedQuestion || isGenerating || hasRubric}
                    className={`inline-flex items-center gap-2 px-6 py-3 ${
                        !selectedQuestion || hasRubric 
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
                    onClick={onManual}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 
                    transition-all font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Manually
                </motion.button>
            </div>
        </motion.div>
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

const RubricItemEditor = React.memo(({ item, index, onUpdate, onDelete, validationErrors = [] }) => {
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
});

const QuestionCard = React.memo(({
    question,
    isSelected,
    onSelect,
    onGenerate,
    onEditRubric,
    showGenerateButton,
    isGenerating,
    hasRubric,
    status // 'pending' | 'generating' | 'done' | 'error'
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        whileHover={{ x: 5 }}
        className={`
            w-full rounded-lg transition-all duration-300 overflow-hidden relative
            ${isSelected
                ? 'bg-accent/10 border border-accent/20 shadow-sm'
                : 'hover:bg-gray-50 border border-gray-200'
            }
            ${status === 'generating' ? 'ring-2 ring-accent ring-opacity-50' : ''}
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
                            ${status === 'generating' ? 'animate-pulse' : ''}
                        `}
                    >
                        {status === 'generating' ? (
                             <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" 
                             />
                        ) : status === 'done' ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                            question.question_number
                        )}
                    </motion.div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${isSelected ? 'text-accent' : 'text-gray-700'}`}>
                                Question {question.question_number}
                            </h4>
                            {status === 'generating' && (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] text-accent animate-pulse font-bold uppercase tracking-wider"
                                >
                                    Generating...
                                </motion.span>
                            )}
                            {status === 'done' && (
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                                    Ready
                                </span>
                            )}
                            {status === 'error' && (
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                    Failed to generate
                                </span>
                            )}
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
                {showGenerateButton && status !== 'generating' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (status === 'error') {
                                onGenerate(e); // Retry on error
                            } else {
                                hasRubric ? onEditRubric(question.question_number) : onGenerate(e);
                            }
                        }}
                        disabled={isGenerating}
                        className={`
                            flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                            transition-colors whitespace-nowrap shadow-sm
                            ${status === 'error'
                                ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md'
                                : isSelected
                                    ? hasRubric
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-md'
                                        : 'bg-accent text-white hover:shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }
                            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {status === 'error' ? (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </>
                        ) : hasRubric ? (
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
));


const clampRubricCount = (value, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, 1), 10);
};

const getQuestionRubricItems = (question) => {
    if (Array.isArray(question?.rubric?.rubric_items)) return question.rubric.rubric_items;
    if (Array.isArray(question?.rubric_items)) return question.rubric_items;
    return [];
};

const getQuestionFeedback = (question) => {
    if (typeof question?.rubric?.problem_feedback === 'string') return question.rubric.problem_feedback;
    if (typeof question?.problem_feedback === 'string') return question.problem_feedback;
    return '';
};

const normalizeQuestions = (questions) => {
    const seen = new Set();

    return (Array.isArray(questions) ? questions : [])
        .filter((question) => question && question.question_number != null)
        .filter((question) => {
            const key = String(question.question_number);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map((question) => {
            const rItems = getQuestionRubricItems(question);
            const feedback = getQuestionFeedback(question);
            if (rItems.length > 0) {
                console.log(`[RubricModal] Question ${question.question_number} normalized with ${rItems.length} rubric items`);
            }
            return {
                ...question,
                rubric_items: rItems,
                problem_feedback: feedback,
                num_rubric_items: clampRubricCount(
                    question?.num_rubric_items,
                    rItems.length || 1
                ),
                professor_instructions:
                    typeof question?.professor_instructions === 'string'
                        ? question.professor_instructions
                        : '',
            };
        })
        .sort((a, b) => Number(a.question_number) - Number(b.question_number));
};


const RubricModal = ({
    isOpen,
    onClose,
    examId,
    onSave = () => { },
    questions: inputQuestions = [],
    apiPrefix = '/exams',
    isMasterAttached = false
}) => {
    const normalizedInputQuestions = useMemo(() => normalizeQuestions(inputQuestions), [inputQuestions]);

    const [questions, setQuestions] = useState(normalizedInputQuestions);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rubricsMap, setRubricsMap] = useState({}); // { [questionNumber]: rubricItems[] }
    const [feedbackMap, setFeedbackMap] = useState({}); // { [questionNumber]: problem_feedback }
    const [generationState, setGenerationState] = useState({
        loading: false,
        mode: null,
    });
    const [showRubricEditor, setShowRubricEditor] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [generatedQuestionsCount, setGeneratedQuestionsCount] = useState(0);
    const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, index: null, itemDescription: '' });
    const [numRubricItems, setNumRubricItems] = useState(3);
    const [profInstructions, setProfInstructions] = useState('');
    const [questionRubricSettings, setQuestionRubricSettings] = useState({});
    const [showRubricSettings, setShowRubricSettings] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [generatingStatus, setGeneratingStatus] = useState({}); // { [questionNumber]: 'pending' | 'generating' | 'done' | 'error' }

    const modalContentRef = useRef(null);
    const modalRootRef = useRef(null);
    const generationLockRef = useRef(false);

    const selectedQuestion = selectedQuestionId;
    const setSelectedQuestion = setSelectedQuestionId;
    const isGenerating = generationState.loading;
    const rubricItems = selectedQuestionId != null ? (rubricsMap[selectedQuestionId] || []) : [];
    const feedback = selectedQuestionId != null ? (feedbackMap[selectedQuestionId] || '') : '';

    const setQuestionRubricItems = (questionNumber, items) => {
        const normalizedItems = Array.isArray(items) ? items : [];
        setRubricsMap((prev) => ({
            ...prev,
            [questionNumber]: normalizedItems,
        }));
    };

    const updateQuestionRubricItems = (questionNumber, updater) => {
        if (questionNumber == null) return;
        setRubricsMap((prev) => {
            const currentItems = prev[questionNumber] || [];
            const nextItems = typeof updater === 'function' ? updater(currentItems) : updater;
            return {
                ...prev,
                [questionNumber]: Array.isArray(nextItems) ? nextItems : [],
            };
        });
    };

    const setQuestionFeedback = (questionNumber, nextFeedback) => {
        if (questionNumber == null) return;
        setFeedbackMap((prev) => ({
            ...prev,
            [questionNumber]: typeof nextFeedback === 'string' ? nextFeedback : '',
        }));
    };

    const replaceQuestionRubric = (questionNumber, items, nextFeedback = '') => {
        setQuestionRubricItems(questionNumber, items);
        setQuestionFeedback(questionNumber, nextFeedback);
    };

    const setQuestionSettings = (questionNumber, nextSettings) => {
        if (questionNumber == null || !nextSettings) return;
        setQuestionRubricSettings((prev) => ({
            ...(prev || {}),
            [questionNumber]: {
                ...(prev?.[questionNumber] || {}),
                ...nextSettings,
            },
        }));
    };

    const getQuestionGenerationSettings = (questionNumber) => {
        const question = questions.find((q) => q.question_number === questionNumber);
        const storedSettings = questionRubricSettings?.[questionNumber];
        const configuredCount = questionNumber === selectedQuestionId
            ? numRubricItems
            : storedSettings?.num_rubric_items;
        const configuredInstructions = questionNumber === selectedQuestionId
            ? profInstructions
            : storedSettings?.professor_instructions;

        return {
            num_rubric_items: clampRubricCount(
                configuredCount,
                question?.num_rubric_items || (rubricsMap[questionNumber] || []).length || 1
            ),
            professor_instructions:
                typeof configuredInstructions === 'string'
                    ? configuredInstructions.trim()
                    : (question?.professor_instructions || ''),
        };
    };

    const extractGeneratedRubric = (payload, expectedCount) => {
        const rubricPayload = Array.isArray(payload?.rubric?.rubric_items) ? payload.rubric : payload;
        const generatedItems = Array.isArray(rubricPayload?.rubric_items) ? rubricPayload.rubric_items : [];
        const generatedFeedback = typeof rubricPayload?.problem_feedback === 'string'
            ? rubricPayload.problem_feedback
            : '';

        if (!generatedItems.length) {
            throw new Error('Invalid rubric');
        }
        if (typeof expectedCount === 'number' && generatedItems.length !== expectedCount) {
            throw new Error('Invalid rubric count');
        }

        return {
            items: generatedItems,
            feedback: generatedFeedback,
            rubricPayload,
        };
    };

    const requestRubricGeneration = async (question, overrideSettings = null) => {
        if (!question) return null;

        // question objects use max_marks; fall back to marks for legacy shapes
        const questionMarks = parseFloat(question.max_marks || question.marks) || 10;
        const itemCount = overrideSettings?.num_rubric_items
            ?? (numRubricItems > 0 ? numRubricItems : 3);
        const instructions = overrideSettings?.professor_instructions
            ?? profInstructions
            ?? '';

        // Strip HTML from question_body so the backend receives clean plain text.
        // Raw HTML confuses both the regex sub-part detector and the AI prompt.
        const cleanBody = htmlToPlainText(question.question_body || '');
        const cleanText = htmlToPlainText(question.question_text || '');

        // Parse structured sub-parts for the subpart-driven rubric path.
        const subparts = parseQuestionSubparts(`${cleanText}\n${cleanBody}`);
        if (subparts.length > 0) {
            console.log('[RubricModal] Parsed Subparts:', subparts);
        }

        const payload = {
            question_text: cleanText,
            question_body: cleanBody,
            marks: questionMarks > 0 ? questionMarks : 10,
            num_rubric_items: itemCount > 0 ? itemCount : 3,
            professor_instructions: instructions,
            // mode tells the backend which generation path to use:
            // "subpart" → one rubric per detected sub-part (structured)
            // "context" → AI decides structure from question content
            mode: subparts.length > 0 ? 'subpart' : 'context',
            // Send structured subparts when detected — backend uses these to
            // generate exactly one rubric per subpart with correct marks.
            ...(subparts.length > 0 && { subparts }),
        };

        console.log('[RubricModal] Rubric payload:', payload);

        try {
            const response = await fetch(
                `${API_BASE_URL}/rubrics/generate`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errText = await response.text();
                console.error('[RubricModal] Backend error:', response.status, errText);
                return null;
            }

            const apiPayload = await response.json();
            console.log('[RubricModal] Rubric response:', apiPayload);

            if (apiPayload.code !== 200 || !apiPayload.data?.rubrics) return null;

            const data = apiPayload.data;

            // Normalise field names: backend returns max_marks per item
            const rubrics = (data.rubrics || []).map(r => ({
                ...r,
                // support both max_marks (backend) and marks (legacy)
                max_marks: parseFloat(r.max_marks ?? r.marks) || 0,
            }));

            // Always normalize — corrects AI drift (e.g. 16.01 vs 10) and zero-mark items
            const normalizedRubrics = normalizeRubricMarks(rubrics, questionMarks);
            console.log(
                '[RubricModal] Rubric marks normalized:',
                normalizedRubrics.reduce((s, r) => s + r.max_marks, 0),
                '(target:', questionMarks, ')'
            );

            return { ...data, rubrics: normalizedRubrics };
        } catch (error) {
            console.error('[RubricModal] Request failed:', error);
            return null;
        }
    };

    const runGenerationWithLock = async (mode, runner) => {
        if (generationLockRef.current || generationState.loading) {
            console.warn('[RubricModal] Generation already in progress, ignoring trigger');
            return null;
        }

        generationLockRef.current = true;
        setGenerationState({
            loading: true,
            mode,
        });

        try {
            return await runner();
        } finally {
            generationLockRef.current = false;
            setGenerationState({
                loading: false,
                mode: null,
            });
        }
    };

    const handleSelectQuestion = (questionNumber) => {
        if (questionNumber === selectedQuestion) return;
        setSelectedQuestion(questionNumber);
        const questionHasRubric = (rubricsMap[questionNumber] || []).length > 0;
        const questionSettings = questionRubricSettings?.[questionNumber];
        const question = questions.find((q) => q.question_number === questionNumber);
        setNumRubricItems(clampRubricCount(
            questionSettings?.num_rubric_items,
            question?.num_rubric_items || (rubricsMap[questionNumber] || []).length || 1
        ));
        setProfInstructions(
            typeof questionSettings?.professor_instructions === 'string'
                ? questionSettings.professor_instructions
                : (question?.professor_instructions || '')
        );
        setShowRubricEditor(questionHasRubric);
        setShowRubricSettings(questionHasRubric);
    };
    
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
    
    const hasRubric = (questionNumber) => (rubricsMap[questionNumber] || []).length > 0;
    
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
    }, [questions, rubricsMap]);

    useEffect(() => {
        if (!isOpen) return;

        setQuestions(normalizedInputQuestions);
        setRubricsMap(() => {
            const next = {};
            normalizedInputQuestions.forEach((question) => {
                const items = getQuestionRubricItems(question);
                if (items.length > 0) {
                    console.log(`[RubricModal] Populating rubricsMap for question ${question.question_number}:`, items.length, "items");
                }
                next[question.question_number] = items;
            });
            return next;
        });
        setFeedbackMap(() => {
            const next = {};
            normalizedInputQuestions.forEach((question) => {
                next[question.question_number] = getQuestionFeedback(question);
            });
            return next;
        });
        setQuestionRubricSettings((prev) => {
            const next = {};
            normalizedInputQuestions.forEach((question) => {
                next[question.question_number] = {
                    num_rubric_items: clampRubricCount(
                        prev?.[question.question_number]?.num_rubric_items,
                        question.num_rubric_items || getQuestionRubricItems(question).length || 1
                    ),
                    professor_instructions:
                        typeof prev?.[question.question_number]?.professor_instructions === 'string'
                            ? prev[question.question_number].professor_instructions
                            : (question.professor_instructions || '')
                };
            });
            return next;
        });
        setSelectedQuestion((prevSelected) =>
            normalizedInputQuestions.some((question) => question.question_number === prevSelected)
                ? prevSelected
                : (normalizedInputQuestions[0]?.question_number ?? null)
        );
    }, [isOpen, normalizedInputQuestions]);
    
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
        if (!selectedQuestion || !isOpen) return;

        const questionSettings = questionRubricSettings?.[selectedQuestion];
        const question = questions.find((q) => q.question_number === selectedQuestion);

        setNumRubricItems(clampRubricCount(
            questionSettings?.num_rubric_items,
            question?.num_rubric_items || (rubricsMap[selectedQuestion] || []).length || 1
        ));
        setProfInstructions(
            typeof questionSettings?.professor_instructions === 'string'
                ? questionSettings.professor_instructions
                : (question?.professor_instructions || '')
        );
    }, [selectedQuestion, isOpen]);

    useEffect(() => {
        if (!selectedQuestion || !isOpen) return;

        const rubricData = rubricsMap[selectedQuestion] || [];
        const hasRubricItems = rubricData.length > 0;
        setShowRubricEditor(hasRubricItems);
        setShowRubricSettings(hasRubricItems);
    }, [selectedQuestion, isOpen, rubricsMap]);

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
            updateQuestionRubricItems(selectedQuestion, (items) => {
                const nextItems = items.filter((_, i) => i !== deleteConfirmation.index);
                setNumRubricItems(nextItems.length || 1);
                setQuestionSettings(selectedQuestion, {
                    num_rubric_items: nextItems.length || 1,
                });
                return nextItems;
            });
            toast.success('Rubric item deleted successfully');
        }
        setDeleteConfirmation({ show: false, index: null, itemDescription: '' });
    };

    const cancelDeleteRubricItem = () => {
        setDeleteConfirmation({ show: false, index: null, itemDescription: '' });
    };

    const buildRubricItemShell = (marks = 1) => ({
        description: '',
        max_marks: marks,
        reasoning: '',
        grading_guidelines: '',
        score_options: [marks, 0]
    });

    const handleAddRubricItem = () => {
        const currentQuestion = questions.find(q => q.question_number === selectedQuestion);
        const maxMarks = Math.abs(currentQuestion?.max_marks || 10);
        const targetCount = Math.max(rubricItems.length + 1, 1);
        const remainingItems = targetCount - rubricItems.length;
        const currentTotalMarks = rubricItems.reduce((sum, item) => sum + (parseFloat(item.max_marks) || 0), 0);
        
        const suggestedMarks = remainingItems > 0 ? parseFloat(((maxMarks - currentTotalMarks) / remainingItems).toFixed(2)) : parseFloat((maxMarks / targetCount).toFixed(2));

        updateQuestionRubricItems(selectedQuestion, (prev) => [
            ...prev,
            buildRubricItemShell(Math.max(0.01, suggestedMarks || parseFloat((maxMarks / targetCount).toFixed(2))))
        ]);
        setNumRubricItems(targetCount);
        setQuestionSettings(selectedQuestion, {
            num_rubric_items: targetCount,
        });

        if (!showRubricEditor) {
            setShowRubricEditor(true);
            setShowRubricSettings(true);
        }
    };

    const handleUpdateRubricItem = (index, updatedItem) => {
        updateQuestionRubricItems(selectedQuestion, (items) => {
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

    const normalizeRubricItemsForSave = (questionNumber = selectedQuestion) => {
        const selectedQuestionData = questions.find(q => q.question_number === questionNumber);
        const questionMaxMarks = Math.abs(selectedQuestionData?.max_marks || 10);
        const items = questionNumber != null ? (rubricsMap[questionNumber] || []) : [];

        // First clean fields, then normalize marks to match question total
        const cleaned = items.map((item) => {
            const c = { ...item };
            delete c['wei' + 'ght'];
            c.max_marks = Math.abs(parseFloat(c.max_marks) || 0);
            return c;
        });

        const redistributed = normalizeRubricMarks(cleaned, questionMaxMarks);

        return redistributed.map((item) => ({
            ...item,
            score_options: buildScoreOptions(questionMaxMarks, item.max_marks),
        }));
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
        if (hasRubric(questionNumber)) {
            handleSelectQuestion(questionNumber);
            setShowRubricEditor(true);
            setShowRubricSettings(true);
        }
    };

    const handleGenerateAll = async () => {
        if (generationState.loading) return;
        
        setGenerationState({ loading: true, mode: 'bulk' });
        setError('');

        const loadingToast = toast.loading('Generating all rubrics...');
        const updatedRubrics = { ...rubricsMap };
        const initialStatus = { ...generatingStatus };
        
        questions.forEach(q => {
            initialStatus[q.question_number] = 'pending';
        });
        setGeneratingStatus(initialStatus);

        try {
            for (const q of questions) {
                const qNum = q.question_number;
                setGeneratingStatus(prev => ({ ...prev, [qNum]: 'generating' }));

                // Use per-question stored settings for bulk generation
                const qSettings = questionRubricSettings?.[qNum];
                const res = await requestRubricGeneration(q, qSettings ?? null);
                if (res && res.rubrics && res.rubrics.every(r => r.max_marks > 0)) {
                    updatedRubrics[qNum] = res.rubrics.map(r => ({
                        description: r.description,
                        max_marks: r.max_marks,
                        reasoning: r.reasoning,
                        grading_guidelines: r.grading_guidelines ?? r.guidelines ?? '',
                    }));
                    // Persist the actual count per question so settings stay in sync
                    setQuestionSettings(qNum, { num_rubric_items: res.rubrics.length });
                    setGeneratingStatus(prev => ({ ...prev, [qNum]: 'done' }));
                } else {
                    setGeneratingStatus(prev => ({ ...prev, [qNum]: 'error' }));
                }
            }

            setRubricsMap(updatedRubrics);
            
            const firstId = questions[0]?.question_number;
            if (firstId) {
                setSelectedQuestion(firstId);
                setShowRubricEditor(true);
                // Sync count input to the first question's actual rubric count
                const firstCount = updatedRubrics[firstId]?.length;
                if (firstCount > 0) setNumRubricItems(firstCount);
            }
            
            toast.success('All rubrics generated successfully!', { id: loadingToast });
        } catch (err) {
            console.error('[RubricModal] Bulk generation failed:', err);
            toast.error('Bulk generation failed', { id: loadingToast });
        } finally {
            setGenerationState({ loading: false, mode: null });
        }
    };

    const generateRubric = async (questionNumber, e) => {
        e?.preventDefault();
        if (generationState.loading) return;

        setGenerationState({ loading: true, mode: 'single' });
        setGeneratingStatus(prev => ({ ...prev, [questionNumber]: 'generating' }));
        
        const loadingToast = toast.loading('Generating rubric...');
        const question = questions.find(q => q.question_number === questionNumber);

        try {
            const res = await requestRubricGeneration(question);
            if (res && res.rubrics) {
                const items = res.rubrics.map(r => ({
                    description: r.description,
                    max_marks: r.max_marks,
                    reasoning: r.reasoning,
                    grading_guidelines: r.grading_guidelines ?? r.guidelines ?? '',
                }));

                setRubricsMap(prev => ({
                    ...prev,
                    [questionNumber]: items
                }));

                // Sync the count input to the actual number of rubrics returned
                setNumRubricItems(items.length);
                setQuestionSettings(questionNumber, { num_rubric_items: items.length });

                setSelectedQuestion(questionNumber);
                setShowRubricEditor(true);
                setGeneratingStatus(prev => ({ ...prev, [questionNumber]: 'done' }));
                toast.success('Rubric generated!', { id: loadingToast });
            } else {
                throw new Error('Failed to generate rubric');
            }
        } catch (err) {
            setGeneratingStatus(prev => ({ ...prev, [questionNumber]: 'error' }));
            toast.error(err.message, { id: loadingToast });
        } finally {
            setGenerationState({ loading: false, mode: null });
        }
    };

    const handleUpdateRubricSettings = async (regenerate = false) => {
        if (!selectedQuestion) {
            toast.error('No question selected');
            return;
        }

        setIsRegenerating(true);

        try {
            if (regenerate) {
                const loadingToast = toast.loading('Generating rubric...');
                try {
                    // selectedQuestion is a question number — look up the full object
                    const questionObj = questions.find(q => q.question_number === selectedQuestion);
                    if (!questionObj) {
                        toast.error('Question not found', { id: loadingToast });
                        return;
                    }

                    const result = await runGenerationWithLock('single', () =>
                        requestRubricGeneration(questionObj, getQuestionGenerationSettings(selectedQuestion))
                    );

                    if (!result) {
                        toast.dismiss(loadingToast);
                        return;
                    }

                    replaceQuestionRubric(selectedQuestion, result.items, result.feedback);
                    // Sync count to actual rubrics returned
                    if (result.items?.length > 0) {
                        setNumRubricItems(result.items.length);
                        setQuestionSettings(selectedQuestion, { num_rubric_items: result.items.length });
                    }
                    setShowRubricEditor(true);
                    setShowRubricSettings(true);
                    toast.success('Rubric generated successfully!', { id: loadingToast });
                } catch (err) {
                    console.error('Error regenerating rubric:', err);
                    toast.error('Failed to generate rubric: ' + (err.message || 'Unknown error'), { id: loadingToast });
                }
                return;
            }

            const loadingToast = toast.loading('Updating rubric settings...');
            try {
                console.log('[RubricModal] Updating rubric settings for question:', selectedQuestion);
                console.log('[RubricModal] Update payload:', {
                    num_rubric_items: numRubricItems,
                    professor_instructions: (profInstructions || '').trim(),
                    regenerate_rubric: false
                });

                const response = await fetch(
                    `${API_BASE_URL}${apiPrefix}/${examId}/questions/${selectedQuestion}/rubric-settings`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            num_rubric_items: numRubricItems,
                            // IMPORTANT: send empty string to CLEAR instructions server-side.
                            // Sending undefined would skip updating and the old value would persist.
                            professor_instructions: (profInstructions || '').trim(),
                            regenerate_rubric: false
                        })
                    }
                );

                console.log('[RubricModal] Update response status:', response.status);

                if (!response.ok) {
                    console.error('[RubricModal] Update failed:', response.status, response.statusText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('[RubricModal] Update response body:', data);

                if (data.code !== 200) {
                    console.error('[RubricModal] Update API error:', data.message);
                    throw new Error(data.message || 'Failed to update settings');
                }

                setQuestionSettings(selectedQuestion, {
                    num_rubric_items: data?.data?.num_rubric_items ?? numRubricItems,
                    professor_instructions:
                        typeof data?.data?.professor_instructions === 'string'
                            ? data.data.professor_instructions
                            : (profInstructions || '').trim(),
                });
                if (typeof data?.data?.professor_instructions === 'string') {
                    setProfInstructions(data.data.professor_instructions);
                }
                if (typeof data?.data?.num_rubric_items === 'number') {
                    setNumRubricItems(data.data.num_rubric_items);
                }
                toast.success('Settings updated successfully!', { id: loadingToast });
            } catch (err) {
                console.error('Error updating rubric settings:', err);
                toast.error('Failed to update settings: ' + (err.message || 'Unknown error'), { id: loadingToast });
            }
        } catch (err) {
            console.error("Error updating rubric settings:", err);
            toast.error('Failed to update settings: ' + (err.message || 'Unknown error'));
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
                `${API_BASE_URL}${apiPrefix}/${examId}/questions/${selectedQuestion}/rubric`,
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
                const errText = await response.text();
                console.error(`[RubricModal] Save rubric failed (${response.status}):`, errText);
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            const data = await response.json();
            if (data.code === 200) {
                await onSave(data.data);
                toast.success('Question rubric saved!', { id: loadingToast });
                // We do NOT close the modal on single save anymore
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

    const handleSaveAllAndEvaluate = async () => {
        if (!validation.isValid) {
            setError('Please fix validation errors in the current question before saving all');
            toast.error('Please fix validation errors in the current question before saving all');
            return;
        }

        setIsLoading(true);
        setError('');
        const loadingToast = toast.loading('Saving all rubrics...');

        try {
            const results = [];

            for (const q of questions) {
                const itemsToSave = normalizeRubricItemsForSave(q.question_number);
                const feedbackToSave = feedbackMap[q.question_number] || '';

                const res = await fetch(
                    `${API_BASE_URL}${apiPrefix}/${examId}/questions/${q.question_number}/rubric`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            rubric_items: itemsToSave,
                            problem_feedback: feedbackToSave
                        })
                    }
                );
                if (!res.ok) {
                    const errText = await res.text();
                    console.error(`[RubricModal] Save failed for question ${q.question_number} (${res.status}):`, errText);
                    throw new Error(`Failed to save question ${q.question_number}: HTTP ${res.status}`);
                }
                const data = await res.json();
                results.push({
                    questionNumber: q.question_number,
                    data: data.data,
                });
            }
            
            // Just call onSave once to update exams tab (with current question's data, or just empty to trigger refresh)
            const currentData = results.find((result) => result.questionNumber === selectedQuestion)?.data || {};
            await onSave(currentData);
            
            toast.success('All rubrics saved successfully!', { id: loadingToast });
            onClose(); // Only close on Save All
        } catch (err) {
            console.error("Error saving all rubrics:", err);
            setError('Failed to save all rubrics. ' + (err.message || 'Unknown error'));
            toast.error('Failed to save all rubrics. ' + (err.message || 'Unknown error'), { id: loadingToast });
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
                                        onClick={handleGenerateAll}
                                        disabled={generationState.loading}
                                        className={`
                                            w-full mb-4 py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-sm font-medium
                                            ${generationState.loading 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-accent text-white shadow-sm hover:shadow-md transition-all duration-300'
                                            }
                                        `}
                                    >
                                        {generationState.loading ? (
                                            <>
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full" 
                                                />
                                                <span>
                                                    {generationState.mode === 'bulk'
                                                        ? 'Generating All...'
                                                        : 'Generating...'}
                                                </span>
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
                                                    onSelect={() => handleSelectQuestion(question.question_number)}
                                                    onGenerate={(e) => generateRubric(question.question_number, e)}
                                                    onEditRubric={handleEditRubric}
                                                    showGenerateButton={selectedQuestion === question.question_number}
                                                    isGenerating={isGenerating}
                                                    hasRubric={hasRubric(question.question_number)}
                                                    status={generatingStatus[question.question_number]}
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

                                        <div className="flex-1 flex flex-col min-h-0">
                                            <div className="flex-1 overflow-y-auto">
                                            <div className="max-w-4xl mx-auto p-6">
                                                <AnimatePresence mode="wait">
                                                    {isGenerating ? (
                                                        <motion.div
                                                            key="loader"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex items-center justify-center min-h-[400px]"
                                                        >
                                                            <GenerateLoader />
                                                        </motion.div>
                                                    ) : (showRubricEditor || rubricItems.length > 0) ? (
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
                                                                        {rubricItems.length > 0 && (
                                                                            <span className="ml-2 text-xs text-accent font-normal">
                                                                                (auto-set to {rubricItems.length})
                                                                            </span>
                                                                        )}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="10"
                                                                        value={numRubricItems}
                                                                        disabled={rubricItems.length > 0}
                                                                        onChange={(e) => {
                                                                            const clampedValue = clampRubricCount(e.target.value, 1);
                                                                            setNumRubricItems(clampedValue);
                                                                            setQuestionSettings(selectedQuestion, {
                                                                                num_rubric_items: clampedValue,
                                                                            });
                                                                        }}
                                                                        className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-200 ${
                                                                            rubricItems.length > 0
                                                                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                                : 'border-gray-300 focus:ring-2 focus:ring-accent focus:border-transparent'
                                                                        }`}
                                                                    />
                                                                    <p className="text-xs text-gray-500">
                                                                        {rubricItems.length > 0
                                                                            ? 'Count is set by the generated rubric structure.'
                                                                            : 'Choose between 1-10 rubric items. These settings are used directly when you generate the rubric.'}
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-2 md:col-span-2">
                                                                    <label className="block text-sm font-medium text-gray-700">
                                                                        Professor Instructions (Optional)
                                                                    </label>
                                                                    <textarea
                                                                        value={profInstructions}
                                                                        onChange={(e) => {
                                                                            const nextInstructions = e.target.value;
                                                                            setProfInstructions(nextInstructions);
                                                                            setQuestionSettings(selectedQuestion, {
                                                                                professor_instructions: nextInstructions,
                                                                            });
                                                                        }}
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
                                                                            Generating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Sparkles className="w-4 h-4" />
                                                                            Generate Rubric
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
                                                                    onChange={(e) => setQuestionFeedback(selectedQuestion, e.target.value)}
                                                                    rows={4}
                                                                    className="w-full px-4 py-3"
                                                                    placeholder="Enter general feedback for this question..."
                                                                />
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                </motion.div>
                                                    ) : (
                                                        <EmptyState
                                                            onGenerate={(e) => selectedQuestion && !hasRubric(selectedQuestion) && generateRubric(selectedQuestion, e)}
                                                            onManual={handleAddRubricItem}
                                                            isGenerating={isGenerating}
                                                            selectedQuestion={selectedQuestion}
                                                            hasRubric={hasRubric(selectedQuestion)}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>
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
                                                {!isMasterAttached && (
                                                <motion.button
                                                    whileHover={{ scale: validation.isValid ? 1.05 : 1 }}
                                                    whileTap={{ scale: validation.isValid ? 0.95 : 1 }}
                                                    onClick={handleSave}
                                                    disabled={isLoading || rubricItems.length === 0 || !validation.isValid}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl transition-all duration-300 font-medium shadow-sm whitespace-nowrap ${
                                                        isLoading || rubricItems.length === 0 || !validation.isValid
                                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                            : 'border-accent/40 bg-accent/5 text-accent hover:bg-accent/10'
                                                    }`}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>Save Question</span>
                                                </motion.button>
                                                )}
                                                {!isMasterAttached && (
                                                <motion.button
                                                    whileHover={{ 
                                                        scale: validation.isValid ? 1.05 : 1, 
                                                        boxShadow: validation.isValid ? "0 4px 12px rgba(var(--accent-rgb), 0.35)" : "" 
                                                    }}
                                                    whileTap={{ scale: validation.isValid ? 0.95 : 1 }}
                                                    onClick={handleSaveAllAndEvaluate}
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
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Save All & Evaluate</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                    </div>
                                </div>
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
