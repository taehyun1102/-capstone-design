import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function InputScreen() {
  const router = useRouter();

  const [mood, setMood] = useState("");
  const [activity, setActivity] = useState("");
  const [fatigue, setFatigue] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("이미지 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (memo.trim() === "") {
      alert("오늘 하루 메모를 입력해주세요.");
      return;
    }

    router.push({
      pathname: "/result",
      params: {
        mood,
        activity,
        fatigue,
        memo,
        image: image ?? "",
      },
    });
  };

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
        사용자 입력
      </Text>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#111827",
          marginBottom: 8,
        }}
      >
        하루 정보 입력
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 14,
          lineHeight: 22,
          marginBottom: 22,
        }}
      >
        오늘의 활동, 기분, 피로도와 스크린샷을 입력하면 결과 화면에서 분석
        내용을 확인할 수 있습니다.
      </Text>

      <View style={cardStyle}>
        <Text style={sectionTitle}>기본 상태 입력</Text>

        <Text style={labelStyle}>오늘 기분</Text>
        <TextInput
          placeholder="예: 보통, 좋음, 피곤함"
          value={mood}
          onChangeText={setMood}
          style={inputStyle}
        />

        <Text style={labelStyle}>오늘 가장 많이 한 활동</Text>
        <TextInput
          placeholder="예: 공부, 게임, 영상 시청"
          value={activity}
          onChangeText={setActivity}
          style={inputStyle}
        />

        <Text style={labelStyle}>오늘 피로도</Text>
        <TextInput
          placeholder="예: 낮음, 보통, 높음"
          value={fatigue}
          onChangeText={setFatigue}
          style={inputStyle}
        />

        <Text style={labelStyle}>오늘 하루 메모</Text>
        <TextInput
          placeholder="예: 오후에는 집중이 잘 됐지만 저녁에는 조금 흐트러졌어요."
          value={memo}
          onChangeText={setMemo}
          multiline
          style={{
            ...inputStyle,
            minHeight: 110,
            textAlignVertical: "top",
          }}
        />
      </View>

      <View style={cardStyle}>
        <View
          style={{
            backgroundColor: "#F5F3FF",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 999,
            alignSelf: "flex-start",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: "#6D28D9",
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            스크린샷 입력 기반 분석
          </Text>
        </View>

        <Text style={sectionTitle}>사용 기록 화면 업로드</Text>

        <Text
          style={{
            color: "#6B7280",
            fontSize: 14,
            lineHeight: 22,
            marginBottom: 16,
          }}
        >
          디지털 웰빙 또는 스크린 타임 화면을 선택하면 결과 분석에 참고할 수
          있습니다.
        </Text>

        <Pressable
          onPress={pickImage}
          style={{
            borderWidth: 1,
            borderColor: "#DDD6FE",
            backgroundColor: "#F5F3FF",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "#6D28D9",
              fontWeight: "800",
            }}
          >
            스크린샷 선택하기
          </Text>
        </Pressable>

        {image && (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 220,
              borderRadius: 18,
              backgroundColor: "#E5E7EB",
            }}
          />
        )}
      </View>

      <Pressable
        onPress={handleSubmit}
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
          입력 내용으로 최종 결과 보기
        </Text>
      </Pressable>
    </ScrollView>
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
  color: "#374151",
  marginBottom: 8,
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#E5E7EB",
  backgroundColor: "white",
  borderRadius: 16,
  padding: 14,
  marginBottom: 16,
  fontSize: 15,
};