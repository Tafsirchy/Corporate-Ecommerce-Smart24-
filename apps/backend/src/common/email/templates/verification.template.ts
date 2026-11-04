import { baseTemplate } from './base.template';

export const getVerificationEmail = (otpCode: string, verificationUrl?: string) => {
  const ctaButton = verificationUrl
    ? `
    <div style="margin: 28px 0; text-align: center;">
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 14px 32px; background-color: #FF9600; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(255,150,0,0.25);">
        Verify Email Address
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 12px;">
      Or copy and paste this link into your browser:<br>
      <a href="${verificationUrl}" style="color: #FF9600; word-break: break-all;">${verificationUrl}</a>
    </p>
  `
    : '';

  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46; font-size: 24px; font-weight: 700;">Welcome to Smart24!</h2>
    <p style="color: #4A5A5C; font-size: 15px; line-height: 1.6;">
      Thank you for creating an account with Smart24. To complete your registration, please enter the following 6-digit verification code:
    </p>
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; padding: 16px 36px; background-color: #F0F3F2; color: #003D46; font-size: 32px; font-weight: 700; letter-spacing: 8px; border-radius: 8px; border: 2px dashed #0A5A66; font-family: 'Courier New', Courier, monospace;">
        ${otpCode}
      </div>
    </div>
    ${ctaButton}
    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
      This verification code and link will expire in <strong>15 minutes</strong> for your security.
    </p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
      If you did not create a Smart24 account, please disregard this email.
    </p>
  `;

  const textContent = `Welcome to Smart24!

Thank you for creating an account with Smart24. To complete your registration, please use the following 6-digit verification code:

${otpCode}

${verificationUrl ? `Alternatively, verify directly using this link:\n${verificationUrl}\n\n` : ''}This code will expire in 15 minutes.

If you did not create a Smart24 account, please disregard this email.`;

  return {
    html: baseTemplate(htmlContent, 'Verify your Smart24 email address'),
    text: textContent,
  };
};
