
const express = require("express");

const {
  createUser,
  authenticateUser,
  isUsernameAvailable,
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword,
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
      token: result.token,
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

// 비밀번호 찾기 - 보안 질문 조회
router.post("/forgot-password/question", async (req, res) => {
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

    const result = await getSecurityQuestion(
      username.trim()
    );

    if (!result.ok) {
      if (result.error === "USER_NOT_FOUND") {
        return res.status(404).json({
          error: "User not found",
          message: "존재하지 않는 아이디입니다.",
        });
      }

      if (result.error === "SECURITY_QUESTION_NOT_FOUND") {
        return res.status(400).json({
          error: "Security question not found",
          message: "등록된 보안 질문이 없습니다.",
        });
      }

      return res.status(400).json({
        error: "Question lookup failed",
        message: "보안 질문을 불러오지 못했습니다.",
      });
    }

    res.json({
      securityQuestion: result.securityQuestion,
    });
  } catch (err) {
    console.error(
      "forgot-password/question error:",
      err
    );

    res.status(500).json({
      error: "Question lookup failed",
      message: "보안 질문 조회 중 오류가 발생했습니다.",
    });
  }
});

// 비밀번호 찾기 - 보안 질문 답변 확인
router.post("/forgot-password/verify", async (req, res) => {
  try {
    const {
      username,
      securityAnswer,
    } = req.body || {};

    if (!username || !securityAnswer) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "username, securityAnswer는 필수입니다.",
      });
    }

    if (
      typeof username !== "string" ||
      typeof securityAnswer !== "string" ||
      username.trim() === "" ||
      securityAnswer.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid fields",
        message: "입력값 형식이 올바르지 않습니다.",
      });
    }

    const result = await verifySecurityAnswer(
      username.trim(),
      securityAnswer
    );

    if (!result.ok) {
      if (result.error === "USER_NOT_FOUND") {
        return res.status(404).json({
          error: "User not found",
          message: "존재하지 않는 아이디입니다.",
        });
      }

      if (
        result.error === "SECURITY_ANSWER_NOT_FOUND"
      ) {
        return res.status(400).json({
          error: "Security answer not found",
          message: "등록된 보안 답변이 없습니다.",
        });
      }

      if (
        result.error === "INVALID_SECURITY_ANSWER"
      ) {
        return res.status(401).json({
          error: "Invalid security answer",
          message: "보안 질문의 답변이 올바르지 않습니다.",
        });
      }

      return res.status(400).json({
        error: "Verification failed",
        message: "보안 답변 확인에 실패했습니다.",
      });
    }

    res.json({
      message: "본인 확인 성공",
      resetToken: result.resetToken,
    });
  } catch (err) {
    console.error(
      "forgot-password/verify error:",
      err
    );

    res.status(500).json({
      error: "Verification failed",
      message: "보안 답변 확인 중 오류가 발생했습니다.",
    });
  }
});

// 비밀번호 찾기 - 새 비밀번호 설정
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
    } = req.body || {};

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "resetToken, newPassword는 필수입니다.",
      });
    }

    if (
      typeof resetToken !== "string" ||
      typeof newPassword !== "string" ||
      resetToken.trim() === "" ||
      newPassword.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid fields",
        message: "입력값 형식이 올바르지 않습니다.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Invalid password",
        message: "비밀번호는 6자 이상이어야 합니다.",
      });
    }

    const result = await resetPassword(
      resetToken,
      newPassword
    );

    if (!result.ok) {
      if (result.error === "INVALID_RESET_TOKEN") {
        return res.status(401).json({
          error: "Invalid reset token",
          message:
            "유효하지 않은 인증 정보입니다. 비밀번호 찾기를 다시 진행해주세요.",
        });
      }

      if (result.error === "RESET_TOKEN_EXPIRED") {
        return res.status(401).json({
          error: "Reset token expired",
          message:
            "인증 시간이 만료되었습니다. 비밀번호 찾기를 다시 진행해주세요.",
        });
      }

      if (result.error === "INVALID_PASSWORD") {
        return res.status(400).json({
          error: "Invalid password",
          message: "비밀번호는 6자 이상이어야 합니다.",
        });
      }

      return res.status(400).json({
        error: "Password reset failed",
        message: "비밀번호 변경에 실패했습니다.",
      });
    }

    res.json({
      message: "비밀번호 변경 성공",
    });
  } catch (err) {
    console.error(
      "forgot-password/reset error:",
      err
    );

    res.status(500).json({
      error: "Password reset failed",
      message: "비밀번호 변경 중 오류가 발생했습니다.",
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
