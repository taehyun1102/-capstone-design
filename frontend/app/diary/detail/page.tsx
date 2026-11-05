
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Diary = {
  id: string;
  title: string;
  date: string;
  content: string;
  analysisResult?: string;
  analyzedAt?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

export default function DiaryDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // MongoDB에서 해당 일기 조회
  useEffect(() => {
    const fetchDiary = async () => {
      const id = searchParams.get("id");

      if (!id) {
        setDiary(null);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/diary/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "일기를 불러오지 못했습니다."
          );
        }

        const foundDiary = data.diary;

        setDiary(foundDiary || null);
        setAnalysisResult(foundDiary?.analysisResult || "");
      } catch (error) {
        console.error("일기 불러오기 실패:", error);

        setDiary(null);
        setAnalysisResult("");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "일기를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiary();
  }, [searchParams, router]);

  // AI 감정 분석
  const handleAnalyze = async () => {
    if (!diary || isAnalyzing) return;

    setErrorMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/diary/${diary.id}/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

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
          "분석 결과가 올바른 형식으로 전달되지 않았습니다."
        );
      }

      // 서버에서 저장된 일기 정보 갱신
      setDiary(data.diary);
      setAnalysisResult(result);

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

  // 일기 불러오는 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <p className="text-gray-500">
            일기를 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  // 일기를 찾을 수 없는 경우
  if (!diary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <p className="text-gray-500">
            {errorMessage || "일기를 찾을 수 없습니다."}
          </p>
        </div>

        <button
          onClick={() => router.push("/diary")}
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
  onClick={() => router.push("/diary")}
  className="mt-3 w-full rounded-2xl bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 py-3 font-semibold shadow-md"
>
  <span className="text-purple-800">
    ← 일기장으로 돌아가기
  </span>
</button>
    </div>
  );
}
