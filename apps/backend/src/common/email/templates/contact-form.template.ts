import { baseTemplate } from './base.template';

export const getContactFormEmail = (data: {
  name: string;
  email: string;
  company?: string;
  message: string;
}) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">New Contact Message</h2>
    <table style="width: 100%; margin-bottom: 24px;">
      <tr><td style="padding: 4px 0;"><strong>Name:</strong> ${data.name}</td></tr>
      <tr><td style="padding: 4px 0;"><strong>Email:</strong> ${data.email}</td></tr>
      <tr><td style="padding: 4px 0;"><strong>Company:</strong> ${data.company || 'N/A'}</td></tr>
    </table>
    <p><strong>Message:</strong></p>
    <div style="background: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0;">
      <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
    </div>
  `;

  const textContent = `New Contact Message\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || 'N/A'}\n\nMessage:\n${data.message}`;

  return {
    html: baseTemplate(
      htmlContent,
      `New Contact Form Submission from ${data.name}`,
    ),
    text: textContent,
  };
};
