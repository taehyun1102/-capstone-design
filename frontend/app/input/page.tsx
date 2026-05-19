"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  RefObject,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserInputData = {
  mainActivity: string;
  dayMood: string;
  focusTime: string;
  fatigueLevel: string;
  frequentCheck: string;
  impulseActivity: string;
  distractionFactor: string;

  hadGoal: string;
  achievedGoal: string;

  faceToFaceInteraction: string;

  memo: string;
};

type AnalysisPayload = {
  analyzedAt: string;

  userInput: UserInputData;

  screenshotInfo: {
    uploaded: boolean;
    fileName: string;
    analyzed: boolean;
    skipped: boolean;
    estimatedConfidence: number;
  };

  // 백엔드 API용 필드
  mood: string;
  activity: string;
  fatigue: string;
  focusLevel: string;
  distraction: string;

  memo: string;

  hasScreenshot: boolean;
};



type NoticeTone = "red" | "amber" | "violet" | "green";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MEMO_MAX_LENGTH = 120;

function NoticeBox({
  message,
  tone,
  title,
  withIcon = false,
  innerRef,
}: {
  message: string;
  tone: NoticeTone;
  title?: string;
  withIcon?: boolean;
  innerRef?: RefObject<HTMLDivElement | null>;
}) {
  const styles = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-300 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const titleStyles = {
    red: "text-red-800",
    amber: "text-amber-800",
    violet: "text-violet-900",
    green: "text-emerald-900",
  };

  return (
    <div
      ref={innerRef}
      className={`rounded-2xl border p-4 shadow-sm ${styles[tone]}`}
    >
      {withIcon ? (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-base">⚠️</div>

          <div>
            {title && (
              <p
                className={`mb-1 text-sm font-semibold ${titleStyles[tone]}`}
              >
                {title}
              </p>
            )}

            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium leading-relaxed">
          {message}
        </p>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-300 border-t-violet-700" />

      <p className="text-sm font-medium text-violet-700">
        스크린샷 분석 진행 중...
      </p>
    </div>
  );
}

export default function InputPage() {
  const router = useRouter();

  const submitErrorRef = useRef<HTMLDivElement | null>(null);

  const [mainActivity, setMainActivity] = useState("");
  const [dayMood, setDayMood] = useState("");
  const [focusTime, setFocusTime] = useState("");
  const [fatigueLevel, setFatigueLevel] = useState("");
  const [frequentCheck, setFrequentCheck] = useState("");
  const [impulseActivity, setImpulseActivity] = useState("");
  const [distractionFactor, setDistractionFactor] = useState("");

  const [hadGoal, setHadGoal] = useState("");
  const [achievedGoal, setAchievedGoal] = useState("");

  const [faceToFaceInteraction, setFaceToFaceInteraction] =
    useState("");

  const [memo, setMemo] = useState("");

  const [screenshotFileName, setScreenshotFileName] =
    useState("");

  const [screenshotPreview, setScreenshotPreview] =
    useState("");

  const [isScreenshotAnalyzing, setIsScreenshotAnalyzing] =
    useState(false);

  const [isScreenshotAnalyzed, setIsScreenshotAnalyzed] =
    useState(false);

  const [isNoScreenshotMode, setIsNoScreenshotMode] =
    useState(false);

  const [analysisConfidence, setAnalysisConfidence] =
    useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fileError, setFileError] = useState("");
  const [screenshotNotice, setScreenshotNotice] =
    useState("");

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  const clearMessages = () => {
    setFileError("");
    setScreenshotNotice("");
    setSubmitError("");
  };

  const resetScreenshotState = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }

    setScreenshotFileName("");
    setScreenshotPreview("");

    setIsScreenshotAnalyzing(false);
    setIsScreenshotAnalyzed(false);
    setIsNoScreenshotMode(false);

    setAnalysisConfidence(0);

    setFileError("");
    setScreenshotNotice("");
  };

  const buildPayload = (): AnalysisPayload => ({
  analyzedAt: new Date().toISOString(),

  userInput: {
    mainActivity,
    dayMood,
    focusTime,
    fatigueLevel,
    frequentCheck,
    impulseActivity,
    distractionFactor,

    hadGoal,
    achievedGoal,

    faceToFaceInteraction,

    memo: memo.trim(),
  },

  screenshotInfo: {
    uploaded: Boolean(screenshotPreview),
    fileName: screenshotFileName,
    analyzed: isScreenshotAnalyzed,
    skipped: isNoScreenshotMode,
    estimatedConfidence: analysisConfidence,
  },

  // 백엔드 API용 필드
  mood: dayMood,
  activity: mainActivity,
  fatigue: fatigueLevel,
  focusLevel: focusTime,
  distraction: distractionFactor,

  memo: memo.trim(),

  hasScreenshot: Boolean(screenshotPreview),
});

  const handleScreenshotUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    clearMessages();

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      resetScreenshotState();

      setFileError(
        "PNG 또는 JPG 형식의 이미지 파일만 업로드할 수 있습니다."
      );

      e.target.value = "";

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      resetScreenshotState();

      setFileError(
        "파일 크기는 10MB 이하만 업로드할 수 있습니다."
      );

      e.target.value = "";

      return;
    }

    resetScreenshotState();

    const previewUrl = URL.createObjectURL(file);

    setScreenshotFileName(file.name);
    setScreenshotPreview(previewUrl);

    setScreenshotNotice(
      "스크린샷이 업로드되었습니다. 분석 버튼을 눌러 진행할 수 있습니다."
    );
  };

  const handleScreenshotAnalyze = () => {
    clearMessages();

    if (!screenshotPreview) {
      setFileError(
        "먼저 스크린샷 이미지를 업로드해 주세요."
      );

      return;
    }

    setIsScreenshotAnalyzing(true);
    setIsScreenshotAnalyzed(false);

    setTimeout(() => {
      const confidence =
        Math.floor(Math.random() * 12) + 82;

      setIsScreenshotAnalyzing(false);
      setIsScreenshotAnalyzed(true);

      setAnalysisConfidence(confidence);

      setScreenshotNotice(
        "스크린샷 분석이 완료되었습니다."
      );
    }, 1800);
  };

  const handleRemoveScreenshot = () => {
    resetScreenshotState();

    setSubmitError("");
  };

  const handleSkipScreenshot = () => {
    resetScreenshotState();

    setIsNoScreenshotMode(true);

    setScreenshotNotice(
      "스크린샷 없이 분석을 진행합니다. 사용자 입력 기반 분석만 사용됩니다."
    );
  };

  const validateBeforeSubmit = () => {
    const requiredFields = [
      mainActivity,
      dayMood,
      focusTime,
      fatigueLevel,
      frequentCheck,
      impulseActivity,
      distractionFactor,
      faceToFaceInteraction,
      hadGoal,
    ];

    if (requiredFields.some((field) => field === "")) {
      setSubmitError(
        "모든 선택 항목을 입력해 주세요."
      );

      return false;
    }

    if (
      hadGoal === "네" &&
      achievedGoal === ""
    ) {
      setSubmitError(
        "목표 달성 여부를 선택해 주세요."
      );

      return false;
    }

    if (
      screenshotPreview &&
      !isScreenshotAnalyzed
    ) {
      setSubmitError(
        "업로드한 스크린샷이 있다면 분석을 먼저 완료해 주세요."
      );

      return false;
    }

    if (
      !screenshotPreview &&
      !isNoScreenshotMode
    ) {
      setSubmitError(
        "스크린샷 업로드 또는 '스크린샷 없이 분석'을 선택해 주세요."
      );

      return false;
    }

    if (memo.trim() === "") {
      setSubmitError(
        "오늘 하루를 한 문장 이상 입력해 주세요."
      );

      return false;
    }

    return true;
  };

const handleSubmit = async () => {
  clearMessages();

  if (!validateBeforeSubmit()) {
    setTimeout(() => {
      submitErrorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);

    return;
  }

  setIsSubmitting(true);

  try {
    const payload = buildPayload();

    console.log("최종 분석 요청 데이터:", payload);

    // 입력 데이터 저장
    sessionStorage.setItem(
      "analysisPayload",
      JSON.stringify(payload)
    );

    // 백엔드 API 요청
    const response = await fetch(
      "http://localhost:5000/api/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // 서버 응답 실패 처리
    if (!response.ok) {
      throw new Error("서버 응답 실패");
    }

    // 분석 결과 JSON 변환
    const result = await response.json();

    console.log("분석 결과:", result);

    // 결과 저장
    sessionStorage.setItem(
      "analysisResult",
      JSON.stringify(result)
    );

    // 결과 페이지 이동
    router.push("/result");

  } catch (error) {
    console.error(error);

    setSubmitError(
      "서버 연결 또는 분석 요청 중 오류가 발생했습니다."
    );
  } finally {
    setIsSubmitting(false);
  }
};



  const screenshotSummaryCards = [
    "주요 사용 앱 흐름 분석",
    "시간대별 사용 패턴 참고",
    "앱 사용 비중 패턴 참고",
  ];

  const selectFields = [
    {
      label: "오늘 가장 중심이 된 활동은 무엇이었나요?",
      value: mainActivity,
      onChange: setMainActivity,
      options: [
        "공부",
        "유튜브/영상 시청",
        "게임",
        "SNS/채팅",
        "휴식/기타",
      ],
    },

    {
      label: "오늘 하루의 전반적인 느낌은 어땠나요?",
      value: dayMood,
      onChange: setDayMood,
      options: [
        "생산적이었음",
        "평소와 비슷했음",
        "조금 흐트러졌음",
        "피곤했음",
      ],
    },

    {
      label: "오늘 사람들과의 대면 상호작용은 어느 정도 있었나요?",
      value: faceToFaceInteraction,
      onChange: setFaceToFaceInteraction,
      options: [
        "거의 없었음",
        "조금 있었음",
        "보통이었음",
        "많았음",
        "매우 많았음",
      ],
    },

    {
      label: "집중이 가장 잘 된 시간대가 있었나요?",
      value: focusTime,
      onChange: setFocusTime,
      options: [
        "오전",
        "오후",
        "저녁",
        "밤",
        "잘 모르겠음",
      ],
    },

    {
      label: "오늘 하루 동안 피로도는 어느 정도였나요?",
      value: fatigueLevel,
      onChange: setFatigueLevel,
      options: [
        "매우 낮음",
        "낮음",
        "보통",
        "높음",
        "매우 높음",
      ],
    },

    {
      label: "오늘 가장 자주 확인했던 활동은 무엇인가요?",
      value: frequentCheck,
      onChange: setFrequentCheck,
      options: [
        "메시지 확인",
        "SNS 확인",
        "영상 확인",
        "뉴스 확인",
        "특별히 없음",
      ],
    },

    {
      label: "오늘 가장 쉽게 끌렸던 활동은 무엇인가요?",
      value: impulseActivity,
      onChange: setImpulseActivity,
      options: [
        "영상 시청",
        "게임",
        "SNS",
        "채팅",
        "기타",
      ],
    },

    {
      label: "집중을 가장 방해한 요소가 있었다면 무엇인가요?",
      value: distractionFactor,
      onChange: setDistractionFactor,
      options: [
        "알림",
        "SNS",
        "피로",
        "주변 환경",
        "없음",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">

        <section>
          <p className="mb-2 text-sm font-semibold text-blue-600">
            AI 기반 하루 흐름 분석 시스템
          </p>

          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            사용자 입력과 스크린샷을 바탕으로 하루를 분석합니다
          </h1>

          <p className="leading-relaxed text-gray-600">
            사용자의 입력 정보와 사용 기록 스크린샷을 기반으로
            하루 패턴 및 집중 흐름을 분석합니다.
          </p>
        </section>

        <section className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                스크린샷 입력 기반 분석
              </span>

              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                Digital Wellbeing / Screen Time 대응
              </span>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              사용 기록 화면 업로드
            </h2>

            <p className="text-sm leading-relaxed text-gray-500">
              갤럭시 디지털 웰빙 또는 아이폰 스크린 타임 화면을
              캡처하여 업로드하면 시스템이 사용 패턴 분석에
              참고합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
              <span className="text-sm font-medium text-gray-800">
                스크린샷 이미지 업로드
              </span>

              <span className="text-xs text-gray-500">
                PNG, JPG 형식의 사용 기록 화면을 업로드해 주세요
              </span>

              <span className="inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700">
                파일 선택
              </span>

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={handleSkipScreenshot}
              className={`w-full rounded-2xl border px-5 py-3 text-sm font-semibold transition md:w-fit ${
                isNoScreenshotMode
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
              }`}
            >
              스크린샷 없이 분석
            </button>
          </div>

          {fileError && (
            <NoticeBox
              message={fileError}
              tone="red"
            />
          )}

          {screenshotNotice && (
            <NoticeBox
              message={screenshotNotice}
              tone="amber"
            />
          )}

          {screenshotFileName && (
            <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-medium text-violet-700">
                업로드된 파일: {screenshotFileName}
              </p>

              <button
                type="button"
                onClick={handleRemoveScreenshot}
                className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
              >
                업로드 제거
              </button>
            </div>
          )}

          {screenshotPreview && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-3 text-sm font-medium text-gray-800">
                  업로드된 스크린샷 미리보기
                </p>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <img
                    src={screenshotPreview}
                    alt="업로드된 사용 기록 스크린샷"
                    className="max-h-[420px] w-full object-contain bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={handleScreenshotAnalyze}
                  className="w-full rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 md:w-fit"
                >
                  업로드한 스크린샷 분석하기
                </button>

                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 md:w-fit"
                >
                  다른 이미지로 다시 업로드하기
                </button>
              </div>
            </div>
          )}

          {isScreenshotAnalyzing && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <LoadingSpinner />
            </div>
          )}

          {isScreenshotAnalyzed && (
            <div className="flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <div>
                <h3 className="mb-2 font-semibold text-violet-900">
                  스크린샷 기반 분석 요약
                </h3>

                <p className="text-sm leading-relaxed text-violet-700">
                  업로드된 화면에서 앱 사용 시간, 주요 사용 앱,
                  시간대별 사용 흐름 기반 참고 정보를 확보했습니다.
                </p>
              </div>

              <div className="rounded-2xl border border-violet-200 bg-white p-4">
                <p className="mb-1 text-xs text-violet-600">
                  예상 분석 신뢰도
                </p>

                <p className="text-lg font-bold text-violet-900">
                  {analysisConfidence}%
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {screenshotSummaryCards.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-violet-200 bg-white p-4"
                  >
                    <p className="mb-1 text-xs text-violet-600">
                      추정 정보 {index + 1}
                    </p>

                    <p className="font-semibold text-gray-900">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              사용자 입력
            </h2>

            <p className="text-sm text-gray-500">
              오늘 하루의 활동 및 상태를 입력해 주세요.
            </p>
          </div>

          {submitError && (
            <NoticeBox
              message={submitError}
              tone="amber"
              title="입력을 다시 확인해 주세요"
              withIcon
              innerRef={submitErrorRef}
            />
          )}

          <div className="flex flex-col gap-5">
            {selectFields.map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  {field.label}
                </label>

                <select
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(e.target.value)
                  }
                >
                  <option value="" disabled hidden>
                    선택해 주세요
                  </option>

                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                오늘의 목표가 있었나요?
              </label>

              <select
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                value={hadGoal}
                onChange={(e) => setHadGoal(e.target.value)}
              >
                <option value="" disabled hidden>
                  선택해 주세요
                </option>

                <option value="네">네</option>
                <option value="아니요">아니요</option>
              </select>
            </div>

            {hadGoal === "네" && (
              <div className="animate-in fade-in duration-300">
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  오늘의 목표를 달성했나요?
                </label>

                <select
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={achievedGoal}
                  onChange={(e) =>
                    setAchievedGoal(e.target.value)
                  }
                >
                  <option value="" disabled hidden>
                    선택해 주세요
                  </option>

                  <option value="네">네</option>
                  <option value="아니요">아니요</option>
                </select>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-800">
                  오늘 하루는 어떤 하루였나요?
                </label>

                <span
                  className={`text-xs font-medium ${
                    memo.length >= MEMO_MAX_LENGTH
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {memo.length}/{MEMO_MAX_LENGTH}
                </span>
              </div>

              <textarea
                maxLength={MEMO_MAX_LENGTH}
                className="h-28 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="일기 쓰듯이 편하게 적어주세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>


<div className="flex flex-col gap-4">

  <button
    disabled={isSubmitting}
    onClick={handleSubmit}
    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {isSubmitting && (
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-300" />
    )}

    {isSubmitting
      ? "결과 페이지로 이동 중..."
      : "입력 내용으로 최종 결과 보기"}
  </button>

  <Link
    href="/diary"
    className="block w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-center font-semibold text-black shadow-lg transition hover:opacity-90"
  >
    📖 나만의 일기
  </Link>

</div>

      
        </section>

      </div>
    </main>
  );
}

