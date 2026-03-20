import nodemailer from "nodemailer";

export type Notifier = {
  send(to: string, subject: string, text: string): Promise<void>;
};

export function makeEmailNotifier(): Notifier {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP config if needed
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return {
    // async send(to: string, subject: string, text: string): Promise<void> {
    //   await transporter.sendMail({
    //     from: process.env.EMAIL_USER,
    //     to,
    //     subject,
    //     text,
    //   });
    // },
    // TODO: For testing, after testing use the above code
    async send(to: string, subject: string, text: string): Promise<void> {
      console.log("=== NOTIFICATION ===");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log(text);
      console.log("====================");
    },
  };
}
