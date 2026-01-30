// import nodemailer from "nodemailer";
// export const sendMail = async (options) => {
//   if (!options.email || (Array.isArray(options.email) && options.email.length === 0)) {
//     console.error("No recipients defined");
//     return; // Exit function early
//   }

//   const transport = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Convert emails to string if it's an array
//   const recipients = Array.isArray(options.email) ? options.email.join(", ") : options.email;

//   const mailOptions = {
//     from: "Jeevan Adhikari <jeevanbhai6676@gmail.com>",
//     to: recipients,
//     subject: options.subject,
//     text: options.message,
//   };

//   // Send email with nodemailer
//   await transport.sendMail(mailOptions);
// };
import nodemailer from "nodemailer";

// Generic function to send any email
export const sendMail = async ({ email, subject, message }) => {
  if (!email || (Array.isArray(email) && email.length === 0)) {
    console.error("No recipients defined");
    return; // Exit function early
  }

  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,          // Your Gmail
      pass: process.env.EMAIL_PASSWORD, // App password (if 2FA is on)
    },
  });

  // Convert array of emails to comma-separated string
  const recipients = Array.isArray(email) ? email.join(", ") : email;

  const mailOptions = {
    from: "Jeevan Adhikari <jeevanbhai6676@gmail.com>",
    to: recipients,
    subject,
    text: message,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log("Email sent successfully to:", recipients);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Optional helper for complaint emails
export const sendComplaintMail = async (email, message) => {
  return sendMail({
    email,
    subject: "Complaint Received",
    message,
  });
};
