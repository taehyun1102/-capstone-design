"use client";

import { useEffect, useState } from "react";

export default function ResultPage() {
  const [data, setData] = useState<any>(null);
  const [showAdvice, setShowAdvice] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("analysisPayload");
      if (stored) setData(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 로딩 화면
  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        분석 중...
      </div>
    );
  }

  const patterns = data?.aiDetectedPatterns || [];
  const user = data?.userInput || {};

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-50 min-h-screen">

      {/* 제목 */}
      <h1 className="text-lg font-bold mb-4">
        AI 분석 결과 리포트
      </h1>

      {/* 사용자 요약 */}
      <div className="bg-white rounded-lg p-3 shadow mb-4 text-sm">
        <p>활동: {user.mainActivity}</p>
        <p>기분: {user.dayMood}</p>
        <p>집중 시간: {user.focusTime}</p>
      </div>

      {/* 📊 그래프 */}
      <div className="bg-white p-3 rounded-lg shadow mb-4">
        <p className="text-sm font-semibold mb-2">패턴 분석 그래프</p>

        <div className="space-y-2">
          {patterns.map((p: any) => (
            <div key={p.id}>
              <div className="flex justify-between text-xs">
                <span>{p.title}</span>
                <span>{p.confidence}%</span>
              </div>

              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${p.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔍 패턴 카드 */}
      <div className="space-y-3">
        {patterns.map((p: any) => (
          <div key={p.id} className="bg-white p-3 rounded-lg shadow">

            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-500">{p.category}</span>
              <span>{p.confidence}%</span>
            </div>

            <p className="font-semibold text-sm">{p.title}</p>
            <p className="text-xs text-gray-500">{p.detail}</p>

          </div>
        ))}
      </div>

      {/* 🔥 AI 해석 */}
      <div className="mt-5 bg-blue-600 text-white p-4 rounded-lg">
        <p className="text-sm font-semibold mb-1">AI 종합 해석</p>
        <p className="text-xs">
          오늘은 특정 시간대 집중 패턴과 콘텐츠 소비가 함께 나타났습니다.
        </p>
      </div>

      {/* 🔥 버튼 */}
      <button
        onClick={() => setShowAdvice(!showAdvice)}
        className="w-full mt-5 bg-blue-700 text-white py-2 rounded-lg"
      >
        행동 추천 보기
      </button>

      {/* 🔥 추천 결과 */}
      {showAdvice && (
        <div className="mt-4 space-y-3">

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold text-sm">📉 집중력 개선</p>
            <p className="text-xs text-gray-600 mt-1">
              25분 집중 + 5분 휴식 (포모도로 기법)을 활용해보세요.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold text-sm">🧠 스트레스 관리</p>
            <p className="text-xs text-gray-600 mt-1">
              가벼운 산책이나 스트레칭을 통해 긴장을 완화하세요.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold text-sm">📵 디지털 사용 조절</p>
            <p className="text-xs text-gray-600 mt-1">
              특정 시간대에는 SNS 사용을 제한하는 것이 도움이 됩니다.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}