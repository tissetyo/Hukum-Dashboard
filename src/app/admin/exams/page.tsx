import { Metadata } from 'next';
import ExamsListPage from './content';

export const metadata: Metadata = {
    title: 'Manage Tests | Indolaw',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <ExamsListPage />;
}
