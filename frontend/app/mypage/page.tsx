"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    alert("로그아웃되었습니다.");
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const confirmed = confirm(
      "정말 회원탈퇴하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/delete-account",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");

      alert("회원탈퇴가 완료되었습니다.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("회원탈퇴 실패");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">

        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          마이페이지
        </h1>

        <div className="mb-8 rounded-2xl border border-gray-200 p-5">
          <h2 className="mb-4 text-xl font-semibold text-black">
            회원 정보
          </h2>

          <p className="mb-2 text-black">
            <strong>이름:</strong> {userName}
          </p>

          <p className="text-black">
            <strong>이메일:</strong> {userEmail}
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
            회원탈퇴
          </button>

        </div>
      </div>
    </main>
  );
}