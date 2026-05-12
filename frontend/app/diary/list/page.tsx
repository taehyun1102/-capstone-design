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
        📚 나만의 일기장
      </h1>

      {diaries.length === 0 ? (
        <div className="bg-white rounded-3xl shadow p-8 text-center">

          <p className="text-5xl mb-3">
            🥲
          </p>

          <p className="text-gray-500">
            아직 저장된 일기가 없습니다.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {diaries.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow p-5"
            >

              <p className="text-xs text-gray-400 mb-2">
                {item.date}
              </p>

              <p className="whitespace-pre-wrap text-sm leading-7">
                {item.content}
              </p>

            </div>
          ))}

        </div>
      )}

      <button
        onClick={() => router.back()}
        className="w-full mt-6 bg-gray-200 py-3 rounded-2xl"
      >
        ← 이전
      </button>

    </div>
  );
}