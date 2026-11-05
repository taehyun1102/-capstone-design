
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const SALT_ROUNDS = 10;

// 로그인 인증 토큰 유효 기간: 7일
const AUTH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60;

// 비밀번호 찾기 본인확인 토큰 저장
// token -> { userId, expiresAt }
const passwordResetTokens = new Map();

// 인증 토큰 서명에 사용할 비밀키
function getAuthSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_TOKEN_SECRET 환경변수가 설정되지 않았습니다."
    );
  }

  return secret;
}

// 로그인 인증 토큰 생성
function createAuthToken(userId) {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + AUTH_TOKEN_EXPIRES_IN,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

// 로그인 인증 토큰 검증
function verifyAuthToken(token) {
  try {
    if (typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, receivedSignature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", getAuthSecret())
      .update(encodedPayload)
      .digest();

    const receivedSignatureBuffer = Buffer.from(
      receivedSignature,
      "base64url"
    );

    if (
      expectedSignature.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(
        expectedSignature,
        receivedSignatureBuffer
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );

    if (
      !payload.userId ||
      !payload.exp ||
      Math.floor(Date.now() / 1000) >= payload.exp
    ) {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch (err) {
    return null;
  }
}

// 사용자 ID로 회원 정보 조회
async function getUserById(userId) {
  return User.findOne({ userId });
}

async function findUserByUsername(username) {
  return User.findOne({ username: username.trim() });
}

async function isUsernameAvailable(username) {
  const user = await findUserByUsername(username);
  return !user;
}

// 회원가입
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

    const existingUsername = await findUserByUsername(
      trimmedUsername
    );

    if (existingUsername) {
      return {
        ok: false,
        error: "USERNAME_EXISTS",
      };
    }

    const userId = `user-${crypto.randomUUID()}`;

    const hashedPassword = await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

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

    return {
      ok: true,
      userId,
    };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return {
          ok: false,
          error: "USERNAME_EXISTS",
        };
      }

      throw err;
    }

    throw err;
  }
}

// 로그인
async function authenticateUser(username, password) {
  const user = await findUserByUsername(username);

  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return {
      ok: false,
    };
  }

  const token = createAuthToken(user.userId);

  return {
    ok: true,
    userId: user.userId,
    name: user.name,
    username: user.username,
    token,
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
async function verifySecurityAnswer(
  username,
  securityAnswer
) {
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

  const resetToken = crypto.randomBytes(32).toString("hex");

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

  passwordResetTokens.delete(resetToken);

  return {
    ok: true,
  };
}

// 회원탈퇴
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
  createAuthToken,
  verifyAuthToken,
  getUserById,
};
