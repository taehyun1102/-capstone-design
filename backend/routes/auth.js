const express = require("express");
const {
createUser,
authenticateUser,
isUsernameAvailable,
deleteUser,
resetPassword,
} = require("../authStore");
const { isEmailVerified, clearVerification } = require("../verificationStore");

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

// 회원가입
router.post("/signup", async (req, res) => {
try {
const { name, username, email, password } = req.body || {};


if (!name || !username || !email || !password) {
  return res.status(400).json({
    error: "Missing required fields",
    message: "name, username, email, password는 필수입니다.",
  });
}

if (
  typeof name !== "string" ||
  typeof username !== "string" ||
  typeof email !== "string" ||
  typeof password !== "string" ||
  name.trim() === "" ||
  username.trim() === "" ||
  email.trim() === "" ||
  password.trim() === ""
) {
  return res.status(400).json({
    error: "Invalid fields",
    message: "입력값 형식이 올바르지 않습니다.",
  });
}

if (!EMAIL_REGEX.test(email.trim())) {
  return res.status(400).json({
    error: "Invalid email",
    message: "유효한 이메일을 입력해 주세요.",
  });
}

if (!isEmailVerified(email)) {
  return res.status(403).json({
    error: "Email not verified",
    message: "이메일 인증이 필요합니다.",
  });
}

const result = await createUser({
  name,
  username,
  email,
  password,
});

if (!result.ok) {
  if (result.error === "USERNAME_EXISTS") {
    return res.status(409).json({
      error: "Username already exists",
      message: "이미 사용 중인 아이디입니다.",
    });
  }

  return res.status(409).json({
    error: "Email already exists",
    message: "이미 가입된 이메일입니다.",
  });
}

clearVerification(email);

res.status(201).json({
  message: "회원가입 성공",
  userId: result.userId,
});


} catch (err) {
console.error("signup error:", err);


res.status(500).json({
  error: "Signup failed",
  message: "회원가입 처리 중 오류가 발생했습니다.",
});


}
});

// 로그인
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body || {};


if (!email || !password) {
  return res.status(400).json({
    error: "Missing required fields",
    message: "email, password는 필수입니다.",
  });
}

const result = await authenticateUser(
  email,
  password
);

if (!result.ok) {
  return res.status(401).json({
    error: "Invalid credentials",
    message: "이메일 또는 비밀번호가 올바르지 않습니다.",
  });
}

res.json({
  message: "로그인 성공",
  userId: result.userId,
});


} catch (err) {
console.error("login error:", err);


res.status(500).json({
  error: "Login failed",
  message: "로그인 처리 중 오류가 발생했습니다.",
});


}
});

// 아이디 중복 확인
router.post("/check-username", async (req, res) => {
try {
const { username } = req.body || {};


if (
  !username ||
  typeof username !== "string" ||
  username.trim() === ""
) {
  return res.status(400).json({
    error: "Missing required fields",
    message: "username은 필수입니다.",
  });
}

const available = await isUsernameAvailable(
  username.trim()
);

res.json({ available });


} catch (err) {
console.error("check-username error:", err);


res.status(500).json({
  error: "Check failed",
  message: "아이디 확인 중 오류가 발생했습니다.",
});


}
});

// 비밀번호 재설정
router.post("/reset-password", async (req, res) => {
try {
const { email, newPassword } = req.body || {};


if (!email || !newPassword) {
  return res.status(400).json({
    message: "email, newPassword는 필수입니다.",
  });
}

const result = await resetPassword(
  email,
  newPassword
);

if (!result.ok) {
  return res.status(404).json({
    message: "사용자를 찾을 수 없습니다.",
  });
}

res.json({
  message: "비밀번호가 변경되었습니다.",
});


} catch (err) {
console.error("reset-password error:", err);


res.status(500).json({
  message: "비밀번호 변경 실패",
});


}
});

// 회원탈퇴
router.delete("/delete-account", async (req, res) => {
try {
const { userId } = req.body || {};


if (!userId) {
  return res.status(400).json({
    message: "userId가 필요합니다.",
  });
}

const result = await deleteUser(userId);

if (!result.ok) {
  return res.status(404).json({
    message: "사용자를 찾을 수 없습니다.",
  });
}

res.json({
  message: "회원탈퇴 완료",
});


} catch (err) {
console.error("delete-account error:", err);


res.status(500).json({
  message: "회원탈퇴 실패",
});


}
});

module.exports = router;
