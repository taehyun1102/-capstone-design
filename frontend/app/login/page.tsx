
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "아이디 또는 비밀번호가 올바르지 않습니다."
        );
        return;
      }

      if (!data.token) {
        console.error("로그인 응답에 token이 없습니다:", data);

        alert(
          "인증 토큰을 받지 못했습니다. 서버 로그인 API를 확인해주세요."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name || "");
      localStorage.setItem("username", data.username || "");

      
     alert("로그인 성공!");

     router.push("/garden");

    } catch (error) {
      console.error("로그인 오류:", error);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#ff78a8] via-[#bd35df] to-[#8125f5] px-4 py-10">

      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -left-12 top-[22%] h-48 w-48 rounded-full bg-gradient-to-br from-[#ffb66f] via-[#f45cba] to-[#8125ed] opacity-90 blur-[1px]" />

      <div className="pointer-events-none absolute -right-12 bottom-[12%] h-52 w-52 rounded-full bg-gradient-to-br from-[#ffa3d1] via-[#d64de4] to-[#7929e9] opacity-90 blur-[1px]" />

      <div className="pointer-events-none absolute right-[15%] top-[5%] h-36 w-36 rounded-full bg-white/10 blur-3xl" />

      {/* 로그인 카드 */}
      <section className="relative z-10 w-full max-w-[410px] overflow-hidden rounded-[32px] border border-white/70 bg-white/45 px-7 py-8 shadow-[0_25px_70px_rgba(74,20,100,0.25)] backdrop-blur-2xl sm:px-10 sm:py-9">

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />

        <div className="relative z-10">

          {/* 브랜드 로고 */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8d7b] via-[#ec4ebc] to-[#9343ef] shadow-lg shadow-purple-400/30">

              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path
                  d="M24 39S6 28 6 17C6 8 18 5 24 15C30 5 42 8 42 17C42 28 24 39 24 39Z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 24H17L21 18L25 29L29 22L32 24H39"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-[30px] font-extrabold tracking-tight text-[#49236d]">
              마음의 하루
            </h1>

            <p className="mt-1 text-sm font-medium text-[#73527f]">
              AI 기반 하루 흐름 분석 시스템
            </p>
          </div>

          {/* 서비스 특징 아이콘 */}
          <div className="mb-6 flex justify-center gap-4">

            {/* 달력 */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-[#9638ed]">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M7 3V7M17 3V7M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01" strokeLinecap="round" />
              </svg>
            </div>

            {/* 통계 */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-[#f28b50]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <rect x="3" y="12" width="4" height="9" rx="1" />
                <rect x="10" y="7" width="4" height="14" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
              </svg>
            </div>

            {/* 감정 */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-[#8838f0]">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3C7.5 3 4 6.5 4 11C4 13.5 5.2 15.5 7 17V21L12 18.5C16.5 18.5 20 15 20 11C20 6.5 16.5 3 12 3Z" strokeLinejoin="round" />
                <path d="M9 10H9.01M15 10H15.01" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* 환영 문구 */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-extrabold text-[#482365] sm:text-2xl">
              다시 만나서{" "}
              <span className="text-[#ed48a9]">반가워요!</span>
            </h2>

            <p className="mt-2 text-sm text-[#70517e]">
              로그인하고 오늘의 마음과 하루를 분석해보세요.
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-3">

            {/* 아이디 */}
            <div className="flex h-11 items-center rounded-xl border border-white/90 bg-white/40 px-4 shadow-sm transition focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-purple-300/60">

              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-[#795a91]" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21V19C4 15.7 7.1 13 12 13C16.9 13 20 15.7 20 19V21H4Z" strokeLinejoin="round" />
              </svg>

              <input
                type="text"
                placeholder="아이디를 입력해주세요."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="h-full w-full bg-transparent px-3 text-sm text-[#49236d] outline-none placeholder:text-[#886e99]"
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex h-11 items-center rounded-xl border border-white/90 bg-white/40 px-4 shadow-sm transition focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-purple-300/60">

              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-[#795a91]" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7A4 4 0 0 1 16 7V10M12 14V17" strokeLinecap="round" />
              </svg>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="h-full min-w-0 w-full bg-transparent px-3 text-sm text-[#49236d] outline-none placeholder:text-[#886e99]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="shrink-0 text-[#795a91] transition hover:text-[#49236d]"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3L21 21M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.2A10.8 10.8 0 0 1 12 5C17 5 20.5 9 22 12C21.4 13.2 20.5 14.5 19.2 15.6M6.2 6.2C4.1 7.4 2.7 9.5 2 12C3.5 15 7 19 12 19C13.3 19 14.5 18.7 15.6 18.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12S5.5 5 12 5S22 12 22 12S18.5 19 12 19S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ff995f] via-[#eb40ad] to-[#9229f5] text-base font-bold text-white shadow-lg shadow-purple-400/30 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "로그인 중..." : "로그인"}
              {!isLoading && <span className="text-xl">→</span>}
            </button>
          </form>

          {/* 회원가입 및 비밀번호 찾기 */}
          <div className="mt-5 flex items-center justify-center gap-6 text-sm font-bold">

            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-[#642c91] transition hover:text-[#a52fce]"
            >
              회원가입
            </button>

            <span className="h-4 w-px bg-[#bba0ca]" />

            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-[#642c91] transition hover:text-[#a52fce]"
            >
              비밀번호 찾기
            </button>
          </div>

          {/* 하단 안내 */}
          <p className="mt-7 text-center text-xs leading-relaxed text-[#896f98]">
            당신의 하루와 마음을 소중하게 기록해보세요.
          </p>

        </div>
      </section>
    </main>
  );
}

