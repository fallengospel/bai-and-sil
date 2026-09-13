import { NextRequest, NextResponse } from 'next/server';
import { sendEmailDetailed } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: 'BREVO_API_KEY not configured in Vercel',
        fix: 'Add BREVO_API_KEY to Vercel environment variables',
      }, { status: 500 });
    }

    console.log(`[Test Email] API Key present: ${apiKey.substring(0, 7)}...`);
    console.log(`[Test Email] Sending test email to ${email}...`);

    const result = await sendEmailDetailed({
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
              This is a test email. If you received it, Resend is working!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                SUCCESS
              </div>
            </div>
          </div>
          <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
            BAI & SIL
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: result.success,
      error: result.error || null,
      statusCode: result.statusCode || null,
      message: result.success
        ? `Test email sent to ${email}. Check inbox and spam folder.`
        : `Email failed. Error: ${result.error}`,
    }, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
