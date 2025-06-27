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

// Function to load and compile an email template
export const loadTemplate = async (
  templateName: string,
  placeholders: Record<string, string>
): Promise<string> => {
  const filePath = path.resolve(__dirname, "templates", `${templateName}.html`);
  const templateContent = await fs.readFile(filePath, "utf-8");
  const compiledTemplate = handlebars.compile(templateContent);
  return compiledTemplate(placeholders);
};

// Function to send an email
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

    const info = await transporter.sendMail({
      from: `"No Reply" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
