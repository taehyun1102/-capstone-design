
const {
  verifyAuthToken,
  getUserById,
} = require("../authStore");

// 로그인 인증 미들웨어
async function authenticateToken(req, res, next) {
  try {
    // Authorization 헤더 확인
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "로그인이 필요합니다.",
      });
    }

    // Bearer 다음의 토큰 추출
    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "인증 토큰이 없습니다.",
      });
    }

    // 토큰 서명 및 만료 시간 검증
    const decoded = verifyAuthToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Invalid token",
        message: "로그인 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.",
      });
    }

    // 실제 MongoDB에 사용자가 존재하는지 확인
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
      });
    }

    // 인증된 사용자 정보 저장
    req.userId = user.userId;

    next();
  } catch (err) {
    console.error("Authentication error:", err.message || err);

    return res.status(500).json({
      error: "Authentication failed",
      message: "로그인 인증 처리 중 오류가 발생했습니다.",
    });
  }
}

module.exports = authenticateToken;
