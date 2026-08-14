import { baseTemplate } from './base.template';

export const getPasswordChangedEmail = (userName: string) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">Password Changed Successfully</h2>
    <p>Hi ${userName},</p>
    <p>This is a confirmation that the password for your Smart24 account was recently changed.</p>
    <p>If you made this change, no further action is required.</p>
    <div class="alert-box">
      <p style="font-weight: 600; margin-bottom: 8px;">Didn't make this change?</p>
      <p>Please contact our support team immediately or reset your password again to secure your account.</p>
    </div>
  `;

  const textContent = `Password Changed Successfully\n\nHi ${userName},\n\nThis is a confirmation that the password for your Smart24 account was recently changed.\n\nIf you made this change, no further action is required.\n\nDidn't make this change? Please contact our support team immediately.`;

  return {
    html: baseTemplate(htmlContent, 'Your password was recently changed'),
    text: textContent,
  };
};
