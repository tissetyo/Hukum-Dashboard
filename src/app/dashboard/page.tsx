'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Shield, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Participant Portal | Indolaw',
};

export default function ParticipantLoginPage() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Find participant(s) with matching email and exact name
            // We use 'ilike' for case-insensitive matching if preferred, or 'eq' for exact.
            // Let's use 'ilike' for email and name to be user-friendly.
            const { data: participants, error: fetchError } = await supabase
                .from('participants')
                .select('*')
                .ilike('email', email.trim())
                .ilike('full_name', fullName.trim())
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            if (!participants || participants.length === 0) {
                setError('No participant found with these details. Please check your spelling.');
                setLoading(false);
                return;
            }

            // 2. Redirect to the most recent one
            const latest = participants[0];

            // Optional: You could list them if there are multiple, but for now we redirect to the latest.
            // If the status is pending, maybe they shouldn't be here? 
            // Usually dashboard is for results, but let's allow access.

            router.push(`/dashboard/${latest.access_token}`);

        } catch (err: any) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center fade-in" style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff',
                        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px auto'
                    }}>
                        <Shield size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Participant Portal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your details to view your exam results and history.</p>
                </div>

                <form onSubmit={handleLogin} className="flex-column" style={{ gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Full Name (as registered)</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '12px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', marginTop: '8px', justifyContent: 'center' }}
                    >
                        {loading ? 'Verifying...' : (
                            <>Access Dashboard <ArrowRight size={18} /></>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; Back to Home</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
