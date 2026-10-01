"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiaryWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const router = useRouter();

  const today = new Date().toLocaleDateString();

  const handleSave = () => {
    if (!title.trim()) {
      alert("일기 제목을 입력해주세요!");
      return;
    }

    if (!content.trim()) {
      alert("일기 내용을 입력해주세요!");
      return;
    }

    const oldData =
      JSON.parse(localStorage.getItem("myDiary") || "[]");

    const newDiary = {
      id: Date.now(),
      title,
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
      ✍️{" "}
      <span className="bg-gradient-to-r from-blue-700 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
        오늘의 일기
      </span>
    </h1>

      <p className="text-sm text-black mb-5">
        📅 {today}
       </p>

      <p className="font-semibold text-gray-800 mb-2">
        제목 :
      </p>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="일기 제목을 입력하세요..."
        className="w-full p-4 mb-5 rounded-2xl border bg-white text-gray-900 placeholder:text-gray-500 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      <p className="font-semibold text-gray-800 mb-2">
        내용 :
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 하루 있었던 일을 자유롭게 적어보세요..."
        className="w-full h-80 p-5 rounded-3xl border bg-white text-gray-900 placeholder:text-gray-500 shadow resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      <button
        onClick={handleSave}
        className="w-full mt-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold shadow-lg"
      >
        저장하기
      </button>

      <button
        onClick={() => router.back()}
        className="w-full mt-3 bg-gray-200 text-black py-3 rounded-2xl"
      >
        ← 이전
      </button>
    </div>
  );
}