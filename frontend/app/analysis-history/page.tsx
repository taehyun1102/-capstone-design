
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

type UserInputData = Record<string, string | number | boolean | null>;

type RadarChartItem = {
  axis: string;
  value: number;
};

type AnalysisResult = {
  summary?: string;
  pattern?: string;
  advice?: string;
  radar_chart?: RadarChartItem[];
};

type AnalysisPayload = {
  userInput?: UserInputData;
};

type SavedAnalysis = {
  id: string;
  analyzedAt: string;
  payload: AnalysisPayload | null;
  result: AnalysisResult;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

const inputLabels: Record<string, string> = {
  mainActivity: "주요 활동",
  dayMood: "오늘의 기분",
  focusTime: "집중 시간",
  fatigueLevel: "피로도",
  impulseActivity: "충동적 행동",
  hadGoal: "목표 설정 여부",
  achievedGoal: "목표 달성 여부",
  faceToFaceInteraction: "대면 상호작용",
  memo: "추가 메모",

  mood: "오늘의 기분",
  activity: "주요 활동",
  fatigue: "피로도",
  focusLevel: "집중도",
  sleepQuality: "수면의 질",
  stressLevel: "스트레스 수준",
  distraction: "주의 분산",
  digitalFeeling: "디지털 생활 체감",
  aiHint: "AI 참고 정보",
  socialInteraction: "사회적 상호작용",
  focusedTime: "집중 시간",
  frequentActivity: "자주 한 활동",
  temptingActivity: "충동을 유발한 활동",
  hasGoal: "목표 설정 여부",
  goalResult: "목표 달성 결과",
};

export default function AnalysisHistoryPage() {
  const router = useRouter();

  const [records, setRecords] = useState<SavedAnalysis[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // MongoDB에서 로그인한 사용자의 분석 기록 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.alert("로그인이 필요한 서비스입니다.");
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/analysis/history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          window.alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("분석 기록을 불러오지 못했습니다.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("분석 기록 응답 형식이 올바르지 않습니다.");
        }

        const formattedRecords: SavedAnalysis[] = data.map((record) => ({
          id: String(record.id || record._id),
          analyzedAt: record.createdAt || record.analyzedAt || "",
          payload: record.payload || null,
          result: record.result || {
            summary: record.summary || "",
            pattern: record.pattern || "",
            advice: record.advice || "",
            radar_chart: record.radar_chart || [],
          },
        }));

        formattedRecords.sort(
          (a, b) =>
            new Date(b.analyzedAt).getTime() -
            new Date(a.analyzedAt).getTime()
        );

        setRecords(formattedRecords);
      } catch (error) {
        console.error("분석 기록 불러오기 실패:", error);
        setErrorMessage(
          "분석 기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "날짜 정보 없음";
    }

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // MongoDB에서 본인 분석 기록 삭제
  const handleDeleteRecord = async (id: string) => {
    const confirmed = window.confirm(
      "이 분석 기록을 삭제하시겠습니까?\n삭제한 기록은 복구할 수 없습니다."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      window.alert("로그인이 필요한 서비스입니다.");
      router.replace("/login");
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/analysis/history/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("분석 기록 삭제에 실패했습니다.");
      }

      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }

      window.alert("분석 기록이 삭제되었습니다.");
    } catch (error) {
      console.error("분석 기록 삭제 실패:", error);
      window.alert("분석 기록 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d20] px-5 py-10 text-white sm:px-7">
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

      <div className="relative mx-auto max-w-4xl">
        {/* 헤더 */}
        <header className="mb-8 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/15 via-[#111a35]/90 to-cyan-500/10 p-7 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-violet-200">
            <span>🌙</span>
            MY ANALYSIS ARCHIVE
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            나의 분석 기록
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            저장한 생활 패턴 분석 결과를 확인하고 관리할 수 있어요.
            지난 하루의 기록을 돌아보며 나의 변화를 살펴보세요.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-slate-300">
              🧠 AI 생활 패턴 분석
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-slate-300">
              ✨ 나의 기록 보관함
            </span>
          </div>
        </header>

        {/* 기록 상태 */}
        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] px-6 py-16 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-violet-200/20 border-t-violet-300" />
            <p className="font-semibold text-white">
              분석 기록을 불러오는 중입니다...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              잠시만 기다려 주세요.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-rose-300/20 bg-rose-400/[0.06] px-6 py-12 text-center">
            <span className="text-3xl">⚠️</span>

            <p className="mt-4 text-sm leading-7 text-rose-200">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl border border-violet-300/20 bg-violet-500/20 px-6 py-3 font-semibold text-violet-100 transition hover:bg-violet-500/30"
            >
              다시 불러오기
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] px-6 py-16 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-3xl">
              🌌
            </div>

            <p className="mt-6 text-lg font-bold text-white">
              저장된 분석 기록이 없습니다.
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              분석 결과 페이지에서 저장 버튼을 누르면 이곳에 기록이 보관됩니다.
            </p>
          </div>
        ) : (
          <>
            {/* 기록 개수 */}
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 backdrop-blur-xl">
              <p className="text-sm text-slate-300">
                저장된 분석 기록
              </p>

              <p className="text-sm font-semibold text-violet-200">
                총{" "}
                <span className="text-lg font-bold text-white">
                  {records.length}
                </span>
                개
              </p>
            </div>

            {/* 기록 목록 */}
            <div className="space-y-5">
              {records.map((record) => {
                const isExpanded = expandedId === record.id;

                return (
                  <section
                    key={record.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10 backdrop-blur-xl"
                  >
                    {/* 기록 제목 및 삭제 버튼 */}
                    <div className="flex items-center gap-2 p-4 sm:gap-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : record.id)
                        }
                        aria-expanded={isExpanded}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl p-3 text-left transition hover:bg-violet-400/[0.06]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.08] px-3 py-1">
                            <span className="text-xs">🌙</span>
                            <p className="text-xs font-medium text-violet-200">
                              {formatDate(record.analyzedAt)}
                            </p>
                          </div>

                          <h2 className="text-base font-bold leading-7 text-white sm:text-lg">
                            {record.result?.summary ||
                              "생활 패턴 분석 결과"}
                          </h2>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                            {record.result?.pattern ||
                              "생활 패턴 정보가 없습니다."}
                          </p>
                        </div>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10 text-xl text-violet-200">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>

                      {/* 개별 삭제 버튼 */}
                      <button
                        type="button"
                        disabled={deletingId === record.id}
                        onClick={() => handleDeleteRecord(record.id)}
                        className="shrink-0 rounded-xl border border-rose-300/20 bg-rose-400/[0.06] px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                      >
                        {deletingId === record.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>

                    {/* 펼쳐지는 상세 내용 */}
                    {isExpanded && (
                      <div className="space-y-6 border-t border-white/[0.08] p-5 sm:p-7">
                        {/* 분석 요약 */}
                        <section className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-5">
                          <h3 className="font-bold text-violet-200">
                            📌 분석 요약
                          </h3>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                            {record.result?.summary ||
                              "분석 요약이 없습니다."}
                          </p>
                        </section>

                        {/* 생활 패턴 분석 */}
                        <section className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.05] p-5">
                          <h3 className="font-bold text-cyan-200">
                            🧠 생활 패턴 분석
                          </h3>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                            {record.result?.pattern ||
                              "생활 패턴 정보가 없습니다."}
                          </p>
                        </section>

                        {/* AI 조언 */}
                        <section className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.05] p-5">
                          <h3 className="font-bold text-emerald-200">
                            💡 AI 조언
                          </h3>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-8 text-slate-200">
                            {record.result?.advice ||
                              "등록된 조언이 없습니다."}
                          </p>
                        </section>

                        {/* 레이더 차트 */}
                        {record.result?.radar_chart &&
                          record.result.radar_chart.length > 0 && (
                            <section className="rounded-2xl border border-violet-300/15 bg-[#0d1630]/80 p-5">
                              <h3 className="font-bold text-violet-200">
                                📊 생활 패턴 레이더 차트
                              </h3>

                              <p className="mt-2 text-sm text-slate-400">
                                당시 분석한 6가지 상태 수준입니다.
                              </p>

                              <div className="mt-4 h-80 w-full">
                                <ResponsiveContainer
                                  width="100%"
                                  height="100%"
                                >
                                  <RadarChart
                                    data={record.result.radar_chart}
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
                                      ticks={[0, 1, 2, 3, 4, 5]}
                                      tick={{
                                        fontSize: 10,
                                        fill: "#94a3b8",
                                      }}
                                      axisLine={false}
                                    />

                                    <Radar
                                      name="분석 수치"
                                      dataKey="value"
                                      stroke="#a78bfa"
                                      strokeWidth={2.5}
                                      fill="#8b5cf6"
                                      fillOpacity={0.3}
                                      isAnimationActive={false}
                                    />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </section>
                          )}

                        {/* 당시 입력 내용 */}
                        {record.payload?.userInput && (
                          <section className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.04] p-5">
                            <h3 className="font-bold text-cyan-200">
                              📝 당시 입력 내용
                            </h3>

                            <dl className="mt-4 space-y-4">
                              {Object.entries(
                                record.payload.userInput
                              ).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="rounded-xl border border-white/[0.06] bg-[#111a32]/80 p-4"
                                >
                                  <dt className="text-xs font-medium text-cyan-300">
                                    {inputLabels[key] || key}
                                  </dt>

                                  <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                                    {value === null ||
                                    value === undefined ||
                                    value === ""
                                      ? "입력 없음"
                                      : String(value)}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </section>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}

        {/* 하단 버튼 */}
        <button
          type="button"
          onClick={() => router.push("/input")}
          className="mt-8 w-full rounded-2xl border border-violet-300/20 bg-gradient-to-r from-violet-600/80 via-purple-500/80 to-indigo-500/80 py-4 font-bold text-white shadow-lg shadow-violet-950/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/30 active:translate-y-0"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-xl">←</span>
            메인페이지로 돌아가기
          </span>
        </button>

        <footer className="mt-8 border-t border-white/[0.07] py-7 text-center">
          <p className="text-sm text-slate-400">
            지나온 하루의 기록이 더 나은 내일을 만들어 갑니다.
          </p>
          <p className="mt-3 text-xs tracking-wider text-violet-300/50">
            MOONLIGHT GARDEN · MY DAILY ARCHIVE
          </p>
        </footer>
      </div>
    </main>
  );
}

