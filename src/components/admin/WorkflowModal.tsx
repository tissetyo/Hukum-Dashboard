'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';

export interface WorkflowStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

interface WorkflowModalProps {
    title: string;
    steps: WorkflowStep[];
    open: boolean;
    onClose: () => void;
}

export default function WorkflowModal({ title, steps, open, onClose }: WorkflowModalProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!open) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;
    const isFirst = currentStep === 0;

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            animation: 'wfFadeIn 0.2s ease',
        }}>
            <div style={{
                width: '480px',
                maxWidth: '92vw',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                animation: 'wfSlideUp 0.25s ease',
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Panduan</div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text)' }}>{title}</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'var(--surface, #f8fafc)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Progress Dots */}
                <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {steps.map((_, i) => (
                        <button key={i} onClick={() => setCurrentStep(i)} style={{
                            width: i === currentStep ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: i <= currentStep ? 'var(--primary)' : '#e2e8f0',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            padding: 0,
                        }} />
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {currentStep + 1}/{steps.length}
                    </span>
                </div>

                {/* Step Content */}
                <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                        padding: '16px',
                        background: 'var(--surface, #f8fafc)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {step.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', color: 'var(--text)' }}>{step.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                {step.description}
                            </p>
                            {step.actionLabel && step.actionHref && (
                                <a
                                    href={step.actionHref}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '10px',
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        background: 'white',
                                        color: 'var(--primary)',
                                        fontSize: '0.78rem',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    {step.actionLabel} →
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '14px 20px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <button
                        onClick={() => setCurrentStep(s => s - 1)}
                        disabled={isFirst}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            color: isFirst ? '#cbd5e1' : 'var(--text-muted)',
                            cursor: isFirst ? 'default' : 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: '500',
                        }}
                    >
                        <ChevronLeft size={14} /> Sebelumnya
                    </button>

                    {isLast ? (
                        <button
                            onClick={handleClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#10b981',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                            }}
                        >
                            <CheckCircle2 size={14} /> Mengerti!
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentStep(s => s + 1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                            }}
                        >
                            Selanjutnya <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes wfFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes wfSlideUp {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
