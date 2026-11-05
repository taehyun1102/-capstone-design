
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
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-purple-600">
            MY ANALYSIS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            나의 분석 기록
          </h1>

          <p className="mt-3 text-gray-600">
            저장한 생활 패턴 분석 결과를 확인하고 관리할 수 있어요.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
            분석 기록을 불러오는 중입니다...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
            <p className="text-red-600">{errorMessage}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-700"
            >
              다시 불러오기
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">
              저장된 분석 기록이 없습니다.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              하루 생활 패턴 분석을 완료하면 기록이 자동으로 저장됩니다.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총{" "}
                <span className="font-bold text-purple-600">
                  {records.length}
                </span>
                개의 기록
              </p>
            </div>

            <div className="space-y-4">
              {records.map((record) => {
                const isExpanded = expandedId === record.id;

                return (
                  <section
                    key={record.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* 기록 제목 및 삭제 버튼 */}
                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : record.id)
                        }
                        aria-expanded={isExpanded}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg p-2 text-left transition hover:bg-purple-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-purple-600">
                            {formatDate(record.analyzedAt)}
                          </p>

                          <h2 className="mt-2 text-lg font-bold text-gray-900">
                            {record.result?.summary ||
                              "생활 패턴 분석 결과"}
                          </h2>

                          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                            {record.result?.pattern ||
                              "생활 패턴 정보가 없습니다."}
                          </p>
                        </div>

                        <span className="shrink-0 text-xl text-gray-500">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>

                      {/* 개별 삭제 버튼 */}
                      <button
                        type="button"
                        disabled={deletingId === record.id}
                        onClick={() => handleDeleteRecord(record.id)}
                        className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === record.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>

                    {/* 펼쳐지는 상세 내용 */}
                    {isExpanded && (
                      <div className="space-y-5 border-t border-gray-100 p-5">
                        <section>
                          <h3 className="font-bold text-gray-900">
                            📌 분석 요약
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">
                            {record.result?.summary ||
                              "분석 요약이 없습니다."}
                          </p>
                        </section>

                        <section>
                          <h3 className="font-bold text-gray-900">
                            🧠 생활 패턴 분석
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">
                            {record.result?.pattern ||
                              "생활 패턴 정보가 없습니다."}
                          </p>
                        </section>

                        <section>
                          <h3 className="font-bold text-gray-900">
                            💡 AI 조언
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">
                            {record.result?.advice ||
                              "등록된 조언이 없습니다."}
                          </p>
                        </section>

                        {record.result?.radar_chart &&
                          record.result.radar_chart.length > 0 && (
                            <section>
                              <h3 className="font-bold text-gray-900">
                                📊 생활 패턴 레이더 차트
                              </h3>

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
                                    <PolarGrid />

                                    <PolarAngleAxis
                                      dataKey="axis"
                                      tick={{
                                        fontSize: 12,
                                        fill: "#4b5563",
                                      }}
                                    />

                                    <PolarRadiusAxis
                                      angle={30}
                                      domain={[0, 5]}
                                      ticks={[0, 1, 2, 3, 4, 5]}
                                      tick={{ fontSize: 10 }}
                                    />

                                    <Radar
                                      name="분석 수치"
                                      dataKey="value"
                                      stroke="#9333ea"
                                      fill="#a855f7"
                                      fillOpacity={0.35}
                                      isAnimationActive={false}
                                    />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </section>
                          )}

                        {record.payload?.userInput && (
                          <section>
                            <h3 className="font-bold text-gray-900">
                              📝 당시 입력 내용
                            </h3>

                            <dl className="mt-3 space-y-3">
                              {Object.entries(
                                record.payload.userInput
                              ).map(([key, value]) => (
                                <div key={key}>
                                  <dt className="text-sm font-medium text-gray-500">
                                    {inputLabels[key] || key}
                                  </dt>

                                  <dd className="mt-1 whitespace-pre-wrap text-gray-800">
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

        <button
          type="button"
          onClick={() => router.push("/input")}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 py-4 font-bold text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-300 active:translate-y-0"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-xl">←</span>
            메인페이지로 돌아가기
          </span>
        </button>
      </div>
    </main>
  );
}
