import { baseTemplate } from './base.template';

export const getOrderConfirmationEmail = (
  orderId: string,
  grandTotal: number,
  userName: string,
  frontendUrl: string,
) => {
  const displayId = orderId.slice(-6).toUpperCase();
  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">Thank you for your order, ${userName}!</h2>
    <p>Your order <strong>#${displayId}</strong> has been received and is now being processed.</p>
    <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 18px;"><strong>Total Amount:</strong> ৳${grandTotal.toLocaleString()}</p>
    </div>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${frontendUrl}/track-order?id=${orderId}" class="btn">Track Your Order</a>
    </div>
    <p>If you have any questions, please reply to this email.</p>
  `;

  const textContent = `Thank you for your order, ${userName}!\n\nYour order #${displayId} has been received and is now being processed.\nTotal Amount: ৳${grandTotal.toLocaleString()}\n\nTrack your order here: ${frontendUrl}/track-order?id=${orderId}\n\nIf you have any questions, please reply to this email.`;

  return {
    html: baseTemplate(htmlContent, `Order Confirmation - #${displayId}`),
    text: textContent,
  };
};
