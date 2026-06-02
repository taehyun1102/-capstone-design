const CODE_TTL_MS = 5 * 60 * 1000;

const codes = new Map();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function saveCode(email, code) {
  codes.set(normalizeEmail(email), {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  });
}

function verifyCode(email, code) {
  const key = normalizeEmail(email);
  const entry = codes.get(key);

  if (!entry) {
    return { ok: false, error: "NOT_FOUND" };
  }

  if (Date.now() > entry.expiresAt) {
    codes.delete(key);
    return { ok: false, error: "EXPIRED" };
  }

  if (entry.code !== String(code).trim()) {
    return { ok: false, error: "INVALID" };
  }

  codes.delete(key);
  return { ok: true };
}

module.exports = {
  CODE_TTL_MS,
  generateCode,
  saveCode,
  verifyCode,
};
