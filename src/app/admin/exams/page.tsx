'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, FileText, Download, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { exportExamToPDF } from '@/lib/pdf';

export default function ExamsListPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Tests</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create and manage certification exams.</p>
                </div>
                <Link href="/admin/exams/new" className="btn btn-primary">
                    <Plus size={20} /> Create New Test
                </Link>
            </header>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
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
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading exams...</div>
                ) : exams.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p>No tests created yet. Click "Create New Test" to get started.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px 24px' }}>Title</th>
                                <th style={{ padding: '16px 24px' }}>Duration</th>
                                <th style={{ padding: '16px 24px' }}>Participants</th>
                                <th style={{ padding: '16px 24px' }}>Created</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((exam) => (
                                <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600' }}>{exam.title}</td>
                                    <td style={{ padding: '16px 24px' }}>{exam.duration} mins</td>
                                    <td style={{ padding: '16px 24px' }}>0</td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {new Date(exam.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: '8px', color: 'var(--primary)' }}
                                                title="Copy Registration Link"
                                                onClick={() => {
                                                    const link = `${window.location.origin}/register/${exam.id}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert('Registration link copied to clipboard!');
                                                }}
                                            >
                                                <Share2 size={18} />
                                            </button>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: '8px' }}
                                                title="Export to PDF"
                                                onClick={async () => {
                                                    const { data: qs } = await supabase
                                                        .from('questions')
                                                        .select('*')
                                                        .eq('exam_id', exam.id)
                                                        .order('order', { ascending: true });
                                                    if (qs) exportExamToPDF(exam, qs);
                                                }}
                                            >
                                                <Download size={18} />
                                            </button>
                                            <Link href={`/register/${exam.id}`} target="_blank" className="btn-ghost" style={{ padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Preview">
                                                <Eye size={18} />
                                            </Link>
                                            <Link href={`/admin/exams/${exam.id}`} className="btn-ghost" style={{ padding: '8px' }} title="Edit">
                                                <Edit size={18} />
                                            </Link>
                                            <button className="btn-ghost" style={{ padding: '8px', color: '#ef4444' }} title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
