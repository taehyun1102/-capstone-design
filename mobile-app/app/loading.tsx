import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function LoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const loadingMessages = [
    "사용자 패턴 분석 중...",
    "감정 흐름 계산 중...",
    "디지털 사용 습관 비교 중...",
    "집중 상태 분석 중...",
    "AI 결과 생성 중...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // 로딩 문구 변경
    const textInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev === loadingMessages.length - 1) {
          return 0;
        }

        return prev + 1;
      });
    }, 1200);

    // 결과 페이지 이동
    const timeout = setTimeout(() => {
      router.replace({
        pathname: "/result",
        params,
      });
    }, 5000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: "white",
          borderRadius: 28,
          paddingVertical: 42,
          paddingHorizontal: 28,
          alignItems: "center",

          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View
          style={{
            backgroundColor: "#EFF6FF",
            paddingVertical: 7,
            paddingHorizontal: 14,
            borderRadius: 999,
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              color: "#2563EB",
              fontWeight: "800",
              fontSize: 13,
            }}
          >
            AI 분석 진행중
          </Text>
        </View>

        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={{
            marginBottom: 28,
          }}
        />

        <Text
          style={{
            fontSize: 24,
            fontWeight: "900",
            color: "#111827",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          사용자 데이터 분석 중
        </Text>

        <Text
          style={{
            color: "#6B7280",
            fontSize: 15,
            lineHeight: 24,
            textAlign: "center",
            marginBottom: 26,
          }}
        >
          입력된 정보와 스크린샷을 기반으로{"\n"}
          감정 흐름 및 생활 패턴을 분석하고 있습니다.
        </Text>

        <Text
          style={{
            color: "#2563EB",
            fontWeight: "800",
            fontSize: 15,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          {loadingMessages[messageIndex]}
        </Text>

        {/* 진행률 바 */}
        <View
          style={{
            width: "100%",
            height: 10,
            backgroundColor: "#E5E7EB",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: "85%",
              height: "100%",
              backgroundColor: "#2563EB",
              borderRadius: 999,
            }}
          />
        </View>

        <Text
          style={{
            marginTop: 14,
            color: "#9CA3AF",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          AX 기반 프로토타입 AI 분석 시스템
        </Text>
      </View>
    </View>
  );
}