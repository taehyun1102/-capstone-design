
const mongoose = require("mongoose");

// 분석 결과 스키마
const analysisSchema = new mongoose.Schema({
  // 사용자 구분
  userId: {
    type: String,
    required: true,
    index: true,
  },

  // 주요 분석 입력값
  mood: { type: String },
  activity: { type: String },
  fatigue: { type: String },
  focusLevel: { type: String },
  distraction: { type: String },

  // AI 분석 결과
  summary: { type: String },
  pattern: { type: String },
  advice: { type: String },

  // 당시 입력 정보
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  // AI 분석 결과 전체
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  // 육각형 레이더 차트 데이터
  radar_chart: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 사용자별 분석 기록을 최신순으로 조회하기 위한 인덱스
analysisSchema.index({ userId: 1, createdAt: -1 });

// JSON 변환 설정
analysisSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;

    // 사용자 식별 정보는 응답에서 제외
    delete ret.userId;

    return ret;
  },
});

module.exports = mongoose.model("Analysis", analysisSchema);
