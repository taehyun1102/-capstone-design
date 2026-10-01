const OpenAI = require("openai");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prompt");

const FALLBACK_RESPONSE = {
  summary: "입력하신 정보를 바탕으로 오늘 하루를 요약했습니다.",
  pattern: "제공된 데이터 범위에서 행동 경향을 해석했습니다.",
  advice: "내일은 오늘과 비슷한 시간대에 작은 목표를 세워 보세요.",
};

function getGeminiClient() {
  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

function toPromptData(input = {}) {
  return {
    mood: input.mood ?? "",
    activity: input.activity ?? "",
    fatigue: input.fatigue ?? "",
    focusLevel: input.focusLevel ?? "",
    distraction: input.distraction ?? "",
    memo: input.memo ?? "",
    hasScreenshot: Boolean(input.hasScreenshot),
    sleepQuality: input.sleepQuality ?? "",
    stressLevel: input.stressLevel ?? "",
    digitalFeeling: input.digitalFeeling ?? "",
    aiHint: input.aiHint ?? "",
  };
}

function parseAnalysisContent(content) {
  try {
    const trimmed = (content || "").trim();

    if (!trimmed) {
      return { ...FALLBACK_RESPONSE };
    }

    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonText = fenced ? fenced[1].trim() : trimmed;

    const parsed = JSON.parse(jsonText);

    if (!parsed.summary || !parsed.pattern || !parsed.advice) {
      return { ...FALLBACK_RESPONSE };
    }

    return {
      summary: String(parsed.summary),
      pattern: String(parsed.pattern),
      advice: String(parsed.advice),
    };
  } catch (error) {
    console.error("❌ [AI 응답 파싱 에러]:", error);
    return { ...FALLBACK_RESPONSE };
  }
}

async function requestAnalysis(data) {
  console.log("🤖 [Gemini 분석 요청 시작]");

  const gemini = getGeminiClient();

  const completion = await gemini.chat.completions.create({
    model: "gemini-3.6-flash",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildUserPrompt(data),
      },
    ],
  });

  console.log("✅ [Gemini API 응답 성공]");

  const content = completion.choices[0]?.message?.content;

  console.log("📄 [Gemini 응답 내용]:", content);

  const result = parseAnalysisContent(content);

  console.log("🔍 [AI 응답 파싱 완료]:", result);

  return result;
}

/**
 * @param {object} input 모바일 앱 req.body
 * @returns {Promise<{ summary: string, pattern: string, advice: string }>}
 */
async function generateMobileAnalysis(input = {}) {
  try {
    console.log("📥 [AI 분석 요청 수신]");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const data = toPromptData(input);

    const result = await requestAnalysis(data);

    console.log("📤 [AI 분석 완료]");

    return result;
  } catch (error) {
    console.error("❌ [AI 분석 통신 에러]:", error);

    return { ...FALLBACK_RESPONSE };
  }
}

module.exports = {
  generateMobileAnalysis,
};