"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DiaryDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [diary, setDiary] = useState<any>(null);

  useEffect(() => {
    const id = searchParams.get("id");

    if (!id) return;

    const saved =
      JSON.parse(localStorage.getItem("myDiary") || "[]");

    const foundDiary = saved.find(
      (item: any) => String(item.id) === String(id)
    );

    setDiary(foundDiary);
  }, [searchParams]);

  if (!diary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">
        <div className="bg-white rounded-3xl shadow p-8 text-center">
          <p className="text-gray-500">
            일기를 찾을 수 없습니다.
          </p>
        </div>

        <button
          onClick={() => router.push("/diary/list")}
          className="w-full mt-5 bg-gray-200 py-3 rounded-2xl"
        >
          ← 일기장으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">

      {/* 제목 */}
      <h1 className="text-2xl font-bold text-purple-700 mb-2">
        📖 {diary.title}
      </h1>

      {/* 날짜 */}
      <p className="text-sm text-gray-500 mb-6">
        {diary.date}
      </p>

      {/* 내용 */}
      <div className="bg-white rounded-3xl shadow p-6">
        <p className="whitespace-pre-wrap text-gray-900 leading-8">
          {diary.content}
        </p>
      </div>

      {/* 분석하기 */}
      <button
        onClick={() => {
          alert("AI 분석 기능은 백엔드 연결 후 사용할 수 있습니다.");
        }}
        className="w-full mt-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold shadow-lg"
      >
        🧠 분석하기
      </button>

      {/* 이전 */}
      <button
        onClick={() => router.push("/diary/list")}
        className="w-full mt-3 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 py-3 rounded-2xl font-semibold shadow-md"
      >
        <span className="text-purple-800">
          ← 일기장으로 돌아가기
        </span>
      </button>

    </div>
  );
}