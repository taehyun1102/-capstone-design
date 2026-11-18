
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

type AnalysisResult = {
  summary: string;
  pattern: string;
  advice: string;
  radar_chart?: {
    axis: string;
    value: number;
  }[];
};

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
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

export default function ResultPage() {
  const router = useRouter();

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [payload, setPayload] = useState<AnalysisPayload | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 분석 결과 및 입력 정보 불러오기
  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem("analysisResult");
      const storedPayload = sessionStorage.getItem("analysisPayload");

      if (storedResult) {
        const parsedResult = JSON.parse(storedResult);

        if (
          parsedResult &&
          typeof parsedResult.summary === "string" &&
          typeof parsedResult.pattern === "string" &&
          typeof parsedResult.advice === "string"
        ) {
          setResult(parsedResult);
        }
      }

      if (storedPayload) {
        const parsedPayload = JSON.parse(storedPayload);
        setPayload(parsedPayload);
      }
    } catch (error) {
      console.error("분석 결과 불러오기 실패:", error);
    }
  }, []);

  // 분석 결과 수동 저장
const handleSaveAnalysis = async () => {
  if (isSaving || isSaved) return;

  const token = localStorage.getItem("token");

  if (!token) {
    window.alert("로그인이 필요한 서비스입니다.");
    router.replace("/login");
    return;
  }

  if (!payload?.userInput || !result) {
    window.alert("저장할 분석 정보가 없습니다.");
    return;
  }

  setIsSaving(true);

  try {
    const response = await fetch(
      `${API_URL}/api/analysis/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userInput: payload.userInput,
          result,
        }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      window.alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      throw new Error("분석 기록 저장에 실패했습니다.");
    }

    setIsSaved(true);
    window.alert("분석 기록이 저장되었습니다.");
  } catch (error) {
    console.error("분석 기록 저장 실패:", error);
    window.alert("분석 기록 저장에 실패했습니다. 다시 시도해 주세요.");
  } finally {
    setIsSaving(false);
  }
};

  // 분석 기록 화면으로 이동
  // 분석 기록은 사용자가 저장 버튼을 눌렀을 때 MongoDB에 저장됨
  const handleGoToHistory = () => {
    router.push("/analysis-history");
  };

  // 결과를 불러오는 중
  if (!result) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d20] px-5 py-10 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px]" />

        <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200/30 border-t-violet-300" />
          </div>

          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-violet-300">
            MOONLIGHT ANALYSIS
          </p>

          <h1 className="text-xl font-bold text-white">
            분석 결과를 불러오는 중입니다.
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            잠시만 기다려 주세요.
          </p>
        </div>
      </main>
    );
  }

  const user = payload?.userInput;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d20] px-5 py-10 text-white">
      {/* 배경 장식 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute right-[-150px] top-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-180px] left-[25%] h-[450px] w-[450px] rounded-full bg-pink-500/[0.07] blur-[140px]" />

        <div className="absolute left-[12%] top-[12%] h-1 w-1 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.5)]" />
        <div className="absolute right-[18%] top-[20%] h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_14px_4px_rgba(196,181,253,0.4)]" />
        <div className="absolute left-[22%] top-[55%] h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_12px_3px_rgba(103,232,249,0.4)]" />
        <div className="absolute bottom-[18%] right-[12%] h-1 w-1 rounded-full bg-pink-200 shadow-[0_0_12px_3px_rgba(249,168,212,0.4)]" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col gap-6">
        {/* 헤더 */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/15 via-[#111a35]/90 to-cyan-500/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border border-violet-200/10" />
          <div className="pointer-events-none absolute -right-2 -top-8 h-48 w-48 rounded-full border border-violet-200/10" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-violet-200">
              <span>🌙</span>
              MOONLIGHT ANALYSIS REPORT
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              오늘의 마음을 들여다보다
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              오늘 하루의 활동과 감정, 집중 상태를 바탕으로 분석한 결과입니다.
              나의 생활 패턴을 돌아보고 더 나은 내일을 준비해 보세요.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-slate-300">
                🧠 AI 생활 패턴 분석
              </span>
              <span className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-slate-300">
                ✨ 하루 상태 리포트
              </span>
            </div>
          </div>
        </section>

        {/* 사용자 입력 요약 */}
        {user && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-cyan-300">
                TODAY'S RECORD
              </p>

              <h2 className="text-xl font-bold text-white">
                오늘의 입력 정보
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                분석에 사용된 오늘의 생활 정보를 확인할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "주요 활동", value: user.mainActivity, icon: "🌿" },
                { label: "하루 상태", value: user.dayMood, icon: "🌙" },
                { label: "집중이 잘 된 시간대", value: user.focusTime, icon: "⏳" },
                { label: "피로도", value: user.fatigueLevel, icon: "💧" },
                { label: "가장 끌렸던 활동", value: user.impulseActivity, icon: "✨" },
                { label: "대면/통화 상호작용", value: user.faceToFaceInteraction, icon: "🫧" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/[0.07] bg-[#111a32]/80 p-4 transition hover:border-violet-300/20 hover:bg-[#17213e]"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-xs font-medium text-slate-400">
                      {item.label}
                    </p>
                  </div>

                  <p className="text-sm font-semibold leading-6 text-slate-100">
                    {item.value || "입력 정보 없음"}
                  </p>
                </div>
              ))}
            </div>

            {/* 메모 */}
            {user.memo && (
              <div className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-400/[0.07] p-5">
                <p className="mb-3 text-xs font-semibold text-violet-300">
                  ✍️ 오늘의 기록
                </p>

                <p className="whitespace-pre-line text-sm leading-7 text-slate-200">
                  {user.memo}
                </p>
              </div>
            )}
          </section>
        )}

        {/* AI 종합 요약 */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 via-[#171c3a] to-indigo-500/10 p-7 shadow-xl shadow-violet-950/20 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200/20 bg-violet-300/10 text-xl">
                🧠
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-violet-300">
                  AI INSIGHT
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  AI 종합 해석
                </h2>
              </div>
            </div>

            <p className="whitespace-pre-line text-sm leading-8 text-violet-50/90">
              {result.summary}
            </p>
          </div>
        </section>

        {/* 6대 상태 밸런스 */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-cyan-300">
              PERSONAL BALANCE
            </p>

            <h2 className="text-xl font-bold text-white">
              📈 오늘의 상태 밸런스
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              AI가 분석한 오늘의 6가지 상태 수준입니다.
            </p>
          </div>

          {result.radar_chart && result.radar_chart.length > 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0d1630]/70 p-3 sm:p-5">
              <div style={{ width: "100%", height: "360px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={result.radar_chart}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                  >
                    <PolarGrid
                      stroke="rgba(167, 139, 250, 0.22)"
                      strokeDasharray="3 5"
                    />

                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{
                        fontSize: 13,
                        fill: "#ddd6fe",
                      }}
                    />

                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 5]}
                      tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                    />

                    <Radar
                      name="오늘의 상태"
                      dataKey="value"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      fill="#8b5cf6"
                      fillOpacity={0.32}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-2 text-center text-xs text-slate-500">
                각 항목의 수치는 기존 AI 분석 데이터를 기준으로 표시합니다.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#111a32] p-7 text-center">
              <span className="text-3xl">🌙</span>
              <p className="mt-3 text-sm text-slate-400">
                상태 밸런스 데이터를 불러오지 못했습니다.
              </p>
            </div>
          )}
        </section>

        {/* 패턴 분석 */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-pink-300">
              DAILY PATTERN
            </p>

            <h2 className="text-xl font-bold text-white">
              📊 생활 패턴 분석
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              오늘의 입력 데이터를 바탕으로 확인된 생활 패턴입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-400/[0.10] to-indigo-400/[0.04] p-5">
            <p className="whitespace-pre-line text-sm leading-8 text-violet-100/90">
              {result.pattern}
            </p>
          </div>
        </section>

        {/* 행동 추천 */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
          <button
            type="button"
            onClick={() => setShowAdvice(!showAdvice)}
            aria-expanded={showAdvice}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-emerald-300">
                TOMORROW'S GUIDE
              </p>

              <h2 className="text-xl font-bold text-white">
                💡 행동 추천
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                오늘의 분석 결과를 바탕으로 한 AI 추천입니다.
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-lg text-emerald-200 transition hover:bg-emerald-400/20">
              {showAdvice ? "▲" : "▼"}
            </span>
          </button>

          {showAdvice && (
            <div className="mt-6 rounded-2xl border border-emerald-300/15 bg-gradient-to-br from-emerald-400/[0.10] to-cyan-400/[0.04] p-5">
              <p className="whitespace-pre-line text-sm leading-8 text-emerald-100/90">
                {result.advice}
              </p>
            </div>
          )}
        </section>

        {/* 하단 버튼 */}
<section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
  <div className="mb-5 text-center">
    <p className="text-lg font-bold text-white">
      오늘의 기록을 마무리해 볼까요?
    </p>
    <p className="mt-2 text-sm text-slate-400">
      분석 결과를 저장하거나 지난 기록을 확인할 수 있습니다.
    </p>
  </div>

  <div className="grid gap-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={handleSaveAnalysis}
      disabled={isSaving || isSaved}
      className="rounded-2xl border border-emerald-300/20 bg-emerald-500/15 px-4 py-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSaving
        ? "저장 중..."
        : isSaved
          ? "✓ 분석 기록 저장 완료"
          : "💾 분석 기록 저장하기"}
    </button>

    <button
      type="button"
      onClick={handleGoToHistory}
      className="rounded-2xl border border-violet-300/20 bg-violet-500/15 px-4 py-4 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25"
    >
      📂 분석 기록 확인하기
    </button>

    <button
      type="button"
      onClick={() => router.push("/input")}
      className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
    >
      ✨ 다시 분석하기
    </button>

    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.12]"
    >
      ← 돌아가기
    </button>
  </div>
</section>

        <p className="pb-4 text-center text-xs tracking-wider text-slate-600">
          MOONLIGHT GARDEN · YOUR DAILY JOURNEY
        </p>
      </div>
    </main>
  );
}

