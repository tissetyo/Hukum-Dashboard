'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Mail, Settings, PieChart, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [signingOut, setSigningOut] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    async function handleSignOut() {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    }

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile hamburger */}
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'sidebar-open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} style={{
                width: '260px',
                background: 'var(--primary)',
                color: 'white',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="logo" style={{ background: '#FFDBDD', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                        <img src="/logo.png" alt="Indolaw Logo" style={{ height: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <AdminNavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setSidebarOpen(false)} />
                        <AdminNavLink href="/admin/exams" icon={<FileText size={20} />} label="Manage Tests" onClick={() => setSidebarOpen(false)} />
                        <AdminNavLink href="/admin/participants" icon={<Users size={20} />} label="Participants" onClick={() => setSidebarOpen(false)} />
                        <AdminNavLink href="/admin/responses" icon={<PieChart size={20} />} label="Responses" onClick={() => setSidebarOpen(false)} />
                        <AdminNavLink href="/admin/emails" icon={<Mail size={20} />} label="Email Center" onClick={() => setSidebarOpen(false)} />
                        <AdminNavLink href="/admin/docs" icon={<BookOpen size={20} />} label="Dokumentasi" onClick={() => setSidebarOpen(false)} />
                        <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" onClick={() => setSidebarOpen(false)} />
                    </nav>
                </div>

                <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: 'var(--radius)',
                        color: 'rgba(255, 255, 255, 0.7)', background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '0.95rem',
                        fontWeight: '500', cursor: signingOut ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease', width: '100%', opacity: signingOut ? 0.5 : 1,
                    }}
                    onMouseOver={(e) => {
                        if (!signingOut) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                            e.currentTarget.style.color = '#fca5a5';
                        }
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                >
                    <LogOut size={20} />
                    {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
            </aside>

            <main style={{ flex: 1, padding: '40px', backgroundColor: 'var(--background)', overflow: 'auto' }}>
                {children}
            </main>
        </div>
    );
}

function AdminNavLink({ href, icon, label, onClick }: { href: string, icon: React.ReactNode, label: string, onClick?: () => void }) {
    return (
        <Link href={href} onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: 'var(--radius)',
            color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none',
            fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s ease'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
        >
            {icon}
            {label}
        </Link>
    );
}
