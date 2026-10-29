
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Diary = {
  id: string | number;
  title: string;
  date: string;
  content: string;
  analysisResult?: string;
  analyzedAt?: string;
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
      const saved: Diary[] = JSON.parse(
        localStorage.getItem("myDiary") || "[]"
      );

      const found = saved.find(
        (item) => String(item.id) === String(id)
      );

      setDiary(found || null);
      setAnalysisResult(found?.analysisResult || "");
    } catch (error) {
      console.error("일기 불러오기 실패:", error);
      setDiary(null);
      setAnalysisResult("");
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!diary || isAnalyzing) return;

    setErrorMessage("");

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

      const result = data?.closing_mood_analysis;

      if (typeof result !== "string" || !result.trim()) {
        throw new Error(
          "분석 응답 형식이 예상과 다릅니다. 팀원에게 응답 데이터 형식을 확인해 주세요."
        );
      }

      // 최신 저장 일기 목록을 가져온 뒤 현재 일기만 갱신
      const saved: Diary[] = JSON.parse(
        localStorage.getItem("myDiary") || "[]"
      );

      const updated = saved.map((item) =>
        String(item.id) === String(diary.id)
          ? {
              ...item,
              analysisResult: result,
              analyzedAt: new Date().toISOString(),
            }
          : item
      );

      localStorage.setItem("myDiary", JSON.stringify(updated));

      const updatedDiary = updated.find(
        (item) => String(item.id) === String(diary.id)
      );

      if (updatedDiary) {
        setDiary(updatedDiary);
        setAnalysisResult(updatedDiary.analysisResult || "");
      }

      alert("일기 분석 결과를 저장했습니다!");
    } catch (error) {
      console.error("일기 분석 실패:", error);
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
          <p className="text-gray-500">일기를 찾을 수 없습니다.</p>
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
        {isAnalyzing
          ? "🧠 일기 분석 중..."
          : analysisResult
            ? "🔄 다시 분석하기"
            : "🧠 분석하기"}
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

          {diary.analyzedAt && (
            <p className="mt-4 text-xs text-gray-400">
              마지막 분석:{" "}
              {new Date(diary.analyzedAt).toLocaleString("ko-KR")}
            </p>
          )}
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
