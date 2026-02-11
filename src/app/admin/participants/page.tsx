import { Metadata } from 'next';
import ParticipantsPage from './content';

export const metadata: Metadata = {
    title: 'Participants | Indolaw',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <ParticipantsPage />;
}
