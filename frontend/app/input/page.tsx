"use client";

import { useState } from "react";

export default function InputPage() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("공부");

  const handleSubmit = () => {
    console.log({
      text,
      category,
    });
    alert("저장 완료!");
  };

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">오늘 활동 기록</h1>

      {/* 텍스트 입력 */}
      <textarea
        className="border p-3 rounded-lg h-32"
        placeholder="오늘 무엇을 했나요?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* 카테고리 선택 */}
      <select
        className="border p-3 rounded-lg text-black bg-white"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="공부">공부</option>
        <option value="유튜브">유튜브</option>
        <option value="게임">게임</option>
        <option value="SNS">SNS</option>
        <option value="기타">기타</option>
      </select>

      {/* 버튼 */}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
      >
        기록하기
      </button>
    </div>
  );
}