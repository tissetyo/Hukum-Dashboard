'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Mail, ShieldCheck, ChevronRight } from 'lucide-react';

export default function RegisterExamPage() {
    const { id } = useParams();
    const router = useRouter();
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        fetchExam();
    }, [id]);

    async function fetchExam() {
        const { data } = await supabase.from('exams').select('*').eq('id', id).single();
        if (data) setExam(data);
        setLoading(false);
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const { data, error } = await supabase
            .from('participants')
            .insert([{
                exam_id: id,
                full_name: formData.name,
                email: formData.email,
                access_token: token,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                alert('This email is already registered for this exam.');
            } else {
                alert('Registration failed: ' + error.message);
            }
            setSubmitting(false);
        } else {
            router.push(`/test/${token}`);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
    if (!exam) return <div className="flex-center" style={{ height: '100vh' }}>Exam not found.</div>;

    return (
        <div className="flex-center fade-in" style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Exam Registration</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{exam.title}</p>
                </div>

                <form onSubmit={handleRegister} className="flex-column" style={{ gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your full name"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                        <h4 style={{ marginBottom: '4px' }}>Test Duration: {exam.duration} Minutes</h4>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Once you start, the timer cannot be paused.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                    >
                        {submitting ? 'Registering...' : 'Complete Registration'} <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Powered by Legal Certification Dashboard
                </p>
            </div>
        </div>
    );
}
