const OpenAI = require("openai");
const { SYSTEM_PROMPT, buildUserPrompt } = require("./prompt");

const FALLBACK_RADAR_CHART = [
  { axis: "신체 활력", value: 1 },
  { axis: "인지 몰입도", value: 1 },
  { axis: "목표 주도성", value: 1 },
  { axis: "사회적 유대", value: 1 },
  { axis: "자극 방어력", value: 1 },
  { axis: "심리적 안정", value: 1 },
];

const FALLBACK_RESPONSE = {
  summary: "입력하신 정보를 바탕으로 오늘 하루를 요약했습니다.",
  pattern: "제공된 데이터 범위에서 행동 경향을 해석했습니다.",
  advice: "내일은 오늘과 비슷한 시간대에 작은 목표를 세워 보세요.",
  radar_chart: FALLBACK_RADAR_CHART,
};

function getOpenRouterClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
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

function parseRadarChart(radarChart) {
  if (!Array.isArray(radarChart)) {
    return FALLBACK_RADAR_CHART;
  }

  const parsed = radarChart
    .filter(
      (item) =>
        item &&
        typeof item.axis === "string" &&
        typeof item.value === "number" &&
        Number.isFinite(item.value)
    )
    .map((item) => ({
      axis: item.axis,
      value: Math.max(1, Math.min(5, item.value)),
    }));

  if (parsed.length === 0) {
    return FALLBACK_RADAR_CHART;
  }

  return parsed;
}

function parseAnalysisContent(content) {
  try {
    const trimmed = (content || "").trim();

    if (!trimmed) {
      console.warn("⚠️ [AI 응답 내용 없음]");
      return { ...FALLBACK_RESPONSE };
    }

    // AI가 ```json ... ``` 형태로 응답하는 경우 처리
    const fenced = trimmed.match(
      /```(?:json)?\s*([\s\S]*?)```/i
    );

    const jsonText = fenced
      ? fenced[1].trim()
      : trimmed;

    const parsed = JSON.parse(jsonText);

    /*
     * AI 실제 응답 구조
     *
     * {
     *   "today_analysis": {
     *     "observed_facts": "...",
     *     "primary_driver": "...",
     *     "secondary_driver": "...",
     *     "adaptive_mechanism": "..."
     *   },
     *   "action_plan": {
     *     "environmental_friction": "...",
     *     "alternative_action": "..."
     *   },
     *   "radar_chart": [
     *     { "axis": "신체 활력", "value": 1 },
     *     { "axis": "인지 몰입도", "value": 1 },
     *     { "axis": "목표 주도성", "value": 1 },
     *     { "axis": "사회적 유대", "value": 1 },
     *     { "axis": "자극 방어력", "value": 1 },
     *     { "axis": "심리적 안정", "value": 1 }
     *   ]
     * }
     */

    if (
      parsed.today_analysis &&
      parsed.action_plan
    ) {
      const todayAnalysis =
        parsed.today_analysis;

      const actionPlan =
        parsed.action_plan;

      const summary =
        todayAnalysis.observed_facts ||
        FALLBACK_RESPONSE.summary;

      const patternParts = [];

      if (todayAnalysis.primary_driver) {
        patternParts.push(
          `주요 행동 요인: ${todayAnalysis.primary_driver}`
        );
      }

      if (todayAnalysis.secondary_driver) {
        patternParts.push(
          `보조 행동 요인: ${todayAnalysis.secondary_driver}`
        );
      }

      if (todayAnalysis.adaptive_mechanism) {
        patternParts.push(
          todayAnalysis.adaptive_mechanism
        );
      }

      const adviceParts = [];

      if (actionPlan.environmental_friction) {
        adviceParts.push(
          `환경 조정: ${actionPlan.environmental_friction}`
        );
      }

      if (actionPlan.alternative_action) {
        adviceParts.push(
          `대안 행동: ${actionPlan.alternative_action}`
        );
      }

      return {
        summary: String(summary),

        pattern: String(
          patternParts.length > 0
            ? patternParts.join("\n\n")
            : FALLBACK_RESPONSE.pattern
        ),

        advice: String(
          adviceParts.length > 0
            ? adviceParts.join("\n\n")
            : FALLBACK_RESPONSE.advice
        ),

        radar_chart: parseRadarChart(
          parsed.radar_chart
        ),
      };
    }

    /*
     * 기존 summary / pattern / advice 형식도 지원
     *
     * {
     *   "summary": "...",
     *   "pattern": "...",
     *   "advice": "...",
     *   "radar_chart": [...]
     * }
     */

    if (
      parsed.summary &&
      parsed.pattern &&
      parsed.advice
    ) {
      return {
        summary: String(parsed.summary),
        pattern: String(parsed.pattern),
        advice: String(parsed.advice),
        radar_chart: parseRadarChart(
          parsed.radar_chart
        ),
      };
    }

    console.warn(
      "⚠️ [AI 응답 형식 불일치]:",
      parsed
    );

    return { ...FALLBACK_RESPONSE };
  } catch (error) {
    console.error(
      "❌ [AI 응답 파싱 에러]:",
      error
    );

    return { ...FALLBACK_RESPONSE };
  }
}

async function requestAnalysis(data) {
  const model =
    process.env.OPENROUTER_MODEL ||
    "google/gemini-2.5-flash";

  console.log(
    `🤖 [OpenRouter 분석 요청 시작] 모델: ${model}`
  );

  const openrouter =
    getOpenRouterClient();

  const completion =
    await openrouter.chat.completions.create({
      model: model,

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

  console.log(
    "✅ [OpenRouter API 응답 성공]"
  );

  const content =
    completion.choices[0]?.message?.content;

  console.log(
    "📄 [OpenRouter 응답 내용]:",
    content
  );

  const result =
    parseAnalysisContent(content);

  console.log(
    "🔍 [AI 응답 파싱 완료]:",
    result
  );

  return result;
}

/**
 * @param {object} input 모바일 앱 req.body
 * @returns {Promise<{
 *   summary: string,
 *   pattern: string,
 *   advice: string,
 *   radar_chart: Array<{axis: string, value: number}>
 * }>}
 */
async function generateMobileAnalysis(
  input = {}
) {
  try {
    console.log(
      "📥 [AI 분석 요청 수신]"
    );

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        "OPENROUTER_API_KEY is not set"
      );
    }

    const data =
      toPromptData(input);

    const result =
      await requestAnalysis(data);

    console.log(
      "📤 [AI 분석 완료]"
    );

    return result;
  } catch (error) {
    console.error(
      "❌ [AI 분석 통신 에러]:",
      error
    );

    return {
      ...FALLBACK_RESPONSE,
    };
  }
}

module.exports = {
  generateMobileAnalysis,
};