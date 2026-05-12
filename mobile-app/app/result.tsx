import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

export default function ResultScreen() {
  const router = useRouter();

  const {
    memo,
    mood,
    activity,
    fatigue,
    focusLevel,
    sleepQuality,
    stressLevel,
    distraction,
    digitalFeeling,
    aiHint,
    image,
  } = useLocalSearchParams<{
    memo?: string;
    mood?: string;
    activity?: string;
    fatigue?: string;
    focusLevel?: string;
    sleepQuality?: string;
    stressLevel?: string;
    distraction?: string;
    digitalFeeling?: string;
    aiHint?: string;
    image?: string;
  }>();

  // 간단한 프로토타입 분석 로직
  const stressScore =
    stressLevel === "매우 높음"
      ? 88
      : stressLevel === "높음"
      ? 72
      : stressLevel === "보통"
      ? 48
      : 25;

  const focusScore =
    focusLevel === "높음"
      ? 85
      : focusLevel === "보통"
      ? 62
      : focusLevel === "낮음"
      ? 40
      : 22;

  const fatigueScore =
    fatigue === "매우 높음"
      ? 90
      : fatigue === "높음"
      ? 70
      : fatigue === "보통"
      ? 45
      : 20;

  const emotionSummary =
    mood === "불안함"
      ? "감정적 긴장 상태가 일부 감지되었습니다."
      : mood === "무기력함"
      ? "에너지 저하 및 동기 감소 패턴이 나타났습니다."
      : mood === "피곤함"
      ? "피로 누적 가능성이 감지되었습니다."
      : mood === "좋음"
      ? "전반적으로 안정적인 감정 흐름이 나타났습니다."
      : "일반적인 상태 흐름이 나타났습니다.";

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
      }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
      }}
    >
      <Text
        style={{
          color: "#2563EB",
          fontWeight: "800",
          marginBottom: 8,
        }}
      >
        AI 분석 결과
      </Text>

      <Text
        style={{
          fontSize: 30,
          fontWeight: "900",
          color: "#111827",
          marginBottom: 10,
        }}
      >
        오늘 하루 패턴 분석
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 14,
          lineHeight: 23,
          marginBottom: 24,
        }}
      >
        입력 정보와 스크린샷 데이터를 기반으로 감정 흐름, 집중 상태,
        디지털 사용 패턴을 분석했습니다.
      </Text>

      {/* AI 종합 분석 */}
      <View style={cardStyle}>
        <View style={blueBadge}>
          <Text style={blueBadgeText}>AI 종합 분석</Text>
        </View>

        <Text style={sectionTitle}>오늘의 분석 요약</Text>

        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <Text
            style={{
              color: "#1E40AF",
              fontSize: 15,
              lineHeight: 25,
              fontWeight: "700",
            }}
          >
            오늘은 {activity || "입력된 활동"} 중심의 패턴이 관찰되었습니다.
            현재 감정 상태는 {mood || "입력 없음"}으로 분석되며,{" "}
            {emotionSummary}
          </Text>

          <Text
            style={{
              color: "#1E3A8A",
              fontSize: 14,
              lineHeight: 24,
              marginTop: 14,
            }}
          >
            AI는 사용자의 집중 상태, 피로도, 디지털 사용 패턴을 종합적으로
            분석한 결과 현재 생활 리듬의 균형 변화 가능성을 감지했습니다.
          </Text>
        </View>
      </View>

      {/* 점수 분석 */}
      <View style={cardStyle}>
        <Text style={sectionTitle}>AI 패턴 점수</Text>

        <ScoreBar
          label="스트레스 지수"
          score={stressScore}
        />

        <ScoreBar
          label="집중 안정성"
          score={focusScore}
        />

        <ScoreBar
          label="피로 누적도"
          score={fatigueScore}
        />
      </View>

      {/* 세부 입력 정보 */}
      <View style={cardStyle}>
        <Text style={sectionTitle}>입력 정보 요약</Text>

        <InfoRow
          label="오늘 기분"
          value={mood || "입력 없음"}
        />

        <InfoRow
          label="주요 활동"
          value={activity || "입력 없음"}
        />

        <InfoRow
          label="피로도"
          value={fatigue || "입력 없음"}
        />

        <InfoRow
          label="집중도"
          value={focusLevel || "입력 없음"}
        />

        <InfoRow
          label="수면 상태"
          value={sleepQuality || "입력 없음"}
        />

        <InfoRow
          label="스트레스 정도"
          value={stressLevel || "입력 없음"}
        />

        <InfoRow
          label="집중 방해 요소"
          value={distraction || "입력 없음"}
        />

        <InfoRow
          label="디지털 사용 느낌"
          value={digitalFeeling || "입력 없음"}
        />

        <InfoRow
          label="AI 분석 초점"
          value={aiHint || "입력 없음"}
        />

        <Text style={labelStyle}>오늘 하루 메모</Text>

        <Text
          style={{
            color: "#374151",
            fontSize: 15,
            lineHeight: 24,
          }}
        >
          {memo || "입력 없음"}
        </Text>
      </View>

      {/* AI 조언 */}
      <View style={cardStyle}>
        <View style={purpleBadge}>
          <Text style={purpleBadgeText}>AI 추천</Text>
        </View>

        <Text style={sectionTitle}>생활 패턴 제안</Text>

        <Text
          style={{
            color: "#374151",
            fontSize: 15,
            lineHeight: 25,
          }}
        >
          현재 분석 결과 기준으로 짧은 휴식 주기 확보와 디지털 사용 시간
          조절이 집중 유지에 도움이 될 가능성이 있습니다. 또한 피로도가 높게
          기록된 경우 수면 패턴 안정화가 필요할 수 있습니다.
        </Text>
      </View>

      {/* 스크린샷 */}
      <View style={cardStyle}>
        <Text style={sectionTitle}>스크린샷 참고 자료</Text>

        {image ? (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 240,
              borderRadius: 18,
              backgroundColor: "#E5E7EB",
            }}
          />
        ) : (
          <Text
            style={{
              color: "#6B7280",
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            업로드된 스크린샷이 없어 사용자 입력 기반 분석만 진행되었습니다.
          </Text>
        )}
      </View>

      {/* 버튼 */}
      <Pressable
        onPress={() => router.push("/input")}
        style={{
          backgroundColor: "#2563EB",
          paddingVertical: 17,
          borderRadius: 20,
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          다시 분석하기
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        marginBottom: 14,
      }}
    >
      <Text style={labelStyle}>{label}</Text>

      <Text
        style={{
          color: "#111827",
          fontSize: 15,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ScoreBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <View
      style={{
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: "#374151",
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: "#2563EB",
            fontWeight: "800",
            fontSize: 14,
          }}
        >
          {score}%
        </Text>
      </View>

      <View
        style={{
          width: "100%",
          height: 12,
          backgroundColor: "#E5E7EB",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${score}%`,
            height: "100%",
            backgroundColor: "#2563EB",
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}

const cardStyle = {
  backgroundColor: "white",
  borderRadius: 24,
  padding: 20,
  marginBottom: 18,

  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,

  elevation: 3,
};

const sectionTitle = {
  fontSize: 20,
  fontWeight: "900" as const,
  color: "#111827",
  marginBottom: 16,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: "800" as const,
  color: "#6B7280",
  marginBottom: 6,
};

const blueBadge = {
  backgroundColor: "#EFF6FF",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 999,
  alignSelf: "flex-start" as const,
  marginBottom: 12,
};

const blueBadgeText = {
  color: "#2563EB",
  fontWeight: "800" as const,
  fontSize: 13,
};

const purpleBadge = {
  backgroundColor: "#F5F3FF",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 999,
  alignSelf: "flex-start" as const,
  marginBottom: 12,
};

const purpleBadgeText = {
  color: "#6D28D9",
  fontWeight: "800" as const,
  fontSize: 13,
};