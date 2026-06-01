const mongoose = require("mongoose");

// 분석 결과 스키마
const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mood: { type: String },
  activity: { type: String },
  fatigue: { type: String },
  focusLevel: { type: String },
  distraction: { type: String },
  summary: { type: String },
  pattern: { type: String },
  advice: { type: String },
  createdAt: { type: Date, default: Date.now },
});

analysisSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Analysis", analysisSchema);
