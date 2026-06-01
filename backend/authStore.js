const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const SALT_ROUNDS = 10;

async function findUserByEmail(email) {
  return User.findOne({ email });
}

// 회원가입 데이터를 저장합니다.
async function createUser(email, password) {
  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return { ok: false, error: "EMAIL_EXISTS" };
    }

    const userId = `user-${crypto.randomUUID()}`;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ userId, email, password: hashedPassword });

    return { ok: true, userId };
  } catch (err) {
    if (err.code === 11000) {
      return { ok: false, error: "EMAIL_EXISTS" };
    }
    throw err;
  }
}

// 로그인 자격 증명을 확인합니다.
async function authenticateUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { ok: false };
  }

  return { ok: true, userId: user.userId };
}

module.exports = {
  createUser,
  authenticateUser,
};
