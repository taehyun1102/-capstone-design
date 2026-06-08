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
    verified: false,
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
  // [이메일 인증 연동] 인증 성공 시 verified 상태를 true로 저장
  codes.set(key, {
    ...entry,
    verified: true,
  });

  return { ok: true };
}

// [이메일 인증 연동] 회원가입 전 이메일 인증 완료 여부 확인
function isEmailVerified(email) {
  const entry = codes.get(normalizeEmail(email));
  return entry?.verified === true;
}

// [이메일 인증 연동] 회원가입 성공 후 인증 상태 제거
function clearVerification(email) {
  codes.delete(normalizeEmail(email));
}

module.exports = {
  CODE_TTL_MS,
  generateCode,
  saveCode,
  verifyCode,
  isEmailVerified,
  clearVerification,
};
