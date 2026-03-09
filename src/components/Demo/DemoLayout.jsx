import React, { useState } from 'react';
import { BookOpen, LayoutDashboard, X, Menu, CheckCircle } from 'lucide-react';
import { useDemo } from './DemoContext';
import { DEMO_STEPS } from './demoData';

const DemoLayout = ({ children, activePage = 'courses' }) => {
    const { currentStep, completedSteps, totalSteps } = useDemo();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const progressPercent = Math.round((currentStep / (totalSteps - 1)) * 100);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
        { icon: BookOpen, label: 'Courses', page: 'courses' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? 240 : 64,
                flexShrink: 0,
                background: 'white',
                borderRight: '1px solid #e5e7eb',
                boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 300ms ease',
                position: 'sticky',
                top: 0,
                height: '100vh',
                zIndex: 40,
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', padding: '0 16px', height: 64, borderBottom: '1px solid #e5e7eb' }}>
                    {sidebarOpen && (
                        <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Smart QnA
                        </span>
                    )}
                    <button onClick={() => setSidebarOpen(o => !o)} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>
                        <Menu size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 10px' }}>
                    {menuItems.map(item => (
                        <div key={item.page} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                            background: activePage === item.page ? 'rgba(99,102,241,0.08)' : 'transparent',
                            color: activePage === item.page ? '#6366f1' : '#6b7280',
                            cursor: 'default',
                            fontWeight: activePage === item.page ? 600 : 400,
                            fontSize: 14, boxSizing: 'border-box',
                        }}>
                            <item.icon size={18} />
                            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                        </div>
                    ))}
                </nav>

                {/* Demo badge */}
                {sidebarOpen && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, padding: '10px 14px', color: 'white' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.85, marginBottom: 4 }}>DEMO MODE</div>
                            <div style={{ fontSize: 12, opacity: 0.9 }}>Explore without any real data</div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Top header */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 30,
                    background: 'white', borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                    {/* Progress Tour Bar */}
                    <div style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)', padding: '10px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 960, margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                {DEMO_STEPS.map((step, i) => (
                                    <React.Fragment key={step.id}>
                                        {/* Step dot */}
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700,
                                            background: completedSteps.has(i)
                                                ? 'rgba(255,255,255,0.95)'
                                                : currentStep === i
                                                    ? 'white'
                                                    : 'rgba(255,255,255,0.2)',
                                            color: completedSteps.has(i)
                                                ? '#6366f1'
                                                : currentStep === i
                                                    ? '#6366f1'
                                                    : 'rgba(255,255,255,0.7)',
                                            border: currentStep === i ? '2px solid white' : '2px solid transparent',
                                            transition: 'all 300ms ease',
                                            boxShadow: currentStep === i ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
                                        }}>
                                            {completedSteps.has(i) ? <CheckCircle size={14} /> : i + 1}
                                        </div>
                                        {/* Label (only on wider screens shown on current step) */}
                                        {currentStep === i && (
                                            <span style={{ fontSize: 11, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', marginRight: 4 }}>
                                                {step.label}
                                            </span>
                                        )}
                                        {/* Connector line */}
                                        {i < DEMO_STEPS.length - 1 && (
                                            <div style={{ flex: 1, height: 3, minWidth: 8, borderRadius: 4, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    background: 'white',
                                                    borderRadius: 4,
                                                    width: completedSteps.has(i) ? '100%' : '0%',
                                                    transition: 'width 600ms ease',
                                                }} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginLeft: 16, whiteSpace: 'nowrap', fontWeight: 500 }}>
                                Step {currentStep + 1} / {totalSteps}
                            </span>
                        </div>
                    </div>

                    {/* Header info row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Professor Dashboard</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{DEMO_STEPS[currentStep]?.description}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 12, background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                                👋 Demo Tour
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                                P
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: '28px 32px', position: 'relative' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DemoLayout;
