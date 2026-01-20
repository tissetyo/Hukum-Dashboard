'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, XCircle, Download, ExternalLink } from 'lucide-react';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPart, setSelectedPart] = useState<any>(null);
    const [gradingScore, setGradingScore] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newParticipant, setNewParticipant] = useState({ name: '', email: '', examId: '' });
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        fetchParticipants();
        fetchExams();
    }, []);

    async function fetchExams() {
        const { data } = await supabase.from('exams').select('id, title');
        if (data) setExams(data);
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

    async function fetchParticipants() {
        setLoading(true);
        const { data } = await supabase
            .from('participants')
            .select('*, exams(title)')
            .order('created_at', { ascending: false });

        if (data) setParticipants(data);
        setLoading(false);
    }

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

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Participants & Grading</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Review submissions and assign final scores.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    Add Participant
                </button>
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
                        {participants.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: '600' }}>{p.full_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>{p.exams.title}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
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
                                        <button className="btn-ghost" onClick={() => {
                                            const link = `${window.location.origin}/test/${p.access_token}`;
                                            navigator.clipboard.writeText(link);
                                            alert('Exam link copied to clipboard!');
                                        }} title="Copy Link">
                                            <ExternalLink size={18} />
                                        </button>
                                        <button className="btn-ghost" onClick={() => setSelectedPart(p)} title="Grade">
                                            <CheckCircle size={18} />
                                        </button>
                                        <button className="btn-ghost" title="Send Email">
                                            <Mail size={18} />
                                        </button>
                                        <button className="btn-ghost" title="Download Submission">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
