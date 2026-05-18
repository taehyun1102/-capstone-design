const express = require("express");
const cors = require("cors");
const { generateMobileAnalysis } = require("./analyzeService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze", (req, res) => {
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

  const result = generateMobileAnalysis({
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

  res.json(result);
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
