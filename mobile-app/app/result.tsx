import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ResultScreen() {
  const router = useRouter();

  const { memo, mood, activity, fatigue, image } = useLocalSearchParams<{
    memo?: string;
    mood?: string;
    activity?: string;
    fatigue?: string;
    image?: string;
  }>();

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
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        AI 분석 결과
      </Text>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#111827",
          marginBottom: 8,
        }}
      >
        오늘 하루 요약
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 14,
          lineHeight: 22,
          marginBottom: 22,
        }}
      >
        입력한 정보와 스크린샷을 바탕으로 하루의 패턴을 간단히 정리했습니다.
      </Text>

      <View style={cardStyle}>
        <Text style={sectionTitle}>분석 요약</Text>

        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: "#1E40AF",
              fontSize: 15,
              lineHeight: 23,
              fontWeight: "600",
            }}
          >
            오늘은 {activity || "입력된 활동"}을 중심으로 하루가 구성된 것으로
            보입니다. 기분은 {mood || "입력 없음"} 상태였고, 피로도는{" "}
            {fatigue || "입력 없음"} 수준으로 기록되었습니다. 메모 내용을
            바탕으로 사용자의 하루 흐름을 추가 분석할 수 있습니다.
          </Text>
        </View>
      </View>

      <View style={cardStyle}>
        <Text style={sectionTitle}>입력 정보</Text>

        <InfoRow label="오늘 기분" value={mood || "입력 없음"} />
        <InfoRow label="주요 활동" value={activity || "입력 없음"} />
        <InfoRow label="피로도" value={fatigue || "입력 없음"} />

        <Text style={labelStyle}>오늘 메모</Text>
        <Text
          style={{
            color: "#374151",
            fontSize: 15,
            lineHeight: 23,
            marginBottom: 4,
          }}
        >
          {memo || "입력 없음"}
        </Text>
      </View>

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
            선택된 스크린샷이 없습니다. 사용자 입력 정보만으로 분석이
            진행되었습니다.
          </Text>
        )}
      </View>

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
            fontWeight: "800",
          }}
        >
          다시 입력하기
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
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
          fontWeight: "600",
        }}
      >
        {value}
      </Text>
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
  fontWeight: "800" as const,
  color: "#111827",
  marginBottom: 16,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: "700" as const,
  color: "#6B7280",
  marginBottom: 5,
};