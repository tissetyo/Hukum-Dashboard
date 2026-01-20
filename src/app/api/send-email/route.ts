import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { to, subject, message, participantName } = await req.json();

    if (!resend) {
      return NextResponse.json({ error: 'Resend is not configured. Please add RESEND_API_KEY to your environment variables.' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Hukum Certification <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">Hukum Certification System</h2>
          <p>Hello ${participantName || 'Participant'},</p>
          <div style="margin: 24px 0; line-height: 1.6;">
            ${message}
          </div>
          <p style="color: #64748b; font-size: 14px;">This is an automated message. Please do not reply directly.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
