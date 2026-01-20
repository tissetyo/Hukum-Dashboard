'use client';

import React from 'react';
import clsx from 'clsx';

export default function QuestionInput({ question, value, onChange }: { question: any, value: string, onChange: (val: string) => void }) {
    if (!question) return null;

    if (question.type === 'multiple_choice') {
        return (
            <div className="flex-column" style={{ gap: '12px' }}>
                {question.options?.map((opt: string, i: number) => (
                    <label key={i} className={clsx('btn btn-ghost', { 'btn-primary': value === opt })} style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        padding: '16px',
                        borderColor: value === opt ? 'var(--primary)' : 'var(--border)'
                    }}>
                        <input
                            type="radio"
                            name={question.id || 'preview'}
                            value={opt}
                            checked={value === opt}
                            onChange={() => onChange(opt)}
                            style={{ marginRight: '12px' }}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        );
    }

    if (question.type === 'boolean') {
        return (
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    className={clsx('btn btn-ghost', { 'btn-primary': value === 'True' })}
                    style={{ flex: 1 }}
                    onClick={() => onChange('True')}
                >
                    True
                </button>
                <button
                    className={clsx('btn btn-ghost', { 'btn-primary': value === 'False' })}
                    style={{ flex: 1 }}
                    onClick={() => onChange('False')}
                >
                    False
                </button>
            </div>
        );
    }

    return (
        <textarea
            placeholder="Type your answer here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                minHeight: '150px',
                fontFamily: 'inherit',
                fontSize: '1rem'
            }}
        />
    );
}
