'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Plus, Trash2, Settings, Eye, X, CheckCircle, Copy, ExternalLink, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QuestionEditor from '@/components/QuestionEditor';
import QuestionInput from '@/components/QuestionInput';

export default function NewExamPage() {
    const router = useRouter();
    const [exam, setExam] = useState({
        title: '',
        description: '',
        duration: 60,
        settings: { layout_type: 'scroll' }
    });

    const [questions, setQuestions] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewSlide, setPreviewSlide] = useState(0);
    const [savedExam, setSavedExam] = useState<any>(null);

    const addQuestion = () => {
        setQuestions([...questions, {
            type: 'multiple_choice',
            content: '',
            options: ['', ''],
            order: questions.length
        }]);
    };

    const updateQuestion = (index: number, data: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = data;
        setQuestions(newQuestions);
    };

    const deleteQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newQs = [...questions];
        [newQs[index - 1], newQs[index]] = [newQs[index], newQs[index - 1]];
        setQuestions(newQs);
    };

    const moveDown = (index: number) => {
        if (index === questions.length - 1) return;
        const newQs = [...questions];
        [newQs[index + 1], newQs[index]] = [newQs[index], newQs[index + 1]];
        setQuestions(newQs);
    };

    const handleSave = async () => {
        if (!exam.title) {
            alert('Please enter a title for the exam.');
            return;
        }

        setSaving(true);
        try {
            console.log('Saving exam:', exam);
            // 1. Save Exam
            const { data: examData, error: examError } = await supabase
                .from('exams')
                .insert([exam])
                .select()
                .single();

            if (examError) {
                console.error('Exam save error:', examError);
                throw new Error(`Failed to save exam details: ${examError.message}`);
            }

            console.log('Exam saved:', examData);

            // 2. Save Questions if any
            if (questions.length > 0) {
                // Explicitly map only necessary fields to avoid sending UI state to DB
                const questionsToSave = questions.map((q, i) => ({
                    exam_id: examData.id,
                    type: q.type,
                    content: q.content,
                    options: q.options,
                    order: i
                }));

                console.log('Saving questions:', questionsToSave);

                const { error: qError } = await supabase
                    .from('questions')
                    .insert(questionsToSave);

                if (qError) {
                    console.error('Questions save error:', qError);
                    // Try to rollback exam if questions fail? For now just alert.
                    throw new Error(`Failed to save questions: ${qError.message}`);
                }
            }

            setSavedExam(examData);
        } catch (error: any) {
            console.error('Full save error:', error);
            alert(`Error saving exam: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (savedExam) {
        const regLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register/${savedExam.id}`;
        return (
            <div className="flex-center fade-in" style={{ height: '80vh', flexDirection: 'column', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', padding: '48px' }}>
                    <div style={{ color: '#10b981', marginBottom: '24px' }}>
                        <CheckCircle size={64} />
                    </div>
                    <h1 style={{ marginBottom: '12px' }}>Test Created Successfully!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                        Your certification test "<strong>{savedExam.title}</strong>" has been saved and is now live.
                    </p>

                    <div style={{ background: 'var(--background)', padding: '20px', borderRadius: 'var(--radius)', textAlign: 'left', marginBottom: '32px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            PUBLIC REGISTRATION LINK
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                readOnly
                                value={regLink}
                                style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                            />
                            <button className="btn btn-ghost" onClick={() => {
                                navigator.clipboard.writeText(regLink);
                                alert('Link copied!');
                            }}>
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-column" style={{ gap: '12px' }}>
                        <button className="btn btn-primary" onClick={() => router.push('/admin/exams')}>
                            Go to Exam List
                        </button>
                        <button className="btn btn-ghost" onClick={() => window.open(regLink, '_blank')}>
                            Open Registration Page <ExternalLink size={16} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div className="flex-column" style={{ gap: '8px' }}>
                    <button onClick={() => router.back()} className="btn-ghost" style={{ width: 'fit-content', padding: '0', color: 'var(--text-muted)' }}>
                        <ChevronLeft size={16} style={{ marginRight: '4px' }} /> Back to Exams
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create New Certification Test</h1>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn btn-ghost" onClick={() => setShowPreview(true)}>
                        <Eye size={18} style={{ marginRight: '8px' }} />
                        Preview
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {saving ? 'Saving...' : 'Save Exam'}
                    </button>
                </div>
            </header>

            <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                <div className="flex-column" style={{ gap: '24px' }}>
                    <section className="card">
                        <h3 style={{ marginBottom: '16px' }}>Test Details</h3>
                        <div className="flex-column" style={{ gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Test Title</label>
                                <input
                                    type="text"
                                    value={exam.title}
                                    onChange={(e) => setExam({ ...exam, title: e.target.value })}
                                    placeholder="e.g., Ujian Advokat Gelombang I 2026"
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description (Optional)</label>
                                <textarea
                                    value={exam.description}
                                    onChange={(e) => setExam({ ...exam, description: e.target.value })}
                                    placeholder="Provide instructions for the participants..."
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px' }}
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3>Questions</h3>
                            <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={addQuestion}>
                                <Plus size={18} /> Add Question
                            </button>
                        </div>

                        {questions.map((q, i) => (
                            <QuestionEditor
                                key={i}
                                index={i}
                                question={q}
                                onUpdate={(data) => updateQuestion(i, data)}
                                onDelete={() => deleteQuestion(i)}
                                onMoveUp={i > 0 ? () => moveUp(i) : undefined}
                                onMoveDown={i < questions.length - 1 ? () => moveDown(i) : undefined}
                            />
                        ))}

                        {questions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No questions added yet. Click "+ Add Question" to start.</p>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="flex-column" style={{ gap: '24px' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--secondary)' }}>
                            <Settings size={20} />
                            <h3 style={{ margin: 0 }}>Exam Settings</h3>
                        </div>

                        <div className="flex-column" style={{ gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Duration (Minutes)</label>
                                <input
                                    type="number"
                                    value={exam.duration}
                                    onChange={(e) => setExam({ ...exam, duration: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Display Mode</label>
                                <select
                                    value={exam.settings.layout_type}
                                    onChange={(e) => setExam({ ...exam, settings: { ...exam.settings, layout_type: e.target.value } })}
                                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                >
                                    <option value="scroll">Single Page (Scroll)</option>
                                    <option value="slideshow">Step-by-step (Slideshow)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            {showPreview && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--background)', zIndex: 1000, display: 'flex',
                    flexDirection: 'column'
                }}>
                    <header style={{
                        padding: '16px 40px',
                        background: 'white',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: 'var(--secondary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>PREVIEW</div>
                            <div style={{ fontWeight: '700' }}>{exam.title || 'Untitled Exam'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                <Clock size={18} /> {exam.duration}:00
                            </div>
                            <button className="btn btn-primary" style={{ padding: '8px 20px' }} onClick={() => setShowPreview(false)}>
                                Exit Preview
                            </button>
                        </div>
                    </header>

                    <main style={{ flex: 1, overflowY: 'auto', padding: '40px 20px' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                            {exam.settings.layout_type === 'slideshow' ? (
                                <div className="fade-in">
                                    {questions.length > 0 ? (
                                        <>
                                            <div className="premium-card">
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Question {previewSlide + 1} of {questions.length}</span>
                                                <h3 style={{ margin: '16px 0 24px 0' }}>{questions[previewSlide]?.content}</h3>
                                                <QuestionInput
                                                    question={questions[previewSlide]}
                                                    value=""
                                                    onChange={() => { }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                                                <button className="btn btn-ghost" disabled={previewSlide === 0} onClick={() => setPreviewSlide(p => p - 1)}>
                                                    <ChevronLeft /> Previous
                                                </button>
                                                <button className="btn btn-primary" disabled={previewSlide === questions.length - 1} onClick={() => setPreviewSlide(p => p + 1)}>
                                                    Next Question <ChevronRight />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Add questions to see them in preview.</div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-column" style={{ gap: '32px' }}>
                                    {questions.map((q, i) => (
                                        <div key={i} className="premium-card">
                                            <h4 style={{ marginBottom: '16px' }}>{i + 1}. {q.content}</h4>
                                            <QuestionInput
                                                question={q}
                                                value=""
                                                onChange={() => { }}
                                            />
                                        </div>
                                    ))}
                                    {questions.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Add questions to see them in preview.</div>
                                    )}
                                    {questions.length > 0 && (
                                        <button className="btn btn-primary" style={{ padding: '20px', marginTop: '20px' }}>
                                            Submit All Answers
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
}
