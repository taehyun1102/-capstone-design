
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Diary = {
  id: string;
  title: string;
  date: string;
  content: string;
  analysisResult?: string;
  analyzedAt?: string | null;
};

const API_BASE_URL = "";

function DiaryDetailContent() {
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
      <main className="relative min-h-screen overflow-hidden bg-[#080d20] px-5 py-10 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-violet-200/15 bg-white/[0.06] p-10 text-center shadow-xl backdrop-blur-xl">
          <p className="mb-4 text-4xl">☾</p>
          <p className="text-slate-300">
            일기를 불러오는 중입니다...
          </p>
        </div>
      </main>
    );
  }

  // 일기를 찾을 수 없는 경우
  if (!diary) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#080d20] px-5 py-10 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl rounded-3xl border border-violet-200/15 bg-white/[0.06] p-8 text-center shadow-xl backdrop-blur-xl">
          <p className="mb-4 text-4xl">🌙</p>
          <p className="leading-7 text-slate-300">
            {errorMessage || "일기를 찾을 수 없습니다."}
          </p>
        </div>

        <button
  type="button"
  onClick={() => router.back()}
  className="mt-8 w-full rounded-2xl border border-violet-300/20 bg-white/[0.06] py-4 font-semibold text-violet-200 transition hover:bg-violet-400/10"
>
  ← 이전으로
</button>
      </main>
    );
  }

  return (
    
<main
  className="relative min-h-screen overflow-hidden bg-[#080d20] bg-cover bg-center bg-fixed px-5 py-10 text-white"
  style={{
    backgroundImage:
      "linear-gradient(rgba(5, 8, 25, 0.42), rgba(5, 8, 25, 0.52)), url('/images/diary-library-bg.png')",
  }}
>
  

      <div className="relative mx-auto w-full max-w-4xl">
        {/* 상단 제목 */}
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm text-violet-200">
            <span>☾</span>
            <span>MOONLIGHT MEMORY</span>
            <span>✦</span>
          </div>

          <h1 className="break-words text-3xl font-bold tracking-wide sm:text-4xl">
            <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              {diary.title}
            </span>
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            ☾ {diary.date}
          </p>
        </header>

        {/* 일기 본문 */}
        <section className="rounded-3xl border border-violet-200/15 bg-white/[0.06] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-400/10 text-xl text-violet-200">
              ✧
            </span>

            <div>
              <h2 className="font-semibold text-violet-100">
                오늘의 이야기
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                MY PERSONAL DIARY
              </p>
            </div>
          </div>

          <p className="whitespace-pre-wrap break-words leading-8 text-slate-200">
            {diary.content}
          </p>
        </section>

        {/* AI 분석 버튼 */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-4 font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition duration-300 hover:brightness-110 hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing
            ? "🧠 일기 분석 중..."
            : analysisResult
              ? "🔄 다시 분석하기"
              : "🧠 AI 감정 분석하기"}
        </button>

        {/* 오류 메시지 */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm leading-7 text-rose-200"
          >
            {errorMessage}
          </div>
        )}

        {/* AI 분석 결과 */}
        {analysisResult && (
          <section className="mt-6 rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-400/[0.10] via-white/[0.05] to-cyan-400/[0.07] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-violet-200/15 pb-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-200/20 bg-violet-400/10 text-2xl">
                🌙
              </span>

              <div>
                <h2 className="text-lg font-bold text-violet-100">
                  하루 마무리 감정 분석
                </h2>
                <p className="mt-1 text-xs tracking-wider text-slate-500">
                  AI CLOSING MOOD ANALYSIS
                </p>
              </div>
            </div>

            <p className="whitespace-pre-wrap break-words leading-8 text-slate-200">
              {analysisResult}
            </p>

            {diary.analyzedAt && (
              <p className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-500">
                마지막 분석:{" "}
                {new Date(diary.analyzedAt).toLocaleString("ko-KR")}
              </p>
            )}
          </section>
        )}

        {/* 이전 페이지로 돌아가기 */}
<button
  type="button"
  onClick={() => router.back()}
  className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
>
  ← 이전으로
</button>

        <p className="mt-6 text-center text-xs tracking-wider text-slate-600">
          UNDER THE MOONLIGHT · YOUR STORY MATTERS
        </p>
      </div>
    </main>
  );
}

export default function DiaryDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen overflow-hidden bg-[#080d20] px-5 py-10 text-white">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />

          <div className="relative mx-auto max-w-4xl rounded-3xl border border-violet-200/15 bg-white/[0.06] p-10 text-center shadow-xl backdrop-blur-xl">
            <p className="mb-4 text-4xl">☾</p>
            <p className="text-slate-300">
              일기를 불러오는 중입니다...
            </p>
          </div>
        </main>
      }
    >
      <DiaryDetailContent />
    </Suspense>
  );
}
