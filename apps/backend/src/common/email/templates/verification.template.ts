import { baseTemplate } from './base.template';

export const getVerificationEmail = (verificationUrl: string) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">Welcome to Smart24!</h2>
    <p>Please verify your email address by clicking the button below:</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all;"><a href="${verificationUrl}" style="color: #0284c7;">${verificationUrl}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;

  const textContent = `Welcome to Smart24!\n\nPlease verify your email address by visiting this link:\n${verificationUrl}\n\nThis link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.`;

  return {
    html: baseTemplate(htmlContent, 'Verify your Smart24 email address'),
    text: textContent,
  };
};
