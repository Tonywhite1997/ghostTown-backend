import nodemailer from "nodemailer";

export type MailOptionsType = {
  to: string;
  from: string;
  subject: string;
  html: string;
};

export const email = async (mailOptions: MailOptionsType) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "app.minicloud@gmail.com",
      pass: "xhuf jdoa ylyh pozb",
    },
  });

  await transporter.sendMail(mailOptions);
};
