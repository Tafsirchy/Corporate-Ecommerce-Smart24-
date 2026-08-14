import { baseTemplate } from './base.template';

export const getAbandonedCartEmail = (
  userName: string,
  frontendUrl: string,
) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #003D46;">Hi ${userName},</h2>
    <p>You left some amazing items in your cart. Come back and complete your purchase before they sell out!</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${frontendUrl}/cart" class="btn">View My Cart</a>
    </div>
    <p>Thank you for shopping with Smart24!</p>
  `;

  const textContent = `Hi ${userName},\n\nYou left some amazing items in your cart. Come back and complete your purchase before they sell out!\n\nView your cart here: ${frontendUrl}/cart\n\nThank you for shopping with Smart24!`;

  return {
    html: baseTemplate(htmlContent, 'Did you forget something in your cart?'),
    text: textContent,
  };
};
