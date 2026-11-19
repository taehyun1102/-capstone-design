
const mongoose = require("mongoose");
const Analysis = require("./models/Analysis");

// userId 미지정 시 사용할 기본값
const TEMP_USER_ID = "test-user";

// 분석 결과 저장
async function saveAnalysis(record) {
  return Analysis.create(record);
}

// 사용자별 분석 이력 조회
async function getAnalysesByUserId(userId) {
  const records = await Analysis.find({ userId }).sort({ createdAt: -1 });
  return records.map((record) => record.toJSON());
}

// 특정 사용자의 분석 기록만 삭제
async function deleteAnalysisById(userId, analysisId) {
  if (!mongoose.isValidObjectId(analysisId)) {
    return null;
  }

  return Analysis.findOneAndDelete({
    _id: analysisId,
    userId,
  });
}

module.exports = {
  TEMP_USER_ID,
  saveAnalysis,
  getAnalysesByUserId,
  deleteAnalysisById,
};
