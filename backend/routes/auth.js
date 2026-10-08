const express = require("express");

const {
  createUser,
  authenticateUser,
  isUsernameAvailable,
  deleteUser,
} = require("../authStore");

const router = express.Router();

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      securityQuestion,
      securityAnswer,
    } = req.body || {};

    if (
      !name ||
      !username ||
      !password ||
      !securityQuestion ||
      !securityAnswer
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "name, username, password, securityQuestion, securityAnswer는 필수입니다.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof securityQuestion !== "string" ||
      typeof securityAnswer !== "string" ||
      name.trim() === "" ||
      username.trim() === "" ||
      password.trim() === "" ||
      securityQuestion.trim() === "" ||
      securityAnswer.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid fields",
        message: "입력값 형식이 올바르지 않습니다.",
      });
    }

    const result = await createUser({
      name,
      username,
      password,
      securityQuestion,
      securityAnswer,
    });

    if (!result.ok) {
      if (result.error === "USERNAME_EXISTS") {
        return res.status(409).json({
          error: "Username already exists",
          message: "이미 사용 중인 아이디입니다.",
        });
      }

      return res.status(409).json({
        error: "Signup failed",
        message: "회원가입에 실패했습니다.",
      });
    }

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
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "username, password는 필수입니다.",
      });
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid fields",
        message: "입력값 형식이 올바르지 않습니다.",
      });
    }

    const result = await authenticateUser(
      username.trim(),
      password
    );

    if (!result.ok) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    res.json({
      message: "로그인 성공",
      userId: result.userId,
      name: result.name,
      username: result.username,
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