import { baseTemplate } from './base.template';

export const getBackInStockEmail = (
  productName: string,
  frontendUrl: string,
) => {
  const htmlContent = `
    <h2 style="margin-top: 0; color: #0f172a;">Great news!</h2>
    <p>The product you were waiting for, <strong>${productName}</strong>, is back in stock.</p>
    <p>Grab it before it runs out again!</p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${frontendUrl}" class="btn">Shop Now</a>
    </div>
    <p>Thank you for shopping with Smart24!</p>
  `;

  const textContent = `Great news!\n\nThe product you were waiting for, ${productName}, is back in stock. Grab it before it runs out again!\n\nShop now: ${frontendUrl}\n\nThank you for shopping with Smart24!`;

  return {
    html: baseTemplate(htmlContent, `${productName} is back in stock!`),
    text: textContent,
  };
};
