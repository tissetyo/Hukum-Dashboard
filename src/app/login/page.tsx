import { Metadata } from 'next';
import LoginContent from './content';

export const metadata: Metadata = {
    title: 'Sign In | Indolaw',
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return <LoginContent />;
}
