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
  screenshotInfo: {
    uploaded: boolean;
    fileName: string;
    analyzed: boolean;
    skipped: boolean;
    estimatedConfidence: number;
  };
};

export default function ResultPage() {
  const router = useRouter();

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [payload, setPayload] = useState<AnalysisPayload | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);

  useEffect(() => {
    try {
      // 실제 AI/백엔드 분석 결과
      const storedResult = sessionStorage.getItem("analysisResult");

      // 사용자가 입력한 데이터
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

  // 결과를 불러오는 중
  if (!result) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

            <h1 className="mb-2 text-lg font-bold text-gray-900">
              분석 결과를 불러오는 중입니다.
            </h1>

            <p className="text-sm text-gray-500">
              잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const user = payload?.userInput;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">

        {/* 헤더 */}
        <section className="rounded-3xl bg-white p-7 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            AI 기반 하루 흐름 분석 시스템
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            AI 분석 결과 리포트
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            입력하신 하루의 활동과 상태를 바탕으로 분석한 결과입니다.
          </p>
        </section>

        {/* 사용자 입력 요약 */}
        {user && (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                오늘의 입력 정보
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                분석에 사용된 오늘의 생활 정보를 확인할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  주요 활동
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.mainActivity}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  하루 상태
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.dayMood}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  집중이 잘 된 시간대
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.focusTime}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  피로도
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.fatigueLevel}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  가장 끌렸던 활동
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.impulseActivity}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  대면/통화 상호작용
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.faceToFaceInteraction}
                </p>
              </div>

            </div>

            {/* 메모 */}
            {user.memo && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xs font-medium text-blue-600">
                  오늘의 기록
                </p>

                <p className="text-sm leading-relaxed text-gray-700">
                  {user.memo}
                </p>
              </div>
            )}
          </section>
        )}

        {/* AI 종합 요약 */}
        <section className="rounded-3xl bg-blue-600 p-6 text-white shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🧠</span>

            <h2 className="text-lg font-bold">
              AI 종합 해석
            </h2>
          </div>

          <p className="text-sm leading-7 text-blue-50">
            {result.summary}
          </p>
        </section>

                {/* 6대 상태 밸런스 */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              📈 오늘의 상태 밸런스
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              AI가 분석한 오늘의 6가지 상태 수준입니다.
            </p>
          </div>

          {result.radar_chart && result.radar_chart.length > 0 ? (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={result.radar_chart}
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                >
                  <PolarGrid />

                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{
                      fontSize: 13,
                      fill: "#374151",
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
                    name="오늘의 상태"
                    dataKey="value"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                상태 밸런스 데이터를 불러오지 못했습니다.
              </p>
            </div>
          )}
        </section>
        
        {/* 패턴 분석 */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              📊 생활 패턴 분석
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              오늘의 입력 데이터를 바탕으로 확인된 생활 패턴입니다.
            </p>
          </div>

          <div className="rounded-2xl bg-violet-50 p-5">
            <p className="whitespace-pre-line text-sm leading-7 text-violet-900">
  {result.pattern}
</p>
          </div>
        </section>

        {/* 행동 추천 */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

          <button
            type="button"
            onClick={() => setShowAdvice(!showAdvice)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                💡 행동 추천
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                오늘의 분석 결과를 바탕으로 한 AI 추천입니다.
              </p>
            </div>

            <span className="text-xl text-gray-400">
              {showAdvice ? "▲" : "▼"}
            </span>
          </button>

          {showAdvice && (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-emerald-900">
  {result.advice}
</p>
            </div>
          )}

        </section>

        {/* 스크린샷 정보 */}
        {payload?.screenshotInfo && (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-lg font-bold text-gray-900">
              📱 사용 기록 입력 정보
            </h2>

            {payload.screenshotInfo.uploaded ? (
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  스크린샷이 입력되었습니다.
                </p>

                {payload.screenshotInfo.fileName && (
                  <p className="mt-1 text-xs text-gray-500">
                    파일명: {payload.screenshotInfo.fileName}
                  </p>
                )}

                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  현재 시스템에서는 업로드된 스크린샷의 존재 여부를
                  분석 요청에 전달하고 있습니다.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  스크린샷 없이 분석했습니다.
                </p>

                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  사용자 입력 정보를 기반으로 분석이 진행되었습니다.
                </p>
              </div>
            )}

          </section>
        )}

        {/* 하단 버튼 */}
        <section className="flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() => router.push("/input")}
            className="w-full rounded-2xl border border-gray-200 bg-white py-4 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            다시 분석하기
          </button>

          <button
            type="button"
            onClick={() => router.push("/mypage")}
            className="w-full rounded-2xl bg-gray-700 py-4 font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            마이페이지
          </button>

        </section>

      </div>
    </main>
  );
}