
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Diary = {
  id: string | number;
  title: string;
  date: string;
  content: string;
};

export default function DiaryDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem("myDiary") || "[]"
      );

      const found = saved.find(
        (item: Diary) => String(item.id) === String(id)
      );

      setDiary(found || null);
    } catch {
      setDiary(null);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!diary || isAnalyzing) return;

    setErrorMessage("");
    setAnalysisResult("");

    // 팀원이 알려 준 '전체 API 경로'를 환경변수로 설정해야 합니다.
    const apiUrl =
      process.env.NEXT_PUBLIC_DIARY_ANALYSIS_API_URL;

    if (!apiUrl) {
      setErrorMessage(
        "일기 분석 API 주소가 설정되지 않았습니다. 팀원에게 전달받은 전체 API 경로를 설정해 주세요."
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 임시 가정: 실제 API 요청 형식과 일치하는지 확인 필요
        body: JSON.stringify({
          diaryText: diary.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `분석 요청 실패 (${response.status})`
        );
      }

      // 임시 가정: 실제 API 응답 필드와 일치하는지 확인 필요
      const result = data?.closing_mood_analysis;

      if (typeof result !== "string" || !result.trim()) {
        throw new Error(
          "분석 응답 형식이 예상과 다릅니다. 팀원에게 응답 데이터 형식을 확인해 주세요."
        );
      }

      setAnalysisResult(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "분석 요청 중 오류가 발생했습니다."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!diary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <p className="text-gray-500">
            일기를 찾을 수 없습니다.
          </p>
        </div>

        <button
          onClick={() => router.push("/diary/list")}
          className="mt-5 w-full rounded-2xl bg-gray-200 py-3"
        >
          ← 일기장으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">
      <h1 className="mb-2 text-2xl font-bold text-purple-700">
        📖 {diary.title}
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        {diary.date}
      </p>

      <div className="rounded-3xl bg-white p-6 shadow">
        <p className="whitespace-pre-wrap leading-8 text-gray-900">
          {diary.content}
        </p>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzing ? "🧠 일기 분석 중..." : "🧠 분석하기"}
      </button>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {analysisResult && (
        <section className="mt-5 rounded-3xl border border-purple-100 bg-white p-6 shadow">
          <h2 className="mb-3 text-lg font-bold text-purple-700">
            🌙 하루 마무리 감정 분석
          </h2>
          <p className="whitespace-pre-wrap leading-8 text-gray-800">
            {analysisResult}
          </p>
        </section>
      )}

      <button
        onClick={() => router.push("/diary/list")}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 py-3 font-semibold shadow-md"
      >
        <span className="text-purple-800">
          ← 일기장으로 돌아가기
        </span>
      </button>
    </div>
  );
}
