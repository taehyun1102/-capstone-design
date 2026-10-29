
"use client";

import { useEffect, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

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

type RadarChartItem = {
  axis: string;
  value: number;
};

type AnalysisResult = {
  summary: string;
  pattern: string;
  advice: string;
  radar_chart?: RadarChartItem[];
};

type AnalysisPayload = {
  analyzedAt: string;
  userInput: UserInputData;
};

type SavedAnalysis = {
  id: string;
  analyzedAt: string;
  payload: AnalysisPayload | null;
  result: AnalysisResult;
};

export default function AnalysisHistoryPage() {
  const [records, setRecords] = useState<SavedAnalysis[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("savedAnalyses");

      if (savedData) {
        const parsedData: SavedAnalysis[] = JSON.parse(savedData);

        const sortedRecords = parsedData.sort(
          (a, b) =>
            new Date(b.analyzedAt).getTime() -
            new Date(a.analyzedAt).getTime()
        );

        setRecords(sortedRecords);
      }
    } catch (error) {
      console.error("분석 기록 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteRecord = (id: string) => {
    const confirmed = window.confirm(
      "이 분석 기록을 삭제하시겠습니까?\n삭제한 기록은 복구할 수 없습니다."
    );

    if (!confirmed) return;

    try {
      const savedData = localStorage.getItem("savedAnalyses");
      const allRecords: SavedAnalysis[] = savedData
        ? JSON.parse(savedData)
        : [];

      const updatedRecords = allRecords.filter(
        (record) => record.id !== id
      );

      localStorage.setItem(
        "savedAnalyses",
        JSON.stringify(updatedRecords)
      );

      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error("분석 기록 삭제 실패:", error);
      window.alert("분석 기록 삭제에 실패했습니다.");
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
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">
              저장된 분석 기록이 없습니다.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              분석 결과 페이지에서 기록을 저장해 주세요.
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
                          setExpandedId(
                            isExpanded ? null : record.id
                          )
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
                        onClick={() =>
                          handleDeleteRecord(record.id)
                        }
                        className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        삭제
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
                              {(
                                Object.entries(
                                  record.payload.userInput
                                ) as [keyof UserInputData, string][]
                              ).map(([key, value]) => {
                                const labels: Record<
                                  keyof UserInputData,
                                  string
                                > = {
                                  mainActivity: "주요 활동",
                                  dayMood: "오늘의 기분",
                                  focusTime: "집중 시간",
                                  fatigueLevel: "피로도",
                                  impulseActivity: "충동적 행동",
                                  hadGoal: "목표 설정 여부",
                                  achievedGoal: "목표 달성 여부",
                                  faceToFaceInteraction:
                                    "대면 상호작용",
                                  memo: "추가 메모",
                                };

                                return (
                                  <div key={key}>
                                    <dt className="text-sm font-medium text-gray-500">
                                      {labels[key]}
                                    </dt>
                                    <dd className="mt-1 whitespace-pre-wrap text-gray-800">
                                      {value || "입력 없음"}
                                    </dd>
                                  </div>
                                );
                              })}
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
      </div>
    </main>
  );
}

