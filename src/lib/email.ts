import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP not configured. Set SMTP_USER and SMTP_PASS environment variables.');
    console.log(`[Email] OTP for ${to}: ${subject}`);
    console.log(`[Email] Preview: ${html.substring(0, 200)}...`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: '"BAI & SIL" <noreply@baiandsil.ph>',
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export function verificationEmailHtml(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 30px 0;">
        <h1 style="color: #7298C7; margin: 0;">BAI & SIL</h1>
        <p style="color: #6b7280; margin-top: 4px;">Filipino Marketplace</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #111827; margin-top: 0;">Verify your email</h2>
        <p style="color: #374151; line-height: 1.6;">
          Hi ${name},<br><br>
          Thanks for registering! Use the OTP code below to verify your email address.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #7298C7; color: white; padding: 18px 0; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 12px; display: inline-block; min-width: 200px;">
            ${code}
          </div>
        </div>
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          This code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
      <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
        BAI & SIL — Hanap, Benta, I-repeat!
      </div>
    </body>
    </html>
  `;
}

export function resetPasswordEmailHtml(name: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bai-and-sil.vercel.app';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 30px 0;">
        <h1 style="color: #7298C7; margin: 0;">BAI & SIL</h1>
        <p style="color: #6b7280; margin-top: 4px;">Filipino Marketplace</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #111827; margin-top: 0;">Reset your password</h2>
        <p style="color: #374151; line-height: 1.6;">
          Hi ${name},<br><br>
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #7298C7; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link expires in 15 minutes. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
      <div style="text-align: center; padding: 20px 0; color: #9ca3af; font-size: 12px;">
        BAI & SIL — Hanap, Benta, I-repeat!
      </div>
    </body>
    </html>
  `;
}
