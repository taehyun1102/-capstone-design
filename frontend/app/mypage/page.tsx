
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

export default function MyPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
    setUsername(localStorage.getItem("username") || "");
  }, []);

  // 로그인 정보 전체 삭제
  const clearLoginInfo = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("username");
  };

  // 로그아웃
  const handleLogout = () => {
    clearLoginInfo();

    alert("로그아웃되었습니다.");
    router.push("/login");
  };

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    const confirmed = confirm(
      "정말 회원탈퇴하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "회원탈퇴에 실패했습니다.");
        return;
      }

      clearLoginInfo();

      alert("회원탈퇴가 완료되었습니다.");
      router.push("/login");
    } catch (err) {
      console.error("회원탈퇴 오류:", err);
      alert("회원탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          🌟 마이페이지
        </h1>

        <div className="mb-8 rounded-2xl border border-gray-200 p-5">
          <h2 className="mb-4 text-xl font-semibold text-black">
            회원 정보
          </h2>

          <p className="mb-2 text-black">
            <strong>이름:</strong> {userName}
          </p>

          <p className="text-black">
            <strong>아이디:</strong> {username}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/input")}
            className="rounded-2xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
          >
            메인으로 이동
          </button>

          <button
            onClick={handleLogout}
            className="rounded-2xl bg-gray-600 py-4 font-semibold text-white hover:bg-gray-700"
          >
            로그아웃
          </button>

          <button
            onClick={handleDeleteAccount}
            className="rounded-2xl bg-red-500 py-4 font-semibold text-white hover:bg-red-600"
          >
            🤔 회원탈퇴
          </button>
        </div>
      </div>
    </main>
  );
}
