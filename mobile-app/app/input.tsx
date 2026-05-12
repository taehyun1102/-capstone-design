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
  const [focusLevel, setFocusLevel] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [distraction, setDistraction] = useState("");
  const [digitalFeeling, setDigitalFeeling] = useState("");
  const [aiHint, setAiHint] = useState("");
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
    if (!mood || !activity || !fatigue || !focusLevel) {
      alert("기분, 주요 활동, 피로도, 집중도는 필수로 선택해주세요.");
      return;
    }

    if (memo.trim() === "") {
      alert("오늘 하루 메모를 입력해주세요.");
      return;
    }

    const payload = {
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
      hasScreenshot: Boolean(image),
    };

    console.log("AI 분석 요청 데이터:", payload);

    // result 대신 loading 페이지로 이동
    router.push({
      pathname: "/loading",
      params: {
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
        paddingBottom: 44,
      }}
    >
      <Text style={blueLabel}>AX 기반 입력 데이터 수집</Text>

      <Text style={pageTitle}>오늘 하루 정보를 입력해주세요</Text>

      <Text style={pageDesc}>
        입력한 정보와 스크린샷은 AI가 사용자의 하루 패턴, 감정 흐름,
        집중 상태를 분석하는 데 활용됩니다.
      </Text>

      <View style={cardStyle}>
        <Text style={sectionTitle}>기본 상태 입력</Text>

        <ChoiceGroup
          label="오늘 기분"
          value={mood}
          options={["좋음", "보통", "피곤함", "불안함", "무기력함"]}
          onSelect={setMood}
        />

        <ChoiceGroup
          label="오늘 가장 중심이 된 활동"
          value={activity}
          options={["공부", "과제", "게임", "영상 시청", "SNS/채팅", "휴식"]}
          onSelect={setActivity}
        />

        <ChoiceGroup
          label="오늘 피로도"
          value={fatigue}
          options={["낮음", "보통", "높음", "매우 높음"]}
          onSelect={setFatigue}
        />

        <ChoiceGroup
          label="오늘 집중도"
          value={focusLevel}
          options={["높음", "보통", "낮음", "집중 어려움"]}
          onSelect={setFocusLevel}
        />
      </View>

      <View style={cardStyle}>
        <Text style={sectionTitle}>생활 패턴 정보</Text>

        <ChoiceGroup
          label="수면 상태"
          value={sleepQuality}
          options={["충분함", "보통", "부족함", "매우 부족함"]}
          onSelect={setSleepQuality}
        />

        <ChoiceGroup
          label="스트레스 정도"
          value={stressLevel}
          options={["낮음", "보통", "높음", "매우 높음"]}
          onSelect={setStressLevel}
        />

        <ChoiceGroup
          label="집중을 방해한 요소"
          value={distraction}
          options={["알림", "SNS", "피로", "주변 환경", "없음"]}
          onSelect={setDistraction}
        />

        <ChoiceGroup
          label="오늘 디지털 사용 느낌"
          value={digitalFeeling}
          options={["적절했음", "조금 많았음", "많았음", "조절이 어려웠음"]}
          onSelect={setDigitalFeeling}
        />
      </View>

      <View style={cardStyle}>
        <View style={aiBadge}>
          <Text style={aiBadgeText}>AI 분석 참고 항목</Text>
        </View>

        <Text style={sectionTitle}>AI가 중점적으로 봤으면 하는 부분</Text>

        <Text style={sectionDesc}>
          자동 데이터 수집이 없는 프로토타입 단계이므로, 사용자가 직접 선택한
          항목을 AI 분석의 참고 기준으로 활용합니다.
        </Text>

        <ChoiceGroup
          label="AI 분석 초점"
          value={aiHint}
          options={[
            "집중 패턴",
            "감정 변화",
            "디지털 과사용",
            "피로/회복",
            "생활 균형",
          ]}
          onSelect={setAiHint}
        />

        <Text style={labelStyle}>오늘 하루 메모</Text>

        <TextInput
          placeholder="예: 오후에는 집중이 잘 됐지만 저녁에는 영상 시청이 길어졌어요."
          value={memo}
          onChangeText={setMemo}
          multiline
          style={{
            ...inputStyle,
            minHeight: 120,
            textAlignVertical: "top",
          }}
        />
      </View>

      <View style={cardStyle}>
        <View style={purpleBadge}>
          <Text style={purpleBadgeText}>스크린샷 입력 기반 분석</Text>
        </View>

        <Text style={sectionTitle}>사용 기록 화면 업로드</Text>

        <Text style={sectionDesc}>
          디지털 웰빙 또는 스크린 타임 화면을 선택하면 AI 분석에 참고할 수
          있습니다. 스크린샷은 선택사항입니다.
        </Text>

        <Pressable onPress={pickImage} style={uploadButton}>
          <Text style={uploadButtonText}>
            {image ? "다른 스크린샷 선택하기" : "스크린샷 선택하기"}
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

      <Pressable onPress={handleSubmit} style={submitButton}>
        <Text style={submitButtonText}>AI 분석 시작</Text>
      </Pressable>
    </ScrollView>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={labelStyle}>{label}</Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {options.map((option) => {
          const selected = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 13,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selected ? "#2563EB" : "#E5E7EB",
                backgroundColor: selected ? "#EFF6FF" : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  color: selected ? "#2563EB" : "#374151",
                  fontWeight: selected ? "800" : "600",
                  fontSize: 14,
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const blueLabel = {
  color: "#2563EB",
  fontWeight: "800" as const,
  marginBottom: 8,
};

const pageTitle = {
  fontSize: 28,
  fontWeight: "900" as const,
  color: "#111827",
  marginBottom: 8,
  lineHeight: 36,
};

const pageDesc = {
  color: "#6B7280",
  fontSize: 14,
  lineHeight: 22,
  marginBottom: 22,
};

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
  marginBottom: 12,
};

const sectionDesc = {
  color: "#6B7280",
  fontSize: 14,
  lineHeight: 22,
  marginBottom: 16,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: "800" as const,
  color: "#374151",
  marginBottom: 9,
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

const aiBadge = {
  backgroundColor: "#EFF6FF",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 999,
  alignSelf: "flex-start" as const,
  marginBottom: 12,
};

const aiBadgeText = {
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

const uploadButton = {
  borderWidth: 1,
  borderColor: "#DDD6FE",
  backgroundColor: "#F5F3FF",
  paddingVertical: 16,
  borderRadius: 18,
  alignItems: "center" as const,
  marginBottom: 16,
};

const uploadButtonText = {
  color: "#6D28D9",
  fontWeight: "900" as const,
};

const submitButton = {
  backgroundColor: "#2563EB",
  paddingVertical: 17,
  borderRadius: 20,
  alignItems: "center" as const,
  marginTop: 4,
};

const submitButtonText = {
  color: "white",
  fontSize: 16,
  fontWeight: "900" as const,
};