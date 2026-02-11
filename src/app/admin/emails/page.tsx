'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, Info } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function EmailCenterPage() {
    const supabase = createClient();
    const [recipientType, setRecipientType] = useState('single');
    const [singleRecipientMode, setSingleRecipientMode] = useState<'manual' | 'exist'>('manual');
    const [email, setEmail] = useState('');
    const [participantName, setParticipantName] = useState(''); // For manual entry context or selected participant

    // For "Existing Participant" selection
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedParticipantId, setSelectedParticipantId] = useState('');

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');
    const [exams, setExams] = useState<any[]>([]);
    const [sending, setSending] = useState(false);

    // Preview Mode
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchExams();
        fetchParticipants();
    }, []);

    async function fetchExams() {
        const { data } = await supabase.from('exams').select('id, title');
        if (data) setExams(data);
    }

    async function fetchParticipants() {
        const { data } = await supabase
            .from('participants')
            .select('*, exams(title)')
            .order('created_at', { ascending: false });
        if (data) setParticipants(data);
    }

    const handleParticipantSelect = (partId: string) => {
        setSelectedParticipantId(partId);
        const part = participants.find(p => p.id === partId);
        if (part) {
            setEmail(part.email);
            setParticipantName(part.full_name);
        } else {
            setEmail('');
            setParticipantName('');
        }
    };

    const templates = [
        {
            name: 'Exam Results',
            subject: 'Your Exam Results for {{exam_name}}',
            body: `Dear {{name}},

Your exam {{exam_name}} has been graded.
You achieved a score of {{score}}%.

You can view your full results and download your certificate here:
{{link}}

Best regards,
Admin Team`
        },
        {
            name: 'New Test Invitation',
            subject: 'Invitation to take {{exam_name}}',
            body: `Dear {{name}},

You have been invited to take a new exam: {{exam_name}}.

Please click the link below to start your test:
{{link}}

Good luck!
Admin Team`
        }
    ];

    const applyTemplate = (t: typeof templates[0]) => {
        setSubject(t.subject);
        setMessage(t.body);
    };

    const insertVariable = (varName: string) => {
        const input = document.querySelector('textarea');
        if (input) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const text = input.value;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            setMessage(before + varName + after);
            // Move cursor after variable
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = start + varName.length;
                input.focus();
            }, 0);
        } else {
            setMessage(prev => prev + varName);
        }
    };

    const getPreviewContent = () => {
        // Determine context data
        let context = {
            name: 'John Doe',
            score: '85',
            exam_name: 'Sample Exam',
            link: 'https://example.com/test/123'
        };

        if (recipientType === 'single') {
            if (singleRecipientMode === 'exist' && selectedParticipantId) {
                const p = participants.find(p => p.id === selectedParticipantId);
                if (p) {
                    context = {
                        name: p.full_name,
                        score: p.score !== null ? String(p.score) : 'N/A',
                        exam_name: p.exams?.title || 'Exam',
                        link: `${window.location.origin}/test/${p.access_token}`
                    };
                }
            } else if (participantName) {
                context.name = participantName;
            }
        } else if (recipientType === 'bulk' && selectedExamId) {
            const ex = exams.find(e => e.id === selectedExamId);
            if (ex) context.exam_name = ex.title;
            context.name = '{Participant Name}'; // Placeholder for bulk
            context.score = '{Score}';
            context.link = '{Link}';
        }

        const previewSubject = subject.replace(/{{exam_name}}/g, context.exam_name);
        const previewBody = message
            .replace(/{{name}}/g, context.name)
            .replace(/{{score}}/g, typeof context.score === 'number' ? String(context.score) : context.score)
            .replace(/{{exam_name}}/g, context.exam_name)
            .replace(/{{link}}/g, context.link);

        return { subject: previewSubject, body: previewBody };
    };

    const handleSend = async () => {
        if (!subject || !message) {
            alert('Please fill subject and message');
            return;
        }

        setSending(true);
        let successCount = 0;
        let failCount = 0;

        try {
            if (recipientType === 'single') {
                if (!email) throw new Error('Recipient email is required');

                // For single send, we try to use context if available
                let finalSubject = subject;
                let finalBody = message;

                // If user selected a participant, we can swap variables!
                if (singleRecipientMode === 'exist' && selectedParticipantId) {
                    const p = participants.find(p => p.id === selectedParticipantId);
                    if (p) {
                        const examTitle = p.exams?.title || 'Exam';
                        const baseUrl = window.location.origin;
                        let link = `${baseUrl}/test/${p.access_token}`;
                        if (p.status === 'graded' || p.status === 'completed') {
                            link = `${baseUrl}/dashboard/${p.access_token}`;
                        }

                        finalSubject = subject.replace(/{{exam_name}}/g, examTitle);
                        finalBody = message
                            .replace(/{{name}}/g, p.full_name)
                            .replace(/{{score}}/g, p.score !== null ? String(p.score) : 'N/A')
                            .replace(/{{exam_name}}/g, examTitle)
                            .replace(/{{link}}/g, link);
                    }
                }

                // If manual, we can only really replace basic knowns or keep as is? 
                // The user prompt implies they want manual option too. 
                // If manual, we probably can't safely replace {{link}} or {{score}} unless we ask them.
                // But typically manual is for ad-hoc. We'll leave variables distinct or maybe replace {{name}} if they provided one.
                else {
                    finalBody = message.replace(/{{name}}/g, participantName || 'Participant');
                }

                await sendEmail(email, participantName || 'Participant', finalBody, finalSubject);
                successCount++;
            } else {
                if (!selectedExamId) throw new Error('Please select an exam to email all participants');

                const parts = participants.filter(p => p.exam_id === selectedExamId);

                if (parts && parts.length > 0) {
                    for (const p of parts) {
                        try {
                            const examTitle = p.exams?.title || 'Exam';
                            const baseUrl = window.location.origin;
                            let link = `${baseUrl}/test/${p.access_token}`;
                            if (p.status === 'graded' || p.status === 'completed') {
                                link = `${baseUrl}/dashboard/${p.access_token}`;
                            }

                            let finalSubject = subject.replace(/{{exam_name}}/g, examTitle);
                            let finalBody = message
                                .replace(/{{name}}/g, p.full_name)
                                .replace(/{{score}}/g, p.score !== null ? String(p.score) : 'N/A')
                                .replace(/{{exam_name}}/g, examTitle)
                                .replace(/{{link}}/g, link);

                            await sendEmail(p.email, p.full_name, finalBody, finalSubject);
                            successCount++;
                        } catch (e) {
                            console.error(`Failed to send to ${p.email}`, e);
                            failCount++;
                        }
                    }
                } else {
                    alert('No participants found for this exam.');
                    setSending(false);
                    return;
                }
            }

            if (failCount > 0) {
                alert(`Finished: ${successCount} sent, ${failCount} failed. Check console for details.`);
            } else {
                alert(`Successfully sent ${successCount} emails!`);
                // Optional: clear form
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    async function sendEmail(to: string, name: string, htmlBody: string, subjectLine: string) {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to,
                subject: subjectLine,
                message: htmlBody,
                participantName: name
            })
        });

        const result = await res.json();

        if (!res.ok) {
            console.error('API Error Response:', result);
            throw new Error(result.error || result.details?.message || 'Failed to send email');
        }
    }

    const previewData = getPreviewContent();

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Email Center</h1>
                <p style={{ color: 'var(--text-muted)' }}>Communicate with your participants.</p>
            </header>

            <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 350px' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0 }}>Compose Email</h3>
                        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <button
                                className={`btn btn-sm ${!showPreview ? 'btn-white shadow-sm' : 'btn-ghost'}`}
                                onClick={() => setShowPreview(false)}
                            >
                                Edit
                            </button>
                            <button
                                className={`btn btn-sm ${showPreview ? 'btn-white shadow-sm' : 'btn-ghost'}`}
                                onClick={() => setShowPreview(true)}
                            >
                                Preview
                            </button>
                        </div>
                    </div>

                    {!showPreview ? (
                        <div className="flex-column" style={{ gap: '20px' }}>
                            {/* Recipient Selection */}
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
                                        <Users size={18} /> Valid Participants (By Exam)
                                    </button>
                                </div>
                            </div>

                            {recipientType === 'single' && (
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                checked={singleRecipientMode === 'manual'}
                                                onChange={() => setSingleRecipientMode('manual')}
                                            />
                                            Manual Entry
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                checked={singleRecipientMode === 'exist'}
                                                onChange={() => setSingleRecipientMode('exist')}
                                            />
                                            Select Participant
                                        </label>
                                    </div>

                                    {singleRecipientMode === 'manual' ? (
                                        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Email Address</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@example.com"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Participant Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={participantName}
                                                    onChange={(e) => setParticipantName(e.target.value)}
                                                    placeholder="John Doe"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Search & Select Participant</label>
                                            <select
                                                value={selectedParticipantId}
                                                onChange={(e) => handleParticipantSelect(e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                            >
                                                <option value="">-- Select Participant --</option>
                                                {participants.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.full_name} ({p.email}) - {p.exams?.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {recipientType === 'bulk' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>Select Exam Group</label>
                                    <select
                                        value={selectedExamId}
                                        onChange={(e) => setSelectedExamId(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="">-- Choose an Exam --</option>
                                        {exams.map(ex => (
                                            <option key={ex.id} value={ex.id}>{ex.title}</option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        This will send an email to ALL participants registered for this exam.
                                    </p>
                                </div>
                            )}

                            {/* Templates */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Use a Template</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {templates.map(t => (
                                        <button
                                            key={t.name}
                                            className="btn btn-ghost"
                                            onClick={() => applyTemplate(t)}
                                            style={{ fontSize: '0.85rem', padding: '8px 12px', border: '1px solid var(--border)' }}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ display: 'block' }}>Message Body</label>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Protip: Click variables on right to insert</span>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your message here..."
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '200px', fontFamily: 'monospace' }}
                                />
                            </div>

                            <button className="btn btn-primary" onClick={handleSend} disabled={sending} style={{ padding: '16px' }}>
                                <Send size={20} /> {sending ? 'Sending...' : 'Send Message Now'}
                            </button>
                        </div>
                    ) : (
                        // PREVIEW MODE
                        <div className="fade-in">
                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>To:</span>
                                    <span style={{ fontWeight: '500' }}>
                                        {recipientType === 'single' ? (email || '(No email entered)') : `All Participants of ${exams.find(e => e.id === selectedExamId)?.title || '...'}`}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Subject:</span>
                                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{previewData.subject}</h2>
                                </div>

                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155' }}>
                                    {previewData.body}
                                </div>

                                <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#94a3b8' }}>
                                    <em>This is a preview of how the email will look to the recipient. Variable {`{{link}}`} is shown as a sample URL.</em>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
                                    <Send size={20} /> Looks Good, Send It
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <aside>
                    <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', gap: '12px', color: '#1d4ed8', marginBottom: '16px' }}>
                            <Info size={24} />
                            <h4 style={{ margin: 0 }}>Smart Variables</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#3b82f6', marginBottom: '20px' }}>
                            Click to insert into your message. They will be replaced with real data.
                        </p>
                        <div className="flex-column" style={{ gap: '12px' }}>
                            <TemplateVar varName="{{name}}" description="Participant's full name" onClick={() => insertVariable('{{name}}')} />
                            <TemplateVar varName="{{score}}" description="The exam score (e.g. 85)" onClick={() => insertVariable('{{score}}')} />
                            <TemplateVar varName="{{exam_name}}" description="Title of the exam" onClick={() => insertVariable('{{exam_name}}')} />
                            <TemplateVar varName="{{link}}" description="Link to Dashboard/Test" onClick={() => insertVariable('{{link}}')} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function TemplateVar({ varName, description, onClick }: { varName: string, description: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem',
                cursor: 'pointer', padding: '8px', borderRadius: '4px',
                transition: 'background 0.2s', alignItems: 'center'
            }}
            className="hover:bg-blue-100"
        >
            <code style={{ background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe', color: '#2563eb', fontWeight: 'bold' }}>{varName}</code>
            <span style={{ color: '#60a5fa', fontSize: '0.8rem', textAlign: 'right', maxWidth: '120px' }}>{description}</span>
        </div>
    );
}
