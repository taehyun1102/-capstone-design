
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
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d20] bg-cover bg-center bg-fixed px-5 py-12 text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5, 8, 25, 0.25), rgba(5, 8, 25, 0.45)), url('/images/mypage-garden-bg.png')",
      }}
    >
      {/* 배경 어둡게 처리 */}
      <div className="pointer-events-none absolute inset-0 bg-[#080d20]/10" />

      {/* 외부 장식 프레임 */}
      <div className="relative z-10 w-full max-w-[600px] p-[1px]">

        {/* 금빛 테두리 */}
        <div className="relative rounded-[2rem] border border-[#e9c9ff]/70 bg-gradient-to-b from-[#f5d9ff]/10 via-[#b99aff]/10 to-[#f5d9ff]/10 p-[7px] shadow-[0_0_45px_rgba(167,139,250,0.22)]">

          {/* 내부 패널 */}
          <div className="relative overflow-hidden rounded-[1.7rem] border border-violet-200/25 bg-[#171638]/85 px-6 py-7 shadow-inner backdrop-blur-2xl sm:px-9 sm:py-8">

            {/* 상단 달 장식 이미지 */}
<header className="mb-7 text-center">

  <div className="mb-4 flex justify-center">
    <img
  src="/images/mypage-moon-logo.png"
  alt="달빛 초승달 장식"
  className="h-auto w-[360px] max-w-full object-contain"
/>
  </div>

  <h1 className="text-4xl font-bold tracking-wide text-white">
    마이페이지
  </h1>

  <p className="mt-3 text-sm tracking-[0.25em] text-violet-200/80">
    MY PAGE
  </p>

</header>

            {/* 별빛 구분 장식 */}
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-200/50" />
              <span className="text-xl text-[#f5d9ff]">✦</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-200/50" />
            </div>

            {/* 회원 정보 카드 */}
            <section className="mb-7 rounded-[1.3rem] border border-violet-200/35 bg-gradient-to-br from-violet-200/[0.13] to-indigo-300/[0.08] px-5 py-3 shadow-[0_0_25px_rgba(167,139,250,0.08)] sm:px-6">

              {/* 아이디 */}
              <div className="flex items-center justify-between gap-3 border-b border-violet-100/20 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-violet-200">♙</span>
                  <span className="text-base font-medium text-violet-100">
                    아이디
                  </span>
                </div>

                <span className="break-all text-right font-medium text-white">
                  {username || "정보 없음"}
                </span>
              </div>

              {/* 이름 */}
              <div className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-violet-200">♙</span>
                  <span className="text-base font-medium text-violet-100">
                    이름
                  </span>
                </div>

                <span className="text-right font-medium text-white">
                  {userName || "정보 없음"}
                </span>
              </div>

            </section>

            {/* 가운데 별빛 장식 */}
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-violet-200/30" />
              <span className="text-lg text-violet-200">✧</span>
              <span className="h-px w-16 bg-violet-200/30" />
            </div>

            {/* 로그아웃 */}
            <div className="flex flex-col gap-5">

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-4 rounded-full border border-[#c4b5fd]/60 bg-gradient-to-r from-indigo-300/[0.08] to-violet-300/[0.12] py-3 text-lg font-semibold text-violet-100 shadow-[0_0_18px_rgba(167,139,250,0.10)] transition duration-300 hover:border-violet-200 hover:bg-violet-300/20 hover:shadow-[0_0_25px_rgba(196,181,253,0.25)]"
              >
                <span className="text-2xl">⇥</span>
                로그아웃
              </button>

              {/* 회원탈퇴 */}
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex w-full items-center justify-center gap-4 rounded-full border border-rose-300/60 bg-rose-300/[0.06] py-3 text-lg font-semibold text-rose-200 shadow-[0_0_18px_rgba(251,113,133,0.08)] transition duration-300 hover:border-rose-200 hover:bg-rose-300/15 hover:shadow-[0_0_25px_rgba(251,113,133,0.2)]"
              >
                <span className="text-2xl">♙</span>
                회원탈퇴
              </button>

              {/* 정원으로 이동 */}
              <button
                type="button"
                onClick={() => router.push("/garden")}
                className="flex w-full items-center justify-center gap-4 rounded-full border border-violet-200/80 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 py-3 text-lg font-bold text-white shadow-[0_0_28px_rgba(167,139,250,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(196,181,253,0.55)]"
              >
                <span className="text-2xl">⌂</span>
                정원으로 이동
              </button>

            </div>

            {/* 하단 장식 */}
            <div className="mt-9 flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-200/40" />
              <span className="text-xl text-[#e9d5ff]">✦</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-200/40" />
            </div>

            <footer className="mt-6 text-center">
              <p className="text-xs tracking-[0.2em] text-violet-200/55">
                A LITTLE GARDEN WHERE YOUR HEART RESTS
              </p>
            </footer>

          </div>
        </div>
      </div>
    </main>
  );
}


