import { baseTemplate } from './base.template';

export const getPasswordResetEmail = (resetUrl: string) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">Password Reset Request</h2>
    <p>You recently requested to reset your password for your Smart24 account. Click the button below to reset it.</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all;"><a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a></p>
    <p>This password reset is only valid for the next 15 minutes.</p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
  `;

  const textContent = `Password Reset Request\n\nYou recently requested to reset your password for your Smart24 account. Reset it here:\n${resetUrl}\n\nThis password reset is only valid for the next 15 minutes.\n\nIf you did not request a password reset, please ignore this email.`;

  return {
    html: baseTemplate(htmlContent, 'Reset your Smart24 password'),
    text: textContent,
  };
};
