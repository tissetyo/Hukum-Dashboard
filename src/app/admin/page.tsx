import React from 'react';
import { supabase } from '@/lib/supabase';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = React.useState({
        activeTests: 0,
        participants: 0,
        graded: 0,
        avgScore: 0
    });
    const [recentSubs, setRecentSubs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            setLoading(true);

            // 1. Get Counts
            const { count: examCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
            const { count: participantCount } = await supabase.from('participants').select('*', { count: 'exact', head: true });
            const { count: gradedCount } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('status', 'graded');

            // 2. Average Score
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

            // 3. Recent Submissions
            const { data: recents } = await supabase
                .from('participants')
                .select('*, exams(title)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recents) setRecentSubs(recents);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Overview of your legal certification tests and participants.</p>
            </header>

            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '40px' }}>
                <StatCard icon={<FileText color="var(--primary)" />} label="Active Tests" value={stats.activeTests.toString()} />
                <StatCard icon={<Users color="#8b5cf6" />} label="Total Participants" value={stats.participants.toString()} />
                <StatCard icon={<CheckCircle color="#10b981" />} label="Graded Participants" value={stats.graded.toString()} />
                <StatCard icon={<TrendingUp color="#f59e0b" />} label="Avg. Score" value={`${stats.avgScore}%`} />
            </div>

            <div className="grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
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
                            {loading ? (
                                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>Loading data...</td></tr>
                            ) : recentSubs.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No recent activity.</td></tr>
                            ) : (
                                recentSubs.map((sub) => (
                                    <RecentRow
                                        key={sub.id}
                                        name={sub.full_name}
                                        test={sub.exams?.title || 'Unknown'}
                                        status={sub.status}
                                    />
                                ))
                            )}
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
    // Normalize status to match standard keys or just use what comes from DB if they match
    // DB usually has 'pending', 'graded', 'in_progress', 'completed'
    const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'graded': 'Graded',
        'in_progress': 'In Progress',
        'completed': 'Completed'
    };

    // Fallback if status is Capitalized or not in map
    const displayStatus = statusMap[status.toLowerCase()] || status;

    const statusColors: Record<string, string> = {
        'Pending': '#f59e0b',
        'Graded': '#10b981',
        'In Progress': '#3b82f6',
        'Completed': '#3b82f6',
        'completed': '#3b82f6'
    };

    // Normalize key lookup
    const color = statusColors[displayStatus] || statusColors['Pending'];

    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '12px 8px' }}>{name}</td>
            <td style={{ padding: '12px 8px' }}>{test}</td>
            <td style={{ padding: '12px 8px' }}>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: `${color}20`,
                    color: color,
                    fontWeight: '600'
                }}>
                    {displayStatus}
                </span>
            </td>
            <td style={{ padding: '12px 8px' }}>
                <button className="btn-ghost" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>View</button>
            </td>
        </tr>
    );
}
