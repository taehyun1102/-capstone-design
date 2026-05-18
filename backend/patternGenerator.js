/**
 * userInput.mainActivity, fatigueLevel, dayMood 기반 aiDetectedPatterns 생성
 * 피로 패턴은 기존 배열을 덮어쓰지 않고 push로만 추가
 */

const ACTIVITY_PATTERNS = {
  공부: [
    {
      id: "study-focus-flow",
      title: "학습 중심 집중 흐름",
      confidence: 82,
      category: "집중 패턴",
      detail:
        "오늘의 중심 활동이 학습으로 기록되어, 목표 지향적 집중 구간이 형성되었을 가능성이 있습니다.",
    },
    {
      id: "study-deep-work",
      title: "심층 학습 구간 감지",
      confidence: 74,
      category: "학습 패턴",
      detail:
        "연속적인 학습 몰입이 유지되었다면 인지 자원을 효율적으로 사용한 하루일 수 있습니다.",
    },
  ],
  "유튜브/영상 시청": [
    {
      id: "video-passive-consumption",
      title: "수동적 콘텐츠 소비 패턴",
      confidence: 76,
      category: "디지털 사용",
      detail:
        "영상 시청이 하루의 주축이 되면 자극 수용형 활동 비중이 높아질 수 있습니다.",
    },
    {
      id: "video-time-extension",
      title: "시청 시간 연장 경향",
      confidence: 68,
      category: "시간 사용",
      detail:
        "짧은 휴식 대신 영상 시청으로 전환되면 계획된 활동 시간이 늘어날 수 있습니다.",
    },
  ],
  게임: [
    {
      id: "game-usage-increase",
      title: "게임 사용 증가 패턴",
      confidence: 80,
      category: "디지털 사용",
      detail:
        "게임이 중심 활동으로 기록되어 즉각 보상 추구형 사용이 두드러졌을 가능성이 있습니다.",
    },
    {
      id: "game-stimulation-seeking",
      title: "자극 추구 활동 우세",
      confidence: 73,
      category: "행동 경향",
      detail:
        "고자극 콘텐츠에 몰입하면 장기 목표보다 단기 만족에 인지 자원이 쏠릴 수 있습니다.",
    },
  ],
  "SNS/채팅": [
    {
      id: "sns-social-loop",
      title: "SNS·채팅 반복 확인 패턴",
      confidence: 77,
      category: "디지털 사용",
      detail:
        "사회적 연결 욕구가 디지털 채널로 주로 해소된 하루로 해석될 수 있습니다.",
    },
    {
      id: "sns-attention-fragment",
      title: "주의 분산형 사용 흐름",
      confidence: 70,
      category: "집중 패턴",
      detail:
        "짧은 간격의 메시지·피드 확인이 집중 지속 시간을 나눌 수 있습니다.",
    },
  ],
  "휴식/기타": [
    {
      id: "rest-recovery-day",
      title: "회복 중심 하루 흐름",
      confidence: 71,
      category: "에너지 상태",
      detail:
        "활동 강도가 낮은 하루는 신체·정서적 회복에 초점이 맞춰진 것으로 볼 수 있습니다.",
    },
  ],
};

const FATIGUE_PATTERNS = {
  "매우 낮음": {
    id: "fatigue-very-low",
    title: "에너지 여유 상태",
    confidence: 68,
    category: "에너지 상태",
    detail: "피로도가 낮게 기록되어 추가 활동 여력이 남아 있을 수 있습니다.",
  },
  낮음: {
    id: "fatigue-low",
    title: "안정적 에너지 유지",
    confidence: 65,
    category: "에너지 상태",
    detail: "전반적으로 가벼운 하루 흐름으로 해석될 수 있습니다.",
  },
  높음: {
    id: "fatigue-high",
    title: "피로 누적 패턴",
    confidence: 79,
    category: "에너지 상태",
    detail:
      "높은 피로도가 기록되어 집중력·자기통제력이 저하되었을 가능성이 있습니다.",
  },
  "매우 높음": {
    id: "fatigue-very-high",
    title: "고강도 피로 누적",
    confidence: 88,
    category: "에너지 상태",
    detail:
      "매우 높은 피로는 수면·휴식 부족과 연관될 수 있으며, 회복 우선이 권장됩니다.",
  },
};

const MOOD_PATTERNS = {
  "생산적이었음": {
    id: "mood-productive",
    title: "생산적 하루 정서",
    confidence: 75,
    category: "정서 패턴",
    detail:
      "성취감·만족감이 높은 하루로 기록되어 목표 지향 행동과 잘 맞았을 수 있습니다.",
  },
  "평소와 비슷했음": {
    id: "mood-stable",
    title: "안정적 일상 리듬",
    confidence: 62,
    category: "정서 패턴",
    detail: "특별한 변동 없이 평소와 유사한 패턴이 유지된 것으로 보입니다.",
  },
  "조금 흐트러졌음": {
    id: "mood-disrupted",
    title: "리듬 흐트러짐 감지",
    confidence: 71,
    category: "정서 패턴",
    detail:
      "계획과 실제 행동 간 간극이 있었을 수 있으며, 집중 흐름이 끊긴 구간이 있었을 수 있습니다.",
  },
  피곤했음: {
    id: "mood-tired",
    title: "피곤함 중심 정서",
    confidence: 77,
    category: "정서 패턴",
    detail:
      "전반적 무기력·피로감이 하루 평가에 반영되어, 활동 선택에 영향을 주었을 수 있습니다.",
  },
};

const DEFAULT_PATTERN = {
  id: "baseline-daily",
  title: "일반적 하루 패턴",
  confidence: 60,
  category: "종합",
  detail: "입력된 활동·상태를 바탕으로 하루 흐름을 분석했습니다.",
};

function dedupeById(patterns) {
  const seen = new Set();
  return patterns.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function hasPatternId(patterns, id) {
  return patterns.some((p) => p.id === id);
}

function appendActivityPatterns(patterns, mainActivity) {
  const activityPatterns = ACTIVITY_PATTERNS[mainActivity];
  if (activityPatterns?.length) {
    for (const pattern of activityPatterns) {
      if (!hasPatternId(patterns, pattern.id)) {
        patterns.push(pattern);
      }
    }
    return;
  }

  if (mainActivity && !hasPatternId(patterns, "activity-unknown")) {
    patterns.push({
      ...DEFAULT_PATTERN,
      id: "activity-unknown",
      title: `${mainActivity} 중심 활동`,
      detail: `오늘의 중심 활동이 '${mainActivity}'(으)로 기록되었습니다.`,
    });
  }
}

function appendMoodPattern(patterns, dayMood) {
  const moodPattern = MOOD_PATTERNS[dayMood];
  if (moodPattern && !hasPatternId(patterns, moodPattern.id)) {
    patterns.push(moodPattern);
  }
}

/**
 * 피로 관련 패턴을 기존 배열 끝에 push (덮어쓰지 않음)
 * @param {Array} patterns
 * @param {string} [fatigueLevel]
 */
function appendFatiguePatterns(patterns, fatigueLevel) {
  if (!fatigueLevel || fatigueLevel === "보통") {
    return patterns;
  }

  const fatiguePattern = FATIGUE_PATTERNS[fatigueLevel];
  if (fatiguePattern && !hasPatternId(patterns, fatiguePattern.id)) {
    patterns.push(fatiguePattern);
  }

  return patterns;
}

/**
 * @param {Record<string, string>} userInput
 * @param {Array} [existingPatterns] 요청에 포함된 기존 패턴 (있으면 유지 후 추가)
 */
function generateAiDetectedPatterns(userInput = {}, existingPatterns = []) {
  const patterns = [...existingPatterns];

  const { mainActivity, fatigueLevel, dayMood } = userInput;

  appendActivityPatterns(patterns, mainActivity);
  appendMoodPattern(patterns, dayMood);

  if (patterns.length === 0) {
    patterns.push(DEFAULT_PATTERN);
  }

  appendFatiguePatterns(patterns, fatigueLevel);

  return dedupeById(patterns);
}

module.exports = {
  generateAiDetectedPatterns,
  appendFatiguePatterns,
};
