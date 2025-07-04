import { sendEmail } from "./Transporter";

interface InviteEmailProps {
  receiver: string;
  firstname: string;
  lastname: string;
}

export const sendInviteEmail = async ({
  receiver,
  firstname,
  lastname,
}: InviteEmailProps): Promise<void> => {
  try {
    await sendEmail({
      to: receiver,
      subject: "You're Invited!",
      templateName: "invite",
      placeholders: {
        name: `${firstname} ${lastname}`,
        inviteLink: "https://example.com/accept-invite",
      },
    });

    console.log("Invite email sent successfully.");
  } catch (error) {
    console.error("Failed to send invite email:", error);
  }
};

interface vProps {
  receiver: string;
  firstname: string;
  lastname: string;
  code: string; // Add this
}

interface InviteEmailProps {
  receiver: string;
  firstname: string;
  lastname: string;
  code: string;
}

export const sendEmailVerification = async ({
  receiver,
  firstname,
  lastname,
  code,
}: InviteEmailProps): Promise<void> => {
  try {
    await sendEmail({
      to: receiver,
      subject: "Verify Your Email Address",
      templateName: "verification",
      placeholders: {
        first_name: firstname,
        verification_code: code,
        year: new Date().getFullYear().toString(),
      },
    });
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
  }
};
