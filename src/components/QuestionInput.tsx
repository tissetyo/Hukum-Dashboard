'use client';

import React from 'react';
import clsx from 'clsx';

export default function QuestionInput({ question, value, onChange }: { question: any, value: string, onChange: (val: string) => void }) {
    if (!question) return null;

    if (question.type === 'multiple_choice') {
        return (
            <div className="flex-column" style={{ gap: '12px' }}>
                {question.options?.map((opt: string, i: number) => {
                    const optValue = `__idx_${i}`;
                    const inputId = `q-${question.id}-${i}`;
                    const isSelected = value === optValue;

                    return (
                        <label
                            key={i}
                            htmlFor={inputId}
                            className={clsx('btn btn-ghost', { 'btn-primary': isSelected })}
                            style={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                padding: '16px',
                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            <input
                                id={inputId}
                                type="radio"
                                name={`question_${question.id}`}
                                value={optValue}
                                checked={isSelected}
                                onChange={() => onChange(optValue)}
                                style={{ marginRight: '12px' }}
                            />
                            {opt}
                        </label>
                    );
                })}
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
