import { baseTemplate } from './base.template';

export const getPasswordResetEmail = (otpCode: string) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46;">Password Reset Request</h2>
    <p>You recently requested to reset your password for your Smart24 account. Use the verification code below to reset it.</p>
    <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #FF9600; font-family: monospace;">
        ${otpCode}
      </div>
    </div>
    <p>This password reset code is only valid for the next 15 minutes.</p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
  `;

  const textContent = `Password Reset Request\n\nYou recently requested to reset your password for your Smart24 account. Use this verification code to reset it:\n${otpCode}\n\nThis password reset code is only valid for the next 15 minutes.\n\nIf you did not request a password reset, please ignore this email.`;

  return {
    html: baseTemplate(htmlContent, 'Reset your Smart24 password'),
    text: textContent,
  };
};
