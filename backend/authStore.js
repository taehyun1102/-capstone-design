const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const SALT_ROUNDS = 10;

async function findUserByEmail(email) {
  return User.findOne({ email: email.trim().toLowerCase() });
}

async function findUserByUsername(username) {
  return User.findOne({ username: username.trim() });
}

async function isUsernameAvailable(username) {
  const user = await findUserByUsername(username);
  return !user;
}

// 회원가입 데이터를 저장합니다.
async function createUser({ name, username, email, password }) {
  try {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const existingEmail = await findUserByEmail(trimmedEmail);
    if (existingEmail) {
      return { ok: false, error: "EMAIL_EXISTS" };
    }

    const existingUsername = await findUserByUsername(trimmedUsername);
    if (existingUsername) {
      return { ok: false, error: "USERNAME_EXISTS" };
    }

    const userId = `user-${crypto.randomUUID()}`;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      userId,
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
    });

    return { ok: true, userId };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return { ok: false, error: "USERNAME_EXISTS" };
      }
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
  isUsernameAvailable,
};
