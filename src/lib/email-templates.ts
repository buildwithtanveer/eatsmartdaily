/**
 * Email Templates
 * Reusable email template components with variables substitution
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Password Reset Email Template
 */
export function passwordResetTemplate(
  userName: string,
  resetLink: string,
  expiryHours: number = 24,
): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5f2e; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; background-color: #2d5f2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <a href="${resetLink}" class="button">Reset Password</a>
      <p><strong>Important:</strong> This link will expire in ${expiryHours} hours. If you didn't request a password reset, please ignore this email.</p>
      <p>Or copy and paste this link in your browser:<br><code>${resetLink}</code></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Eat Smart Daily. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Password Reset Request

Hello ${userName},

We received a request to reset your password. Click the link below to proceed:
${resetLink}

Important: This link will expire in ${expiryHours} hours. If you didn't request a password reset, please ignore this email.

© 2026 Eat Smart Daily. All rights reserved.
  `;

  return {
    subject: "Reset Your Password - Eat Smart Daily",
    html,
    text,
  };
}

/**
 * Welcome Email Template
 */
export function welcomeTemplate(
  userName: string,
  siteName: string,
): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5f2e; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; background-color: #2d5f2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${siteName}!</h1>
    </div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>Thank you for joining our community! We're excited to have you on board.</p>
      <p>You can now:</p>
      <ul>
        <li>Comment on articles and share your thoughts</li>
        <li>Subscribe to our newsletter for regular updates</li>
        <li>Save your favorite articles</li>
        <li>Connect with our health and nutrition community</li>
      </ul>
      <a href="https://eatsmartdaily.com" class="button">Visit Our Site</a>
    </div>
    <div class="footer">
      <p>&copy; 2026 Eat Smart Daily. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to ${siteName}!

Hello ${userName},

Thank you for joining our community! We're excited to have you on board.

You can now:
- Comment on articles and share your thoughts
- Subscribe to our newsletter for regular updates
- Save your favorite articles
- Connect with our health and nutrition community

Visit: https://eatsmartdaily.com

© 2026 Eat Smart Daily. All rights reserved.
  `;

  return {
    subject: `Welcome to ${siteName}!`,
    html,
    text,
  };
}

/**
 * Comment Notification Email Template
 */
export function commentNotificationTemplate(
  postTitle: string,
  commentAuthor: string,
  commentText: string,
  postUrl: string,
): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5f2e; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .comment-box { background-color: white; border-left: 4px solid #2d5f2e; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background-color: #2d5f2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Comment on Your Article</h1>
    </div>
    <div class="content">
      <p>Someone has commented on your article "<strong>${postTitle}</strong>"</p>
      <div class="comment-box">
        <p><strong>${commentAuthor} wrote:</strong></p>
        <p>${commentText}</p>
      </div>
      <a href="${postUrl}" class="button">View Comment</a>
    </div>
    <div class="footer">
      <p>&copy; 2026 Eat Smart Daily. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
New Comment on Your Article

Someone has commented on your article "${postTitle}"

${commentAuthor} wrote:
${commentText}

View: ${postUrl}

© 2026 Eat Smart Daily. All rights reserved.
  `;

  return {
    subject: `New comment on "${postTitle}"`,
    html,
    text,
  };
}

/**
 * Newsletter Email Template
 */
export function newsletterTemplate(
  subscriberName: string,
  articles: Array<{ title: string; excerpt: string; url: string }>,
): EmailTemplate {
  const articlesHtml = articles
    .map(
      (article) => `
    <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
      <h3 style="margin-top: 0;"><a href="${article.url}" style="color: #2d5f2e; text-decoration: none;">${article.title}</a></h3>
      <p>${article.excerpt}</p>
      <a href="${article.url}" style="color: #2d5f2e; text-decoration: none;">Read More →</a>
    </div>
    `,
    )
    .join("");

  const articlesText = articles
    .map(
      (article) => `\n${article.title}\n${article.excerpt}\n${article.url}\n`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5f2e; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Weekly Nutrition Newsletter</h1>
    </div>
    <div class="content">
      <p>Hello ${subscriberName},</p>
      <p>Here are this week's best articles on nutrition and healthy eating:</p>
      ${articlesHtml}
      <p>Stay healthy! 🥗</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Eat Smart Daily. All rights reserved.</p>
      <p><a href="[UNSUBSCRIBE_URL]" style="color: #666; text-decoration: none;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Your Weekly Nutrition Newsletter

Hello ${subscriberName},

Here are this week's best articles on nutrition and healthy eating:
${articlesText}

Stay healthy!

© 2026 Eat Smart Daily. All rights reserved.
  `;

  return {
    subject: "Your Weekly Nutrition Newsletter - Eat Smart Daily",
    html,
    text,
  };
}

/**
 * Contact Form Response Email Template
 */
export function contactResponseTemplate(
  senderName: string,
  message: string,
): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5f2e; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You For Contacting Us</h1>
    </div>
    <div class="content">
      <p>Hello ${senderName},</p>
      <p>We have received your message and appreciate you taking the time to reach out.</p>
      <p><strong>Your message:</strong></p>
      <p>${message}</p>
      <p>Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
      <p>If you have any urgent matters, please feel free to contact us directly.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Eat Smart Daily. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Thank You For Contacting Us

Hello ${senderName},

We have received your message and appreciate you taking the time to reach out.

Your message:
${message}

Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.

© 2026 Eat Smart Daily. All rights reserved.
  `;

  return {
    subject: "We Received Your Message - Eat Smart Daily",
    html,
    text,
  };
}

/**
 * Admin Email Template
 */
export function adminNotificationTemplate(
  subject: string,
  message: string,
  actionUrl?: string,
): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5f2e; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; background-color: #2d5f2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${subject}</h1>
    </div>
    <div class="content">
      <p>${message}</p>
      ${actionUrl ? `<a href="${actionUrl}" class="button">Take Action</a>` : ""}
    </div>
    <div class="footer">
      <p>&copy; 2026 Eat Smart Daily. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${subject}

${message}

${actionUrl ? `\nTake Action: ${actionUrl}` : ""}

© 2026 Eat Smart Daily. All rights reserved.
  `;

  return {
    subject: `[Admin] ${subject}`,
    html,
    text,
  };
}
