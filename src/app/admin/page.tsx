import { Metadata } from 'next';
import AdminDashboard from './content';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Indolaw',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <AdminDashboard />;
}
