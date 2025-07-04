import nodemailer, { Transporter } from "nodemailer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";

// Create a transporter instance
export const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

// Load and compile an email template
export const loadTemplate = async (
  templateName: string,
  placeholders: Record<string, string>
): Promise<string> => {
  const filePath = path.resolve(__dirname, "templates", `${templateName}.html`);
  const templateContent = await fs.readFile(filePath, "utf-8");
  const compiledTemplate = handlebars.compile(templateContent);
  return compiledTemplate(placeholders);
};

// Send an email with HTML template
export const sendEmail = async ({
  to,
  subject,
  templateName,
  placeholders,
}: {
  to: string | string[];
  subject: string;
  templateName: string;
  placeholders: Record<string, string>;
}): Promise<void> => {
  const transporter = createTransporter();

  try {
    const html = await loadTemplate(templateName, placeholders);

    await transporter.sendMail({
      from: `"No Reply" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: `Please view this email in a modern email client to see the full content.\n\nCode: ${
        placeholders.verification_code || "N/A"
      }`,
    });

    console.log(`✅ Email sent to ${to} | Subject: "${subject}"`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to} | Subject: "${subject}"`);
    console.error("Error details:", error);
    throw error;
  }
};
