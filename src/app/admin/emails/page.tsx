import { Metadata } from 'next';
import EmailCenterPage from './content';

export const metadata: Metadata = {
    title: 'Email Center | Indolaw',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <EmailCenterPage />;
}
