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
    const [open, setOpen] = useState(false);

    return (
        <div style={{
            marginBottom: '20px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card-bg, white)',
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
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={15} />
                    <span>Butuh bantuan? Klik untuk tips & panduan</span>
                </div>
                {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {/* Collapsible Content */}
            <div style={{
                maxHeight: open ? '400px' : '0',
                opacity: open ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.35s ease, opacity 0.25s ease',
            }}>
                <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                    {/* Description */}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5', margin: '12px 0 10px' }}>
                        {description}
                    </p>

                    {/* Tips as inline pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {tips.map((tip, i) => (
                            <span key={i} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                background: '#fef9c3',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                color: '#854d0e',
                                fontWeight: '500',
                            }}>
                                <Lightbulb size={11} />
                                {tip.text}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onOpenWorkflow}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--primary)',
                                background: 'var(--primary)',
                                color: 'white',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            <Navigation size={12} />
                            Panduan Langkah
                        </button>
                        <Link
                            href="/admin/docs"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'white',
                                color: 'var(--text-muted)',
                                fontSize: '0.78rem',
                                fontWeight: '500',
                                textDecoration: 'none',
                            }}
                        >
                            <BookOpen size={12} />
                            Dokumentasi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
