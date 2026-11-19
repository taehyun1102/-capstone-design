
const express = require("express");
const mongoose = require("mongoose");

const Diary = require("../models/Diary");
const authenticateToken = require("../middleware/auth");
const { generateDiaryMoodAnalysis } = require("../diaryMoodAnalysisService");

const router = express.Router();

// 모든 일기 API는 로그인 인증 필요
router.use(authenticateToken);

// 일기 작성
router.post("/", async (req, res) => {
  try {
    const { title, content, date } = req.body;

    if (!title || !content || !date) {
      return res.status(400).json({
        message: "제목, 내용, 작성 날짜는 필수입니다.",
      });
    }

    const diary = await Diary.create({
      userId: req.userId,
      title,
      content,
      date,
    });

    return res.status(201).json({
      message: "일기가 저장되었습니다.",
      diary,
    });
  } catch (error) {
    console.error("일기 작성 오류:", error);

    return res.status(500).json({
      message: "일기 저장 중 오류가 발생했습니다.",
    });
  }
});

// 본인의 일기 목록 조회
router.get("/", async (req, res) => {
  try {
    const diaries = await Diary.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({ diaries });
  } catch (error) {
    console.error("일기 목록 조회 오류:", error);

    return res.status(500).json({
      message: "일기 목록을 불러오지 못했습니다.",
    });
  }
});

// 특정 일기 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "올바르지 않은 일기 ID입니다.",
      });
    }

    const diary = await Diary.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!diary) {
      return res.status(404).json({
        message: "일기를 찾을 수 없습니다.",
      });
    }

    return res.json({ diary });
  } catch (error) {
    console.error("일기 상세 조회 오류:", error);

    return res.status(500).json({
      message: "일기를 불러오지 못했습니다.",
    });
  }
});

// 일기 수정
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "올바르지 않은 일기 ID입니다.",
      });
    }

    if (!title || !content || !date) {
      return res.status(400).json({
        message: "제목, 내용, 작성 날짜는 필수입니다.",
      });
    }

    const diary = await Diary.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      {
        title,
        content,
        date,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!diary) {
      return res.status(404).json({
        message: "수정할 일기를 찾을 수 없습니다.",
      });
    }

    return res.json({
      message: "일기가 수정되었습니다.",
      diary,
    });
  } catch (error) {
    console.error("일기 수정 오류:", error);

    return res.status(500).json({
      message: "일기 수정 중 오류가 발생했습니다.",
    });
  }
});

// 일기 삭제
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "올바르지 않은 일기 ID입니다.",
      });
    }

    const diary = await Diary.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!diary) {
      return res.status(404).json({
        message: "삭제할 일기를 찾을 수 없습니다.",
      });
    }

    return res.json({
      message: "일기가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("일기 삭제 오류:", error);

    return res.status(500).json({
      message: "일기 삭제 중 오류가 발생했습니다.",
    });
  }
});

// 특정 일기의 AI 감정 분석
router.post("/:id/analyze", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "올바르지 않은 일기 ID입니다.",
      });
    }

    const diary = await Diary.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!diary) {
      return res.status(404).json({
        message: "분석할 일기를 찾을 수 없습니다.",
      });
    }

    if (!diary.content.trim()) {
      return res.status(400).json({
        message: "일기 내용이 비어 있습니다.",
      });
    }

    const result = await generateDiaryMoodAnalysis(diary.content);

    const analysisResult =
      typeof result === "string"
        ? result
        : result?.closing_mood_analysis;

    if (!analysisResult) {
      return res.status(500).json({
        message: "AI 감정 분석 결과를 생성하지 못했습니다.",
      });
    }

    diary.analysisResult = analysisResult;
    diary.analyzedAt = new Date();

    await diary.save();

    return res.json({
      message: "감정 분석이 완료되었습니다.",
      closing_mood_analysis: analysisResult,
      diary,
    });
  } catch (error) {
    console.error("일기 감정 분석 오류:", error);

    return res.status(500).json({
      message: "일기 감정 분석 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
