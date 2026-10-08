const mongoose = require("mongoose");

// 사용자 계정 스키마
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  // 비밀번호 찾기용 보안 질문
  securityQuestion: {
    type: String,
    required: true,
  },

  // 비밀번호 찾기용 보안 질문 답변
  // 실제 저장할 때는 bcrypt로 해시해서 저장
  securityAnswer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);