
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");

const { generateMobileAnalysis } = require("./analyzeService");

const {
  saveAnalysis,
  getAnalysesByUserId,
  deleteAnalysisById,
} = require("./analysisStore");

const authRouter = require("./routes/auth");
const diaryRouter = require("./routes/diary");
const authenticateToken = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// 서버 상태 확인
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 회원가입 및 로그인 API
app.use("/api/auth", authRouter);

// 일기 CRUD 및 감정 분석 API
app.use("/api/diary", diaryRouter);

// 하루 생활 패턴 분석 API
// 로그인한 사용자만 분석 가능
app.post("/api/analyze", authenticateToken, async (req, res, next) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        error: "Invalid request body",
        message: "JSON 객체 형식의 body가 필요합니다.",
      });
    }

    const {
      mood,
      activity,
      fatigue,
      focusLevel,
      sleepQuality,
      stressLevel,
      distraction,
      digitalFeeling,
      aiHint,
      memo,
      socialInteraction,
      focusedTime,
      frequentActivity,
      temptingActivity,
      hasGoal,
      goalResult,
    } = body;

    if (!mood || !activity || !fatigue || !focusLevel) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "mood, activity, fatigue, focusLevel은 필수입니다.",
      });
    }

    if (typeof memo !== "string" || !memo.trim()) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "memo는 필수입니다.",
      });
    }

    // 요청 body가 아닌 인증된 사용자 ID 사용
    const userId = req.userId;

    const result = await generateMobileAnalysis({
      mood,
      activity,
      fatigue,
      focusLevel,
      sleepQuality,
      stressLevel,
      distraction,
      digitalFeeling,
      aiHint,
      memo,
      socialInteraction,
      focusedTime,
      frequentActivity,
      temptingActivity,
      hasGoal,
      goalResult,
    });


    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// 사용자가 직접 요청한 분석 결과만 MongoDB에 저장
app.post(
  "/api/analysis/save",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { userInput, result } = req.body || {};

      // 입력값 검증
      if (
        !userInput ||
        typeof userInput !== "object" ||
        Array.isArray(userInput) ||
        !result ||
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        return res.status(400).json({
          error: "Invalid request body",
          message: "userInput과 result가 필요합니다.",
        });
      }

      if (
        !result.summary ||
        !result.pattern ||
        !result.advice
      ) {
        return res.status(400).json({
          error: "Invalid analysis result",
          message: "분석 결과가 올바르지 않습니다.",
        });
      }

      // 인증된 사용자 ID 사용
      const userId = req.userId;

      // 사용자가 저장 버튼을 눌렀을 때만 실행
      const savedRecord = await saveAnalysis({
        userId,
        mood: userInput.mood,
        activity: userInput.activity,
        fatigue: userInput.fatigue,
        focusLevel: userInput.focusLevel,
        distraction: userInput.distraction,
        summary: result.summary,
        pattern: result.pattern,
        advice: result.advice,
        radar_chart: result.radar_chart,
        payload: {
          userInput,
        },
        result,
        createdAt: new Date(),
      });

      return res.status(201).json({
        message: "분석 기록이 저장되었습니다.",
        record: savedRecord,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 로그인한 사용자의 분석 기록만 조회
app.get(
  "/api/analysis/history",
  authenticateToken,
  async (req, res, next) => {
    try {
      const history = await getAnalysesByUserId(req.userId);
      return res.json(history);
    } catch (err) {
      next(err);
    }
  }
);

// 로그인한 사용자의 분석 기록만 삭제
app.delete(
  "/api/analysis/history/:id",
  authenticateToken,
  async (req, res, next) => {
    try {
      const deletedRecord = await deleteAnalysisById(
        req.userId,
        req.params.id
      );

      if (!deletedRecord) {
        return res.status(404).json({
          error: "Not Found",
          message: "삭제할 분석 기록을 찾을 수 없습니다.",
        });
      }

      return res.json({
        message: "분석 기록이 삭제되었습니다.",
      });
    } catch (err) {
      next(err);
    }
  }
);

// 존재하지 않는 API 요청 처리
app.use((_req, res) => {
  res.status(404).json({
    error: "Not Found",
  });
});

// 공통 오류 처리
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON",
      message: "요청 body가 올바른 JSON 형식이 아닙니다.",
    });
  }

  console.error("API 오류:", err.message || err);

  return res.status(500).json({
    error: "Internal Server Error",
    message: "요청 처리 중 오류가 발생했습니다.",
  });
});

// MongoDB 연결 후 서버 실행
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
