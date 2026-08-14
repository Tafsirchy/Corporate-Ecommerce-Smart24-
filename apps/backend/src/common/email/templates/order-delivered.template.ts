import { baseTemplate } from './base.template';

export const getOrderDeliveredEmail = (
  orderId: string,
  frontendUrl: string,
) => {
  const displayId = orderId.slice(-6).toUpperCase();
  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46;">Your order has arrived!</h2>
    <p>Your order <strong>#${displayId}</strong> has been successfully delivered.</p>
    <p>We hope you enjoy your products!</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${frontendUrl}/account/reviews" class="btn">Leave a Review</a>
    </div>
    <p>If there are any issues with your order, please contact our support team.</p>
  `;

  const textContent = `Your order has arrived!\n\nYour order #${displayId} has been successfully delivered. We hope you enjoy your products!\n\nLeave a review here: ${frontendUrl}/account/reviews\n\nIf there are any issues with your order, please contact our support team.`;

  return {
    html: baseTemplate(htmlContent, `Order Delivered - #${displayId}`),
    text: textContent,
  };
};
