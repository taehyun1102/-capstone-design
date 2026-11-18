
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

export default function DiaryWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const today = new Date().toLocaleDateString();

  const handleSave = async () => {
    if (!title.trim()) {
      alert("일기 제목을 입력해주세요!");
      return;
    }

    if (!content.trim()) {
      alert("일기 내용을 입력해주세요!");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/api/diary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          date: today,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "일기 저장에 실패했습니다.");
      }

      alert("저장 완료!");
      router.push("/diary/list");
    } catch (error) {
      console.error("일기 저장 오류:", error);

      alert(
        error instanceof Error
          ? error.message
          : "일기 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
  className="relative min-h-screen overflow-hidden bg-[#080d20] bg-cover bg-center bg-fixed px-5 py-10 text-white"
  style={{
    backgroundImage:
      "linear-gradient(rgba(5, 8, 25, 0.35), rgba(5, 8, 25, 0.5)), url('/images/diary-write-bg.png')",
  }}
>
      {/* 달빛 배경 효과 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="absolute right-[15%] top-20 h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_15px_4px_rgba(196,181,253,0.5)]" />
        <div className="absolute left-[12%] top-[35%] h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_3px_rgba(165,243,252,0.5)]" />
        <div className="absolute right-[20%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-pink-200 shadow-[0_0_12px_3px_rgba(251,207,232,0.5)]" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl">
        {/* 상단 제목 */}
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm text-violet-200">
            <span>☾</span>
            <span>MOONLIGHT DIARY</span>
            <span>✦</span>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-wide sm:text-4xl">
            <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              오늘의 일기
            </span>
          </h1>

          <p className="text-sm text-slate-400">
            달빛 아래, 오늘의 마음을 천천히 기록해 보세요.
          </p>

          <p className="mt-4 text-sm text-violet-200/80">
            ☾ {today}
          </p>
        </header>

        {/* 일기 작성 카드 */}
        <section className="rounded-3xl border border-violet-200/15 bg-white/[0.06] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          {/* 제목 입력 */}
          <div className="mb-7">
            <label
              htmlFor="diary-title"
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-100"
            >
              <span className="text-lg">✧</span>
              일기 제목
            </label>

            <input
              id="diary-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="오늘의 하루를 한마디로 표현한다면..."
              className="w-full rounded-2xl border border-violet-200/20 bg-[#10172d]/80 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/70 focus:ring-2 focus:ring-violet-400/20"
              disabled={isSaving}
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <label
              htmlFor="diary-content"
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-100"
            >
              <span className="text-lg">✦</span>
              오늘의 이야기
            </label>

            <textarea
              id="diary-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 하루 있었던 일, 느꼈던 감정, 마음속에 남아 있는 생각들을 자유롭게 적어보세요..."
              className="min-h-[360px] w-full resize-y rounded-2xl border border-violet-200/20 bg-[#10172d]/80 p-5 leading-8 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/70 focus:ring-2 focus:ring-violet-400/20"
              disabled={isSaving}
            />
          </div>

          {/* 하단 안내 */}
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>✧ 당신의 소중한 하루를 기록하세요.</span>
            <span>{content.length}자</span>
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-4 font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition duration-300 hover:brightness-110 hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "✧ 일기 저장하기"}
          </button>

          {/* 이전 버튼 */}
          <button
            onClick={() => router.back()}
            disabled={isSaving}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            ← 이전 화면으로
          </button>
        </section>

        <p className="mt-6 text-center text-xs tracking-wider text-slate-600">
          UNDER THE MOONLIGHT · YOUR STORY MATTERS
        </p>
      </div>
    </main>
  );
}

