import { baseTemplate } from './base.template';

export const getWelcomeEmail = (userName: string, frontendUrl: string) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46;">Welcome aboard, ${userName}! 🎉</h2>
    <p>Your email has been successfully verified, and your account is now fully active.</p>
    <p>We are thrilled to have you join the Smart24 platform. Start exploring our wide range of products and enjoy exclusive deals just for you.</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${frontendUrl}" class="btn">Shop Now</a>
    </div>
    <p>If you have any questions or need assistance, our support team is always here to help.</p>
  `;

  const textContent = `Welcome aboard, ${userName}! 🎉\n\nYour email has been successfully verified, and your account is now fully active.\n\nWe are thrilled to have you join the Smart24 platform. Start exploring our wide range of products at: ${frontendUrl}\n\nIf you have any questions or need assistance, our support team is always here to help.`;

  return {
    html: baseTemplate(htmlContent, 'Welcome to Smart24!'),
    text: textContent,
  };
};
