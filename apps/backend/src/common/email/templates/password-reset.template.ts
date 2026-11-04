import { baseTemplate } from './base.template';

export const getPasswordResetEmail = (otpCode: string, resetUrl?: string) => {
  const ctaButton = resetUrl
    ? `
    <div style="margin: 28px 0; text-align: center;">
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 14px 32px; background-color: #FF9600; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(255,150,0,0.25);">
        Reset Your Password
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 12px;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #FF9600; word-break: break-all;">${resetUrl}</a>
    </p>
  `
    : '';

  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46; font-size: 24px; font-weight: 700;">Password Reset Request</h2>
    <p style="color: #4A5A5C; font-size: 15px; line-height: 1.6;">
      We received a request to reset your password for your Smart24 account. Enter this verification code to proceed:
    </p>
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; padding: 16px 36px; background-color: #f8fafc; color: #FF9600; font-size: 32px; font-weight: 700; letter-spacing: 8px; border-radius: 8px; border: 2px dashed #FF9600; font-family: 'Courier New', Courier, monospace;">
        ${otpCode}
      </div>
    </div>
    ${ctaButton}
    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
      This password reset code is only valid for the next <strong>15 minutes</strong>.
    </p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `;

  const textContent = `Password Reset Request

We received a request to reset your password for your Smart24 account. Enter this verification code to proceed:

${otpCode}

${resetUrl ? `Alternatively, reset directly with this link:\n${resetUrl}\n\n` : ''}This code is valid for 15 minutes.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.`;

  return {
    html: baseTemplate(htmlContent, 'Reset your Smart24 password'),
    text: textContent,
  };
};
