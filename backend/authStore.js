let users = [];

function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

function createUser(email, password) {
  if (findUserByEmail(email)) {
    return { ok: false, error: "EMAIL_EXISTS" };
  }

  const userId = `user-${Date.now()}`;
  users.push({ userId, email, password });

  return { ok: true, userId };
}

function authenticateUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false };
  }

  return { ok: true, userId: user.userId };
}

module.exports = {
  createUser,
  authenticateUser,
};
