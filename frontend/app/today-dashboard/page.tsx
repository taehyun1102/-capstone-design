
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

type Diary = {
  id: string | number;
  title: string;
  date: string;
  content: string;
  analysisResult?: string;
  analyzedAt?: string;
  createdAt?: string;
};

type UserInputData = {
  mainActivity?: string;
  dayMood?: string;
  focusTime?: string;
  fatigueLevel?: string;
  impulseActivity?: string;
  hadGoal?: string;
  achievedGoal?: string;
  faceToFaceInteraction?: string;
  memo?: string;
};

type RadarItem = {
  axis: string;
  value: number;
};

type SavedAnalysis = {
  id: string | number;
  createdAt?: string;
  analyzedAt?: string;
  payload?: {
    userInput?: UserInputData;
  } | null;
  result?: {
    summary?: string;
    pattern?: string;
    advice?: string;
    radar_chart?: RadarItem[];
  };
};

function isToday(value?: string) {
  if (!value) return false;

  const date = new Date(value);
  const now = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function latestFirst<T>(
  items: T[],
  getTime: (item: T) => string | undefined
) {
  return [...items].sort(
    (a, b) =>
      new Date(getTime(b) || 0).getTime() -
      new Date(getTime(a) || 0).getTime()
  );
}

function EmptyMessage({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111a32]/80 p-5 text-sm leading-7 text-slate-400">
      <span className="mr-2">🌙</span>
      {children}
    </div>
  );
}

function InputCard({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111a32]/80 p-4">
      <p className="mb-2 text-xs font-medium text-violet-300">
        {label}
      </p>
      <p className="break-words text-sm font-semibold leading-6 text-slate-100">
        {value?.trim() || "입력 정보 없음"}
      </p>
    </div>
  );
}

export default function TodayDashboardPage() {
  const router = useRouter();

  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        router.replace("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        // 기존 API에서 일기와 생활 패턴 분석 기록 조회
        const [diaryResponse, analysisResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/diary`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE_URL}/api/analysis/history`, {
            method: "GET",
            headers,
          }),
        ]);

        if (diaryResponse.status === 401 || analysisResponse.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("username");

          alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
          router.replace("/login");
          return;
        }

        if (!diaryResponse.ok) {
          throw new Error("일기 데이터를 불러오지 못했습니다.");
        }

        if (!analysisResponse.ok) {
          throw new Error("AI 분석 기록을 불러오지 못했습니다.");
        }

        const diaryData = await diaryResponse.json();
        const analysisData = await analysisResponse.json();

        if (cancelled) return;

        setDiaries(
          Array.isArray(diaryData.diaries)
            ? diaryData.diaries
            : []
        );

        setAnalyses(
          Array.isArray(analysisData)
            ? analysisData
            : []
        );
      } catch (error) {
        console.error("대시보드 데이터 불러오기 실패:", error);

        if (!cancelled) {
          setDiaries([]);
          setAnalyses([]);
          alert(
            error instanceof Error
              ? error.message
              : "대시보드 데이터를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const todayString = new Date().toLocaleDateString();

  // 오늘 작성한 가장 최근 일기
  const latestDiary = latestFirst(
    diaries.filter((diary) => diary.date === todayString),
    (diary) => diary.createdAt
  )[0];

  // 오늘 분석을 완료한 가장 최근 일기
  const latestDiaryAnalysis = latestFirst(
    diaries.filter(
      (diary) =>
        diary.analysisResult?.trim() &&
        isToday(diary.analyzedAt)
    ),
    (diary) => diary.analyzedAt
  )[0];

  // 오늘 진행한 가장 최근 AI 생활 패턴 분석
  const latestLifestyleAnalysis = latestFirst(
    analyses.filter(
      (item) =>
        item.result &&
        isToday(item.createdAt || item.analyzedAt)
    ),
    (item) => item.createdAt || item.analyzedAt
  )[0];

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const userInput =
    latestLifestyleAnalysis?.payload?.userInput;

  const radarData =
    latestLifestyleAnalysis?.result?.radar_chart;

  return (
    
<main
  className="relative min-h-screen overflow-hidden bg-[#080d20] bg-cover bg-center bg-fixed px-5 py-8 text-white sm:px-7 sm:py-10"
  style={{
    backgroundImage:
      "linear-gradient(rgba(5, 8, 25, 0.42), rgba(5, 8, 25, 0.55)), url('/images/dashboard-observatory-bg.png')",
  }}
>


      <div className="relative mx-auto max-w-5xl">
        {/* 헤더 */}
        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-3xl shadow-lg shadow-violet-950/20">
            🧠
          </div>

          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-violet-300">
              MOONLIGHT DAILY DASHBOARD
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              📅 오늘의 심리 상태 대시보드
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              하루의 기록과 마음을 돌아보는 시간
            </p>

            <p className="mt-2 text-sm text-violet-300/80">
              {today}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="self-start rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-violet-300/30 hover:bg-violet-400/10 sm:self-center"
          >
            ← 이전 화면
          </button>
        </header>

        {/* 오늘의 나 */}
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 via-[#171c3a] to-cyan-500/10 p-7 shadow-xl shadow-violet-950/20 sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border border-violet-200/10" />
          <div className="pointer-events-none absolute -right-2 -top-8 h-48 w-48 rounded-full border border-violet-200/10" />

          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.2em] text-violet-300">
              TODAY, JUST FOR YOU
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              오늘의 나
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              오늘 하루의 기록과 분석을 한곳에서 확인하고,
              나의 마음과 생활 패턴을 천천히 돌아보세요.
            </p>
          </div>
        </section>

        <div className="space-y-6">
          {/* 오늘의 일기 */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-xl">
                ✍️
              </span>

              <div>
                <p className="text-xs font-semibold tracking-wider text-cyan-300">
                  DAILY DIARY
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  오늘의 일기
                </h2>
              </div>

              <span className="ml-auto rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                기록
              </span>
            </div>

            {!ready ? (
              <p className="text-sm text-slate-400">
                기록을 불러오는 중...
              </p>
            ) : latestDiary ? (
              <>
                <h3 className="mb-3 text-lg font-bold text-white">
                  {latestDiary.title}
                </h3>

                <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-300">
                  {latestDiary.content}
                </p>

                <p className="mt-5 border-t border-white/[0.07] pt-4 text-xs text-slate-500">
                  오늘 작성한 가장 최근 일기
                </p>
              </>
            ) : (
              <EmptyMessage>
                오늘 작성한 일기가 아직 없어요.
              </EmptyMessage>
            )}
          </section>

          {/* 오늘의 일기 분석 결과 */}
          <section className="rounded-3xl border border-violet-300/15 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-xl">
                🌙
              </span>

              <div>
                <p className="text-xs font-semibold tracking-wider text-violet-300">
                  DIARY INSIGHT
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  오늘의 일기 분석 결과
                </h2>
              </div>
            </div>

            <div className="mb-5 border-t border-violet-300/10" />

            {!ready ? (
              <p className="text-sm text-slate-400">
                분석 결과를 불러오는 중...
              </p>
            ) : latestDiaryAnalysis ? (
              <>
                <h3 className="mb-4 font-bold text-violet-200">
                  {latestDiaryAnalysis.title}
                </h3>

                <div className="rounded-2xl border border-violet-300/10 bg-violet-400/[0.07] p-5">
                  <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                    {latestDiaryAnalysis.analysisResult}
                  </p>
                </div>

                {latestDiaryAnalysis.analyzedAt && (
                  <p className="mt-4 text-xs text-violet-300/70">
                    분석 시간:{" "}
                    {new Date(
                      latestDiaryAnalysis.analyzedAt
                    ).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </>
            ) : (
              <EmptyMessage>
                오늘 분석을 완료한 일기가 아직 없어요.
              </EmptyMessage>
            )}
          </section>

          {/* AI 생활 패턴 분석 */}
          <section className="rounded-3xl border border-emerald-300/15 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-xl">
                🌿
              </span>

              <div>
                <p className="text-xs font-semibold tracking-wider text-emerald-300">
                  AI LIFESTYLE ANALYSIS
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  AI 생활 패턴 분석
                </h2>
              </div>
            </div>

            {!ready ? (
              <p className="text-sm text-slate-400">
                분석 결과를 불러오는 중...
              </p>
            ) : latestLifestyleAnalysis?.result ? (
              <div className="space-y-5">
                {/* 당시 입력 내용 */}
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.05] p-5">
                  <h3 className="mb-4 font-bold text-cyan-200">
                    📝 당시 입력 내용
                  </h3>

                  {userInput ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InputCard
                        label="주요 활동"
                        value={userInput.mainActivity}
                      />

                      <InputCard
                        label="하루 상태"
                        value={userInput.dayMood}
                      />

                      <InputCard
                        label="집중이 잘 된 시간대"
                        value={userInput.focusTime}
                      />

                      <InputCard
                        label="피로도"
                        value={userInput.fatigueLevel}
                      />

                      <InputCard
                        label="가장 끌렸던 활동"
                        value={userInput.impulseActivity}
                      />

                      <InputCard
                        label="대면/통화 상호작용"
                        value={userInput.faceToFaceInteraction}
                      />

                      <InputCard
                        label="목표 설정 여부"
                        value={userInput.hadGoal}
                      />

                      <InputCard
                        label="목표 달성 여부"
                        value={userInput.achievedGoal}
                      />
                    </div>
                  ) : (
                    <EmptyMessage>
                      이 분석 기록에는 당시 입력 정보가 저장되어 있지 않아요.
                    </EmptyMessage>
                  )}

                  {userInput?.memo && (
                    <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#111a32]/80 p-4">
                      <p className="mb-2 text-xs font-semibold text-cyan-300">
                        추가 메모
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                        {userInput.memo}
                      </p>
                    </div>
                  )}
                </div>

                {/* 육각형 그래프 */}
                <div className="rounded-2xl border border-violet-300/15 bg-[#0d1630]/80 p-5">
                  <h3 className="font-bold text-violet-200">
                    📈 당시의 상태 밸런스
                  </h3>

                  <p className="mb-4 mt-2 text-sm text-slate-400">
                    해당 분석을 진행했을 때의 6가지 상태 수준입니다.
                  </p>

                  {Array.isArray(radarData) &&
                  radarData.length > 0 ? (
                    <div
                      style={{
                        width: "100%",
                        height: "320px",
                      }}
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <RadarChart
                          data={radarData}
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
                              fontSize: 12,
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
                            name="당시의 상태"
                            dataKey="value"
                            stroke="#a78bfa"
                            strokeWidth={2.5}
                            fill="#8b5cf6"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyMessage>
                      이 기록에는 상태 밸런스 그래프 데이터가 없어요.
                    </EmptyMessage>
                  )}
                </div>

                {/* AI 종합 요약 */}
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.06] p-5">
                  <h3 className="mb-3 font-bold text-emerald-200">
                    💡 분석 요약
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                    {latestLifestyleAnalysis.result.summary ||
                      "저장된 요약이 없습니다."}
                  </p>
                </div>

                {/* 생활 패턴 */}
                <div className="rounded-2xl border border-violet-300/10 bg-violet-400/[0.05] p-5">
                  <h3 className="mb-3 font-bold text-violet-200">
                    🔍 생활 패턴
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                    {latestLifestyleAnalysis.result.pattern ||
                      "저장된 생활 패턴이 없습니다."}
                  </p>
                </div>

                {/* 행동 제안 */}
                {latestLifestyleAnalysis.result.advice && (
                  <div className="rounded-2xl border border-amber-300/15 bg-amber-400/[0.05] p-5">
                    <h3 className="mb-3 font-bold text-amber-200">
                      🌱 오늘의 제안
                    </h3>

                    <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                      {latestLifestyleAnalysis.result.advice}
                    </p>
                  </div>
                )}

                <p className="border-t border-white/[0.07] pt-4 text-xs text-slate-500">
                  저장 시간:{" "}
                  {new Date(
                    latestLifestyleAnalysis.createdAt ||
                    latestLifestyleAnalysis.analyzedAt ||
                    ""
                  ).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ) : (
              <EmptyMessage>
                오늘 저장된 AI 생활 패턴 분석 결과가 아직 없어요.
              </EmptyMessage>
            )}
          </section>
        </div>

        <footer className="mt-8 border-t border-white/[0.07] py-7 text-center">
          <p className="text-sm text-slate-400">
            오늘의 작은 기록이 내일의 나를 이해하는 데 도움이 되길 바라요.
          </p>
          <p className="mt-3 text-xs tracking-wider text-violet-300/50">
            MOONLIGHT GARDEN · YOUR DAILY JOURNEY
          </p>
        </footer>
      </div>
    </main>
  );
}

