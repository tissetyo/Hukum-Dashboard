'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, XCircle, Download, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPart, setSelectedPart] = useState<any>(null);
    const [gradingScore, setGradingScore] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newParticipant, setNewParticipant] = useState({ name: '', email: '', examId: '' });
    const [exams, setExams] = useState<any[]>([]);

    // Filtering State
    const [selectedExamFilter, setSelectedExamFilter] = useState('');

    // Email State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({ to: '', subject: 'Exam Results', message: '', name: '' });
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        fetchParticipants();
        fetchExams();
    }, []);

    const filteredParticipants = selectedExamFilter
        ? participants.filter(p => p.exam_id === selectedExamFilter)
        : participants;

    async function fetchExams() {
        const { data } = await supabase.from('exams').select('id, title');
        if (data) setExams(data);
    }

    async function fetchParticipants() {
        setLoading(true);
        const { data } = await supabase
            .from('participants')
            .select('*, exams(title)')
            .order('created_at', { ascending: false });

        if (data) setParticipants(data);
        setLoading(false);
    }

    const handleAddParticipant = async () => {
        if (!newParticipant.name || !newParticipant.email || !newParticipant.examId) {
            alert('Please fill all fields');
            return;
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const { error } = await supabase.from('participants').insert([{
            full_name: newParticipant.name,
            email: newParticipant.email,
            exam_id: newParticipant.examId,
            access_token: token,
            status: 'pending'
        }]);

        if (error) {
            alert('Error adding participant: ' + error.message);
        } else {
            setShowAddModal(false);
            setNewParticipant({ name: '', email: '', examId: '' });
            fetchParticipants();
        }
    };

    const handleGrade = async () => {
        if (!selectedPart || !gradingScore) return;

        const { error } = await supabase
            .from('participants')
            .update({
                score: parseFloat(gradingScore),
                status: 'graded'
            })
            .eq('id', selectedPart.id);

        if (!error) {
            alert('Score updated successfully!');
            setSelectedPart(null);
            fetchParticipants();
        }
    };

    const handleOpenEmail = (p: any) => {
        setEmailData({
            to: p.email,
            subject: `Exam Results: ${p.exams?.title || 'Certification'}`,
            message: `Dear ${p.full_name},\n\nYour exam has been graded. You can view your results by logging into the dashboard.\n\nScore: ${p.score || 'N/A'}\n\nBest regards,\nAdmin Team`,
            name: p.full_name
        });
        setShowEmailModal(true);
    };

    const handleSendEmail = async () => {
        if (!emailData.to || !emailData.message) return;
        setSendingEmail(true);

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: emailData.to,
                    subject: emailData.subject,
                    message: emailData.message.replace(/\n/g, '<br/>'), // simple formatting
                    participantName: emailData.name
                })
            });

            if (res.ok) {
                alert('Email sent successfully!');
                setShowEmailModal(false);
            } else {
                const err = await res.json();
                alert('Failed to send email: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Email error:', error);
            alert('Failed to send email.');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleDownloadSubmission = async (p: any) => {
        try {
            const { data: submissionData, error: subError } = await supabase
                .from('submissions')
                .select('*')
                .eq('participant_id', p.id)
                .single();

            if (subError && subError.code !== 'PGRST116') {
                console.error('Error fetching submission:', subError);
                alert('Error fetching submission data.');
                return;
            }

            const answers = submissionData?.answers || {};

            const { data: questions, error: qError } = await supabase
                .from('questions')
                .select('*')
                .eq('exam_id', p.exam_id)
                .order('order', { ascending: true });

            if (qError) {
                console.error('Error fetching questions:', qError);
                alert('Error fetching questions data.');
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Result Submission', 14, 20);

            doc.setFontSize(11);
            doc.text(`Participant: ${p.full_name}`, 14, 30);
            doc.text(`Email: ${p.email}`, 14, 36);
            doc.text(`Exam: ${p.exams?.title || 'Unknown Exam'}`, 14, 42);
            doc.text(`Score: ${p.score !== null ? p.score + '%' : 'Not Graded'}`, 14, 48);
            doc.text(`Date: ${submissionData?.submitted_at ? new Date(submissionData.submitted_at).toLocaleString() : 'Not Submitted'}`, 14, 54);

            const tableBody = questions.map((q: any, index: number) => {
                const userAnswer = answers[q.id] || '(No Answer)';
                const questionText = q.content;
                return [`${index + 1}`, questionText, userAnswer];
            });

            autoTable(doc, {
                startY: 60,
                head: [['#', 'Question', 'Participant Answer']],
                body: tableBody,
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 90 },
                    2: { cellWidth: 90 }
                },
                styles: { overflow: 'linebreak' }
            });

            doc.save(`${p.full_name}_${p.exams?.title}_Submission.pdf`);

        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to generate PDF. See console for details.');
        }
    };

    const handleBulkExport = async () => {
        if (!selectedExamFilter) {
            alert('Please select an exam to export results.');
            return;
        }

        const examTitle = exams.find(e => e.id === selectedExamFilter)?.title || 'Exam';
        setLoading(true);

        try {
            const { data: questions, error: qError } = await supabase
                .from('questions')
                .select('id, content, order')
                .eq('exam_id', selectedExamFilter)
                .order('order', { ascending: true });

            if (qError || !questions) throw new Error('Failed to fetch questions');

            const participantIds = filteredParticipants.map(p => p.id);
            const { data: submissions, error: sError } = await supabase
                .from('submissions')
                .select('participant_id, answers, submitted_at')
                .in('participant_id', participantIds);

            if (sError) throw new Error('Failed to fetch submissions');

            const headers = [
                'Full Name',
                'Email',
                'Status',
                'Score',
                'Submitted At',
                ...questions.map((q, i) => `Q${i + 1}: ${q.content.substring(0, 50).replace(/,/g, '')}...`)
            ];

            const rows = filteredParticipants.map(p => {
                const sub = submissions?.find(s => s.participant_id === p.id);
                const answers = sub?.answers || {};

                const answerColumns = questions.map(q => {
                    const ans = answers[q.id] || '-';
                    return `"${String(ans).replace(/"/g, '""')}"`;
                });

                return [
                    `"${p.full_name}"`,
                    `"${p.email}"`,
                    p.status,
                    p.score !== null ? p.score : '-',
                    sub?.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-',
                    ...answerColumns
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${examTitle}_Results_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err: any) {
            console.error('Export error:', err);
            alert('Export failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Participants & Grading</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Review submissions and assign final scores.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Add Participant
                        </button>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--surface)' }}>
                    <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Filter by Exam:</span>
                        <select
                            value={selectedExamFilter}
                            onChange={(e) => setSelectedExamFilter(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minWidth: '250px' }}
                        >
                            <option value="">All Exams</option>
                            {exams.map(e => (
                                <option key={e.id} value={e.id}>{e.title}</option>
                            ))}
                        </select>
                    </div>
                    {selectedExamFilter && (
                        <button className="btn btn-secondary" onClick={handleBulkExport}>
                            <Download size={18} /> Export Results (CSV)
                        </button>
                    )}
                </div>
            </header>

            <div className="card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px 24px' }}>Participant</th>
                            <th style={{ padding: '16px 24px' }}>Exam</th>
                            <th style={{ padding: '16px 24px' }}>Status</th>
                            <th style={{ padding: '16px 24px' }}>Score</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParticipants.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No participants found.
                                </td>
                            </tr>
                        ) : (
                            filteredParticipants.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600' }}>{p.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>{p.exams?.title || 'Unknown'}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            background: p.status === 'graded' ? '#10b98120' : (p.status === 'completed' ? '#3b82f620' : '#f59e0b20'),
                                            color: p.status === 'graded' ? '#10b981' : (p.status === 'completed' ? '#3b82f6' : '#f59e0b'),
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
                                            <button className="btn-ghost btn-icon" onClick={() => {
                                                const link = `${window.location.origin}/test/${p.access_token}`;
                                                navigator.clipboard.writeText(link)
                                                    .then(() => alert('Exam link copied to clipboard!'))
                                                    .catch(() => alert('Failed to copy link. Manual copy needed.'));
                                            }} title="Copy Link">
                                                <ExternalLink size={18} />
                                            </button>
                                            <button className="btn-ghost btn-icon" onClick={() => setSelectedPart(p)} title="Grade">
                                                <CheckCircle size={18} />
                                            </button>
                                            <button className="btn-ghost btn-icon" onClick={() => handleOpenEmail(p)} title="Send Email">
                                                <Mail size={18} />
                                            </button>
                                            <button className="btn-ghost btn-icon" title="Download Submission" onClick={() => handleDownloadSubmission(p)}>
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110
                }}>
                    <div className="card" style={{ width: '500px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Send Email Notification</h3>
                        <div className="flex-column" style={{ gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>To</label>
                                <input
                                    value={emailData.to}
                                    disabled
                                    style={{ width: '100%', padding: '8px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Subject</label>
                                <input
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Message</label>
                                <textarea
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                                    style={{ width: '100%', padding: '8px', minHeight: '120px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSendEmail} disabled={sendingEmail}>
                                    {sendingEmail ? 'Sending...' : 'Send Email'}
                                </button>
                                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowEmailModal(false)}>Cancel</button>
                            </div>
                        </div>
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

                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Final Score (%)</label>
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

            {/* Add Participant Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{ width: '500px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Add New Participant</h3>

                        <div className="flex-column" style={{ gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={newParticipant.name}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                    placeholder="Enter full name"
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={newParticipant.email}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                                    placeholder="name@example.com"
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Select Test</label>
                                <select
                                    value={newParticipant.examId}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, examId: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                >
                                    <option value="">-- Choose a test --</option>
                                    {exams.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddParticipant}>Generate Link</button>
                                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
