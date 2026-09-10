const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendVerificationEmail(email, code) {
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "[Capstone] 이메일 인증번호",
      text: `인증번호: ${code}\n\n5분 이내에 입력해 주세요.`,
      html: `<p>인증번호: <strong>${code}</strong></p><p>5분 이내에 입력해 주세요.</p>`,
    });
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

module.exports = {
  getTransporter,
  sendVerificationEmail,
};