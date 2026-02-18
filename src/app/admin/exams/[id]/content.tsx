'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Plus, Trash2, Settings, Eye, Clock, Download, ExternalLink, Mail, CheckCircle, Upload, ToggleLeft, ToggleRight, Palette, Move, Type } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import QuestionEditor from '@/components/QuestionEditor';
import QuestionInput from '@/components/QuestionInput';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
import { exportCertificatePDF } from '@/lib/pdf';

export default function ExamDetailsPage() {
    const supabase = createClient();
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'questions' | 'responses' | 'settings'>('questions');

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);



    // Responses State
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [gradingScore, setGradingScore] = useState('');
    const [selectedPart, setSelectedPart] = useState<any>(null);

    // Settings Tab State
    const [settings, setSettings] = useState({
        passing_score: 70,
        certificate_bg: '',
        certificate_title: 'CERTIFICATE OF COMPLETION',
        materials: [] as { title: string, url: string }[],
        certificate_enabled: true,
        materials_enabled: true,
        cert_mode: 'auto' as 'auto' | 'template',
        text_positions: {
            name: { x: 50, y: 42, fontSize: 26, color: '#1B2B4B' },
            score: { x: 50, y: 60, fontSize: 20, color: '#8A151B' },
            exam: { x: 50, y: 74, fontSize: 14, color: '#1B2B4B' },
            date: { x: 50, y: 83, fontSize: 11, color: '#1B2B4B' },
        } as Record<string, { x: number; y: number; fontSize: number; color: string }>
    });
    const [uploadingCert, setUploadingCert] = useState(false);
    const [dragging, setDragging] = useState<string | null>(null);
    const previewRef = React.useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!exam || !settings.certificate_enabled) return;

        const timer = setTimeout(() => {
            const dummyParticipant = {
                full_name: '[Participant Name]',
                score: 95,
                end_time: new Date().toISOString()
            };
            const dummyExam = { title: exam.title || 'Exam Title' };
            exportCertificatePDF(dummyParticipant, dummyExam, settings, true).then((url) => {
                if (typeof url === 'string') setPdfPreviewUrl(url);
            });
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [settings, exam]);

    useEffect(() => {
        if (id) {
            fetchExamDetails();
            if (activeTab === 'responses') {
                fetchResponses();
            }
        }
    }, [id, activeTab]);

    async function fetchExamDetails() {
        setLoading(true);
        const { data: examData, error } = await supabase.from('exams').select('*').eq('id', id).single();
        if (examData) {
            setExam(examData);
            // Initialize settings from DB or defaults
            const s = examData.settings || {};
            setSettings({
                passing_score: s.passing_score || 70,
                certificate_bg: s.certificate_bg || '',
                certificate_title: s.certificate_title || 'CERTIFICATE OF COMPLETION',
                materials: s.materials || [],
                certificate_enabled: s.certificate_enabled !== false,
                materials_enabled: s.materials_enabled !== false,
                cert_mode: s.cert_mode || 'auto',
                text_positions: s.text_positions || {
                    name: { x: 50, y: 42, fontSize: 26, color: '#1B2B4B' },
                    score: { x: 50, y: 60, fontSize: 20, color: '#8A151B' },
                    exam: { x: 50, y: 74, fontSize: 14, color: '#1B2B4B' },
                    date: { x: 50, y: 83, fontSize: 11, color: '#1B2B4B' },
                }
            });

            const { data: qData } = await supabase.from('questions').select('*').eq('exam_id', id).order('order', { ascending: true });
            if (qData) setQuestions(qData);
        }
        setLoading(false);
    }

    async function fetchResponses() {
        setLoadingResponses(true);
        const { data } = await supabase
            .from('participants')
            .select('*, exams(title)')
            .eq('exam_id', id)
            .order('created_at', { ascending: false });
        if (data) setParticipants(data);
        setLoadingResponses(false);
    }

    // --- Questions Tab Logic ---

    const addQuestion = () => {
        setQuestions([...questions, {
            type: 'multiple_choice',
            content: '',
            options: ['', ''],
            order: questions.length,
            exam_id: id // Ensure new questions have exam_id
        }]);
    };

    const updateQuestion = (index: number, data: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...data, exam_id: id };
        setQuestions(newQuestions);
    };

    const deleteQuestion = async (index: number) => {
        const q = questions[index];
        if (q.id) {
            // Delete from DB if it exists
            const { error } = await supabase.from('questions').delete().eq('id', q.id);
            if (error) {
                alert('Failed to delete question');
                return;
            }
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSaveExam = async () => {
        setSaving(true);
        try {
            // Update Exam
            await supabase.from('exams').update({
                title: exam.title,
                description: exam.description,
                duration: exam.duration,
                settings: {
                    ...exam.settings,
                    passing_score: settings.passing_score,
                    certificate_bg: settings.certificate_bg,
                    certificate_title: settings.certificate_title,
                    materials: settings.materials,
                    certificate_enabled: settings.certificate_enabled,
                    materials_enabled: settings.materials_enabled,
                    cert_mode: settings.cert_mode,
                    text_positions: settings.text_positions
                }
            }).eq('id', id);

            // Upsert Questions
            // For simplicity in this demo, we upsert all. 
            // Ideally we track dirty state.
            const questionsToSave = questions.map((q, i) => ({
                ...q,
                exam_id: id,
                order: i
            }));

            // Remove temporary IDs if any (though upsert handles new records if ID is missing or new)
            // But supabase upsert needs ID to update, no ID to insert.
            // My questions state has IDs for existing ones.

            const { error: qError } = await supabase.from('questions').upsert(questionsToSave);
            if (qError) throw qError;

            alert('Exam updated successfully!');
            fetchExamDetails();
        } catch (error: any) {
            alert('Error saving: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // --- Responses Tab Logic ---

    const handleDownloadSubmission = async (p: any) => {
        try {
            const { data: submissionData } = await supabase.from('submissions').select('*').eq('participant_id', p.id).single();
            const answers = submissionData?.answers || {};
            // Re-use questions state as it is already loaded for this exam

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Result Submission', 14, 20);
            doc.setFontSize(11);
            doc.text(`Participant: ${p.full_name}`, 14, 30);
            doc.text(`Email: ${p.email}`, 14, 36);
            doc.text(`Exam: ${exam?.title}`, 14, 42);
            doc.text(`Score: ${p.score !== null ? p.score + '%' : 'Not Graded'}`, 14, 48);

            const tableBody = questions.map((q: any, index: number) => {
                return [`${index + 1}`, q.content, answers[q.id] || '(No Answer)'];
            });

            autoTable(doc, {
                startY: 60,
                head: [['#', 'Question', 'Participant Answer']],
                body: tableBody,
            });
            doc.save(`${p.full_name}_Submission.pdf`);
        } catch (e) { alert('Download failed'); }
    };

    const handleBulkExport = async () => {
        setLoadingResponses(true);
        try {
            // We need all submissions
            const pIds = participants.map(p => p.id);
            const { data: subs } = await supabase.from('submissions').select('*').in('participant_id', pIds);

            const headers = ['Name', 'Email', 'Score', ...questions.map((q, i) => `Q${i + 1}`)];
            const rows = participants.map(p => {
                const sub = subs?.find(s => s.participant_id === p.id);
                const ans = sub?.answers || {};
                return [
                    `"${p.full_name}"`,
                    `"${p.email}"`,
                    p.score || '-',
                    ...questions.map(q => `"${(ans[q.id] || '').replace(/"/g, '""')}"`)
                ].join(',');
            });

            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${exam.title}_Results.csv`;
            link.click();
        } catch (e) { alert('Export failed'); }
        finally { setLoadingResponses(false); }
    };

    const handleGrade = async () => {
        if (!selectedPart || !gradingScore) return;
        await supabase.from('participants').update({ score: parseFloat(gradingScore), status: 'graded' }).eq('id', selectedPart.id);
        setSelectedPart(null);
        fetchResponses();
    };

    if (loading || !exam) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => router.push('/admin/exams')} className="btn-ghost" style={{ padding: 0 }}>
                        <ChevronLeft />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{exam.title}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href={`/register/${exam.id}`} target="_blank" className="btn btn-ghost" rel="noreferrer">
                        <ExternalLink size={18} style={{ marginRight: '8px' }} /> Preview Link
                    </a>
                    <button className="btn btn-primary" onClick={handleSaveExam} disabled={saving}>
                        <Save size={18} style={{ marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '32px' }}>
                <TabButton active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} label="Questions" />
                <TabButton active={activeTab === 'responses'} onClick={() => setActiveTab('responses')} label="Responses" />
                <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings & Certificate" />
            </div>

            {
                activeTab === 'settings' && (
                    <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px' }}>
                        <div className="flex-column" style={{ gap: '24px' }}>
                            {/* Test Details */}
                            <div className="card">
                                <h3 style={{ marginBottom: '16px' }}>Test Details</h3>
                                <div className="flex-column" style={{ gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Test Title</label>
                                        <input
                                            type="text"
                                            value={exam.title}
                                            onChange={(e) => setExam({ ...exam, title: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                                        <textarea
                                            value={exam.description || ''}
                                            onChange={(e) => setExam({ ...exam, description: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Designer */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <CheckCircle size={18} color="var(--primary)" /> Certificate Designer
                                    </h3>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, certificate_enabled: !s.certificate_enabled }))}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: settings.certificate_enabled ? '#10b981' : 'var(--text-muted)' }}
                                    >
                                        {settings.certificate_enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                        {settings.certificate_enabled ? 'Enabled' : 'Disabled'}
                                    </button>
                                </div>

                                {settings.certificate_enabled && (
                                    <>
                                        {/* Certificate Title */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Certificate Title</label>
                                            <input
                                                type="text"
                                                value={settings.certificate_title}
                                                onChange={(e) => setSettings({ ...settings, certificate_title: e.target.value })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                placeholder="CERTIFICATE OF COMPLETION"
                                            />
                                        </div>

                                        {/* Background Upload */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Background Image (Optional)</label>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                                    <Plus size={16} style={{ marginRight: '6px' }} />
                                                    {uploadingCert ? 'Uploading...' : 'Upload Background'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setUploadingCert(true);
                                                            try {
                                                                const ext = file.name.split('.').pop();
                                                                const fileName = `cert_bg_${Date.now()}.${ext}`;
                                                                const { error: upErr } = await supabase.storage.from('branding').upload(fileName, file);
                                                                if (upErr) throw upErr;
                                                                const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(fileName);
                                                                setSettings(prev => ({ ...prev, certificate_bg: publicUrl }));
                                                            } catch (err: any) {
                                                                alert('Upload failed: ' + err.message);
                                                            } finally {
                                                                setUploadingCert(false);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                {settings.certificate_bg && (
                                                    <button className="btn-ghost" onClick={() => setSettings({ ...settings, certificate_bg: '' })} style={{ color: '#ef4444' }}>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                                Upload a custom background to replace the default design. Text will overlay automatically.
                                            </p>
                                        </div>

                                        {/* ── AUTO MODE PREVIEW (ALWAYS VISIBLE) ── */}
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            aspectRatio: '1.414 / 1',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            background: '#f8fafc',
                                        }}>
                                            {pdfPreviewUrl ? (
                                                <iframe
                                                    src={pdfPreviewUrl}
                                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                                    title="Certificate Preview"
                                                />
                                            ) : (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--text-muted)', gap: '10px'
                                                }}>
                                                    <div style={{
                                                        width: '24px', height: '24px',
                                                        border: '3px solid var(--border)',
                                                        borderTopColor: 'var(--primary)',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }} />
                                                    <span style={{ fontSize: '0.9rem' }}>Generating Preview...</span>
                                                </div>
                                            )}
                                        </div>
                                        <style jsx>{`
                                            @keyframes spin { to { transform: rotate(360deg); } }
                                        `}</style>
                                    </>
                                )}

                                {!settings.certificate_enabled && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        Certificate is disabled for this exam. Participants will not see a certificate download option.
                                    </p>
                                )}
                            </div>

                            {/* Learning Materials */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <ExternalLink size={18} color="var(--primary)" /> Learning Materials
                                    </h3>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, materials_enabled: !s.materials_enabled }))}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: settings.materials_enabled ? '#10b981' : 'var(--text-muted)' }}
                                    >
                                        {settings.materials_enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                        {settings.materials_enabled ? 'Enabled' : 'Disabled'}
                                    </button>
                                </div>

                                {settings.materials_enabled ? (
                                    <>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                                            Add study resources for participants. These will appear on their dashboard.
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {settings.materials.map((mat, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Title (e.g. Study Guide)"
                                                        value={mat.title}
                                                        onChange={(e) => {
                                                            const newMats = [...settings.materials];
                                                            newMats[idx].title = e.target.value;
                                                            setSettings({ ...settings, materials: newMats });
                                                        }}
                                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="URL (https://...)"
                                                        value={mat.url}
                                                        onChange={(e) => {
                                                            const newMats = [...settings.materials];
                                                            newMats[idx].url = e.target.value;
                                                            setSettings({ ...settings, materials: newMats });
                                                        }}
                                                        style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                                    />
                                                    <button
                                                        className="btn-ghost"
                                                        onClick={() => {
                                                            const newMats = settings.materials.filter((_, i) => i !== idx);
                                                            setSettings({ ...settings, materials: newMats });
                                                        }}
                                                        style={{ color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => setSettings({ ...settings, materials: [...settings.materials, { title: '', url: '' }] })}
                                                style={{ width: 'fit-content', marginTop: '8px' }}
                                            >
                                                <Plus size={16} style={{ marginRight: '6px' }} /> Add Material
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        Learning materials are disabled for this exam.
                                    </p>
                                )}
                            </div>
                        </div>

                        <aside className="flex-column" style={{ gap: '24px' }}>
                            <div className="card">
                                <h3 style={{ marginBottom: '20px' }}>Exam Configuration</h3>
                                <div className="flex-column" style={{ gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Duration (Minutes)</label>
                                        <input
                                            type="number"
                                            value={exam.duration}
                                            onChange={(e) => setExam({ ...exam, duration: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                        />
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Passing Score (%)</label>
                                        <input
                                            type="number"
                                            value={settings.passing_score}
                                            onChange={(e) => setSettings({ ...settings, passing_score: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Minimum score to receive a certificate.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}


            {activeTab === 'questions' && (
                <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                    <div className="flex-column" style={{ gap: '24px' }}>
                        <section className="card">
                            <h3 style={{ marginBottom: '16px' }}>Test Details</h3>
                            <div className="flex-column" style={{ gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Test Title</label>
                                    <input
                                        type="text"
                                        value={exam.title}
                                        onChange={(e) => setExam({ ...exam, title: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        value={exam.description || ''}
                                        onChange={(e) => setExam({ ...exam, description: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px' }}
                                    />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3>Questions ({questions.length})</h3>
                                <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={addQuestion}>
                                    <Plus size={18} /> Add Question
                                </button>
                            </div>
                            {questions.map((q: any, i: number) => (
                                <QuestionEditor
                                    key={q.id || i}
                                    index={i}
                                    question={q}
                                    onUpdate={(data: any) => updateQuestion(i, data)}
                                    onDelete={() => deleteQuestion(i)}
                                />
                            ))}
                        </section>
                    </div>
                    <aside className="flex-column" style={{ gap: '24px' }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '20px' }}>Settings</h3>
                            <div className="flex-column" style={{ gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        value={exam.duration}
                                        onChange={(e) => setExam({ ...exam, duration: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {activeTab === 'responses' && (
                <div className="flex-column" style={{ gap: '24px' }}>
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>{participants.length} Responses</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Latest responses for this exam.</p>
                        </div>
                        <button className="btn btn-secondary" onClick={handleBulkExport} disabled={loadingResponses}>
                            <Download size={18} /> Export All to CSV
                        </button>
                    </div>

                    <div className="card" style={{ padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '16px 24px' }}>Participant</th>
                                    <th style={{ padding: '16px 24px' }}>Status</th>
                                    <th style={{ padding: '16px 24px' }}>Score</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>No responses yet.</td></tr>
                                ) : participants.map((p: any) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '600' }}>{p.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px',
                                                background: p.status === 'graded' ? '#10b98120' : '#f59e0b20',
                                                color: p.status === 'graded' ? '#10b981' : '#f59e0b',
                                                fontWeight: '600'
                                            }}>
                                                {p.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '700' }}>
                                            {p.score !== null ? `${p.score}%` : '--'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn-ghost" title="Grade" onClick={() => setSelectedPart(p)}><CheckCircle size={18} /></button>
                                                <button className="btn-ghost" title="Download" onClick={() => handleDownloadSubmission(p)}><Download size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            {selectedPart && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card" style={{ width: '400px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Grade Submission</h3>
                        <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Assigning score for <strong>{selectedPart.full_name}</strong></p>
                        <input
                            type="number"
                            value={gradingScore}
                            onChange={(e) => setGradingScore(e.target.value)}
                            placeholder="0 - 100"
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '24px' }}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGrade}>Save Grade</button>
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelectedPart(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '12px 0',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: '600',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </button>
    );
}

