const express = require("express");
const cors = require("cors");
const { generateMobileAnalysis } = require("./analyzeService");
const {
  TEMP_USER_ID,
  saveAnalysis,
  getAnalysesByUserId,
} = require("./analysisStore");
const { createUser, authenticateUser } = require("./authStore");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/signup", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "email, password는 필수입니다.",
    });
  }

  const result = createUser(email, password);

  if (!result.ok) {
    return res.status(409).json({
      error: "Email already exists",
      message: "이미 가입된 이메일입니다.",
    });
  }

  res.status(201).json({
    message: "회원가입 성공",
    userId: result.userId,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "email, password는 필수입니다.",
    });
  }

  const result = authenticateUser(email, password);

  if (!result.ok) {
    return res.status(401).json({
      error: "Invalid credentials",
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    });
  }

  res.json({
    message: "로그인 성공",
    userId: result.userId,
  });
});

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
  });

  saveAnalysis({
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

app.get("/api/analysis/history", (req, res) => {
  const userId = req.query.userId || TEMP_USER_ID;
  const history = getAnalysesByUserId(userId);
  res.json(history);
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

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
