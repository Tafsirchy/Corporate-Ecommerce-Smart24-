import { baseTemplate } from './base.template';

export const getSupportTicketEmail = (ticket: any) => {
  const attachmentsHtml =
    ticket.attachments && ticket.attachments.length > 0
      ? `<p><strong>Attachments:</strong></p><ul>${ticket.attachments.map((url: string) => `<li><a href="${url}" style="color: #0284c7;">${url}</a></li>`).join('')}</ul>`
      : '';

  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">New Support Ticket</h2>
    <table style="width: 100%; margin-bottom: 24px;">
      <tr><td style="padding: 4px 0;"><strong>From:</strong> ${ticket.name} (${ticket.email})</td></tr>
      <tr><td style="padding: 4px 0;"><strong>Subject:</strong> ${ticket.subject}</td></tr>
      ${ticket.orderId ? `<tr><td style="padding: 4px 0;"><strong>Linked Order ID:</strong> ${ticket.orderId}</td></tr>` : ''}
    </table>
    <p><strong>Message:</strong></p>
    <div style="background: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0;">
      <p style="margin: 0; white-space: pre-wrap;">${ticket.message}</p>
    </div>
    ${attachmentsHtml}
  `;

  const textContent = `New Support Ticket\n\nFrom: ${ticket.name} (${ticket.email})\nSubject: ${ticket.subject}\n${ticket.orderId ? `Linked Order ID: ${ticket.orderId}\n` : ''}\nMessage:\n${ticket.message}`;

  return {
    html: baseTemplate(htmlContent, `New Support Ticket: ${ticket.subject}`),
    text: textContent,
  };
};
