
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "";

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  // MongoDB에서 로그인한 사용자의 일기 목록 불러오기
  useEffect(() => {
    const fetchDiaries = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/diary`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "일기 목록을 불러오지 못했습니다."
          );
        }

        setDiaries(data.diaries || []);
      } catch (error) {
        console.error("일기 목록 조회 오류:", error);

        alert(
          error instanceof Error
            ? error.message
            : "일기 목록을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaries();
  }, [router]);

  // 일기 삭제
  const handleDelete = async (id: string) => {
    const confirmed = confirm("이 일기를 삭제할까요?");

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `${API_BASE_URL}/api/diary/${id}`,
        {
          method: "DELETE",
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
        throw new Error(data.message || "일기 삭제에 실패했습니다.");
      }

      setDiaries((prev) =>
        prev.filter((diary) => diary.id !== id)
      );

      alert("일기가 삭제되었습니다.");
    } catch (error) {
      console.error("일기 삭제 오류:", error);

      alert(
        error instanceof Error
          ? error.message
          : "일기 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    
<main
  className="relative min-h-screen overflow-hidden bg-[#080d20] bg-cover bg-center bg-fixed px-5 py-10 text-white"
  style={{
    backgroundImage:
      "linear-gradient(rgba(5, 8, 25, 0.38), rgba(5, 8, 25, 0.48)), url('/images/diary-library-bg.png')",
  }}
>

      <div className="relative mx-auto w-full max-w-4xl">
        {/* 페이지 제목 */}
        <header className="mb-9 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm text-violet-200">
            <span>☾</span>
            <span>MY MOONLIGHT OBSERVATORY</span>
            <span>✦</span>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-wide sm:text-4xl">
            <span className="bg-gradient-to-r from-violet-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              달빛 전망대
            </span>
          </h1>

          <p className="text-sm text-slate-300">
  달빛 아래에서 나만의 이야기를 기록하고, 소중한 순간들을 다시 만나보세요.
</p>
        </header>

        {/* 일기 목록 영역 */}
        {isLoading ? (
          <div className="rounded-3xl border border-violet-200/15 bg-white/[0.06] p-10 text-center shadow-xl backdrop-blur-xl">
            <p className="mb-4 text-4xl">☾</p>
            <p className="text-slate-300">
              일기를 불러오는 중입니다...
            </p>
            <p className="mt-2 text-xs text-slate-500">
              잠시만 기다려 주세요.
            </p>
          </div>
        ) : diaries.length === 0 ? (
          <div className="rounded-3xl border border-violet-200/15 bg-white/[0.06] px-6 py-14 text-center shadow-xl backdrop-blur-xl">
            <div className="mb-5 text-5xl">🌙</div>

            <h2 className="mb-3 text-xl font-semibold text-violet-100">
  아직 달빛 아래 기록된 이야기가 없어요.
</h2>

<p className="text-sm leading-7 text-slate-400">
  오늘의 마음과 소중한 순간들을 첫 일기로 남겨보세요.
</p>

            <button
              onClick={() => router.push("/diary/write")}
              className="mt-7 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3 font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:brightness-110"
            >
              ✧ 첫 일기 작성하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {diaries.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-3 rounded-3xl border border-violet-200/15 bg-white/[0.06] p-5 shadow-lg backdrop-blur-xl transition duration-300 hover:border-violet-300/40 hover:bg-white/[0.09] hover:shadow-[0_10px_35px_rgba(139,92,246,0.12)] sm:p-6"
              >
                {/* 일기 상세 페이지 이동 */}
                <button
                  onClick={() =>
                    router.push(`/diary/detail?id=${item.id}`)
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-400/10 text-xl text-violet-200">
                      ✧
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-violet-100 transition group-hover:text-pink-200 sm:text-xl">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        MY MOONLIGHT STORY
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400">
                    <span className="mr-2 text-violet-300">☾</span>
                    {item.date}
                  </p>
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="shrink-0 rounded-xl border border-rose-300/20 bg-rose-400/5 px-3 py-2 text-xs text-rose-200 transition hover:border-rose-300/40 hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                >
                  {deletingId === item.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 이전 버튼 */}
        <button
          onClick={() => router.back()}
          className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          ← 이전 화면으로
        </button>

        <p className="mt-6 text-center text-xs tracking-wider text-slate-600">
          UNDER THE MOONLIGHT · YOUR MEMORIES REMAIN
        </p>
      </div>
    </main>
  );
}

