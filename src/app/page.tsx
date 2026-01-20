import Link from 'next/link';
import { Gavel, Shield, GraduationCap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="fade-in">
      <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
          <Gavel size={28} />
          <span>HUKUM.ID</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/admin" className="btn btn-ghost">Admin Portal</Link>
          <Link href="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </nav>

      <main style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '24px', fontFamily: 'var(--font-heading)' }}>
          Legal Certification <br />
          <span style={{ color: 'var(--secondary)' }}>Standardized & Verified</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px auto' }}>
          The professional platform for legal practitioners to validate their expertise through rigorous, modern examinations.
        </p>

        <div className="flex-center" style={{ gap: '20px' }}>
          <Link href="/admin/exams/new" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Get Started as Admin <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid gap-8" style={{ marginTop: '100px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <FeatureCard
            icon={<Shield size={32} color="var(--primary)" />}
            title="Secure & Fair"
            description="Anti-pause timers and randomized question delivery ensure integrity throughout the examination."
          />
          <FeatureCard
            icon={<GraduationCap size={32} color="var(--primary)" />}
            title="Professional Creds"
            description="Automatically generated digital certificates recognized by top law firms and institutions."
          />
          <FeatureCard
            icon={<Gavel size={32} color="var(--primary)" />}
            title="Legal Excellence"
            description="Designed specifically for the nuances of law examinations with support for essay responses."
          />
        </div>
      </main>

      <footer style={{ marginTop: '100px', padding: '40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>&copy; 2026 Hukum Certification System. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="premium-card" style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '20px' }}>{icon}</div>
      <h3 style={{ marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{description}</p>
    </div>
  );
}
