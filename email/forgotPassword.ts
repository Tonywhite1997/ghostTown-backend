import { email } from "./email";

export async function sendPassResetToEmail(to: string, resetCode: string) {
  const html = `
    <h1>Reset your password</h1>
    <p>Use the code below to reset your password</p>
    <p>The code will expire in 5 minutes.</p>
    <h2 style="background-color: green; padding: 10px; display: inline-block;">${resetCode}</h2>
     <br/>
    <p>GhostTown</p>
  `;
  const mailOptions = {
    to,
    from: "app.ghosttown@gmail.com",
    subject: "forgot password",
    html,
  };
  await email(mailOptions);
}
