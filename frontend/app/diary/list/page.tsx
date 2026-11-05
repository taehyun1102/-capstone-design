
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-5">
      <h1 className="text-3xl font-bold mb-6">
        📚{" "}
        <span className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          나만의 일기장
        </span>
      </h1>

      {isLoading ? (
        <div className="bg-white rounded-3xl shadow p-8 text-center">
          <p className="text-gray-500">
            일기를 불러오는 중입니다...
          </p>
        </div>
      ) : diaries.length === 0 ? (
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
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="ml-3 px-3 py-2 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === item.id ? "삭제 중..." : "삭제"}
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
