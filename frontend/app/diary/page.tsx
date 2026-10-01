"use client";

import Link from "next/link";

export default function DiaryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-6">

      <h1 className="text-3xl font-bold mb-2 text-black">
        📖 나만의 일기
      </h1>

      <p className="text-black mb-8">
        오늘 하루를 기록해보세요
      </p>

      <div className="space-y-4">

        <Link href="/diary/write">
          <button className="w-full bg-white shadow-xl rounded-3xl p-6 text-left hover:scale-[1.02] transition">

            <p className="text-xl font-bold mb-1 text-black">
              ✍️ 일기 쓰기
            </p>

            <p className="text-sm text-black">
              오늘 하루 있었던 일을 기록하세요
            </p>

          </button>
        </Link>

        <Link href="/diary/list">
          <button className="w-full bg-white shadow-xl rounded-3xl p-6 text-left hover:scale-[1.02] transition">

            <p className="text-xl font-bold mb-1 text-black">
              📚 나만의 일기장
            </p>

            <p className="text-sm text-black">
              저장된 일기를 날짜별로 확인하세요
            </p>

          </button>
        </Link>

      </div>

      <Link href="/input">
        <button className="w-full mt-8 bg-gray-200 py-3 rounded-2xl text-black">
          ← 이전
        </button>
      </Link>

    </div>
  );
}