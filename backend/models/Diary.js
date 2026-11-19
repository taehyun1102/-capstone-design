const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema(
  {
    // 일기를 작성한 사용자 ID
    userId: {
      type: String,
      required: true,
    },

    // 일기 제목
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // 일기 내용
    content: {
      type: String,
      required: true,
    },

    // 작성 날짜
    date: {
      type: String,
      required: true,
    },

    // AI 감정 분석 결과
    analysisResult: {
      type: String,
      default: "",
    },

    // AI 분석 날짜
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 사용자별 일기 조회를 위한 인덱스
diarySchema.index({ userId: 1, createdAt: -1 });

// 응답 데이터에서 MongoDB 내부 필드 정리
diarySchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;
    delete ret.userId;

    return ret;
  },
});

module.exports = mongoose.model("Diary", diarySchema);