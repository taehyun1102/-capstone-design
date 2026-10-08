const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const SALT_ROUNDS = 10;

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
  deleteUser,
};