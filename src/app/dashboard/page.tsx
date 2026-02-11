import { Metadata } from 'next';
import ParticipantLoginContent from './content';

export const metadata: Metadata = {
    title: 'Participant Portal | Indolaw',
};

export const dynamic = 'force-dynamic';

export default function ParticipantLoginPage() {
    return <ParticipantLoginContent />;
}
