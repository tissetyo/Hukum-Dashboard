'use client';

import React from 'react';

export default function SettingsPage() {
    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your account and application preferences.</p>
            </header>

            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>Settings configuration coming soon...</p>
            </div>
        </div>
    );
}
