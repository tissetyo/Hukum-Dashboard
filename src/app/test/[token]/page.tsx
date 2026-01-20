'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, Shield, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QuestionInput from '@/components/QuestionInput';
import { clsx } from 'clsx';

export default function ExamEnginePage() {
    const { token } = useParams();
    const router = useRouter();

    const [participant, setParticipant] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchExamData();
    }, [token]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !submitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => (prev !== null ? prev - 1 : 0));
            }, 1000);
        } else if (timeLeft === 0 && !submitted) {
            handleSubmit();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, submitted]);

    async function fetchExamData() {
        setLoading(true);
        // 1. Fetch Participant
        const { data: partData, error: partError } = await supabase
            .from('participants')
            .select('*, exams(*)')
            .eq('access_token', token)
            .single();

        if (partError || !partData) {
            alert('Invalid or expired link.');
            setLoading(false);
            return;
        }

        setParticipant(partData);
        setExam(partData.exams);

        // 2. Fetch Questions
        const { data: questData } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', partData.exam_id)
            .order('order', { ascending: true });

        if (questData) setQuestions(questData);

        // 3. Initialize Timer
        if (partData.status === 'in_progress' && partData.start_time) {
            const startTime = new Date(partData.start_time).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = (partData.exams.duration * 60) - elapsed;
            setTimeLeft(remaining > 0 ? remaining : 0);
        } else if (partData.status === 'completed' || partData.status === 'graded') {
            setSubmitted(true);
        }

        setLoading(false);
    }

    const startExam = async () => {
        const startTime = new Date().toISOString();
        const { error } = await supabase
            .from('participants')
            .update({ status: 'in_progress', start_time: startTime })
            .eq('id', participant.id);

        if (!error) {
            setParticipant({ ...participant, status: 'in_progress', start_time: startTime });
            setTimeLeft(exam.duration * 60);
        }
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (submitted) return;
        setSubmitted(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const { error: subError } = await supabase
                .from('submissions')
                .insert([{
                    participant_id: participant.id,
                    answers,
                    submitted_at: new Date().toISOString()
                }]);

            if (subError) throw subError;

            await supabase
                .from('participants')
                .update({ status: 'completed', end_time: new Date().toISOString() })
                .eq('id', participant.id);

        } catch (err: any) {
            console.error('Submission error:', err);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading Exam Session...</div>;

    if (submitted) {
        return (
            <div className="flex-center fade-in" style={{ height: '100vh', flexDirection: 'column', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '500px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Test Submitted Successfully!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your answers have been saved. Your results will be available in your dashboard once the administrator has graded your test.</p>
                    <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Go to My Dashboard</button>
                </div>
            </div>
        );
    }

    if (participant.status === 'pending') {
        return (
            <div className="flex-center fade-in" style={{ height: '100vh', flexDirection: 'column', textAlign: 'center', background: 'var(--background)' }}>
                <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
                    <div style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'var(--secondary)', fontWeight: '700' }}>Legal Certification Platform</div>
                    <h1 style={{ marginBottom: '12px' }}>{exam.title}</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Welcome to the certification test. Please verify and complete your details before starting.</p>

                    <div className="flex-column" style={{ gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: '500' }}>Full Name</label>
                            <input
                                type="text"
                                value={participant.full_name}
                                onChange={(e) => setParticipant({ ...participant, full_name: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
                            <input
                                type="email"
                                value={participant.email}
                                onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: '500' }}>Other Details (ID Number, Firm, etc.)</label>
                            <textarea
                                value={participant.details?.info || ''}
                                onChange={(e) => setParticipant({ ...participant, details: { ...participant.details, info: e.target.value } })}
                                placeholder="Enter any additional required information..."
                                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', minHeight: '80px' }}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.02)', marginBottom: '32px' }}>
                        <h4 style={{ marginBottom: '8px' }}>Test Rules:</h4>
                        <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Total duration: <strong>{exam.duration} minutes</strong></li>
                            <li>Timer cannot be paused once started.</li>
                            <li>System will auto-submit when time expires.</li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px' }}
                        onClick={async () => {
                            if (!participant.full_name || !participant.email) {
                                alert('Please fill in your name and email.');
                                return;
                            }
                            // Save details and start
                            const startTime = new Date().toISOString();
                            const { error } = await supabase
                                .from('participants')
                                .update({
                                    full_name: participant.full_name,
                                    email: participant.email,
                                    details: participant.details,
                                    status: 'in_progress',
                                    start_time: startTime
                                })
                                .eq('id', participant.id);

                            if (!error) {
                                setParticipant({ ...participant, status: 'in_progress', start_time: startTime });
                                setTimeLeft(exam.duration * 60);
                            }
                        }}
                    >
                        Confirm Details & Start Examination
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                padding: '20px 40px',
                background: 'white',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{exam.title}</div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: timeLeft && timeLeft < 300 ? '#fee2e2' : 'var(--background)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius)',
                    color: timeLeft && timeLeft < 300 ? '#ef4444' : 'var(--text)',
                    fontWeight: '700',
                    transition: 'all 0.3s ease'
                }}>
                    <Clock size={20} />
                    <span>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
                </div>
            </header>

            <main style={{ flex: 1, padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                {exam.settings.layout_type === 'slideshow' ? (
                    <div className="fade-in">
                        <div className="premium-card">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Question {currentSlide + 1} of {questions.length}</span>
                            <h3 style={{ margin: '16px 0 24px 0' }}>{questions[currentSlide]?.content}</h3>

                            <QuestionInput
                                question={questions[currentSlide]}
                                value={answers[questions[currentSlide]?.id] || ''}
                                onChange={(val) => handleAnswerChange(questions[currentSlide].id, val)}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                disabled={currentSlide === 0}
                            >
                                <ChevronLeft /> Previous
                            </button>

                            {currentSlide === questions.length - 1 ? (
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    Submit Final Answers <Send size={18} />
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={() => setCurrentSlide(prev => Math.min(questions.length - 1, prev + 1))}>
                                    Next Question <ChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="fade-in flex-column" style={{ gap: '32px' }}>
                        {questions.map((q, i) => (
                            <div key={q.id} className="premium-card">
                                <h4 style={{ marginBottom: '16px' }}>{i + 1}. {q.content}</h4>
                                <QuestionInput
                                    question={q}
                                    value={answers[q.id] || ''}
                                    onChange={(val) => handleAnswerChange(q.id, val)}
                                />
                            </div>
                        ))}
                        <button className="btn btn-primary" style={{ padding: '20px', fontSize: '1.1rem' }} onClick={handleSubmit}>
                            Submit All Answers
                        </button>
                    </div>
                )}
            </main>

            {timeLeft !== null && timeLeft < 60 && !submitted && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: '#ef4444',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'pulse 1s infinite'
                }}>
                    <AlertTriangle size={20} />
                    <strong>Less than 1 minute remaining!</strong>
                </div>
            )}

            <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
        </div>
    );
}


