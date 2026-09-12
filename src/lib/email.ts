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
  if (!process.env.SMTP_USER) {
    console.log(`[Email] SMTP not configured. Would send to ${to}: ${subject}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: '"BAI & SIL" <noreply@baiandsil.ph>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export function verificationEmailHtml(name: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bai-and-sil.vercel.app';
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 30px 0;">
        <h1 style="color: #1a56db; margin: 0;">BAI & SIL</h1>
        <p style="color: #6b7280; margin-top: 4px;">Filipino Marketplace</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #111827; margin-top: 0;">Verify your email</h2>
        <p style="color: #374151; line-height: 1.6;">
          Hi ${name},<br><br>
          Thanks for registering! Please verify your email address to start buying and selling on BAI & SIL.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #1a56db; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
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
        <h1 style="color: #1a56db; margin: 0;">BAI & SIL</h1>
        <p style="color: #6b7280; margin-top: 4px;">Filipino Marketplace</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #111827; margin-top: 0;">Reset your password</h2>
        <p style="color: #374151; line-height: 1.6;">
          Hi ${name},<br><br>
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #1a56db; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
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
