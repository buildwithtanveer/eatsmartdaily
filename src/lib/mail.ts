import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use your SMTP settings
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // Only attempt to send if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials missing. Skipping email send.");
      return;
    }

    await transporter.sendMail({
      from: `"Eat Smart Daily" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw, just log. We don't want to break the user flow if email fails.
  }
}
