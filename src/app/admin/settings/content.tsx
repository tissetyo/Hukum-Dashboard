'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Palette, UserPlus, Shield, Upload, Check, Trash2,
    Eye, EyeOff, Save, Image as ImageIcon
} from 'lucide-react';

const COLOR_PRESETS = [
    { name: 'Merah Tua (Default)', value: '#8A151B' },
    { name: 'Biru Navy', value: '#1e3a5f' },
    { name: 'Hijau Tua', value: '#166534' },
    { name: 'Ungu', value: '#5b21b6' },
    { name: 'Abu Gelap', value: '#1f2937' },
    { name: 'Teal', value: '#0f766e' },
    { name: 'Indigo', value: '#3730a3' },
    { name: 'Coklat', value: '#78350f' },
];

type Tab = 'branding' | 'admins';

export default function SettingsPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<Tab>('branding');

    // Branding state
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState('#8A151B');
    const [customColor, setCustomColor] = useState('');
    const [savingBranding, setSavingBranding] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Admin state
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'admins') fetchAdmins();
    }, [activeTab]);

    async function loadSettings() {
        try {
            const { data } = await supabase.from('app_settings').select('*').limit(1).single();
            if (data) {
                setSelectedColor(data.primary_color || '#8A151B');
                if (data.logo_url) setLogoPreview(data.logo_url);
            }
        } catch {
            // table might not exist yet
        }
    }

    async function handleLogoUpload() {
        if (!logoFile) return;
        setUploadingLogo(true);
        try {
            const ext = logoFile.name.split('.').pop();
            const fileName = `logo_${Date.now()}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from('branding')
                .upload(fileName, logoFile, { upsert: true });
            if (upErr) throw upErr;

            const { data: { publicUrl } } = supabase.storage
                .from('branding')
                .getPublicUrl(fileName);

            // Upsert settings
            const { data: existing } = await supabase.from('app_settings').select('id').limit(1).single();
            if (existing) {
                await supabase.from('app_settings').update({ logo_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', existing.id);
            } else {
                await supabase.from('app_settings').insert([{ logo_url: publicUrl }]);
            }

            setLogoPreview(publicUrl);
            setLogoFile(null);
            alert('Logo berhasil diupload!');
        } catch (e: any) {
            alert('Upload gagal: ' + e.message);
        } finally {
            setUploadingLogo(false);
        }
    }

    async function handleSaveColor() {
        setSavingBranding(true);
        const color = customColor || selectedColor;
        try {
            const { data: existing } = await supabase.from('app_settings').select('id').limit(1).single();
            if (existing) {
                await supabase.from('app_settings').update({ primary_color: color, updated_at: new Date().toISOString() }).eq('id', existing.id);
            } else {
                await supabase.from('app_settings').insert([{ primary_color: color }]);
            }
            setSelectedColor(color);
            // Apply immediately
            document.documentElement.style.setProperty('--primary', color);
            alert('Warna tema berhasil disimpan!');
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setSavingBranding(false);
        }
    }

    async function fetchAdmins() {
        setLoadingAdmins(true);
        try {
            const res = await fetch('/api/admin/list');
            if (res.ok) {
                const data = await res.json();
                setAdmins(data.users || []);
            }
        } catch {
            // silently fail
        } finally {
            setLoadingAdmins(false);
        }
    }

    async function handleCreateAdmin() {
        if (!newEmail || !newPassword) {
            alert('Masukkan email dan password');
            return;
        }
        if (newPassword.length < 6) {
            alert('Password minimal 6 karakter');
            return;
        }
        setCreatingAdmin(true);
        try {
            const res = await fetch('/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail, password: newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal membuat admin');
            alert('Admin baru berhasil dibuat!');
            setNewEmail('');
            setNewPassword('');
            fetchAdmins();
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setCreatingAdmin(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontSize: '0.88rem',
        background: 'white',
        boxSizing: 'border-box' as const,
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '28px',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.82rem',
        fontWeight: '600',
        color: 'var(--text)',
        marginBottom: '6px',
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Pengaturan</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Kelola branding, tema, dan akun admin.</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                <TabButton active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<Palette size={16} />} label="Branding & Tema" />
                <TabButton active={activeTab === 'admins'} onClick={() => setActiveTab('admins')} icon={<Shield size={16} />} label="Admin" />
            </div>

            {/* ── Branding Tab ── */}
            {activeTab === 'branding' && (
                <div style={{ maxWidth: '640px' }}>
                    {/* Logo Upload */}
                    <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ImageIcon size={18} color="var(--primary)" /> Logo
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 16px' }}>Upload logo organisasi Anda</p>

                        {logoPreview && (
                            <div style={{
                                marginBottom: '14px',
                                padding: '16px',
                                background: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                                <img src={logoPreview} alt="Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                                background: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
                            }}>
                                <Upload size={14} />
                                {logoFile ? logoFile.name : 'Pilih File'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setLogoFile(f);
                                            setLogoPreview(URL.createObjectURL(f));
                                        }
                                    }}
                                />
                            </label>
                            {logoFile && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleLogoUpload}
                                    disabled={uploadingLogo}
                                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                                >
                                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Color Theme */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Palette size={18} color="var(--primary)" /> Warna Tema
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 16px' }}>Pilih warna utama untuk dashboard</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                            {COLOR_PRESETS.map(cp => (
                                <button
                                    key={cp.value}
                                    onClick={() => { setSelectedColor(cp.value); setCustomColor(''); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 12px', borderRadius: '8px',
                                        border: selectedColor === cp.value && !customColor ? `2px solid ${cp.value}` : '1px solid var(--border)',
                                        background: selectedColor === cp.value && !customColor ? `${cp.value}08` : 'white',
                                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: '500', textAlign: 'left',
                                    }}
                                >
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: cp.value, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {selectedColor === cp.value && !customColor && <Check size={14} color="white" />}
                                    </div>
                                    {cp.name}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Atau masukkan kode warna kustom</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={customColor || selectedColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                                />
                                <input
                                    type="text"
                                    placeholder="#8A151B"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    style={{ ...inputStyle, maxWidth: '180px' }}
                                />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleSaveColor}
                            disabled={savingBranding}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Save size={16} />
                            {savingBranding ? 'Menyimpan...' : 'Simpan Warna'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Admin Tab ── */}
            {activeTab === 'admins' && (
                <div style={{ maxWidth: '640px' }}>
                    {/* Add admin */}
                    <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserPlus size={18} color="var(--primary)" /> Tambah Admin Baru
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 16px' }}>Buat akun admin baru untuk mengakses dashboard</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" placeholder="admin@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimal 6 karakter"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '40px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateAdmin}
                                disabled={creatingAdmin}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
                            >
                                <UserPlus size={16} />
                                {creatingAdmin ? 'Membuat...' : 'Buat Admin'}
                            </button>
                        </div>
                    </div>

                    {/* Admin List */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} color="var(--primary)" /> Daftar Admin
                        </h3>

                        {loadingAdmins ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Memuat...</p>
                        ) : admins.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Belum ada data admin. Pastikan API route dan service role key sudah dikonfigurasi.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {admins.map((admin, i) => (
                                    <div key={admin.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 8px',
                                        borderBottom: i < admins.length - 1 ? '1px solid var(--border)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: '#8b5cf618', color: '#8b5cf6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '700', fontSize: '0.82rem', flexShrink: 0,
                                        }}>
                                            {admin.email?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.email}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                Dibuat: {new Date(admin.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '3px 8px', borderRadius: '999px',
                                            background: '#10b98115', color: '#10b981', fontWeight: '600',
                                        }}>
                                            Admin
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', border: 'none', background: 'none',
                fontSize: '0.85rem', fontWeight: active ? '600' : '500',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s',
                marginBottom: '-1px',
            }}
        >
            {icon}
            {label}
        </button>
    );
}
