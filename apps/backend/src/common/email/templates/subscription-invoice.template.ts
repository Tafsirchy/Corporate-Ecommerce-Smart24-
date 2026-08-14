import { baseTemplate } from './base.template';

export const getSubscriptionInvoiceEmail = (
  userName: string,
  orderId: string,
  amount: number,
  frontendUrl: string,
) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46;">Hello ${userName},</h2>
    <p>Your monthly subscription order has been generated.</p>
    <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 16px;"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
      <p style="margin: 8px 0 0 0; font-size: 18px;"><strong>Total Amount:</strong> ৳${amount.toLocaleString()}</p>
    </div>
    <p>Please log in to your account to process the payment so we can prepare your delivery.</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${frontendUrl}/account/orders" class="btn">Pay Invoice</a>
    </div>
    <p>Thank you for choosing Smart24!</p>
  `;

  const textContent = `Hello ${userName},\n\nYour monthly subscription order has been generated.\nOrder ID: #${orderId.slice(-6).toUpperCase()}\nTotal Amount: ৳${amount.toLocaleString()}\n\nPlease log in to your account to process the payment: ${frontendUrl}/account/orders\n\nThank you for choosing Smart24!`;

  return {
    html: baseTemplate(
      htmlContent,
      `Invoice for your Subscription (Order #${orderId.slice(-6).toUpperCase()})`,
    ),
    text: textContent,
  };
};
