import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log("=========================================");
    console.log(`MOCK EMAIL SENT TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${html.substring(0, 100)}...`);
    console.log("=========================================");
    console.log("Note: Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env to send real emails.");
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM || '"Islam360" <noreply@example.com>',
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
