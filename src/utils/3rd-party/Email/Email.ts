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

// // Usage example
// sendInviteEmail({
//   receiver: "recipient@example.com",
//   firstname: "John",
//   lastname: "Doe",
// });
