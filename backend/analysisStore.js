const Analysis = require("./models/Analysis");

// userId 미지정 시 사용할 기본값
const TEMP_USER_ID = "test-user";

async function saveAnalysis(record) {
  return Analysis.create(record);
}

// 사용자별 분석 이력 조회
async function getAnalysesByUserId(userId) {
  const records = await Analysis.find({ userId }).sort({ createdAt: -1 });
  return records.map((record) => record.toJSON());
}

module.exports = {
  TEMP_USER_ID,
  saveAnalysis,
  getAnalysesByUserId,
};
