const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function getTransporter() {
  return resend;
}

async function sendVerificationEmail(email, code) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [email],
      subject: "[Capstone] 이메일 인증번호",
      text: `인증번호: ${code}\n\n5분 이내에 입력해 주세요.`,
      html: `<p>인증번호: <strong>${code}</strong></p><p>5분 이내에 입력해 주세요.</p>`,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(error.message || "이메일 발송에 실패했습니다.");
    }

    console.log("Verification email sent:", data);
    return data;
  } catch (err) {
    console.error("sendVerificationEmail error:", err.message);
    throw err;
  }
}

module.exports = {
  getTransporter,
  sendVerificationEmail,
};