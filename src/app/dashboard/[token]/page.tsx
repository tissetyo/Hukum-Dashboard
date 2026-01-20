'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Award, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { exportCertificatePDF } from '@/lib/pdf';

export default function UserDashboardPage() {
    const { token } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [token]);

    async function fetchDashboardData() {
        setLoading(true);
        const { data: partData } = await supabase
            .from('participants')
            .select('*, exams(*)')
            .eq('access_token', token)
            .single();

        if (partData) setData(partData);
        setLoading(false);
    }

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading Dashboard...</div>;
    if (!data) return <div className="flex-center" style={{ height: '100vh' }}>Access Denied.</div>;

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome, {data.full_name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Certification Progress & Results for <strong>{data.exams.title}</strong></p>
                </div>
                <div className="card" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>EXAM STATUS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{data.status.toUpperCase()}</div>
                </div>
            </header>

            <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '48px' }}>
                <div className="premium-card flex-column" style={{ justifyContent: 'space-between' }}>
                    <div>
                        <div className="flex" style={{ gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '10px', background: 'var(--background)', borderRadius: '12px' }}>
                                <Award size={24} color="var(--secondary)" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Final Score</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official certification result</p>
                            </div>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', margin: '20px 0' }}>
                            {data.score !== null ? `${data.score}%` : '--'}
                        </div>
                    </div>
                    {data.status === 'graded' && data.score >= 70 ? (
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <CheckCircle size={20} /> Certified Practitioner
                        </div>
                    ) : data.status === 'completed' ? (
                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} /> Waiting for Grading
                        </div>
                    ) : (
                        <div style={{ color: '#ef4444' }}>Not Certified Yet</div>
                    )}
                </div>

                <div className="premium-card">
                    <h3 style={{ marginBottom: '20px' }}>Documents & Materials</h3>
                    <div className="flex-column" style={{ gap: '12px' }}>
                        <DocRow
                            title="Certificate of Completion"
                            available={data.status === 'graded' && data.score >= 70}
                            icon={<Award size={18} />}
                            onDownload={() => exportCertificatePDF(data, data.exams)}
                        />
                        <DocRow title="Exam Summary PDF" available={data.status === 'graded'} icon={<FileText size={18} />} />
                        <DocRow title="Learning Materials" available={true} icon={<Download size={18} />} />
                    </div>
                </div>
            </div>

            <section>
                <h2 style={{ marginBottom: '24px' }}>Exam Timeline</h2>
                <div className="card">
                    <TimelineItem date={new Date(data.created_at).toLocaleDateString()} label="Registration Completed" active />
                    {data.start_time && <TimelineItem date={new Date(data.start_time).toLocaleString()} label="Test Started" active />}
                    {data.end_time && <TimelineItem date={new Date(data.end_time).toLocaleString()} label="Test Submitted" active />}
                    {data.status === 'graded' && <TimelineItem date="N/A" label="Grading Completed & Certificate Issued" active />}
                </div>
            </section>
        </div>
    );
}

function DocRow({ title, available, icon, onDownload }: { title: string, available: boolean, icon: React.ReactNode, onDownload?: () => void }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: 'var(--background)',
            borderRadius: 'var(--radius-sm)',
            opacity: available ? 1 : 0.5
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {icon}
                <span style={{ fontWeight: '500' }}>{title}</span>
            </div>
            <button
                className="btn-ghost"
                disabled={!available}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={onDownload}
            >
                Download
            </button>
        </div>
    );
}

function TimelineItem({ date, label, active }: { date: string, label: string, active: boolean }) {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '16px 0', borderBottom: '1px solid var(--border)', opacity: active ? 1 : 0.3 }}>
            <div style={{ minWidth: '150px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{date}</div>
            <div style={{ fontWeight: '600' }}>{label}</div>
        </div>
    );
}
