'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Download, CheckCircle, PieChart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExamResponsesPage() {
    const { id } = useParams();
    const router = useRouter();

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResponses, setLoadingResponses] = useState(false);

    // Grading
    const [gradingScore, setGradingScore] = useState('');
    const [selectedPart, setSelectedPart] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    async function fetchData() {
        setLoading(true);
        // 1. Fetch Exam
        const { data: examData } = await supabase.from('exams').select('*').eq('id', id).single();
        if (examData) setExam(examData);

        // 2. Fetch Questions (needed for headers/export)
        const { data: qData } = await supabase.from('questions').select('*').eq('exam_id', id).order('order', { ascending: true });
        if (qData) setQuestions(qData);

        // 3. Fetch Participants
        await fetchParticipants();

        setLoading(false);
    }

    async function fetchParticipants() {
        setLoadingResponses(true);
        const { data } = await supabase
            .from('participants')
            .select('*, exams(title)')
            .eq('exam_id', id)
            .order('created_at', { ascending: false });
        if (data) setParticipants(data);
        setLoadingResponses(false);
    }

    const handleDownloadSubmission = async (p: any) => {
        try {
            const { data: submissionData } = await supabase.from('submissions').select('*').eq('participant_id', p.id).single();
            const answers = submissionData?.answers || {};

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
        fetchParticipants();
    };

    if (loading || !exam) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => router.push('/admin/responses')} className="btn-ghost" style={{ padding: 0 }}>
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{exam.title}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Results & Responses</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="card" style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--surface)' }}>
                        <PieChart size={16} />
                        <strong>{participants.length}</strong> Responses
                    </div>
                </div>
            </header>

            <div className="flex-column" style={{ gap: '24px' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Participant List</h2>
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
