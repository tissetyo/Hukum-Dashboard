'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Mail, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
            <aside className="sidebar" style={{
                width: '260px',
                background: 'var(--primary)',
                color: 'white',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
            }}>
                <div className="logo" style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                    Hukum<span style={{ color: 'var(--secondary)' }}>Admin</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <AdminNavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <AdminNavLink href="/admin/exams" icon={<FileText size={20} />} label="Manage Tests" />
                    <AdminNavLink href="/admin/participants" icon={<Users size={20} />} label="Participants" />
                    <AdminNavLink href="/admin/emails" icon={<Mail size={20} />} label="Email Center" />
                    <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>
            </aside>

            <main style={{ flex: 1, padding: '40px', backgroundColor: 'var(--background)' }}>
                {children}
            </main>


        </div>
    );
}

function AdminNavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link href={href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
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
