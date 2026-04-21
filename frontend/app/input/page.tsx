"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UserInputData = {
  mainActivity: string;
  dayMood: string;
  focusTime: string;
  fatigueLevel: string;
  frequentCheck: string;
  impulseActivity: string;
  distractionFactor: string;
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
  };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

type NoticeTone = "red" | "amber" | "violet";

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
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const styles = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-300 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  const titleStyles = {
    red: "text-red-800",
    amber: "text-amber-800",
    violet: "text-violet-900",
  };

  return (
    <div ref={innerRef} className={`rounded-2xl border p-4 shadow-sm ${styles[tone]}`}>
      {withIcon ? (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-base">⚠️</div>
          <div>
            {title && (
              <p className={`mb-1 text-sm font-semibold ${titleStyles[tone]}`}>
                {title}
              </p>
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium">{message}</p>
      )}
    </div>
  );
}

export default function InputPage() {
  const router = useRouter();
  const submitErrorRef = useRef<HTMLDivElement | null>(null);

  const [mainActivity, setMainActivity] = useState("공부");
  const [dayMood, setDayMood] = useState("평소와 비슷했음");
  const [focusTime, setFocusTime] = useState("오후");
  const [fatigueLevel, setFatigueLevel] = useState("보통");
  const [frequentCheck, setFrequentCheck] = useState("메시지 확인");
  const [impulseActivity, setImpulseActivity] = useState("영상 시청");
  const [distractionFactor, setDistractionFactor] = useState("알림");
  const [memo, setMemo] = useState("");

  const [screenshotFileName, setScreenshotFileName] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [isScreenshotAnalyzing, setIsScreenshotAnalyzing] = useState(false);
  const [isScreenshotAnalyzed, setIsScreenshotAnalyzed] = useState(false);
  const [isNoScreenshotMode, setIsNoScreenshotMode] = useState(false);

  const [fileError, setFileError] = useState("");
  const [screenshotNotice, setScreenshotNotice] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const clearMessages = () => {
    setFileError("");
    setScreenshotNotice("");
    setSubmitError("");
  };

  const resetScreenshotState = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotFileName("");
    setScreenshotPreview("");
    setIsScreenshotAnalyzing(false);
    setIsScreenshotAnalyzed(false);
    setIsNoScreenshotMode(false);
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
      memo,
    },
    screenshotInfo: {
      uploaded: Boolean(screenshotPreview),
      fileName: screenshotFileName,
      analyzed: isScreenshotAnalyzed,
      skipped: isNoScreenshotMode,
    },
  });

  const handleScreenshotUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    clearMessages();
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      resetScreenshotState();
      setFileError("PNG 또는 JPG 형식의 이미지 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      resetScreenshotState();
      setFileError("파일 크기는 10MB 이하만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);

    setScreenshotFileName(file.name);
    setScreenshotPreview(URL.createObjectURL(file));
    setIsScreenshotAnalyzed(false);
    setIsScreenshotAnalyzing(false);
    setIsNoScreenshotMode(false);
    setScreenshotNotice("");
  };

  const handleScreenshotAnalyze = () => {
    clearMessages();

    if (!screenshotPreview) {
      setFileError("먼저 스크린샷 이미지를 업로드해 주세요.");
      return;
    }

    setIsScreenshotAnalyzing(true);
    setIsScreenshotAnalyzed(false);

    setTimeout(() => {
      setIsScreenshotAnalyzing(false);
      setIsScreenshotAnalyzed(true);
    }, 1400);
  };

  const handleRemoveScreenshot = () => {
    resetScreenshotState();
    setSubmitError("");
  };

  const handleSkipScreenshot = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);

    setScreenshotFileName("");
    setScreenshotPreview("");
    setIsScreenshotAnalyzed(false);
    setIsScreenshotAnalyzing(false);
    setIsNoScreenshotMode(true);
    setFileError("");
    setSubmitError("");
    setScreenshotNotice(
      "스크린샷 없이 분석을 진행합니다. 사용자 입력만으로 결과 분석을 이어갈 수 있습니다."
    );
  };

  const validateBeforeSubmit = () => {
    if (screenshotPreview && !isScreenshotAnalyzed) {
      setSubmitError("업로드한 스크린샷이 있다면 '업로드한 스크린샷 분석하기'를 먼저 완료해 주세요.");
      return false;
    }

    if (!screenshotPreview && !isNoScreenshotMode) {
      setSubmitError("스크린샷을 업로드하거나 '스크린샷 없이 분석'을 선택해 주세요.");
      return false;
    }

    if (memo.trim() === "") {
      setSubmitError("오늘 하루를 한 문장으로 입력해 주세요.");
      return false;
    }

    setSubmitError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validateBeforeSubmit()) {
      setTimeout(() => {
        submitErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
      return;
    }

    const payload = buildPayload();
    console.log("최종 분석 요청 데이터:", payload);
    sessionStorage.setItem("analysisPayload", JSON.stringify(payload));
    router.push("/result");
  };

  const screenshotSummaryCards = [
    "주요 사용 앱 확인",
    "시간대별 사용 흐름 참고",
    "앱별 사용 비중 참고",
  ];

  const selectFields = [
    {
      label: "오늘 가장 중심이 된 활동은 무엇이었나요?",
      value: mainActivity,
      onChange: setMainActivity,
      options: ["공부", "유튜브/영상 시청", "게임", "SNS/채팅", "휴식/기타"],
    },
    {
      label: "오늘 하루의 전반적인 느낌은 어땠나요?",
      value: dayMood,
      onChange: setDayMood,
      options: ["생산적이었음", "평소와 비슷했음", "조금 흐트러졌음", "피곤했음"],
    },
    {
      label: "집중이 가장 잘 된 시간대가 있었나요?",
      value: focusTime,
      onChange: setFocusTime,
      options: ["오전", "오후", "저녁", "밤", "잘 모르겠음"],
    },
    {
      label: "오늘 하루 동안 피로도는 어느 정도였나요?",
      value: fatigueLevel,
      onChange: setFatigueLevel,
      options: ["매우 낮음", "낮음", "보통", "높음", "매우 높음"],
    },
    {
      label: "오늘 가장 자주 확인했던 활동은 무엇인가요?",
      value: frequentCheck,
      onChange: setFrequentCheck,
      options: ["메시지 확인", "SNS 확인", "영상 확인", "뉴스 확인", "특별히 없음"],
    },
    {
      label: "오늘 가장 쉽게 끌렸던 활동은 무엇인가요?",
      value: impulseActivity,
      onChange: setImpulseActivity,
      options: ["영상 시청", "게임", "SNS", "채팅", "기타"],
    },
    {
      label: "집중을 가장 방해한 요소가 있었다면 무엇인가요?",
      value: distractionFactor,
      onChange: setDistractionFactor,
      options: ["알림", "SNS", "피로", "주변 환경", "없음"],
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section>
          <p className="mb-2 text-sm font-semibold text-blue-600">
            AX 기반 하루 패턴 분석 시스템
          </p>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            사용자 입력과 스크린샷을 바탕으로 하루를 분석합니다
          </h1>
          <p className="leading-relaxed text-gray-600">
            본 시스템은 사용자가 입력한 정보와 사용 기록 스크린샷을 바탕으로
            하루 패턴을 해석하고 결과를 정리합니다.
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
              갤럭시 디지털 웰빙 또는 아이폰 스크린 타임 화면을 캡처하여
              업로드하면, 시스템이 화면 정보를 바탕으로 사용 패턴 분석에 참고할
              수 있습니다.
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

          {fileError && <NoticeBox message={fileError} tone="red" />}
          {screenshotNotice && <NoticeBox message={screenshotNotice} tone="amber" />}

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
                    alt="업로드된 사용 기록 스크린샷 미리보기"
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
            <NoticeBox
              message="업로드된 사용 기록 화면을 분석 중입니다..."
              tone="violet"
            />
          )}

          {isScreenshotAnalyzed && (
            <div className="flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <div>
                <h3 className="mb-2 font-semibold text-violet-900">
                  스크린샷 기반 분석 요약
                </h3>
                <p className="text-sm leading-relaxed text-violet-700">
                  업로드된 화면에서 앱 사용 시간, 주요 사용 앱, 시간대별 사용
                  흐름이 포함되어 있을 가능성을 바탕으로 분석 참고 정보를
                  확보했습니다.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {screenshotSummaryCards.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-violet-200 bg-white p-4"
                  >
                    <p className="mb-1 text-xs text-violet-600">추정 정보 {index + 1}</p>
                    <p className="font-semibold text-gray-900">{item}</p>
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
              오늘 하루의 활동과 상태를 입력해 주세요. 입력 내용은 최종 분석에
              반영됩니다.
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
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                오늘 하루를 한 문장으로 적어주세요
              </label>
              <textarea
                className="h-28 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="예: 오후에는 집중이 잘 됐지만 저녁에는 조금 흐트러졌어요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            입력 내용으로 최종 결과 보기
          </button>
        </section>
      </div>
    </main>
  );
}