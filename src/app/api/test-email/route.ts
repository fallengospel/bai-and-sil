import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not configured',
        fix: 'Add RESEND_API_KEY to Vercel environment variables',
        steps: [
          '1. Go to https://resend.com → Sign up (free)',
          '2. API Keys → Create API Key → Copy the key',
          '3. Vercel Dashboard → bai-and-sil → Settings → Environment Variables',
          '4. Add: RESEND_API_KEY = re_your_key_here',
          '5. Redeploy the project',
        ],
      }, { status: 500 });
    }

    console.log(`[Test Email] Sending test email to ${email}...`);
    console.log(`[Test Email] API Key starts with: ${apiKey.substring(0, 6)}...`);

    const result = await sendEmail({
      to: email,
      subject: 'BAI & SIL - Test Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 30px 0;">
            <h1 style="color: #7BA8D0; margin: 0;">BAI & SIL</h1>
            <p style="color: #6b7280; margin-top: 4px;">Filipino Marketplace</p>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #111827; margin-top: 0;">Email Test</h2>
            <p style="color: #374151; line-height: 1.6;">
              This is a test email to verify that Resend API is working correctly.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                SUCCESS
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If you received this, email delivery is working!
            </p>
          </div>
          <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
            BAI & SIL — Hanap, Benta, I-repeat!
          </div>
        </body>
        </html>
      `,
    });

    if (result) {
      console.log(`[Test Email] SUCCESS - Email sent to ${email}`);
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}. Check your inbox (and spam folder).`,
      });
    } else {
      console.error(`[Test Email] FAILED - Could not send email to ${email}`);
      return NextResponse.json({
        success: false,
        error: 'Failed to send email. Check Vercel logs for details.',
        possible_causes: [
          'RESEND_API_KEY is invalid or expired',
          'API key was not saved properly in Vercel',
          'Resend account needs email verification',
        ],
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
