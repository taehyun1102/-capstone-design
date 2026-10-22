
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const { generateMobileAnalysis } = require("./analyzeService");
const {
  TEMP_USER_ID,
  saveAnalysis,
  getAnalysesByUserId,
} = require("./analysisStore");
const { generateDiaryMoodAnalysis } = require("./diaryMoodAnalysisService");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

// 기존 하루 분석 API
app.post("/api/analyze", async (req, res, next) => {
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

    const userId = body.userId || TEMP_USER_ID;

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

    await saveAnalysis({
      userId,
      mood,
      activity,
      fatigue,
      focusLevel,
      distraction,
      summary: result.summary,
      pattern: result.pattern,
      advice: result.advice,
      createdAt: new Date(),
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// 새 일기 감정 분석 API
app.post("/api/diary/analyze", async (req, res, next) => {
  try {
    const { diaryText } = req.body || {};

    if (typeof diaryText !== "string" || !diaryText.trim()) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "diaryText는 필수입니다.",
      });
    }

    const result = await generateDiaryMoodAnalysis(diaryText);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// 기존 분석 기록 조회 API
app.get("/api/analysis/history", async (req, res, next) => {
  try {
    const userId = req.query.userId || TEMP_USER_ID;
    const history = await getAnalysesByUserId(userId);
    return res.json(history);
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

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
