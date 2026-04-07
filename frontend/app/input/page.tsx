"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

type DetectedPattern = {
  id: number;
  title: string;
  detail: string;
  confidence: number;
  category: string;
  checked: boolean;
};

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
  aiDetectedPatterns: DetectedPattern[];
  userInput: UserInputData;
  screenshotInfo: {
    uploaded: boolean;
    fileName: string;
    analyzed: boolean;
  };
};

export default function InputPage() {
  const router = useRouter();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const [mainActivity, setMainActivity] = useState("공부");
  const [dayMood, setDayMood] = useState("평소와 비슷했음");
  const [focusTime, setFocusTime] = useState("오후");
  const [memo, setMemo] = useState("");

  const [fatigueLevel, setFatigueLevel] = useState("보통");
  const [frequentCheck, setFrequentCheck] = useState("메시지 확인");
  const [impulseActivity, setImpulseActivity] = useState("영상 시청");
  const [distractionFactor, setDistractionFactor] = useState("알림");

  // 스크린샷 입력 및 분석 상태
  const [screenshotFileName, setScreenshotFileName] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [isScreenshotAnalyzing, setIsScreenshotAnalyzing] = useState(false);
  const [isScreenshotAnalyzed, setIsScreenshotAnalyzed] = useState(false);

  const [patterns, setPatterns] = useState<DetectedPattern[]>([
    {
      id: 1,
      title: "오후 시간대 영상 소비 증가",
      detail: "14:00 ~ 16:00 사이 영상 시청 패턴이 높게 감지되었습니다.",
      confidence: 91,
      category: "콘텐츠 소비",
      checked: true,
    },
    {
      id: 2,
      title: "저녁 학습 활동 존재",
      detail: "18:00 ~ 20:00 사이 학습 관련 활동 패턴이 감지되었습니다.",
      confidence: 87,
      category: "학습 활동",
      checked: true,
    },
    {
      id: 3,
      title: "야간 채팅 활동 증가",
      detail: "22:00 이후 채팅 사용 빈도가 증가한 것으로 분석되었습니다.",
      confidence: 84,
      category: "사회적 상호작용",
      checked: true,
    },
  ]);

  const analysisSteps = [
    "앱 사용 기록 수집",
    "시간대별 패턴 분류",
    "활동 유형 추론",
    "AI 1차 해석 완료",
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setIsDetected(false);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 600);
    setTimeout(() => setAnalysisStep(3), 1200);
    setTimeout(() => {
      setAnalysisStep(4);
      setIsAnalyzing(false);
      setIsDetected(true);
    }, 1800);
  };

  const handleScreenshotUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotFileName(file.name);
    setIsScreenshotAnalyzed(false);

    const imageUrl = URL.createObjectURL(file);
    setScreenshotPreview(imageUrl);
  };

  const handleScreenshotAnalyze = () => {
    if (!screenshotPreview) return;

    setIsScreenshotAnalyzing(true);
    setIsScreenshotAnalyzed(false);

    setTimeout(() => {
      setIsScreenshotAnalyzing(false);
      setIsScreenshotAnalyzed(true);
    }, 1400);
  };

  const togglePattern = (id: number) => {
    setPatterns((prev) =>
      prev.map((pattern) =>
        pattern.id === id
          ? { ...pattern, checked: !pattern.checked }
          : pattern
      )
    );
  };

  const getStepStyle = (step: number) => {
    if (analysisStep > step) {
      return "bg-blue-600 text-white border-blue-600";
    }
    if (analysisStep === step) {
      return "bg-blue-50 text-blue-700 border-blue-300";
    }
    return "bg-white text-gray-400 border-gray-200";
  };

  const getSelectedPatterns = () => {
    return patterns.filter((pattern) => pattern.checked);
  };

  const buildPayload = (): AnalysisPayload => {
    return {
      analyzedAt: new Date().toISOString(),
      aiDetectedPatterns: getSelectedPatterns(),
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
      },
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();

    console.log("최종 분석 요청 데이터:", payload);

    sessionStorage.setItem("analysisPayload", JSON.stringify(payload));
    router.push("/result");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <section>
          <p className="text-sm font-semibold text-blue-600 mb-2">
            AX 기반 하루 패턴 분석 시스템
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            AI가 앱 사용 기록과 생활 패턴을 먼저 분석합니다
          </h1>
          <p className="text-gray-600 leading-relaxed">
            본 시스템은 사용자의 앱 사용 기록과 생활 패턴을 기반으로 AI가 먼저
            활동 흐름을 인식하고, 이후 사용자는 필요한 항목만 보완하여 분석
            정확도를 높일 수 있습니다.
          </p>
        </section>

        {/* 스크린샷 입력 및 분석 파트 추가 */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold">
                스크린샷 입력 기반 분석
              </span>
              <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                Digital Wellbeing / Screen Time 대응
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              사용 기록 화면 업로드
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              갤럭시 디지털 웰빙 또는 아이폰 스크린 타임 화면을 캡처하여
              업로드하면, AI가 화면 정보를 바탕으로 사용 패턴 분석에 참고할 수
              있습니다.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <label className="flex flex-col items-center justify-center gap-3 cursor-pointer text-center">
              <span className="text-sm font-medium text-gray-800">
                스크린샷 이미지 업로드
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG 형식의 사용 기록 화면을 업로드해 주세요
              </span>

              <span className="inline-flex px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition">
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

          {screenshotFileName && (
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
              <p className="text-sm text-violet-700 font-medium">
                업로드된 파일: {screenshotFileName}
              </p>
            </div>
          )}

          {screenshotPreview && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-3">
                  업로드된 스크린샷 미리보기
                </p>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <img
                    src={screenshotPreview}
                    alt="업로드된 사용 기록 스크린샷 미리보기"
                    className="w-full max-h-[420px] object-contain bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleScreenshotAnalyze}
                className="w-full md:w-fit bg-violet-600 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-violet-700 transition"
              >
                업로드한 스크린샷 분석하기
              </button>
            </div>
          )}

          {isScreenshotAnalyzing && (
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
              <p className="text-violet-700 font-medium">
                AI가 업로드된 사용 기록 화면을 분석 중입니다...
              </p>
            </div>
          )}

          {isScreenshotAnalyzed && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-violet-900 mb-2">
                  스크린샷 기반 분석 요약
                </h3>
                <p className="text-sm text-violet-700 leading-relaxed">
                  업로드된 화면에서 앱 사용 시간, 주요 사용 앱, 시간대별 사용
                  흐름이 포함되어 있을 가능성을 바탕으로 AI가 분석 참고 정보를
                  확보했습니다.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white border border-violet-200 p-4">
                  <p className="text-xs text-violet-600 mb-1">추정 정보 1</p>
                  <p className="font-semibold text-gray-900">주요 사용 앱 확인</p>
                </div>
                <div className="rounded-2xl bg-white border border-violet-200 p-4">
                  <p className="text-xs text-violet-600 mb-1">추정 정보 2</p>
                  <p className="font-semibold text-gray-900">시간대별 사용 흐름 참고</p>
                </div>
                <div className="rounded-2xl bg-white border border-violet-200 p-4">
                  <p className="text-xs text-violet-600 mb-1">추정 정보 3</p>
                  <p className="font-semibold text-gray-900">앱별 사용 비중 참고</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 기존 AI 자동 인식 파트 유지 */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                AI 중심 분석 단계
              </span>
              <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                앱 사용 기록 + 생활 패턴 기반
              </span>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                AI 자동 인식
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                사용자의 활동 데이터를 기반으로 시간대별 행동 흐름, 주요 활동
                유형, 반복 패턴을 먼저 인식합니다. 사용자는 이후 AI가 놓친
                맥락만 보완하면 됩니다.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">분석 대상</p>
              <p className="font-semibold text-gray-900">앱 사용 기록</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">보조 정보</p>
              <p className="font-semibold text-gray-900">생활 패턴 데이터</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">AI 출력</p>
              <p className="font-semibold text-gray-900">행동 패턴 1차 해석</p>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full md:w-fit bg-blue-600 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-700 transition"
          >
            AI가 활동 패턴 인식하기
          </button>

          {(isAnalyzing || isDetected) && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-900">AI 분석 진행 상태</h3>
                <span className="text-sm text-blue-700 font-medium">
                  {isDetected ? "분석 완료" : "분석 중"}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                {analysisSteps.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-2xl border p-4 text-sm font-medium transition ${getStepStyle(
                      index + 1
                    )}`}
                  >
                    <p className="text-xs mb-1 opacity-80">STEP {index + 1}</p>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              {isAnalyzing && (
                <p className="mt-4 text-sm text-blue-700">
                  AI가 시간대별 활동 흐름과 반복 행동 패턴을 분석하고 있습니다...
                </p>
              )}
            </div>
          )}
        </section>

        {isDetected && (
          <>
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  AI가 인식한 활동 패턴
                </h2>
                <p className="text-sm text-gray-500">
                  AI가 감지한 주요 패턴입니다. 실제와 맞는 항목만 선택하여 결과
                  분석에 반영할 수 있습니다.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-xs text-blue-600 mb-1">감지 패턴 수</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {patterns.length}개
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
                  <p className="text-xs text-indigo-600 mb-1">평균 신뢰도</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {Math.round(
                      patterns.reduce((acc, cur) => acc + cur.confidence, 0) /
                        patterns.length
                    )}
                    %
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-xs text-emerald-600 mb-1">AI 해석 상태</p>
                  <p className="text-2xl font-bold text-emerald-900">완료</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className={`rounded-2xl border p-5 transition ${
                      pattern.checked
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-600">
                            {pattern.category}
                          </span>
                          <span className="inline-flex px-3 py-1 rounded-full bg-white border border-blue-200 text-xs text-blue-700 font-medium">
                            신뢰도 {pattern.confidence}%
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">
                          {pattern.title}
                        </h3>
                        <p className="text-sm text-gray-600">{pattern.detail}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePattern(pattern.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                          pattern.checked
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pattern.checked ? "반영 중" : "제외됨"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-7 shadow-sm">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold text-blue-100 mb-2">
                  AI 1차 해석 요약
                </p>
                <h2 className="text-2xl font-bold mb-3">
                  오늘은 콘텐츠 소비와 학습 활동이 모두 관찰되었습니다
                </h2>
                <p className="text-blue-50 leading-relaxed">
                  AI는 오후 시간대의 영상 소비 증가, 저녁 시간대 학습 활동, 야간
                  채팅 증가 패턴을 감지했습니다. 이를 바탕으로 사용자의 하루는
                  휴식·콘텐츠 소비와 목표 지향 활동이 혼합된 형태로 1차 해석되고
                  있습니다.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  AI 분석 보완 입력
                </h2>
                <p className="text-sm text-gray-500">
                  아래 입력은 AI가 이미 인식한 결과를 보완하기 위한 단계입니다.
                  AI가 놓친 맥락만 추가해 주세요.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    오늘 가장 중심이 된 활동은 무엇이었나요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={mainActivity}
                    onChange={(e) => setMainActivity(e.target.value)}
                  >
                    <option>공부</option>
                    <option>유튜브/영상 시청</option>
                    <option>게임</option>
                    <option>SNS/채팅</option>
                    <option>휴식/기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    오늘 하루의 전반적인 느낌은 어땠나요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={dayMood}
                    onChange={(e) => setDayMood(e.target.value)}
                  >
                    <option>생산적이었음</option>
                    <option>평소와 비슷했음</option>
                    <option>조금 흐트러졌음</option>
                    <option>피곤했음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    집중이 가장 잘 된 시간대가 있었나요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={focusTime}
                    onChange={(e) => setFocusTime(e.target.value)}
                  >
                    <option>오전</option>
                    <option>오후</option>
                    <option>저녁</option>
                    <option>밤</option>
                    <option>잘 모르겠음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    오늘 하루 동안 피로도는 어느 정도였나요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={fatigueLevel}
                    onChange={(e) => setFatigueLevel(e.target.value)}
                  >
                    <option>매우 낮음</option>
                    <option>낮음</option>
                    <option>보통</option>
                    <option>높음</option>
                    <option>매우 높음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    오늘 가장 자주 확인했던 활동은 무엇인가요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={frequentCheck}
                    onChange={(e) => setFrequentCheck(e.target.value)}
                  >
                    <option>메시지 확인</option>
                    <option>SNS 확인</option>
                    <option>영상 확인</option>
                    <option>뉴스 확인</option>
                    <option>특별히 없음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    오늘 가장 쉽게 끌렸던 활동은 무엇인가요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={impulseActivity}
                    onChange={(e) => setImpulseActivity(e.target.value)}
                  >
                    <option>영상 시청</option>
                    <option>게임</option>
                    <option>SNS</option>
                    <option>채팅</option>
                    <option>기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    집중을 가장 방해한 요소가 있었다면 무엇인가요?
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 bg-white"
                    value={distractionFactor}
                    onChange={(e) => setDistractionFactor(e.target.value)}
                  >
                    <option>알림</option>
                    <option>SNS</option>
                    <option>피로</option>
                    <option>주변 환경</option>
                    <option>없음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    오늘 하루를 한 문장으로 적어주세요
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-2xl p-4 h-28 text-gray-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="예: 오후에는 집중이 잘 됐지만 저녁에는 조금 흐트러졌어요."
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition"
              >
                AI 분석 결과 보완 후 최종 결과 보기
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}