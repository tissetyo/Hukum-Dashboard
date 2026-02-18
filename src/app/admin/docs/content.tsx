'use client';

import React, { useState } from 'react';
import {
    BookOpen, LayoutDashboard, FileText, Users, PieChart, Mail,
    ChevronDown, ChevronRight, CheckCircle, Plus, Share2, Download,
    Eye, Save, Award, Send, Settings, HelpCircle, Lightbulb, Search
} from 'lucide-react';

interface DocSection {
    id: string;
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}

export default function DocsContent() {
    const [openSection, setOpenSection] = useState<string | null>('welcome');

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    const sections: DocSection[] = [
        {
            id: 'welcome',
            icon: <BookOpen size={20} />,
            title: 'Selamat Datang',
            content: (
                <div className="flex-column" style={{ gap: '16px' }}>
                    <p>
                        Selamat datang di <strong>Indolaw Admin Dashboard</strong>! Sistem ini membantu Anda mengelola
                        ujian sertifikasi hukum secara online, mulai dari membuat ujian, mengelola peserta, memberikan
                        nilai, sampai mengirim email pemberitahuan.
                    </p>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#1d4ed8', fontWeight: '600' }}>
                            <Lightbulb size={18} />
                            <span>Gambaran Singkat</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                            <li><strong>Dashboard</strong> — Lihat ringkasan statistik dan aktivitas terbaru</li>
                            <li><strong>Kelola Ujian</strong> — Buat, edit, dan bagikan ujian sertifikasi</li>
                            <li><strong>Peserta</strong> — Kelola peserta, beri nilai, dan upload sertifikat</li>
                            <li><strong>Lihat Jawaban</strong> — Periksa jawaban peserta per ujian</li>
                            <li><strong>Email Center</strong> — Kirim email pemberitahuan ke peserta</li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            id: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            title: 'Dashboard',
            content: (
                <div className="flex-column" style={{ gap: '16px' }}>
                    <p>
                        Halaman <strong>Dashboard</strong> adalah halaman utama yang Anda lihat setelah login.
                        Di sini Anda bisa melihat ringkasan kondisi sistem secara keseluruhan.
                    </p>
                    <h4 style={{ marginBottom: '4px' }}>Informasi yang Ditampilkan:</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li><strong>Active Tests</strong> — Jumlah ujian yang sudah dibuat</li>
                        <li><strong>Total Participants</strong> — Jumlah total peserta yang terdaftar</li>
                        <li><strong>Graded Participants</strong> — Jumlah peserta yang sudah di-nilai</li>
                        <li><strong>Avg. Score</strong> — Rata-rata nilai seluruh peserta</li>
                    </ul>
                    <h4 style={{ marginBottom: '4px' }}>Tabel Aktivitas Terbaru</h4>
                    <p>
                        Di bawah statistik, terdapat tabel yang menampilkan <strong>5 peserta terbaru</strong> beserta
                        status mereka (Pending, Completed, Graded). Klik tombol <strong>"View"</strong> untuk langsung
                        melihat detail jawaban peserta tersebut.
                    </p>
                </div>
            ),
        },
        {
            id: 'manage-exams',
            icon: <FileText size={20} />,
            title: 'Kelola Ujian',
            content: (
                <div className="flex-column" style={{ gap: '20px' }}>
                    <p>
                        Menu <strong>"Manage Tests"</strong> di sidebar adalah tempat Anda membuat dan mengelola semua ujian.
                    </p>

                    {/* Membuat Ujian Baru */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            <Plus size={16} color="var(--primary)" /> Cara Membuat Ujian Baru
                        </h4>
                        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Klik tombol <strong>"Create New Test"</strong> di pojok kanan atas</li>
                            <li>Isi <strong>Judul Ujian</strong> (wajib) dan <strong>Deskripsi</strong> (opsional)</li>
                            <li>Di bagian kanan, atur <strong>Durasi</strong> (dalam menit) dan <strong>Mode Tampilan</strong>:
                                <ul style={{ lineHeight: '1.8', marginTop: '4px' }}>
                                    <li><strong>Single Page (Scroll)</strong> — Semua soal tampil di satu halaman</li>
                                    <li><strong>Step-by-step (Slideshow)</strong> — Soal tampil satu per satu</li>
                                </ul>
                            </li>
                            <li>Klik <strong>"+ Add Question"</strong> untuk menambah soal</li>
                            <li>Pilih tipe soal: <strong>Text</strong> (isian) atau <strong>Multiple Choice</strong></li>
                            <li>Klik <strong>"Preview"</strong> untuk melihat tampilan ujian dari sudut pandang peserta</li>
                            <li>Klik <strong>"Save Exam"</strong> untuk menyimpan</li>
                            <li>Setelah tersimpan, Anda akan mendapat <strong>Link Registrasi</strong> yang bisa dibagikan ke peserta</li>
                        </ol>
                    </div>

                    {/* Tombol Aksi */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0' }}>Tombol Aksi pada Daftar Ujian</h4>
                        <p style={{ marginBottom: '12px' }}>Di halaman daftar ujian, setiap ujian memiliki beberapa tombol:</p>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Share2 size={14} /> <strong>Copy Link</strong>
                                </span> — Salin link registrasi ke clipboard
                            </li>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Download size={14} /> <strong>Export PDF</strong>
                                </span> — Unduh soal ujian dalam format PDF
                            </li>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Eye size={14} /> <strong>Preview</strong>
                                </span> — Buka halaman registrasi ujian di tab baru
                            </li>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Settings size={14} /> <strong>Edit</strong>
                                </span> — Buka halaman edit ujian
                            </li>
                        </ul>
                    </div>

                    {/* Alur Peserta */}
                    <div style={{ background: '#fefce8', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#92400e', fontWeight: '600' }}>
                            <Lightbulb size={18} />
                            <span>Bagaimana Peserta Mengakses Ujian?</span>
                        </div>
                        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                            <li>Admin membagikan <strong>Link Registrasi</strong> kepada peserta</li>
                            <li>Peserta membuka link, mengisi nama dan email untuk mendaftar</li>
                            <li>Peserta mendapat <strong>link ujian unik</strong> yang langsung bisa dikerjakan</li>
                            <li>Setelah selesai, jawaban otomatis tersimpan di sistem</li>
                        </ol>
                    </div>
                </div>
            ),
        },
        {
            id: 'participants',
            icon: <Users size={20} />,
            title: 'Peserta & Penilaian',
            content: (
                <div className="flex-column" style={{ gap: '20px' }}>
                    <p>
                        Menu <strong>"Participants"</strong> di sidebar menampilkan semua peserta yang telah mendaftar ujian.
                        Di halaman ini Anda bisa memberi nilai, upload sertifikat, dan banyak lagi.
                    </p>

                    {/* Filter */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            <Search size={16} color="var(--primary)" /> Filter Peserta
                        </h4>
                        <p style={{ margin: 0 }}>
                            Gunakan dropdown <strong>"Filter by Exam"</strong> di atas tabel untuk menampilkan peserta
                            dari ujian tertentu saja. Jika memilih <strong>"All Exams"</strong>, semua peserta akan ditampilkan.
                        </p>
                    </div>

                    {/* Status */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0' }}>Status Peserta</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li><span style={{ color: '#f59e0b', fontWeight: '600' }}>PENDING</span> — Peserta sudah terdaftar tapi belum mengerjakan ujian</li>
                            <li><span style={{ color: '#3b82f6', fontWeight: '600' }}>COMPLETED</span> — Peserta sudah selesai mengerjakan ujian</li>
                            <li><span style={{ color: '#10b981', fontWeight: '600' }}>GRADED</span> — Peserta sudah diberi nilai oleh admin</li>
                        </ul>
                    </div>

                    {/* Aksi */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0' }}>Tombol Aksi per Peserta</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '2.2' }}>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle size={14} color="#10b981" /> <strong>Beri Nilai</strong>
                                </span> — Masukkan skor akhir (0-100) untuk peserta
                            </li>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Award size={14} color="var(--primary)" /> <strong>Upload Sertifikat</strong>
                                </span> — Upload file PDF sertifikat untuk peserta
                            </li>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={14} color="#3b82f6" /> <strong>Kirim Email</strong>
                                </span> — Kirim notifikasi email langsung ke peserta
                            </li>
                            <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Download size={14} /> <strong>Download Jawaban</strong>
                                </span> — Unduh jawaban peserta dalam format PDF
                            </li>
                        </ul>
                    </div>

                    {/* Tambah Peserta */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            <Plus size={16} color="var(--primary)" /> Menambah Peserta Manual
                        </h4>
                        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Klik tombol <strong>"Add Participant"</strong> di pojok kanan atas</li>
                            <li>Isi <strong>Nama Lengkap</strong>, <strong>Email</strong>, dan pilih <strong>Ujian</strong></li>
                            <li>Klik <strong>"Generate Link"</strong></li>
                            <li>Sistem akan membuat link ujian unik untuk peserta tersebut</li>
                        </ol>
                    </div>

                    {/* Export */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#166534', fontWeight: '600' }}>
                            <Download size={18} />
                            <span>Export Hasil ke CSV</span>
                        </div>
                        <p style={{ margin: 0 }}>
                            Pilih ujian di filter, lalu klik tombol <strong>"Export Results (CSV)"</strong> yang muncul.
                            File CSV berisi nama, email, status, skor, dan jawaban setiap peserta.
                            Bisa dibuka di <strong>Excel</strong> atau <strong>Google Sheets</strong>.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'responses',
            icon: <PieChart size={20} />,
            title: 'Lihat Jawaban (Responses)',
            content: (
                <div className="flex-column" style={{ gap: '16px' }}>
                    <p>
                        Menu <strong>"Responses"</strong> di sidebar menampilkan daftar semua ujian.
                        Dari sini Anda bisa melihat detail jawaban peserta untuk setiap ujian.
                    </p>

                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0' }}>Cara Melihat Jawaban:</h4>
                        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Buka menu <strong>"Responses"</strong> di sidebar</li>
                            <li>Anda akan melihat daftar semua ujian yang sudah dibuat</li>
                            <li>Klik tombol <strong>"View Results"</strong> pada ujian yang ingin dilihat</li>
                            <li>Halaman detail akan menampilkan semua jawaban peserta untuk ujian tersebut</li>
                        </ol>
                    </div>
                </div>
            ),
        },
        {
            id: 'email-center',
            icon: <Mail size={20} />,
            title: 'Email Center',
            content: (
                <div className="flex-column" style={{ gap: '20px' }}>
                    <p>
                        Menu <strong>"Email Center"</strong> memungkinkan Anda mengirim email ke peserta, baik
                        satu per satu maupun secara massal ke semua peserta di satu ujian.
                    </p>

                    {/* Kirim ke Satu Orang */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            <Send size={16} color="var(--primary)" /> Kirim ke Satu Penerima
                        </h4>
                        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Pilih <strong>"Single Recipient"</strong></li>
                            <li>Pilih mode:
                                <ul style={{ lineHeight: '1.8', marginTop: '4px' }}>
                                    <li><strong>Manual Entry</strong> — Ketik email dan nama penerima sendiri</li>
                                    <li><strong>Select Participant</strong> — Pilih dari daftar peserta yang sudah terdaftar</li>
                                </ul>
                            </li>
                            <li>Pilih template atau tulis pesan sendiri</li>
                            <li>Klik <strong>"Preview"</strong> untuk melihat hasil email sebelum dikirim</li>
                            <li>Klik <strong>"Send Message Now"</strong> untuk mengirim</li>
                        </ol>
                    </div>

                    {/* Kirim Massal */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            <Users size={16} color="var(--primary)" /> Kirim ke Semua Peserta (Massal)
                        </h4>
                        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Pilih <strong>"Valid Participants (By Exam)"</strong></li>
                            <li>Pilih ujian dari dropdown</li>
                            <li>Tulis subjek dan pesan (gunakan template jika perlu)</li>
                            <li>Sistem akan mengirim email ke <strong>semua peserta</strong> di ujian tersebut</li>
                        </ol>
                    </div>

                    {/* Variabel Pintar */}
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#1d4ed8', fontWeight: '600' }}>
                            <Lightbulb size={18} />
                            <span>Variabel Pintar (Smart Variables)</span>
                        </div>
                        <p style={{ marginBottom: '12px' }}>
                            Gunakan variabel berikut dalam pesan email. Variabel akan otomatis diganti dengan data peserta:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <VarChip label="{{name}}" desc="Nama lengkap peserta" />
                            <VarChip label="{{score}}" desc="Skor ujian peserta" />
                            <VarChip label="{{exam_name}}" desc="Judul ujian" />
                            <VarChip label="{{link}}" desc="Link dashboard/ujian" />
                        </div>
                    </div>

                    {/* Template */}
                    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0' }}>Template yang Tersedia:</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li><strong>Exam Results</strong> — Template untuk mengirim hasil ujian + link dashboard</li>
                            <li><strong>New Test Invitation</strong> — Template untuk mengundang peserta mengerjakan ujian</li>
                        </ul>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Klik nama template untuk langsung mengisi subjek dan pesan.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'faq',
            icon: <HelpCircle size={20} />,
            title: 'FAQ & Tips',
            content: (
                <div className="flex-column" style={{ gap: '20px' }}>
                    <FAQItem
                        question="Bagaimana cara peserta mendaftar ujian?"
                        answer="Bagikan Link Registrasi dari halaman Manage Tests. Peserta buka link tersebut, isi nama dan email, lalu langsung mendapat link ujian yang bisa dikerjakan."
                    />
                    <FAQItem
                        question="Peserta sudah selesai ujian, bagaimana cara memberi nilai?"
                        answer="Buka menu Participants, cari nama peserta, lalu klik tombol centang (✓). Masukkan skor 0-100 dan klik Save Grade."
                    />
                    <FAQItem
                        question="Bagaimana cara upload sertifikat?"
                        answer="Di halaman Participants, klik tombol piala (🏆) pada peserta yang sudah di-nilai. Upload file PDF sertifikat, dan peserta akan bisa mengunduhnya dari dashboard mereka."
                    />
                    <FAQItem
                        question="Email gagal terkirim, apa yang harus dilakukan?"
                        answer="Pastikan RESEND_API_KEY sudah dikonfigurasi dengan benar di environment variables. Cek juga apakah domain email pengirim sudah diverifikasi di Resend."
                    />
                    <FAQItem
                        question="Apakah peserta bisa mengulang ujian?"
                        answer="Saat ini setiap link ujian hanya bisa digunakan satu kali. Jika peserta perlu mengulang, admin harus menambahkan peserta lagi di halaman Participants untuk membuat link baru."
                    />
                    <FAQItem
                        question="Bagaimana cara melihat jawaban semua peserta sekaligus?"
                        answer="Buka menu Responses, pilih ujian, lalu klik View Results. Anda juga bisa export seluruh data ke CSV di halaman Participants menggunakan tombol Export Results."
                    />

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#166534', fontWeight: '600' }}>
                            <Lightbulb size={18} />
                            <span>Tips Berguna</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Gunakan <strong>Preview</strong> sebelum menyimpan ujian untuk memastikan tampilan sudah benar</li>
                            <li>Export jawaban ke <strong>CSV</strong> untuk analisis lebih lanjut di Excel/Google Sheets</li>
                            <li>Gunakan <strong>template email</strong> dan variabel pintar agar pesan lebih personal</li>
                            <li>Klik <strong>"Preview"</strong> di Email Center sebelum mengirim untuk memastikan isi email sudah pas</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <BookOpen size={28} color="var(--primary)" />
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>Dokumentasi</h1>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>
                    Panduan lengkap penggunaan Admin Dashboard dalam Bahasa Indonesia.
                </p>
            </header>

            {/* Quick nav */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => {
                                setOpenSection(s.id);
                                document.getElementById(`doc-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="btn btn-ghost"
                            style={{
                                padding: '8px 14px',
                                fontSize: '0.85rem',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            {s.icon}
                            {s.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sections */}
            <div className="flex-column" style={{ gap: '12px' }}>
                {sections.map((section) => (
                    <div key={section.id} id={`doc-${section.id}`} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <button
                            onClick={() => toggleSection(section.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '20px 24px',
                                border: 'none',
                                background: openSection === section.id ? 'var(--surface)' : 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'background 0.2s',
                            }}
                        >
                            <span style={{ color: 'var(--primary)' }}>{section.icon}</span>
                            <span style={{ flex: 1 }}>{section.title}</span>
                            {openSection === section.id
                                ? <ChevronDown size={20} color="var(--text-muted)" />
                                : <ChevronRight size={20} color="var(--text-muted)" />
                            }
                        </button>
                        {openSection === section.id && (
                            <div className="fade-in" style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function VarChip({ label, desc }: { label: string; desc: string }) {
    return (
        <div style={{
            background: 'white', padding: '8px 12px', borderRadius: '6px',
            border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px'
        }}>
            <code style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>{label}</code>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</span>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="var(--primary)" />
                {question}
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.6' }}>{answer}</p>
        </div>
    );
}
