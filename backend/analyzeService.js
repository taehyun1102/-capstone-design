const OpenAI = require("openai");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prompt");

const FALLBACK_RESPONSE = {
  summary: "입력하신 정보를 바탕으로 오늘 하루를 요약했습니다.",
  pattern: "제공된 데이터 범위에서 행동 경향을 해석했습니다.",
  advice: "내일은 오늘과 비슷한 시간대에 작은 목표를 세워 보세요.",
};

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
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
  } catch {
    return { ...FALLBACK_RESPONSE };
  }
}

async function requestAnalysis(data) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(data) },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  return parseAnalysisContent(content);
}

/**
 * @param {object} input 모바일 앱 req.body
 * @returns {Promise<{ summary: string, pattern: string, advice: string }>}
 */
async function generateMobileAnalysis(input = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const data = toPromptData(input);
    return await requestAnalysis(data);
  } catch {
    return { ...FALLBACK_RESPONSE };
  }
}

module.exports = {
  generateMobileAnalysis,
};
