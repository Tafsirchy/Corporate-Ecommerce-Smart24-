export const baseTemplate = (content: string, previewText?: string) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Smart24</title>
  
  <style>
    /* Reset styles */
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f6f9fc;
    }
    * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    div[style*="margin: 16px 0"] {
      margin: 0 !important;
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
    }
    img {
      -ms-interpolation-mode:bicubic;
    }
    a {
      text-decoration: none;
    }
    
    /* Container Styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .header {
      padding: 30px 20px;
      text-align: center;
      background-color: #ffffff;
      border-bottom: 1px solid #eeeeee;
    }
    
    .header h1 {
      margin: 0;
      color: #FF9600; /* Primary Color */
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    
    .body {
      padding: 40px 30px;
      color: #4A5A5C;
      font-size: 16px;
      line-height: 1.6;
    }
    
    .footer {
      padding: 30px 20px;
      text-align: center;
      background-color: #f8fafc;
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .footer a {
      color: #64748b;
      text-decoration: underline;
    }
    
    /* Utilities */
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: #FF9600;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      font-size: 16px;
    }
    .btn:hover {
      background-color: #CC7700;
    }
    
    .alert-box {
      background-color: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 6px;
      padding: 16px;
      margin: 24px 0;
    }
    
    .alert-box p {
      margin: 0;
      color: #be123c;
    }
  </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f6f9fc;">
  <center style="width: 100%; background-color: #f6f9fc; padding: 40px 0;">
    
    <!-- Preheader Text -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      ${previewText || 'A message from Smart24'}
    </div>
    
    <div class="email-container">
      
      <!-- Header -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="header">
            <!-- You can replace this text with an <img src="LOGO_URL"> -->
            <h1>Smart24</h1>
          </td>
        </tr>
      </table>
      
      <!-- Body -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="body">
            ${content}
          </td>
        </tr>
      </table>
      
      <!-- Footer -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="footer">
            <p style="margin: 0 0 10px 0;">
              <strong>Smart24 eCommerce</strong><br>
              123 Business Avenue, Dhaka, Bangladesh
            </p>
            <p style="margin: 0;">
              You received this email because you are registered on Smart24.live.<br>
              If you didn't request this, please ignore this email or contact support.
            </p>
          </td>
        </tr>
      </table>
      
    </div>
  </center>
</body>
</html>
`;
