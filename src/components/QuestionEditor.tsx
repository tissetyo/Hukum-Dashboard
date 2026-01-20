'use client';

import React from 'react';
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionEditorProps {
    question: any;
    index: number;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

export default function QuestionEditor({ question, index, onUpdate, onDelete, onMoveUp, onMoveDown }: QuestionEditorProps) {
    return (
        <div className="card" style={{ marginBottom: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div className="flex-column" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        className="btn-ghost"
                        disabled={!onMoveUp}
                        onClick={onMoveUp}
                        style={{ padding: '4px', opacity: onMoveUp ? 1 : 0.3 }}
                    >
                        <ChevronUp size={18} />
                    </button>
                    <GripVertical size={20} />
                    <button
                        className="btn-ghost"
                        disabled={!onMoveDown}
                        onClick={onMoveDown}
                        style={{ padding: '4px', opacity: onMoveDown ? 1 : 0.3 }}
                    >
                        <ChevronDown size={18} />
                    </button>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Question {index + 1}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <select
                                value={question.type}
                                onChange={(e) => onUpdate({ ...question, type: e.target.value })}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="text">Text Response</option>
                                <option value="boolean">True/False</option>
                            </select>
                            <button
                                onClick={onDelete}
                                style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <textarea
                        placeholder="Enter your question here..."
                        value={question.content}
                        onChange={(e) => onUpdate({ ...question, content: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            minHeight: '80px',
                            marginBottom: '16px',
                            fontFamily: 'inherit'
                        }}
                    />

                    {question.type === 'multiple_choice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.options?.map((opt: string, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input type="radio" disabled />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...(question.options || [])];
                                            newOpts[i] = e.target.value;
                                            onUpdate({ ...question, options: newOpts });
                                        }}
                                        placeholder={`Option ${i + 1}`}
                                        style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                    <button
                                        onClick={() => {
                                            const newOpts = question.options.filter((_: any, idx: number) => idx !== i);
                                            onUpdate({ ...question, options: newOpts });
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                className="btn-ghost"
                                style={{ padding: '4px 12px', fontSize: '0.85rem', alignSelf: 'flex-start' }}
                                onClick={() => onUpdate({ ...question, options: [...(question.options || []), ''] })}
                            >
                                + Add Option
                            </button>
                        </div>
                    )}

                    {question.type === 'boolean' && (
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', gap: '8px' }}>
                                <input type="radio" name={`bool-${index}`} value="true" /> True
                            </label>
                            <label style={{ display: 'flex', gap: '8px' }}>
                                <input type="radio" name={`bool-${index}`} value="false" /> False
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
