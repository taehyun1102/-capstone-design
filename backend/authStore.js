const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const SALT_ROUNDS = 10;

// 비밀번호 찾기 본인확인 토큰 저장
// token -> { userId, expiresAt }
const passwordResetTokens = new Map();

async function findUserByUsername(username) {
  return User.findOne({ username: username.trim() });
}

async function isUsernameAvailable(username) {
  const user = await findUserByUsername(username);
  return !user;
}

// 회원가입 데이터를 저장합니다.
async function createUser({
  name,
  username,
  password,
  securityQuestion,
  securityAnswer,
}) {
  try {
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();
    const trimmedSecurityQuestion = securityQuestion.trim();
    const trimmedSecurityAnswer = securityAnswer.trim();

    const existingUsername = await findUserByUsername(trimmedUsername);

    if (existingUsername) {
      return { ok: false, error: "USERNAME_EXISTS" };
    }

    const userId = `user-${crypto.randomUUID()}`;

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

    // 보안 질문 답변도 해시해서 저장
    const hashedSecurityAnswer = await bcrypt.hash(
      trimmedSecurityAnswer,
      SALT_ROUNDS
    );

    await User.create({
      userId,
      name: trimmedName,
      username: trimmedUsername,
      password: hashedPassword,
      securityQuestion: trimmedSecurityQuestion,
      securityAnswer: hashedSecurityAnswer,
    });

    return { ok: true, userId };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return { ok: false, error: "USERNAME_EXISTS" };
      }

      throw err;
    }

    throw err;
  }
}

// 로그인 자격 증명을 확인합니다.
async function authenticateUser(username, password) {
  const user = await findUserByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { ok: false };
  }

  return {
    ok: true,
    userId: user.userId,
    name: user.name,
    username: user.username,
  };
}

// 비밀번호 찾기 - 보안 질문 조회
async function getSecurityQuestion(username) {
  const user = await findUserByUsername(username);

  if (!user) {
    return {
      ok: false,
      error: "USER_NOT_FOUND",
    };
  }

  if (!user.securityQuestion) {
    return {
      ok: false,
      error: "SECURITY_QUESTION_NOT_FOUND",
    };
  }

  return {
    ok: true,
    securityQuestion: user.securityQuestion,
  };
}

// 비밀번호 찾기 - 보안 질문 답변 확인
async function verifySecurityAnswer(username, securityAnswer) {
  const user = await findUserByUsername(username);

  if (!user) {
    return {
      ok: false,
      error: "USER_NOT_FOUND",
    };
  }

  if (!user.securityAnswer) {
    return {
      ok: false,
      error: "SECURITY_ANSWER_NOT_FOUND",
    };
  }

  const isCorrect = await bcrypt.compare(
    securityAnswer.trim(),
    user.securityAnswer
  );

  if (!isCorrect) {
    return {
      ok: false,
      error: "INVALID_SECURITY_ANSWER",
    };
  }

  // 본인 확인 성공 시 임시 토큰 생성
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 10분 동안만 사용할 수 있도록 설정
  const expiresAt = Date.now() + 10 * 60 * 1000;

  passwordResetTokens.set(resetToken, {
    userId: user.userId,
    expiresAt,
  });

  return {
    ok: true,
    resetToken,
  };
}

// 비밀번호 찾기 - 새 비밀번호 설정
async function resetPassword(resetToken, newPassword) {
  const tokenData = passwordResetTokens.get(resetToken);

  if (!tokenData) {
    return {
      ok: false,
      error: "INVALID_RESET_TOKEN",
    };
  }

  // 토큰 만료 확인
  if (Date.now() > tokenData.expiresAt) {
    passwordResetTokens.delete(resetToken);

    return {
      ok: false,
      error: "RESET_TOKEN_EXPIRED",
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      ok: false,
      error: "INVALID_PASSWORD",
    };
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    SALT_ROUNDS
  );

  const result = await User.updateOne(
    { userId: tokenData.userId },
    {
      $set: {
        password: hashedPassword,
      },
    }
  );

  if (result.modifiedCount === 0) {
    return {
      ok: false,
      error: "PASSWORD_RESET_FAILED",
    };
  }

  // 토큰은 한 번 사용하면 삭제
  passwordResetTokens.delete(resetToken);

  return {
    ok: true,
  };
}

// 회원 탈퇴
async function deleteUser(userId) {
  const result = await User.deleteOne({ userId });

  return {
    ok: result.deletedCount > 0,
  };
}

module.exports = {
  createUser,
  authenticateUser,
  isUsernameAvailable,
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword,
  deleteUser,
};