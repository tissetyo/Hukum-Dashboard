'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, Info, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function EmailCenterPage() {
    const [recipientType, setRecipientType] = useState('single');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');
    const [exams, setExams] = useState<any[]>([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchExams();
    }, []);

    async function fetchExams() {
        const { data } = await supabase.from('exams').select('id, title');
        if (data) setExams(data);
    }

    const handleSend = async () => {
        if (!subject || !message) {
            alert('Please fill subject and message');
            return;
        }

        setSending(true);
        try {
            if (recipientType === 'single') {
                if (!email) throw new Error('Recipient email is required');
                await sendEmail(email, 'Participant');
            } else {
                if (!selectedExamId) throw new Error('Please select an exam to email all participants');
                const { data: parts } = await supabase
                    .from('participants')
                    .select('email, full_name')
                    .eq('exam_id', selectedExamId);

                if (parts) {
                    for (const p of parts) {
                        await sendEmail(p.email, p.full_name);
                    }
                }
            }
            alert('Email(s) sent successfully!');
            setMessage('');
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    async function sendEmail(to: string, name: string) {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            body: JSON.stringify({
                to,
                subject,
                message: message.replace('{{name}}', name),
                participantName: name
            })
        });
        if (!res.ok) throw new Error('Failed to send email to ' + to);
    }

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Email Center</h1>
                <p style={{ color: 'var(--text-muted)' }}>Communicate with your participants.</p>
            </header>

            <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 350px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '24px' }}>Compose Email</h3>

                    <div className="flex-column" style={{ gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Recipient Type</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className={recipientType === 'single' ? 'btn btn-primary' : 'btn btn-ghost'}
                                    onClick={() => setRecipientType('single')}
                                    style={{ flex: 1 }}
                                >
                                    <Mail size={18} /> Single Recipient
                                </button>
                                <button
                                    className={recipientType === 'bulk' ? 'btn btn-primary' : 'btn btn-ghost'}
                                    onClick={() => setRecipientType('bulk')}
                                    style={{ flex: 1 }}
                                >
                                    <Users size={18} /> All Participants
                                </button>
                            </div>
                        </div>

                        {recipientType === 'single' ? (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Recipient Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                />
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Target Test</label>
                                <select
                                    value={selectedExamId}
                                    onChange={(e) => setSelectedExamId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                >
                                    <option value="">-- Choose a test to email all participants --</option>
                                    {exams.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ex: Your Certification Results"
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Message Body</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '200px' }}
                            />
                        </div>

                        <button className="btn btn-primary" onClick={handleSend} disabled={sending} style={{ padding: '16px' }}>
                            <Send size={20} /> {sending ? 'Sending...' : 'Send Message Now'}
                        </button>
                    </div>
                </div>

                <aside>
                    <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', gap: '12px', color: '#1d4ed8', marginBottom: '16px' }}>
                            <Info size={24} />
                            <h4 style={{ margin: 0 }}>Smart Templates</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#3b82f6', marginBottom: '20px' }}>Use variables to personalize your bulk emails:</p>
                        <div className="flex-column" style={{ gap: '12px' }}>
                            <TemplateVar varName="{{name}}" description="Participant's full name" />
                            <TemplateVar varName="{{score}}" description="The exam score" />
                            <TemplateVar varName="{{link}}" description="Link to their dashboard" />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function TemplateVar({ varName, description }: { varName: string, description: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <code style={{ background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{varName}</code>
            <span style={{ color: '#60a5fa' }}>{description}</span>
        </div>
    );
}
