/**
 * 모바일 앱 입력 기준 규칙 기반 분석 (summary, pattern, advice)
 */

function trimMemoSnippet(memo, maxLen = 36) {
  const trimmed = (memo || "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}…`;
}

function isStudyActivity(activity) {
  return activity === "공부" || activity === "과제";
}

function isDigitalStimulusActivity(activity) {
  return activity === "게임" || activity === "영상 시청";
}

function isHighFatigue(fatigue) {
  return fatigue === "높음" || fatigue === "매우 높음";
}

function isLowFocus(focusLevel) {
  return focusLevel === "낮음" || focusLevel === "집중 어려움";
}

function isPoorSleep(sleepQuality) {
  return sleepQuality === "부족함" || sleepQuality === "매우 부족함";
}

function isHighStress(stressLevel) {
  return stressLevel === "높음" || stressLevel === "매우 높음";
}

function isDigitalOverload(digitalFeeling) {
  return digitalFeeling === "많았음" || digitalFeeling === "조절이 어려웠음";
}

function buildSummary({
  mood,
  activity,
  fatigue,
  focusLevel,
  sleepQuality,
  stressLevel,
  memo,
  hasScreenshot,
}) {
  const parts = [];

  if (isStudyActivity(activity)) {
    parts.push(`오늘은 ${activity} 중심의 활동이 이루어진 것으로 보입니다`);
  } else if (isDigitalStimulusActivity(activity)) {
    parts.push(
      `오늘은 ${activity} 위주의 디지털 사용이 두드러진 하루로 보입니다`
    );
  } else if (activity) {
    parts.push(`오늘은 ${activity}을(를) 중심으로 한 하루로 보입니다`);
  } else {
    parts.push("입력하신 정보를 바탕으로 오늘 하루를 정리했습니다");
  }

  if (isHighFatigue(fatigue)) {
    parts.push("피로도가 다소 높은 상태로 보입니다");
  }

  if (mood) {
    parts.push(`전반적인 기분은 '${mood}'(으)로 기록되었습니다`);
  }

  if (isHighStress(stressLevel)) {
    parts.push("스트레스 수준도 높게 느껴지는 하루였을 수 있습니다");
  }

  const memoSnippet = trimMemoSnippet(memo);
  if (memoSnippet) {
    parts.push(`메모에는 "${memoSnippet}"라고 남기셨습니다`);
  }

  if (hasScreenshot) {
    parts.push("스크린샷 자료도 함께 참고했습니다");
  }

  return `${parts.join(", ")}.`;
}

function buildPattern({
  activity,
  fatigue,
  focusLevel,
  sleepQuality,
  stressLevel,
  distraction,
  digitalFeeling,
  aiHint,
}) {
  const parts = [];

  if (focusLevel === "높음") {
    parts.push("집중 흐름이 비교적 잘 유지된 패턴으로 보입니다");
  } else if (isLowFocus(focusLevel)) {
    parts.push("집중이 쉽게 흐트러지는 흐름이 관찰될 수 있습니다");
  }

  if (isStudyActivity(activity)) {
    parts.push("학습·과제 중심의 목표 지향적 활동 비중이 높았을 수 있습니다");
  } else if (isDigitalStimulusActivity(activity)) {
    parts.push(
      "즉각적 자극을 주는 디지털 활동 비중이 높아진 패턴일 수 있습니다"
    );
  }

  if (isHighFatigue(fatigue)) {
    parts.push("피로 누적으로 인지 자원이 소모된 흐름이 반영되었을 수 있습니다");
  }

  if (isPoorSleep(sleepQuality)) {
    parts.push("수면 부족이 하루 컨디션과 집중에 영향을 주었을 수 있습니다");
  }

  if (isHighStress(stressLevel)) {
    parts.push("스트레스가 활동 선택과 감정 흐름에 영향을 주었을 가능성이 있습니다");
  }

  if (distraction && distraction !== "없음") {
    parts.push(
      `'${distraction}'(이)가 집중을 방해한 요소로 작용했을 가능성이 있습니다`
    );
  }

  if (isDigitalOverload(digitalFeeling)) {
    parts.push("디지털 사용 조절에 어려움이 있었던 것으로 보입니다");
  }

  if (aiHint) {
    const hintMessages = {
      "집중 패턴": "집중 리듬의 변화에 특히 주목할 필요가 있습니다",
      "감정 변화": "감정 기복과 활동 선택의 연결이 드러날 수 있습니다",
      "디지털 과사용": "디지털 사용량과 조절 경험이 핵심 분석 포인트입니다",
      "피로/회복": "피로 누적과 회복 시간의 균형이 중요해 보입니다",
      "생활 균형": "활동·휴식·수면 간 균형을 점검할 여지가 있습니다",
    };
    if (hintMessages[aiHint]) {
      parts.push(hintMessages[aiHint]);
    } else {
      parts.push(`'${aiHint}' 관점에서 하루를 해석했습니다`);
    }
  }

  if (parts.length === 0) {
    return "입력된 활동과 상태를 종합하면 특별히 두드러진 패턴은 제한적으로 보입니다.";
  }

  return `${parts.join(", ")}.`;
}

function buildAdvice({
  activity,
  fatigue,
  focusLevel,
  sleepQuality,
  stressLevel,
  digitalFeeling,
  aiHint,
}) {
  const parts = [];

  if (isHighFatigue(fatigue) || isPoorSleep(sleepQuality)) {
    parts.push(
      "가능하다면 휴식 시간을 늘리고 수면 리듬을 안정화하는 것이 도움이 될 수 있습니다"
    );
  }

  if (isDigitalStimulusActivity(activity) || isDigitalOverload(digitalFeeling)) {
    parts.push(
      "저녁 시간에는 디지털 사용을 줄이고 짧은 휴식을 넣어 보세요"
    );
  }

  if (isLowFocus(focusLevel)) {
    parts.push(
      "짧은 집중 구간(예: 25분)과 휴식을 나누어 시도해 보는 것도 좋습니다"
    );
  }

  if (isHighStress(stressLevel)) {
    parts.push("가벼운 스트레칭이나 산책으로 긴장을 완화해 보세요");
  }

  if (focusLevel === "높음" && isStudyActivity(activity)) {
    parts.push(
      "잘 유지된 집중 리듬을 내일도 비슷한 시간대에 반복해 보세요"
    );
  }

  if (aiHint === "디지털 과사용") {
    parts.push("특정 시간대에 앱 사용 알림 제한을 설정해 보는 것도 도움이 됩니다");
  } else if (aiHint === "피로/회복") {
    parts.push("오늘보다 일찍 쉬는 시간을 확보해 보세요");
  } else if (aiHint === "집중 패턴") {
    parts.push("집중이 잘 됐던 시간대를 메모해 두고 내일 재현해 보세요");
  }

  if (parts.length === 0) {
    return "오늘의 리듬을 기록해 두고 내일 같은 시간대에 작은 목표를 세워 보세요.";
  }

  return `${parts[0]}.`;
}

/**
 * @param {object} input 모바일 앱 req.body
 * @returns {{ summary: string, pattern: string, advice: string }}
 */
function generateMobileAnalysis(input = {}) {
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
  } = input;

  return {
    summary: buildSummary({
      mood,
      activity,
      fatigue,
      focusLevel,
      sleepQuality,
      stressLevel,
      memo,
      hasScreenshot: Boolean(hasScreenshot),
    }),
    pattern: buildPattern({
      activity,
      fatigue,
      focusLevel,
      sleepQuality,
      stressLevel,
      distraction,
      digitalFeeling,
      aiHint,
    }),
    advice: buildAdvice({
      activity,
      fatigue,
      focusLevel,
      sleepQuality,
      stressLevel,
      digitalFeeling,
      aiHint,
    }),
  };
}

module.exports = { generateMobileAnalysis };
