import React from 'react';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Overview of your legal certification tests and participants.</p>
            </header>

            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '40px' }}>
                <StatCard icon={<FileText color="var(--primary)" />} label="Active Tests" value="12" />
                <StatCard icon={<Users color="#8b5cf6" />} label="Participants" value="1,240" />
                <StatCard icon={<CheckCircle color="#10b981" />} label="Graded" value="850" />
                <StatCard icon={<TrendingUp color="#f59e0b" />} label="Avg. Score" value="78%" />
            </div>

            <div className="grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Recent Submissions</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '12px 8px' }}>Name</th>
                                <th style={{ padding: '12px 8px' }}>Test</th>
                                <th style={{ padding: '12px 8px' }}>Status</th>
                                <th style={{ padding: '12px 8px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <RecentRow name="Budi Santoso" test="Ujian Advokat I" status="Pending" />
                            <RecentRow name="Siti Aminah" test="Sertifikasi Notaris" status="Graded" />
                            <RecentRow name="Dewi Lestari" test="Ujian Advokat I" status="In Progress" />
                        </tbody>
                    </table>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white' }}>
                    <h3>Quick Help</h3>
                    <p style={{ margin: '16px 0', opacity: 0.9 }}>Need help managing your tests or participants? Check our documentation or contact support.</p>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>View Docs</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="card flex-center" style={{ gap: '20px', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'var(--background)', borderRadius: '12px' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</div>
            </div>
        </div>
    );
}

function RecentRow({ name, test, status }: { name: string, test: string, status: string }) {
    const statusColors: Record<string, string> = {
        'Pending': '#f59e0b',
        'Graded': '#10b981',
        'In Progress': '#3b82f6'
    };

    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '12px 8px' }}>{name}</td>
            <td style={{ padding: '12px 8px' }}>{test}</td>
            <td style={{ padding: '12px 8px' }}>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: `${statusColors[status]}20`,
                    color: statusColors[status],
                    fontWeight: '600'
                }}>
                    {status}
                </span>
            </td>
            <td style={{ padding: '12px 8px' }}>
                <button className="btn-ghost" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>View</button>
            </td>
        </tr>
    );
}
