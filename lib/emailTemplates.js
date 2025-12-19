// Email templates for Verified Homeowner

export function getMarketplaceLeadEmailTemplate({ lead, recipientName, unsubscribeUrl }) {
  const { city, state, motivation, timeline, price, temperature, temperatureLabel } = lead;
  
  // Temperature-based styling
  const tempEmoji = temperature === 'hot' ? '🔥' : '🌡️';
  const tempLabel = temperatureLabel || (temperature === 'hot' ? 'Hot' : 'Warm');
  const headerGradient = temperature === 'hot' 
    ? 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)' 
    : 'linear-gradient(135deg, #f97316 0%, #eab308 100%)';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ${tempLabel} Lead Available</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: ${headerGradient}; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ${tempEmoji} New ${tempLabel} Lead in ${state}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${recipientName || 'there'},
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                A motivated seller just became available in your target market!
              </p>
              
              <!-- Lead Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">${tempEmoji} Temperature:</span>
                          <span style="color: ${temperature === 'hot' ? '#dc2626' : '#f97316'}; font-size: 14px; font-weight: 600; margin-left: 8px;">${tempLabel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">📍 Location:</span>
                          <span style="color: #111827; font-size: 14px; font-weight: 600; margin-left: 8px;">${city}, ${state}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">💡 Motivation:</span>
                          <span style="color: #111827; font-size: 14px; font-weight: 600; margin-left: 8px;">${motivation}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">⏰ Timeline:</span>
                          <span style="color: #111827; font-size: 14px; font-weight: 600; margin-left: 8px;">${timeline}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">💰 Price:</span>
                          <span style="color: #059669; font-size: 14px; font-weight: 600; margin-left: 8px;">$${price}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                This lead won't last long. Be the first to reach out!
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/marketplace?state=${state}" 
                       style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      👀 View in Marketplace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-align: center;">
                You're receiving this because ${state} is one of your target markets.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile" style="color: #7c3aed; text-decoration: none;">Update preferences</a>
                &nbsp;|&nbsp;
                <a href="${unsubscribeUrl || `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile`}" style="color: #7c3aed; text-decoration: none;">Unsubscribe from marketplace alerts</a>
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Brand Footer -->
        <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Verified Homeowner. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
${tempEmoji} New ${tempLabel} Lead in ${state}

Hi ${recipientName || 'there'},

A motivated seller just became available in your target market!

${tempEmoji} Temperature: ${tempLabel}
📍 Location: ${city}, ${state}
💡 Motivation: ${motivation}
⏰ Timeline: ${timeline}
💰 Price: $${price}

This lead won't last long. Be the first to reach out!

View in Marketplace: ${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/marketplace?state=${state}

---
You're receiving this because ${state} is one of your target markets.
Update preferences: ${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile
  `.trim();

  return { html, text };
}
