const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",   
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendVerificationEmail(email, code) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "[Capstone] 이메일 인증번호",
    text: `인증번호: ${code}\n\n5분 이내에 입력해 주세요.`,
    html: `<p>인증번호: <strong>${code}</strong></p><p>5분 이내에 입력해 주세요.</p>`,
  });
}

module.exports = {
  getTransporter,
  sendVerificationEmail,
};
