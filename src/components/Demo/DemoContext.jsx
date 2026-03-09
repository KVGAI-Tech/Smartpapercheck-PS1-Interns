import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_STEPS } from './demoData';

const DemoContext = createContext(null);

export const useDemo = () => useContext(DemoContext);

export const DemoProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState(new Set());

    const advanceStep = useCallback(() => {
        setCurrentStep(prev => {
            const next = Math.min(prev + 1, DEMO_STEPS.length - 1);
            setCompletedSteps(done => new Set([...done, prev]));
            return next;
        });
    }, []);

    const goToStep = useCallback((stepIndex) => {
        setCurrentStep(stepIndex);
    }, []);

    const value = {
        currentStep,
        completedSteps,
        totalSteps: DEMO_STEPS.length,
        steps: DEMO_STEPS,
        advanceStep,
        goToStep,
        isDemoMode: true,
    };

    return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export default DemoContext;
