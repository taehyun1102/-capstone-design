
"use client";

import {
  useEffect,
  useRef,
  useState,
  RefObject,
} from "react";
import { useRouter } from "next/navigation";


type UserInputData = {
  mainActivity: string;
  dayMood: string;
  focusTime: string;
  fatigueLevel: string;
  impulseActivity: string;
  hadGoal: string;
  achievedGoal: string;
  faceToFaceInteraction: string;
  memo: string;
};

type AnalysisPayload = {
  analyzedAt: string;
  userInput: UserInputData;

  mood: string;
  activity: string;
  fatigue: string;
  focusLevel: string;
  distraction: string;

  memo: string;

  socialInteraction: string;
  focusedTime: string;
  frequentActivity: string;
  temptingActivity: string;
  hasGoal: boolean;
  goalResult: string;
};

type NoticeTone = "red" | "amber" | "violet" | "green";

const MEMO_MAX_LENGTH = 500;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

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
    red: "border-rose-300/20 bg-rose-400/10 text-rose-200",
    amber: "border-amber-300/20 bg-amber-400/10 text-amber-200",
    violet: "border-violet-300/20 bg-violet-400/10 text-violet-200",
    green: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  };

  const titleStyles = {
    red: "text-rose-100",
    amber: "text-amber-100",
    violet: "text-violet-100",
    green: "text-emerald-100",
  };

  return (
    <div
      ref={innerRef}
      className={`rounded-2xl border p-4 shadow-sm ${styles[tone]}`}
    >
      {withIcon ? (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-base">
            ⚠️
          </div>

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

export default function InputPage() {
  const router = useRouter();

  const submitErrorRef =
    useRef<HTMLDivElement | null>(null);

  const [userName, setUserName] = useState("");

  const [mainActivity, setMainActivity] = useState("");
  const [dayMood, setDayMood] = useState("");
  const [focusTime, setFocusTime] = useState("");
  const [fatigueLevel, setFatigueLevel] = useState("");
  const [impulseActivity, setImpulseActivity] = useState("");

  const [hadGoal, setHadGoal] = useState("");
  const [achievedGoal, setAchievedGoal] = useState("");

  const [
    faceToFaceInteraction,
    setFaceToFaceInteraction,
  ] = useState("");

  const [memo, setMemo] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");

    if (name) {
      setUserName(name);
    }
  }, []);

  const clearMessages = () => {
    setSubmitError("");
  };

  const buildPayload = (): AnalysisPayload => ({
    analyzedAt: new Date().toISOString(),

    userInput: {
      mainActivity,
      dayMood,
      focusTime,
      fatigueLevel,
      impulseActivity,
      hadGoal,
      achievedGoal,
      faceToFaceInteraction,
      memo: memo.trim(),
    },

    mood: dayMood,
    activity: mainActivity,
    fatigue: fatigueLevel,
    focusLevel: focusTime,
    distraction: impulseActivity,

    memo: memo.trim(),

    socialInteraction: faceToFaceInteraction,
    focusedTime: focusTime,
    frequentActivity: mainActivity,
    temptingActivity: impulseActivity,
    hasGoal: hadGoal === "네",
    goalResult: achievedGoal,
  });

  const validateBeforeSubmit = () => {
    const requiredFields = [
      mainActivity,
      dayMood,
      focusTime,
      fatigueLevel,
      impulseActivity,
      faceToFaceInteraction,
      hadGoal,
    ];

    if (requiredFields.some((field) => field === "")) {
      setSubmitError(
        "모든 선택 항목을 입력해 주세요."
      );

      return false;
    }

    if (hadGoal === "네" && achievedGoal === "") {
      setSubmitError(
        "목표 달성 여부를 선택해 주세요."
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
      // 로그인 토큰 가져오기
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "로그인 정보가 만료되었거나 없습니다. 다시 로그인해 주세요."
        );

        router.push("/login");
        return;
      }

      const payload = buildPayload();

      console.log(
        "최종 분석 요청 데이터:",
        payload
      );

      sessionStorage.removeItem(
        "currentAnalysisSaveId"
      );

      // 입력 데이터 저장
      sessionStorage.setItem(
        "analysisPayload",
        JSON.stringify(payload)
      );

      // 백엔드 API 요청
      const response = await fetch(
        `${API_URL}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // 서버 응답 JSON 변환
      const responseData = await response.json();

      // 서버 응답 실패 처리
      if (!response.ok) {
        throw new Error(
          responseData.message ||
          responseData.error ||
          "서버 응답 실패"
        );
      }

      // 분석 결과
      const result = responseData;

      console.log(
        "분석 결과:",
        result
      );

      // 결과 저장
      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify(result)
      );

      // 결과 페이지 이동
      router.push("/result");
    } catch (error) {
      console.error(
        "분석 요청 오류:",
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "서버 연결 또는 분석 요청 중 오류가 발생했습니다."
      );

      setTimeout(() => {
        submitErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const confirmed = confirm(
      "정말 회원탈퇴하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "회원탈퇴에 실패했습니다.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("username");

      alert("회원탈퇴가 완료되었습니다.");

      router.push("/login");
    } catch (err) {
      console.error(err);

      alert("회원탈퇴 실패");
    }
  };

  const selectFields = [
    {
      label: "오늘 가장 중심이 된 활동은 무엇이었나요?",
      value: mainActivity,
      onChange: setMainActivity,
      options: [
        "목표 수행 (공부/일)",
        "콘텐츠 소비 (영상 시청/유튜브)",
        "오락 활동 (게임)",
        "사회적 상호작용 (SNS/채팅)",
        "휴식/기타",
      ],
    },
    {
      label: "오늘 하루의 전반적인 상태는 어땠나요?",
      value: dayMood,
      onChange: setDayMood,
      options: [
        "컨디션이 좋았음",
        "평소와 비슷했음",
        "조금 산만했음",
        "피곤하고 지쳤음",
      ],
    },
    {
      label:
        "오늘 실제 사람들과의 상호작용(대면/통화)은 어느 정도 있었나요?",
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
      label: "오늘 가장 끌렸던 활동은 무엇인가요?",
      value: impulseActivity,
      onChange: setImpulseActivity,
      options: [
        "짧은 콘텐츠 (쇼츠/릴스)",
        "게임",
        "SNS/메신저",
        "음식/간식",
        "휴식/수면",
        "기타",
      ],
    },
  ];

  
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d20] px-5 py-10 text-white">
      {/* 달빛 정원 배경 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="absolute left-[12%] top-[20%] h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_3px_rgba(165,243,252,0.5)]" />
        <div className="absolute right-[15%] top-[30%] h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_15px_4px_rgba(196,181,253,0.5)]" />
        <div className="absolute right-[25%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-pink-200 shadow-[0_0_12px_3px_rgba(251,207,232,0.5)]" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col gap-8">
        {/* 페이지 소개 */}
        <section>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm text-violet-200">
                <span>☾</span>
                <span>MOONLIGHT MIND LAB</span>
                <span>✦</span>
              </div>

              {userName && (
                <p className="mb-3 text-lg font-semibold text-violet-200">
                  안녕하세요, {userName}님 ✨
                </p>
              )}

              <h1 className="mb-4 text-3xl font-bold leading-snug sm:text-4xl">
                <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                  오늘 하루는 어떠셨나요?
                </span>
              </h1>

              <p className="max-w-2xl leading-8 text-slate-400">
                오늘의 활동과 상태를 기록하면 AI가 생활 패턴과 행동 경향을
                분석하고, 더 나은 하루를 위한 방향을 찾아볼 수 있도록
                도와드립니다.
              </p>
            </div>

            {/* 이전 페이지 버튼 */}
            <button
            type="button"
            onClick={() => router.push("/garden")}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-2xl border border-violet-300/20 bg-white/[0.06] px-5 py-3 font-semibold text-violet-200 shadow-lg backdrop-blur-xl transition hover:border-violet-300/50 hover:bg-violet-400/10"
            >
            <span>←</span>
            <span>이전</span>
          </button>
          </div>
        </section>

        {/* AI 분석 안내 */}
        <section className="overflow-hidden rounded-3xl border border-violet-200/15 bg-white/[0.05] shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="bg-gradient-to-br from-violet-400/10 via-transparent to-cyan-400/10 p-7 sm:p-9">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-sm font-semibold text-violet-200">
                🧠 AI 생활 패턴 분석
              </span>

              <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-sm font-semibold text-blue-200">
                진화심리학 기반
              </span>
            </div>

            <h2 className="mb-4 text-2xl font-bold leading-snug text-white sm:text-3xl">
              오늘의 나를 기록하면,
              <br />
              <span className="text-violet-200">
                반복되는 생활 패턴이 보입니다.
              </span>
            </h2>

            <p className="max-w-3xl text-sm leading-7 text-slate-400">
              하루 동안의 활동, 기분, 집중도, 피로도와 같은 정보를 바탕으로
              AI가 오늘의 생활 흐름과 행동 경향을 분석합니다.
            </p>
          </div>

          {/* 설명 카드 */}
          <div className="grid gap-4 p-6 md:grid-cols-3 sm:p-7">
            <div className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.07] p-5">
              <div className="mb-3 text-2xl">🧠</div>
              <h3 className="mb-2 font-semibold text-violet-100">
                AI 생활 패턴 분석
              </h3>
              <p className="text-sm leading-7 text-slate-400">
                입력한 하루의 데이터를 종합하여 반복적으로 나타나는 행동과
                생활 패턴을 살펴봅니다.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-300/15 bg-blue-400/[0.07] p-5">
              <div className="mb-3 text-2xl">🧬</div>
              <h3 className="mb-2 font-semibold text-blue-100">
                진화심리학적 관점
              </h3>
              <p className="text-sm leading-7 text-slate-400">
                보상 추구, 위험 회피, 사회적 관계, 에너지 절약과 같은 인간의
                기본적인 행동 경향을 참고하여 행동의 배경을 해석합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.07] p-5">
              <div className="mb-3 text-2xl">🌱</div>
              <h3 className="mb-2 font-semibold text-emerald-100">
                나를 이해하는 과정
              </h3>
              <p className="text-sm leading-7 text-slate-400">
                단순히 하루를 평가하는 것이 아니라 자신의 행동 패턴을
                돌아보고 앞으로의 행동을 생각해볼 수 있도록 돕습니다.
              </p>
            </div>
          </div>

          {/* 분석 과정 */}
          <div className="px-6 pb-7 sm:px-7">
            <div className="rounded-2xl border border-violet-300/20 bg-violet-400/[0.07] p-5">
              <p className="mb-4 text-sm font-bold text-violet-100">
                ✧ AI 분석 과정
              </p>

              <div className="grid gap-4 text-sm md:grid-cols-4">
                {[
                  {
                    number: "01. 기록",
                    description: "오늘의 활동과 상태를 입력합니다.",
                  },
                  {
                    number: "02. 패턴 발견",
                    description: "입력된 데이터를 종합적으로 살펴봅니다.",
                  },
                  {
                    number: "03. 행동 이해",
                    description: "행동의 배경과 경향을 해석합니다.",
                  },
                  {
                    number: "04. 행동 추천",
                    description: "더 나은 하루를 위한 방향을 제안합니다.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="rounded-xl border border-white/10 bg-[#111a32]/80 p-4"
                  >
                    <p className="mb-2 font-bold text-violet-200">
                      {step.number}
                    </p>
                    <p className="leading-6 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 사용자 입력 */}
        <section className="flex flex-col gap-6 rounded-3xl border border-violet-200/15 bg-white/[0.06] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
          <div className="border-b border-white/10 pb-5">
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-violet-200">
              <span>✦</span>
              <span>DAILY INPUT</span>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-violet-100">
              오늘의 나를 기록하기
            </h2>

            <p className="text-sm leading-7 text-slate-400">
              오늘 하루의 활동 및 상태를 입력해 주세요.
            </p>
          </div>

          {/* 오류 메시지 */}
          {submitError && (
            <NoticeBox
              message={submitError}
              tone="amber"
              title="입력을 다시 확인해 주세요"
              withIcon
              innerRef={submitErrorRef}
            />
          )}

          <div className="flex flex-col gap-6">
            {/* 선택 항목 */}
            {selectFields.map((field, index) => (
              <div key={field.label}>
                <label className="mb-3 block text-sm font-semibold leading-6 text-violet-100">
                  <span className="mr-2 text-violet-300">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  {field.label}
                </label>

                <select
                  className="w-full rounded-2xl border border-violet-200/20 bg-[#10172d] p-4 text-white outline-none transition focus:border-violet-300/70 focus:ring-2 focus:ring-violet-400/20"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="" disabled hidden>
                    선택해 주세요
                  </option>

                  {field.options.map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="bg-[#10172d] text-white"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* 목표 여부 */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-violet-100">
                <span className="mr-2 text-violet-300">07.</span>
                오늘의 목표가 있었나요?
              </label>

              <select
                className="w-full rounded-2xl border border-violet-200/20 bg-[#10172d] p-4 text-white outline-none transition focus:border-violet-300/70 focus:ring-2 focus:ring-violet-400/20"
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

            {/* 목표 달성 여부 */}
            {hadGoal === "네" && (
              <div className="animate-in fade-in duration-300">
                <label className="mb-3 block text-sm font-semibold text-violet-100">
                  오늘의 목표를 달성했나요?
                </label>

                <select
                  className="w-full rounded-2xl border border-violet-200/20 bg-[#10172d] p-4 text-white outline-none transition focus:border-violet-300/70 focus:ring-2 focus:ring-violet-400/20"
                  value={achievedGoal}
                  onChange={(e) => setAchievedGoal(e.target.value)}
                >
                  <option value="" disabled hidden>
                    선택해 주세요
                  </option>
                  <option value="네">네</option>
                  <option value="아니요">아니요</option>
                </select>
              </div>
            )}

            {/* 하루 메모 */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-violet-100">
                  오늘 하루는 어떤 하루였나요?
                </label>

                <span
                  className={`text-xs font-medium ${
                    memo.length >= MEMO_MAX_LENGTH
                      ? "text-rose-300"
                      : "text-slate-500"
                  }`}
                >
                  {memo.length}/{MEMO_MAX_LENGTH}
                </span>
              </div>

              <textarea
                maxLength={MEMO_MAX_LENGTH}
                className="h-36 w-full resize-none rounded-2xl border border-violet-200/20 bg-[#10172d]/80 p-5 leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/70 focus:ring-2 focus:ring-violet-400/20"
                placeholder="일기 쓰듯이 편하게 적어주세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />

              <p className="mt-2 text-xs text-slate-500">
                ✧ 오늘의 생각과 감정을 자유롭게 기록해 주세요.
              </p>
            </div>
          </div>

          
{/* 분석 결과 버튼 */}
<div className="flex flex-col gap-3 border-t border-white/10 pt-6">
  <button
    type="button"
    disabled={isSubmitting}
    onClick={handleSubmit}
    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-4 font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:brightness-110 hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isSubmitting && (
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-violet-300" />
    )}

    {isSubmitting
      ? "결과 페이지로 이동 중..."
      : "✧ 입력 내용으로 최종 결과 보기"}
  </button>
</div>

        </section>

        <p className="pb-2 text-center text-xs tracking-wider text-slate-600">
          UNDER THE MOONLIGHT · DISCOVER YOURSELF
        </p>
      </div>
    </main>
  );
}

