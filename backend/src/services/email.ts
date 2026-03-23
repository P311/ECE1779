import sgMail from "@sendgrid/mail";

export type Notifier = {
  send(to: string, subject: string, text: string): Promise<void>;
};

export function makeEmailNotifier(): Notifier {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");
  // sgMail.setDataResidency('eu');
  // Uncomment the above line if you are sending mail using a regional EU subuser.

  const from = process.env.EMAIL_USER ?? "yupeng.huang@mail.utoronto.ca";

  return {
    async send(to: string, subject: string, text: string): Promise<void> {
      console.log("=== NOTIFICATION ===");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log(text);
      console.log("====================");
      await sgMail.send({ to, from, subject, text });
    },
  };
}