import * as nodemailer from 'nodemailer';

const userEmail = process.env.USER_EMAIL;
const userPass = process.env.APP_PASSWORD_FOR_EMAIL;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: userEmail,
    pass: userPass,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: userEmail,
    to,
    subject: 'YOUR MUSIC APP Two-Factor Authentication Code',
    text: `Your two-factor authentication code is: ${code}. The code will expire soon`,
  };

  await transporter.sendMail(mailOptions);
};
