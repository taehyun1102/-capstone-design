import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 24,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 28,
          padding: 28,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: "#2563EB",
            fontWeight: "700",
            marginBottom: 10,
          }}
        >
          AX 기반 하루 패턴 분석 시스템
        </Text>

        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 14,
            lineHeight: 38,
          }}
        >
          오늘 하루를{"\n"}AI로 정리해보세요
        </Text>

        <Text
          style={{
            color: "#6B7280",
            fontSize: 15,
            lineHeight: 23,
            marginBottom: 28,
          }}
        >
          사용자가 입력한 정보와 스크린샷을 바탕으로 하루의 활동, 감정,
          집중 상태를 분석합니다.
        </Text>

        <Pressable
          onPress={() => router.push("/input")}
          style={{
            backgroundColor: "#2563EB",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "800",
              fontSize: 16,
            }}
          >
            시작하기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}