'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, BookOpen, Navigation } from 'lucide-react';

interface Tip {
    text: string;
}

interface PageHelpProps {
    description: string;
    tips: Tip[];
    onOpenWorkflow: () => void;
}

export default function PageHelp({ description, tips, onOpenWorkflow }: PageHelpProps) {
    const [open, setOpen] = useState(true);

    return (
        <div style={{
            marginBottom: '24px',
            borderRadius: 'var(--radius)',
            border: '1px solid #dbeafe',
            background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
        }}>
            {/* Toggle Header */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#1e40af',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HelpCircle size={18} />
                    <span>Bantuan & Tips</span>
                </div>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {/* Collapsible Content */}
            {open && (
                <div style={{ padding: '0 20px 18px' }}>
                    {/* Description */}
                    <p style={{ color: '#1e3a5f', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 16px' }}>
                        {description}
                    </p>

                    {/* Tips */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '8px',
                        marginBottom: '16px'
                    }}>
                        {tips.map((tip, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.7)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                color: '#334155',
                            }}>
                                <Lightbulb size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                                <span>{tip.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={onOpenWorkflow}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #3b82f6',
                                background: '#3b82f6',
                                color: 'white',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Navigation size={14} />
                            Panduan Langkah
                        </button>
                        <Link
                            href="/admin/docs"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #93c5fd',
                                background: 'white',
                                color: '#2563eb',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            <BookOpen size={14} />
                            Lihat Dokumentasi
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
