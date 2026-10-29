
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

type Diary = {
  id: string | number;
  title: string;
  date: string;
  content: string;
  analysisResult?: string;
  analyzedAt?: string;
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
  analyzedAt: string;
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
    <div className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-500">
      🍃 {children}
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
    <div className="rounded-xl bg-white p-3">
      <p className="mb-1 text-xs font-medium text-gray-500">
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-gray-800">
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
    try {
      const savedDiaries = JSON.parse(
        localStorage.getItem("myDiary") || "[]"
      );
      const savedAnalyses = JSON.parse(
        localStorage.getItem("savedAnalyses") || "[]"
      );

      setDiaries(
        Array.isArray(savedDiaries) ? savedDiaries : []
      );
      setAnalyses(
        Array.isArray(savedAnalyses) ? savedAnalyses : []
      );
    } catch (error) {
      console.error("대시보드 데이터 불러오기 실패:", error);
      setDiaries([]);
      setAnalyses([]);
    } finally {
      setReady(true);
    }
  }, []);

  const todayString = new Date().toLocaleDateString();

  const latestDiary = [...diaries]
    .filter((diary) => diary.date === todayString)
    .sort((a, b) => Number(b.id) - Number(a.id))[0];

  const latestDiaryAnalysis = latestFirst(
    diaries.filter(
      (diary) =>
        diary.analysisResult?.trim() &&
        isToday(diary.analyzedAt)
    ),
    (diary) => diary.analyzedAt
  )[0];

  const latestLifestyleAnalysis = latestFirst(
    analyses.filter(
      (item) => item.result && isToday(item.analyzedAt)
    ),
    (item) => item.analyzedAt
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
    <main className="min-h-screen bg-[#F0EDF7] px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-3xl bg-[#F8F7FC] p-5 sm:p-8">
        {/* 헤더 */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-2xl text-purple-600">
            🧠
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#29213F]">
              📅 오늘의 심리 상태 대시보드
            </h1>
            <p className="mt-2 text-[#857B9B]">
              하루의 기록과 마음을 돌아보는 시간
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {today}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="self-start rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50 sm:self-center"
          >
            ← 이전 화면
          </button>
        </header>

        {/* 오늘의 나 */}
        <section className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-400 p-5 text-white">
          <p className="text-sm text-purple-100">
            TODAY, JUST FOR YOU
          </p>
          <h2 className="mt-1 text-2xl font-bold">
            오늘의 나
          </h2>
        </section>

        <div className="space-y-5">
          {/* 오늘의 일기 */}
          <section className="rounded-3xl border border-[#E5E1FA] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xl text-blue-500">✍️</span>
              <h2 className="text-xl font-bold text-[#3550A4]">
                오늘의 일기
              </h2>
              <span className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                기록
              </span>
            </div>

            {!ready ? (
              <p className="text-gray-500">
                기록을 불러오는 중...
              </p>
            ) : latestDiary ? (
              <>
                <h3 className="mb-3 text-lg font-bold text-[#29213F]">
                  {latestDiary.title}
                </h3>
                <p className="whitespace-pre-wrap break-words leading-7 text-gray-600">
                  {latestDiary.content}
                </p>
                <p className="mt-4 text-sm text-[#857B9B]">
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
          <section className="rounded-3xl border border-[#E6D8FF] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xl text-purple-500">🌙</span>
              <h2 className="text-xl font-bold text-purple-600">
                오늘의 일기 분석 결과
              </h2>
            </div>

            <div className="mb-5 border-t border-purple-100" />

            {!ready ? (
              <p className="text-gray-500">
                분석 결과를 불러오는 중...
              </p>
            ) : latestDiaryAnalysis ? (
              <>
                <h3 className="mb-3 font-bold text-purple-800">
                  {latestDiaryAnalysis.title}
                </h3>
                <div className="rounded-2xl bg-[#F8F4FF] p-4">
                  <p className="whitespace-pre-wrap break-words leading-7 text-[#6D5A8C]">
                    {latestDiaryAnalysis.analysisResult}
                  </p>
                </div>
                {latestDiaryAnalysis.analyzedAt && (
                  <p className="mt-3 text-sm text-purple-400">
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
          <section className="rounded-3xl border border-[#D8EDE2] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xl text-emerald-600">🌿</span>
              <h2 className="text-xl font-bold text-[#246B56]">
                AI 생활 패턴 분석
              </h2>
            </div>

            {!ready ? (
              <p className="text-gray-500">
                분석 결과를 불러오는 중...
              </p>
            ) : latestLifestyleAnalysis?.result ? (
              <div className="space-y-5">
                {/* 당시 입력 내용 */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <h3 className="mb-3 font-bold text-blue-900">
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
                    <div className="mt-3 rounded-xl bg-white p-4">
                      <p className="mb-2 text-xs font-medium text-blue-600">
                        추가 메모
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {userInput.memo}
                      </p>
                    </div>
                  )}
                </div>

                {/* 육각형 그래프 */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <h3 className="mb-1 font-bold text-indigo-900">
                    📈 당시의 상태 밸런스
                  </h3>
                  <p className="mb-3 text-sm text-gray-500">
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
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="axis"
                            tick={{
                              fontSize: 12,
                              fill: "#4338CA",
                            }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 5]}
                            tick={{
                              fontSize: 10,
                              fill: "#9CA3AF",
                            }}
                          />
                          <Radar
                            name="당시의 상태"
                            dataKey="value"
                            stroke="#7C3AED"
                            fill="#8B5CF6"
                            fillOpacity={0.25}
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
                <div className="rounded-2xl bg-[#F0FAF5] p-4">
                  <h3 className="mb-2 font-bold text-emerald-800">
                    💡 분석 요약
                  </h3>
                  <p className="whitespace-pre-wrap break-words leading-7 text-gray-700">
                    {latestLifestyleAnalysis.result.summary ||
                      "저장된 요약이 없습니다."}
                  </p>
                </div>

                {/* 생활 패턴 */}
                <div className="rounded-2xl bg-gray-50 p-4">
                  <h3 className="mb-2 font-bold text-gray-800">
                    🔍 생활 패턴
                  </h3>
                  <p className="whitespace-pre-wrap break-words leading-7 text-gray-700">
                    {latestLifestyleAnalysis.result.pattern ||
                      "저장된 생활 패턴이 없습니다."}
                  </p>
                </div>

                {/* 행동 제안 */}
                {latestLifestyleAnalysis.result.advice && (
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <h3 className="mb-2 font-bold text-amber-800">
                      🌱 오늘의 제안
                    </h3>
                    <p className="whitespace-pre-wrap break-words leading-7 text-gray-700">
                      {latestLifestyleAnalysis.result.advice}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-400">
                  저장 시간:{" "}
                  {new Date(
                    latestLifestyleAnalysis.analyzedAt
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

        <footer className="pt-6 text-center text-sm text-[#8A809F]">
          오늘의 작은 기록이 내일의 나를 이해하는 데 도움이 되길 바라요. 💜
        </footer>
      </div>
    </main>
  );
}

