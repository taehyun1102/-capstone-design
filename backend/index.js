const express = require("express");
const cors = require("cors");
const { generateAiDetectedPatterns } = require("./patternGenerator");

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

  const userInput = body.userInput ?? {};
  const existingPatterns = Array.isArray(body.aiDetectedPatterns)
    ? [...body.aiDetectedPatterns]
    : [];

  const response = {
    analyzedAt: body.analyzedAt || new Date().toISOString(),
    userInput,
    screenshotInfo: body.screenshotInfo ?? {
      uploaded: false,
      fileName: "",
      analyzed: false,
      skipped: true,
      estimatedConfidence: 0,
    },
    aiDetectedPatterns: generateAiDetectedPatterns(userInput, existingPatterns),
  };

  res.json(response);
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
