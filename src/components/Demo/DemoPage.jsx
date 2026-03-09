import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle, Mouse, ChevronDown, Sparkles, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DemoProvider, useDemo } from './DemoContext';
import DemoLayout from './DemoLayout';
import DemoTourOverlay from './DemoTourOverlay';

// Real app components – these render with Tailwind and match the real UI
import StudentsTab from '../Dashboard/Course/tabs/StudentsTab';
import ExamsTab from '../Dashboard/Course/tabs/ExamsTab';

import {
    DEMO_COURSE, DEMO_STUDENTS, DEMO_EXAM, DEMO_STEPS
} from './demoData';
import {
    installDemoFetch, uninstallDemoFetch,
    DEMO_ACCESS_TOKEN, DEMO_COURSE_ID, DEMO_EXAM_ID
} from './demoFetch';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
const formatDate = d =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ──────────────────────────────────────────────────────────────────────────────
// Animated pulsing hint pointer
// ──────────────────────────────────────────────────────────────────────────────
const DemoHintBubble = ({ message, icon: Icon = Mouse, position = 'bottom', animate = true }) => (
    <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? -8 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-col items-center gap-2 mt-3"
    >
        <motion.div
            animate={animate ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg"
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
        </motion.div>
    </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Step 0 — Courses list
// ──────────────────────────────────────────────────────────────────────────────
const DemoCoursesList = () => {
    const { advanceStep } = useDemo();

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-2xl">
                    <input
                        type="text"
                        placeholder="Search courses by name or code..."
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent bg-white shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Demo course card */}
                <div
                    id="demo-course-card"
                    onClick={advanceStep}
                    className="bg-white rounded-xl p-6 border-2 border-accent shadow-sm hover:shadow-lg hover:border-accent transition-all duration-300 flex flex-col h-full cursor-pointer"
                    style={{ position: 'relative' }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{DEMO_COURSE.course_code}</h3>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">Active</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">{DEMO_COURSE.course_name}</h4>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6">
                        <div className="text-sm text-gray-600">
                            {formatDate(DEMO_COURSE.start_date)} – {formatDate(DEMO_COURSE.end_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                            <span className="font-medium">Semester:</span> {DEMO_COURSE.year}-{DEMO_COURSE.semester}
                        </div>
                    </div>
                    <div className="mt-auto text-sm text-accent font-medium flex items-center">
                        View Details <span className="ml-1">→</span>
                    </div>
                </div>

                {/* Faded placeholder cards */}
                {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm opacity-40">
                        <div className="h-5 bg-gray-200 rounded w-2/5 mb-3 animate-pulse" />
                        <div className="h-7 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-2/5 animate-pulse" />
                    </div>
                ))}
            </div>

            <DemoTourOverlay targetId="demo-course-card" message="Click this course to get started!" position="bottom" />
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Steps 1–2  — CourseDetails shell (tabs: Students / Exams / Grading)
// ──────────────────────────────────────────────────────────────────────────────
const DemoCourseDetails = () => {
    const { currentStep, advanceStep, goToStep } = useDemo();
    const navigate = useNavigate();

    // activeTab maps: step 1 → students, step 2+ → exams
    const activeTab = currentStep === 1 ? 'students' : 'exams';
    const [searchQuery, setSearchQuery] = useState('');

    const TABS = [
        { id: 'students', label: 'Students' },
        { id: 'exams', label: 'Exams' },
        { id: 'grading', label: 'Grading' },
    ];

    // When ExamsTab triggers "Evaluate", intercept and navigate to the demo eval route
    const handleStartEvaluation = useCallback((exam) => {
        navigate(`/demo/evaluations`);
    }, [navigate]);

    return (
        <div className="space-y-4">
            {/* Back + tab bar */}
            <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 mb-1">
                    <button
                        onClick={() => goToStep(0)}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center"
                        aria-label="Back to courses"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex-1 mt-1 sm:mt-0 border-b border-gray-200">
                        <div className="flex flex-wrap gap-2 max-w-full">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    id={tab.id === 'exams' ? 'demo-exams-tab' : undefined}
                                    onClick={() => {
                                        if (tab.id === 'exams' && currentStep === 1) advanceStep();
                                    }}
                                    className={`relative -mb-px px-3 py-2 text-sm font-medium rounded-t-lg transition-colors flex-1 basis-1/3 sm:flex-none sm:basis-auto sm:shrink-0
                    ${activeTab === tab.id
                                            ? 'text-accent border-b-2 border-accent bg-accent/5'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab content */}
            <div className="py-3">
                {activeTab === 'students' && (
                    <>
                        <StudentsTab
                            courseId={DEMO_COURSE_ID}
                            students={DEMO_STUDENTS}
                            sections={DEMO_COURSE.sections}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onAdd={() => { }}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                        <DemoTourOverlay
                            targetId="demo-exams-tab"
                            message="Click the Exams tab to see the exam!"
                            position="bottom"
                        />
                    </>
                )}

                {activeTab === 'exams' && (
                    <>
                        <ExamsTab
                            exams={[{
                                ...DEMO_EXAM,
                                // mark as having questions + rubrics so steps show progress
                                has_questions: true,
                                has_rubrics: true,
                                has_answers: true,
                            }]}
                            courseId={DEMO_COURSE_ID}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onAdd={() => { }}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            onEvaluate={() => { }}
                            onRefresh={() => { }}
                            students={DEMO_STUDENTS.map(s => ({
                                id: s.id,
                                name: s.user_name,
                                email: s.user_email,
                                roll_number: s.roll_number,
                            }))}
                        />
                        {/* Override navigate so "Evaluate" goes to demo eval page */}
                        <EvaluateInterceptor onEvaluate={() => navigate('/demo/evaluations')} />

                        {/* Hint bubble below the exam card pointing to the Evaluate button */}
                        <div className="mt-4 flex justify-center">
                            <DemoHintBubble
                                message="Upload Q&A → Generate Rubrics → Upload Answers → then click Evaluate!"
                                icon={PlayCircle}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/**
 * EvaluateInterceptor: Tiny invisible component that monkey-patches the
 * ExamsTab "Evaluate" button so it navigates to /demo/evaluations
 * instead of the real /courses/:id/exams/:id/evaluations route.
 * It does this by observing clicks on the Evaluate button.
 */
const EvaluateInterceptor = ({ onEvaluate }) => {
    useEffect(() => {
        const handler = (e) => {
            const btn = e.target.closest('button');
            if (btn && btn.textContent?.trim() === 'Evaluate') {
                e.stopPropagation();
                onEvaluate();
            }
        };
        document.addEventListener('click', handler, true);
        return () => document.removeEventListener('click', handler, true);
    }, [onEvaluate]);
    return null;
};

// ──────────────────────────────────────────────────────────────────────────────
// Floating guided tooltip on the evaluation page
// ──────────────────────────────────────────────────────────────────────────────
const EvalPageGuide = () => {
    const [step, setStep] = useState(0); // 0 = show hint, 1 = done
    const navigate = useNavigate();

    // Watch for "Evaluate All" button clicks to advance the guide
    useEffect(() => {
        if (step !== 0) return;
        const handler = (e) => {
            const btn = e.target.closest('button');
            if (btn && btn.textContent?.trim().startsWith('Evaluate All')) {
                // After clicking, show "great!" and wait a moment
                setTimeout(() => setStep(1), 500);
            }
        };
        document.addEventListener('click', handler, true);
        return () => document.removeEventListener('click', handler, true);
    }, [step]);

    return (
        <AnimatePresence>
            {step === 0 && (
                <motion.div
                    key="guide-step0"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ delay: 0.8 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none"
                >
                    <div className="bg-accent text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        >
                            <Sparkles className="w-5 h-5 flex-shrink-0" />
                        </motion.div>
                        <span>Click <strong>Evaluate All</strong> to start AI-powered grading of all student answers!</span>
                    </div>
                    {/* Arrow pointing up */}
                    <div className="flex justify-center mt-1">
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <ChevronDown className="w-5 h-5 text-accent rotate-180" />
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {step === 1 && (
                <motion.div
                    key="guide-step1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Complete! 🎉</h2>
                        <p className="text-gray-600 mb-1">
                            AI has graded all <strong>8 students</strong> across <strong>4 questions</strong>.
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            Average score: <strong>15.5 / 20</strong> · Pass rate: <strong>87.5%</strong>
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { label: 'Evaluated', value: '8/8', color: 'bg-green-50 text-green-700' },
                                { label: 'Average', value: '15.5', color: 'bg-blue-50 text-blue-700' },
                                { label: 'Highest', value: '20', color: 'bg-purple-50 text-purple-700' },
                                { label: 'Lowest', value: '8', color: 'bg-orange-50 text-orange-700' },
                            ].map(stat => (
                                <div key={stat.label} className={`${stat.color} rounded-xl p-3`}>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-xs font-medium opacity-80">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setStep(0)}
                                className="w-full py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <BarChart2 className="w-4 h-4" />
                                View Full Evaluation Results
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('professor_demo_seen');
                                    navigate('/dashboard');
                                }}
                                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Go to Dashboard →
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Evaluation wrapper – rendered at /demo/evaluations
// Uses the real ExamEvaluation modal with the fake IDs (all API calls are mocked)
// ──────────────────────────────────────────────────────────────────────────────
const ExamEvaluationLazy = React.lazy(() =>
    import('../Dashboard/Course/modals/ExamEvaluation')
);

export const DemoEvaluationPage = () => {
    const navigate = useNavigate();

    // Make sure fetch is still mocked when landing here
    useEffect(() => {
        installDemoFetch();
        localStorage.setItem('accessToken', DEMO_ACCESS_TOKEN);
        return () => {
            uninstallDemoFetch();
            localStorage.removeItem('accessToken');
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="h-full min-h-0 min-w-0 overflow-x-hidden">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
                        </div>
                    }
                >
                    <ExamEvaluationLazy
                        examId={DEMO_EXAM_ID}
                        courseId={DEMO_COURSE_ID}
                        onClose={() => {
                            localStorage.removeItem('professor_demo_seen');
                            navigate('/dashboard');
                        }}
                    />
                </Suspense>

                {/* Guided overlay for the evaluation page */}
                <EvalPageGuide />
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main demo router inner component
// ──────────────────────────────────────────────────────────────────────────────
const DemoInner = () => {
    const { currentStep } = useDemo();

    const renderContent = () => {
        if (currentStep === 0) return <DemoCoursesList />;
        if (currentStep >= 1) return <DemoCourseDetails />;
        return <DemoCoursesList />;
    };

    return (
        <DemoLayout activePage="courses">
            {renderContent()}
        </DemoLayout>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Exported page component
// ──────────────────────────────────────────────────────────────────────────────
const DemoPage = () => {
    // Install fetch mock + fake token for the whole demo session
    useEffect(() => {
        installDemoFetch();
        localStorage.setItem('accessToken', DEMO_ACCESS_TOKEN);

        // Pre-seed student list in localStorage so EnrollmentsModal can read it
        localStorage.setItem(
            `course_${DEMO_COURSE_ID}_students`,
            JSON.stringify(DEMO_STUDENTS)
        );

        return () => {
            uninstallDemoFetch();
            localStorage.removeItem('accessToken');
            localStorage.removeItem(`course_${DEMO_COURSE_ID}_students`);
            localStorage.removeItem(`course_${DEMO_COURSE_ID}_exam_steps`);
        };
    }, []);

    return (
        <DemoProvider>
            <DemoInner />
        </DemoProvider>
    );
};

export default DemoPage;
