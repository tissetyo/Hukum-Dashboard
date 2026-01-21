'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Plus, Trash2, Settings, Eye, Clock, Download, ExternalLink, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QuestionEditor from '@/components/QuestionEditor';
import QuestionInput from '@/components/QuestionInput';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

export default function ExamDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Responses State
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [gradingScore, setGradingScore] = useState('');
    const [selectedPart, setSelectedPart] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchExamDetails();
            if (activeTab === 'responses') {
                fetchResponses();
            }
        }
    }, [id, activeTab]);

    async function fetchExamDetails() {
        setLoading(true);
        const { data: examData, error } = await supabase.from('exams').select('*').eq('id', id).single();
        if (examData) {
            setExam(examData);
            const { data: qData } = await supabase.from('questions').select('*').eq('exam_id', id).order('order', { ascending: true });
            if (qData) setQuestions(qData);
        }
        setLoading(false);
    }

    async function fetchResponses() {
        setLoadingResponses(true);
        const { data } = await supabase
            .from('participants')
            .select('*, exams(title)')
            .eq('exam_id', id)
            .order('created_at', { ascending: false });
        if (data) setParticipants(data);
        setLoadingResponses(false);
    }

    // --- Questions Tab Logic ---

    const addQuestion = () => {
        setQuestions([...questions, {
            type: 'multiple_choice',
            content: '',
            options: ['', ''],
            order: questions.length,
            exam_id: id // Ensure new questions have exam_id
        }]);
    };

    const updateQuestion = (index: number, data: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...data, exam_id: id };
        setQuestions(newQuestions);
    };

    const deleteQuestion = async (index: number) => {
        const q = questions[index];
        if (q.id) {
            // Delete from DB if it exists
            const { error } = await supabase.from('questions').delete().eq('id', q.id);
            if (error) {
                alert('Failed to delete question');
                return;
            }
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSaveExam = async () => {
        setSaving(true);
        try {
            // Update Exam
            await supabase.from('exams').update({
                title: exam.title,
                description: exam.description,
                duration: exam.duration,
                settings: exam.settings
            }).eq('id', id);

            // Upsert Questions
            // For simplicity in this demo, we upsert all. 
            // Ideally we track dirty state.
            const questionsToSave = questions.map((q, i) => ({
                ...q,
                exam_id: id,
                order: i
            }));

            // Remove temporary IDs if any (though upsert handles new records if ID is missing or new)
            // But supabase upsert needs ID to update, no ID to insert.
            // My questions state has IDs for existing ones.

            const { error: qError } = await supabase.from('questions').upsert(questionsToSave);
            if (qError) throw qError;

            alert('Exam updated successfully!');
            fetchExamDetails();
        } catch (error: any) {
            alert('Error saving: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // --- Responses Tab Logic ---

    const handleDownloadSubmission = async (p: any) => {
        try {
            const { data: submissionData } = await supabase.from('submissions').select('*').eq('participant_id', p.id).single();
            const answers = submissionData?.answers || {};
            // Re-use questions state as it is already loaded for this exam

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Result Submission', 14, 20);
            doc.setFontSize(11);
            doc.text(`Participant: ${p.full_name}`, 14, 30);
            doc.text(`Email: ${p.email}`, 14, 36);
            doc.text(`Exam: ${exam?.title}`, 14, 42);
            doc.text(`Score: ${p.score !== null ? p.score + '%' : 'Not Graded'}`, 14, 48);

            const tableBody = questions.map((q: any, index: number) => {
                return [`${index + 1}`, q.content, answers[q.id] || '(No Answer)'];
            });

            autoTable(doc, {
                startY: 60,
                head: [['#', 'Question', 'Participant Answer']],
                body: tableBody,
            });
            doc.save(`${p.full_name}_Submission.pdf`);
        } catch (e) { alert('Download failed'); }
    };

    const handleBulkExport = async () => {
        setLoadingResponses(true);
        try {
            // We need all submissions
            const pIds = participants.map(p => p.id);
            const { data: subs } = await supabase.from('submissions').select('*').in('participant_id', pIds);

            const headers = ['Name', 'Email', 'Score', ...questions.map((q, i) => `Q${i + 1}`)];
            const rows = participants.map(p => {
                const sub = subs?.find(s => s.participant_id === p.id);
                const ans = sub?.answers || {};
                return [
                    `"${p.full_name}"`,
                    `"${p.email}"`,
                    p.score || '-',
                    ...questions.map(q => `"${(ans[q.id] || '').replace(/"/g, '""')}"`)
                ].join(',');
            });

            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${exam.title}_Results.csv`;
            link.click();
        } catch (e) { alert('Export failed'); }
        finally { setLoadingResponses(false); }
    };

    const handleGrade = async () => {
        if (!selectedPart || !gradingScore) return;
        await supabase.from('participants').update({ score: parseFloat(gradingScore), status: 'graded' }).eq('id', selectedPart.id);
        setSelectedPart(null);
        fetchResponses();
    };

    if (loading || !exam) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => router.push('/admin/exams')} className="btn-ghost" style={{ padding: 0 }}>
                        <ChevronLeft />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{exam.title}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href={`/register/${exam.id}`} target="_blank" className="btn btn-ghost" rel="noreferrer">
                        <ExternalLink size={18} style={{ marginRight: '8px' }} /> Preview Link
                    </a>
                    <button className="btn btn-primary" onClick={handleSaveExam} disabled={saving}>
                        <Save size={18} style={{ marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    <button
                        onClick={() => setActiveTab('questions')}
                        style={{
                            padding: '12px 0',
                            borderBottom: activeTab === 'questions' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'questions' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            background: 'none', border: 'none', cursor: 'pointer'
                        }}
                    >
                        Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('responses')}
                        style={{
                            padding: '12px 0',
                            borderBottom: activeTab === 'responses' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'responses' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            background: 'none', border: 'none', cursor: 'pointer'
                        }}
                    >
                        Responses
                    </button>
                </div>
            </div>

            {activeTab === 'questions' ? (
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
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        value={exam.description || ''}
                                        onChange={(e) => setExam({ ...exam, description: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px' }}
                                    />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3>Questions ({questions.length})</h3>
                                <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={addQuestion}>
                                    <Plus size={18} /> Add Question
                                </button>
                            </div>
                            {questions.map((q, i) => (
                                <QuestionEditor
                                    key={q.id || i}
                                    index={i}
                                    question={q}
                                    onUpdate={(data) => updateQuestion(i, data)}
                                    onDelete={() => deleteQuestion(i)}
                                />
                            ))}
                        </section>
                    </div>
                    <aside className="flex-column" style={{ gap: '24px' }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '20px' }}>Settings</h3>
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
                            </div>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="flex-column" style={{ gap: '24px' }}>
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>{participants.length} Responses</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Latest responses for this exam.</p>
                        </div>
                        <button className="btn btn-secondary" onClick={handleBulkExport} disabled={loadingResponses}>
                            <Download size={18} /> Export All to CSV
                        </button>
                    </div>

                    <div className="card" style={{ padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '16px 24px' }}>Participant</th>
                                    <th style={{ padding: '16px 24px' }}>Status</th>
                                    <th style={{ padding: '16px 24px' }}>Score</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>No responses yet.</td></tr>
                                ) : participants.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '600' }}>{p.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px',
                                                background: p.status === 'graded' ? '#10b98120' : '#f59e0b20',
                                                color: p.status === 'graded' ? '#10b981' : '#f59e0b',
                                                fontWeight: '600'
                                            }}>
                                                {p.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '700' }}>
                                            {p.score !== null ? `${p.score}%` : '--'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn-ghost" title="Grade" onClick={() => setSelectedPart(p)}><CheckCircle size={18} /></button>
                                                <button className="btn-ghost" title="Download" onClick={() => handleDownloadSubmission(p)}><Download size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            {selectedPart && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{ width: '400px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Grade Submission</h3>
                        <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Assigning score for <strong>{selectedPart.full_name}</strong></p>
                        <input
                            type="number"
                            value={gradingScore}
                            onChange={(e) => setGradingScore(e.target.value)}
                            placeholder="0 - 100"
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '24px' }}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGrade}>Save Grade</button>
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelectedPart(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
