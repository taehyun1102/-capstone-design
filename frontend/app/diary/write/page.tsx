"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiaryWritePage() {
  const [content, setContent] = useState("");
  const router = useRouter();

  const today = new Date().toLocaleDateString();

  const handleSave = () => {
    if (!content.trim()) {
      alert("일기를 입력해주세요!");
      return;
    }

    const oldData =
      JSON.parse(localStorage.getItem("myDiary") || "[]");

    const newDiary = {
      id: Date.now(),
      date: today,
      content,
    };

    oldData.unshift(newDiary);

    localStorage.setItem(
      "myDiary",
      JSON.stringify(oldData)
    );

    alert("저장 완료!");
    router.push("/diary/list");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 p-5">

      <h1 className="text-2xl font-bold mb-2">
        ✍️ 오늘의 일기
      </h1>

      <p className="text-sm text-gray-500 mb-5">
        {today}
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 하루 있었던 일을 자유롭게 적어보세요..."
        className="w-full h-80 p-5 rounded-3xl border bg-white shadow resize-none focus:outline-none"
      />

      <button
        onClick={handleSave}
        className="w-full mt-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold shadow-lg"
      >
        저장하기
      </button>

      <button
        onClick={() => router.back()}
        className="w-full mt-3 bg-gray-200 py-3 rounded-2xl"
      >
        ← 이전
      </button>

    </div>
  );
}