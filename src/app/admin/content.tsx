'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Users, FileText, CheckCircle, TrendingUp, Plus, PieChart,
    Mail, BookOpen, ArrowRight, Clock, CalendarDays, BarChart3,
    Sparkles, FileEdit, Zap
} from 'lucide-react';


export default function AdminDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [stats, setStats] = useState({
        activeTests: 0,
        participants: 0,
        graded: 0,
        avgScore: 0
    });
    const [recentSubs, setRecentSubs] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Quick Draft
    const [draftTitle, setDraftTitle] = useState('');
    const [draftDuration, setDraftDuration] = useState('60');
    const [creatingDraft, setCreatingDraft] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            setLoading(true);

            const { count: examCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
            const { count: participantCount } = await supabase.from('participants').select('*', { count: 'exact', head: true });
            const { count: gradedCount } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('status', 'graded');

            const { data: scoreData } = await supabase.from('participants').select('score').not('score', 'is', null);
            let avg = 0;
            if (scoreData && scoreData.length > 0) {
                const total = scoreData.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
                avg = Math.round(total / scoreData.length);
            }

            setStats({
                activeTests: examCount || 0,
                participants: participantCount || 0,
                graded: gradedCount || 0,
                avgScore: avg
            });

            const { data: recents } = await supabase
                .from('participants')
                .select('*, exams(title)')
                .order('created_at', { ascending: false })
                .limit(5);
            if (recents) setRecentSubs(recents);

            const { data: examList } = await supabase
                .from('exams')
                .select('*, participants(id)')
                .order('created_at', { ascending: false })
                .limit(8);
            if (examList) setExams(examList);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateDraft = async () => {
        if (!draftTitle.trim()) return;
        setCreatingDraft(true);
        try {
            const { data, error } = await supabase.from('exams').insert([{
                title: draftTitle.trim(),
                duration: parseInt(draftDuration) || 60,
                description: '',
            }]).select().single();

            if (error) throw error;
            if (data) {
                router.push(`/admin/exams/${data.id}`);
            }
        } catch (e: any) {
            alert('Error creating draft: ' + e.message);
        } finally {
            setCreatingDraft(false);
        }
    };

    const statusColors: Record<string, string> = {
        'pending': '#f59e0b',
        'graded': '#10b981',
        'in_progress': '#3b82f6',
        'completed': '#3b82f6'
    };

    const statusLabels: Record<string, string> = {
        'pending': 'Pending',
        'graded': 'Graded',
        'in_progress': 'In Progress',
        'completed': 'Completed'
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <header style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={24} color="var(--primary)" />
                            Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Selamat datang! Berikut ringkasan sistem sertifikasi hukum Anda.</p>
                    </div>
                    <Link href="/admin/exams/new" className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} /> Buat Ujian Baru
                    </Link>
                </div>
            </header>

            {/* Stats Row — uses .dash-stats from globals.css */}
            <div className="dash-stats" style={{ marginBottom: '24px' }}>
                <StatCard icon={<FileText size={20} />} label="Total Ujian" value={stats.activeTests.toString()} color="#8b5cf6" trend="+aktif" />
                <StatCard icon={<Users size={20} />} label="Total Peserta" value={stats.participants.toString()} color="#3b82f6" trend="terdaftar" />
                <StatCard icon={<CheckCircle size={20} />} label="Sudah Dinilai" value={stats.graded.toString()} color="#10b981" trend="peserta" />
                <StatCard icon={<BarChart3 size={20} />} label="Rata-rata Skor" value={`${stats.avgScore}%`} color="#f59e0b" trend="overall" />
            </div>

            {/* Row 2: Test History + Quick Draft — uses .dash-row */}
            <div className="dash-row" style={{ marginBottom: '24px' }}>
                {/* Test History */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            <CalendarDays size={18} color="var(--primary)" />
                            Riwayat Ujian
                        </h3>
                        <Link href="/admin/exams" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Lihat Semua <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Memuat data...</p>
                    ) : exams.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            <FileText size={32} strokeWidth={1.2} />
                            <p style={{ marginTop: '8px' }}>Belum ada ujian. Buat ujian pertama Anda!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {exams.map((exam, i) => (
                                <Link
                                    key={exam.id}
                                    href={`/admin/exams/${exam.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 8px',
                                        borderBottom: i < exams.length - 1 ? '1px solid var(--border)' : 'none',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        borderRadius: '8px',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface, #f8fafc)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, border: '2px solid white', boxShadow: '0 0 0 2px var(--primary)' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={11} /> {exam.duration}m</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Users size={11} /> {exam.participants?.length || 0} peserta</span>
                                            <span>{new Date(exam.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Draft */}
                <div className="card" style={{
                    padding: '24px',
                    background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
                    border: '1px dashed var(--border)',
                }}>
                    <h3 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <Zap size={18} color="#f59e0b" />
                        Quick Draft
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 18px' }}>
                        Buat ujian baru dengan cepat
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Judul ujian..."
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                fontSize: '0.88rem',
                                background: 'white',
                                boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="number"
                                    placeholder="60"
                                    value={draftDuration}
                                    onChange={(e) => setDraftDuration(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 30px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.88rem',
                                        background: 'white',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>menit</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateDraft}
                            disabled={creatingDraft || !draftTitle.trim()}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', marginTop: '4px' }}
                        >
                            <FileEdit size={16} />
                            {creatingDraft ? 'Membuat...' : 'Buat & Edit'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 3: Recent Activity + Quick Access */}
            <div className="dash-row">
                {/* Recent Activity */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            <TrendingUp size={18} color="#10b981" />
                            Aktivitas Terbaru
                        </h3>
                        <Link href="/admin/participants" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Semua Peserta <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Memuat...</p>
                    ) : recentSubs.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Belum ada aktivitas.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {recentSubs.map((sub, i) => {
                                const color = statusColors[sub.status] || '#94a3b8';
                                const label = statusLabels[sub.status] || sub.status;
                                return (
                                    <div key={sub.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 8px',
                                        borderBottom: i < recentSubs.length - 1 ? '1px solid var(--border)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: `${color}18`, color: color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '700', fontSize: '0.82rem', flexShrink: 0,
                                        }}>
                                            {sub.full_name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.full_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.exams?.title || 'Unknown'}</span>
                                                <span>•</span>
                                                <span style={{ whiteSpace: 'nowrap' }}>{new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '3px 8px', borderRadius: '999px',
                                            background: `${color}15`, color: color, fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
                                        }}>
                                            {label}
                                        </span>
                                        <Link
                                            href={`/admin/responses/${sub.exam_id}`}
                                            style={{ color: 'var(--text-muted)', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color 0.15s', flexShrink: 0 }}
                                            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Access */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <Sparkles size={18} color="var(--primary)" />
                        Akses Cepat
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <QuickBtn href="/admin/exams" icon={<FileText size={18} />} label="Ujian" color="#8b5cf6" />
                        <QuickBtn href="/admin/exams/new" icon={<Plus size={18} />} label="Buat Baru" color="#10b981" />
                        <QuickBtn href="/admin/participants" icon={<Users size={18} />} label="Peserta" color="#3b82f6" />
                        <QuickBtn href="/admin/responses" icon={<PieChart size={18} />} label="Jawaban" color="#f59e0b" />
                        <QuickBtn href="/admin/emails" icon={<Mail size={18} />} label="Email" color="#ec4899" />
                        <QuickBtn href="/admin/docs" icon={<BookOpen size={18} />} label="Docs" color="#06b6d4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ────── Sub-components ────── */

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: string; color: string; trend: string }) {
    return (
        <div className="card" style={{
            padding: '20px',
            borderLeft: `3px solid ${color}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
        }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '8px', background: `${color}12`, borderRadius: '8px', color: color, display: 'flex' }}>{icon}</div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>{trend}</div>
        </div>
    );
}

function QuickBtn({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
    return (
        <Link href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            padding: '14px 8px', borderRadius: '10px', border: '1px solid var(--border)',
            textDecoration: 'none', color: 'var(--text)', fontSize: '0.78rem', fontWeight: '500', transition: 'all 0.2s',
        }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ color }}>{icon}</div>
            {label}
        </Link>
    );
}
