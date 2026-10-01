"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("myDiary") || "[]");

    setDiaries(saved);
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-5">
    <h1 className="text-3xl font-bold mb-6">
      📚{" "}
      <span className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent">
        나만의 일기장
      </span>
    </h1>

    {diaries.length === 0 ? (
      <div className="bg-white rounded-3xl shadow p-8 text-center">
        <p className="text-5xl mb-3">🥲</p>
        <p className="text-gray-500">
          아직 저장된 일기가 없습니다.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {diaries.map((item) => (
          <div
            key={item.id}
            className="w-full bg-white rounded-3xl shadow p-5 flex items-center justify-between"
          >
            <button
              onClick={() =>
                router.push(`/diary/detail?id=${item.id}`)
              }
              className="flex-1 text-left hover:scale-[1.01] transition"
            >
              <p className="text-xl font-bold text-purple-700 mb-2">
                📖 {item.title}
              </p>

              <p className="text-sm text-black">
                📅 {item.date}
              </p>
            </button>

            <button
              onClick={() => {
                const confirmed = confirm("이 일기를 삭제할까요?");

                if (!confirmed) return;

                const updated = diaries.filter(
                  (diary) => diary.id !== item.id
                );

                localStorage.setItem(
                  "myDiary",
                  JSON.stringify(updated)
                );

                setDiaries(updated);
              }}
              className="ml-3 px-3 py-2 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    )}

    <button
      onClick={() => router.back()}
      className="w-full mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white py-3 rounded-2xl font-semibold shadow-lg"
    >
      <span className="text-black">←</span>{" "}
      <span className="text-white">이전</span>
    </button>
  </div>
);
}