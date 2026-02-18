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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            animation: 'fadeIn 0.2s ease',
        }}>
            <div style={{
                width: '520px',
                maxWidth: '90vw',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                animation: 'slideUp 0.3s ease',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light, #e05060))',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '4px' }}>Panduan Langkah</div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{title}</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{ padding: '0 24px', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                background: i <= currentStep ? 'var(--primary)' : '#e2e8f0',
                                transition: 'background 0.3s ease',
                            }} />
                        ))}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Langkah {currentStep + 1} dari {steps.length}
                    </div>
                </div>

                {/* Step Content */}
                <div style={{ padding: '0 24px 24px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        minHeight: '120px',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-light, #e05060))',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '1.2rem',
                            fontWeight: '700',
                        }}>
                            {step.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#0f172a' }}>{step.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.6' }}>
                                {step.description}
                            </p>
                            {step.actionLabel && step.actionHref && (
                                <a
                                    href={step.actionHref}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginTop: '12px',
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        background: '#f0f9ff',
                                        color: '#2563eb',
                                        fontSize: '0.82rem',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        border: '1px solid #bfdbfe',
                                    }}
                                >
                                    {step.actionLabel} →
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
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
                            gap: '6px',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            color: isFirst ? '#cbd5e1' : '#475569',
                            cursor: isFirst ? 'default' : 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: '500',
                        }}
                    >
                        <ChevronLeft size={16} /> Sebelumnya
                    </button>

                    {isLast ? (
                        <button
                            onClick={handleClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#10b981',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: '600',
                            }}
                        >
                            <CheckCircle2 size={16} /> Selesai, Mengerti!
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentStep(s => s + 1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: '600',
                            }}
                        >
                            Selanjutnya <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
