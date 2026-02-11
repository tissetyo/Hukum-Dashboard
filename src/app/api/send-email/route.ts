import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { to, subject, message, participantName } = await req.json();

    console.log('Attempting to send email to:', to);

    if (!resend) {
      console.error('RESEND_API_KEY is missing');
      return NextResponse.json({ error: 'Resend API Key is not configured in environment variables.' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Hukum Admin <onboarding@resend.dev>', // Use a verified domain or the testing domain
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">Hukum Certification System</h2>
          <p>Hello ${participantName || 'Participant'},</p>
          <div style="margin: 24px 0; line-height: 1.6; white-space: pre-wrap;">
            ${message}
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message from the Hukum Dashboard. 
            please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected Error in /api/send-email:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
