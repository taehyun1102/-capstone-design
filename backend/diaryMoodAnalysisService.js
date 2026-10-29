
const OpenAI = require("openai");
const {
  SYSTEM_PROMPT,
  buildUserPrompt,
} = require("./diaryMoodAnalysisPrompt");

async function generateDiaryMoodAnalysis(diaryText) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY가 설정되지 않았습니다.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(diaryText) },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI 분석 결과가 비어 있습니다.");
  }

  let result;

  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("AI 분석 결과가 올바른 JSON 형식이 아닙니다.");
  }

  if (
    typeof result.closing_mood_analysis !== "string" ||
    !result.closing_mood_analysis.trim()
  ) {
    throw new Error("AI 응답에 closing_mood_analysis가 없습니다.");
  }

  return {
    closing_mood_analysis: result.closing_mood_analysis.trim(),
  };
}

module.exports = { generateDiaryMoodAnalysis };
