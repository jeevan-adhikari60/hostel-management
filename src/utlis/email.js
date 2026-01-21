import nodemailer from "nodemailer";
export const sendMail = async (options) => {
  if (!options.email || (Array.isArray(options.email) && options.email.length === 0)) {
    console.error("No recipients defined");
    return; // Exit function early
  }

  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Convert emails to string if it's an array
  const recipients = Array.isArray(options.email) ? options.email.join(", ") : options.email;

  const mailOptions = {
    from: "Jeevan Adhikari <jeevanbhai6676@gmail.com>",
    to: recipients,
    subject: options.subject,
    text: options.message,
  };

  // Send email with nodemailer
  await transport.sendMail(mailOptions);
};
