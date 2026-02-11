'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, Info, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function EmailCenterPage() {
    const supabase = createClient();
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
                // For single email, we can't easily replace {{score}} or {{link}} dynamically without context
                // So we'll send as is, or warn user. 
                // However, for better UX, if they put an email that matches a participant, we could look it up.
                // For now, let's just send basic replacements.
                if (!email) throw new Error('Recipient email is required');
                await sendEmail(email, 'Participant', message, subject);
                successCount++;
            } else {
                if (!selectedExamId) throw new Error('Please select an exam to email all participants');

                // Fetch participants AND exam details
                const { data: parts } = await supabase
                    .from('participants')
                    .select('*, exams(title)')
                    .eq('exam_id', selectedExamId);

                if (parts && parts.length > 0) {
                    for (const p of parts) {
                        try {
                            // Prepare specific variables
                            const examTitle = p.exams?.title || 'Exam';
                            // Determine link based on status
                            const baseUrl = window.location.origin;
                            let link = `${baseUrl}/test/${p.access_token}`; // Default to test link
                            if (p.status === 'graded' || p.status === 'completed') {
                                link = `${baseUrl}/dashboard/${p.access_token}`; // Result link
                            }

                            // Replace variables
                            let finalSubject = subject.replace(/{{exam_name}}/g, examTitle);

                            let finalBody = message
                                .replace(/{{name}}/g, p.full_name)
                                .replace(/{{score}}/g, p.score !== null ? p.score : 'N/A')
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
                setMessage('');
                setSubject('');
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
                                    <Users size={18} /> Valid Participants (By Exam)
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Use a Template</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {templates.map(t => (
                                    <button
                                        key={t.name}
                                        className="btn btn-ghost"
                                        onClick={() => applyTemplate(t)}
                                        style={{ fontSize: '0.85rem', padding: '8px 12px' }}
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
                            <label style={{ display: 'block', marginBottom: '8px' }}>Message Body</label>
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
                </div>

                <aside>
                    <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', gap: '12px', color: '#1d4ed8', marginBottom: '16px' }}>
                            <Info size={24} />
                            <h4 style={{ margin: 0 }}>Smart Variables</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#3b82f6', marginBottom: '20px' }}>
                            Use these variables in your subject or body. They will be automatically replaced for each participant.
                        </p>
                        <div className="flex-column" style={{ gap: '12px' }}>
                            <TemplateVar varName="{{name}}" description="Participant's full name" />
                            <TemplateVar varName="{{score}}" description="The exam score (e.g. 85)" />
                            <TemplateVar varName="{{exam_name}}" description="Title of the exam" />
                            <TemplateVar varName="{{link}}" description="Link to Dashboard (if graded) or Test (if new)" />
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
