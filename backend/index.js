const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const { generateMobileAnalysis } = require("./analyzeService");
const {
  TEMP_USER_ID,
  saveAnalysis,
  getAnalysesByUserId,
} = require("./analysisStore");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

// 분석 생성 API입니다.
app.post("/api/analyze", async (req, res) => {
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
  hasScreenshot,
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

  if (!memo || typeof memo !== "string" || memo.trim() === "") {
    return res.status(400).json({
      error: "Missing required fields",
      message: "memo는 필수입니다.",
    });
  }

  // userId가 없으면 임시 사용자 ID를 사용합니다.
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
  hasScreenshot,
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

  res.json(result);
});

// 분석 히스토리 조회 API입니다.
app.get("/api/analysis/history", async (req, res) => {
  const userId = req.query.userId || TEMP_USER_ID;
  const history = await getAnalysesByUserId(userId);
  res.json(history);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// 공통 에러 처리
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON",
      message: "요청 body가 올바른 JSON 형식이 아닙니다.",
    });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// DB 연결 성공 후 서버 시작
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
