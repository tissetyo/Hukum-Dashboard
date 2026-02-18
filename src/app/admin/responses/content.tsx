'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileText, ChevronRight, PieChart, MousePointerClick, Eye, Download } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import PageHelp from '@/components/admin/PageHelp';
import WorkflowModal, { WorkflowStep } from '@/components/admin/WorkflowModal';

export default function ResponsesPage() {
    const supabase = createClient();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWorkflow, setShowWorkflow] = useState(false);

    const workflowSteps: WorkflowStep[] = [
        { icon: <MousePointerClick size={22} />, title: 'Pilih Ujian', description: 'Pilih ujian dari daftar di bawah untuk melihat semua jawaban peserta yang sudah dikumpulkan.' },
        { icon: <Eye size={22} />, title: 'Lihat Detail Jawaban', description: 'Klik "View Results" untuk melihat jawaban setiap peserta secara rinci, termasuk skor dan waktu pengumpulan.' },
        { icon: <Download size={22} />, title: 'Download Hasil', description: 'Gunakan fitur export di halaman detail untuk mengunduh jawaban dalam format PDF atau CSV.' },
    ];

    useEffect(() => {
        fetchExams();
    }, []);

    async function fetchExams() {
        setLoading(true);
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setExams(data);
        setLoading(false);
    }

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Responses & Results</h1>
                <p style={{ color: 'var(--text-muted)' }}>Select a test to view all participant responses and grades.</p>
            </header>

            <PageHelp
                description="Halaman ini menampilkan semua ujian yang tersedia. Pilih ujian untuk melihat jawaban dan nilai peserta secara detail."
                tips={[
                    { text: 'Gunakan search untuk mencari ujian tertentu' },
                    { text: 'Klik "View Results" untuk masuk ke halaman detail' },
                    { text: 'Jawaban bisa diunduh dalam format PDF per peserta' },
                ]}
                onOpenWorkflow={() => setShowWorkflow(true)}
            />

            <WorkflowModal
                title="Cara Melihat Jawaban Peserta"
                steps={workflowSteps}
                open={showWorkflow}
                onClose={() => setShowWorkflow(false)}
            />

            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--background)'
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                ) : exams.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <PieChart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p>No tests found.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px 24px' }}>Test Title</th>
                                <th style={{ padding: '16px 24px' }}>Created</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((exam) => (
                                <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileText size={18} className="text-muted" />
                                            {exam.title}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {new Date(exam.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <Link href={`/admin/responses/${exam.id}`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            View Results <ChevronRight size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
