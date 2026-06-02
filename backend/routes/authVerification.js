const express = require("express");
const { CODE_TTL_MS, generateCode, saveCode, verifyCode } = require("../verificationStore");
const { sendVerificationEmail } = require("../emailService");

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 인증번호 발송
router.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        error: "Invalid email",
        message: "유효한 이메일을 입력해 주세요.",
      });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        error: "Email service not configured",
        message: "이메일 서버 설정이 완료되지 않았습니다.",
      });
    }

    const trimmedEmail = email.trim();
    const code = generateCode();

    saveCode(trimmedEmail, code);
    await sendVerificationEmail(trimmedEmail, code);

    res.json({
      message: "인증번호가 이메일로 전송되었습니다.",
      expiresInMinutes: CODE_TTL_MS / 60000,
    });
  } catch (err) {
    console.error("send-code error:", err);
    res.status(500).json({
      error: "Send failed",
      message: "인증번호 전송에 실패했습니다.",
    });
  }
});

// 인증번호 검증
router.post("/verify-code", (req, res) => {
  try {
    const { email, code } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "email, code는 필수입니다.",
      });
    }

    const result = verifyCode(email, code);

    if (!result.ok) {
      const messages = {
        NOT_FOUND: "인증번호를 먼저 요청해 주세요.",
        EXPIRED: "인증번호가 만료되었습니다. 다시 요청해 주세요.",
        INVALID: "인증번호가 일치하지 않습니다.",
      };

      return res.status(400).json({
        verified: false,
        error: result.error,
        message: messages[result.error] || "인증에 실패했습니다.",
      });
    }

    res.json({
      verified: true,
      message: "이메일 인증에 성공했습니다.",
    });
  } catch (err) {
    console.error("verify-code error:", err);
    res.status(500).json({
      error: "Verification failed",
      message: "인증 처리 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
