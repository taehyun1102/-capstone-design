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
      console.warn("⚠️ [AI 응답 내용 없음]");
      return { ...FALLBACK_RESPONSE };
    }

    // Gemini가 ```json ... ``` 형태로 응답하는 경우 처리
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonText = fenced ? fenced[1].trim() : trimmed;

    const parsed = JSON.parse(jsonText);

    /*
     * Gemini 실제 응답 구조
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
     *   }
     * }
     */

    if (
      parsed.today_analysis &&
      parsed.action_plan
    ) {
      const todayAnalysis = parsed.today_analysis;
      const actionPlan = parsed.action_plan;

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
      };
    }

    /*
     * 기존 summary / pattern / advice 형식도 지원
     *
     * 프롬프트가 나중에 변경되어 Gemini가
     * 다음과 같은 형태를 반환하더라도 정상 처리합니다.
     *
     * {
     *   "summary": "...",
     *   "pattern": "...",
     *   "advice": "..."
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
      };
    }

    console.warn(
      "⚠️ [AI 응답 형식 불일치]:",
      parsed
    );

    return { ...FALLBACK_RESPONSE };
  } catch (error) {
    console.error("❌ [AI 응답 파싱 에러]:", error);

    return { ...FALLBACK_RESPONSE };
  }
}

async function requestAnalysis(data) {
  console.log("🤖 [Gemini 분석 요청 시작]");

  const gemini = getGeminiClient();

  const completion =
    await gemini.chat.completions.create({
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

  const content =
    completion.choices[0]?.message?.content;

  console.log(
    "📄 [Gemini 응답 내용]:",
    content
  );

  const result = parseAnalysisContent(content);

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
 *   advice: string
 * }>}
 */
async function generateMobileAnalysis(input = {}) {
  try {
    console.log("📥 [AI 분석 요청 수신]");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set"
      );
    }

    const data = toPromptData(input);

    const result =
      await requestAnalysis(data);

    console.log("📤 [AI 분석 완료]");

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