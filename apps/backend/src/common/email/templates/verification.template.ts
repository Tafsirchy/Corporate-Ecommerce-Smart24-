import { baseTemplate } from './base.template';

export const getVerificationEmail = (otpCode: string) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46;">Welcome to Smart24!</h2>
    <p>Please verify your email address by entering the following 6-digit code on the verification page:</p>
    <div style="margin: 32px 0; text-align: center;">
      <div style="display: inline-block; padding: 16px 32px; background-color: #F0F3F2; color: #003D46; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; border: 1px dashed #0A5A66;">
        ${otpCode}
      </div>
    </div>
    <p>This code will expire in 15 minutes.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;

  const textContent = `Welcome to Smart24!\n\nPlease verify your email address by entering the following 6-digit code:\n\n${otpCode}\n\nThis code will expire in 15 minutes. If you didn't create an account, you can safely ignore this email.`;

  return {
    html: baseTemplate(htmlContent, 'Verify your Smart24 email address'),
    text: textContent,
  };
};
