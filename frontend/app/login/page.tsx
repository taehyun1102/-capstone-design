
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

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
      const res = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "아이디 또는 비밀번호가 올바르지 않습니다."
        );
        return;
      }

      // 서버에서 발급한 인증 토큰 확인
      if (!data.token) {
        console.error("로그인 응답에 token이 없습니다:", data);

        alert(
          "인증 토큰을 받지 못했습니다. 서버 로그인 API를 확인해주세요."
        );
        return;
      }

      // 로그인 정보 저장
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name || "");
      localStorage.setItem("username", data.username || "");

      alert("로그인 성공!");

      router.push("/input");
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <p className="mb-2 text-center text-sm font-semibold text-blue-600">
          AI 기반 하루 흐름 분석 시스템
        </p>

        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          로그인
        </h1>

        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
          required
        />

        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 pr-16 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700"
          >
            {showPassword ? "숨김" : "보기"}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-500">
            아직 계정이 없나요?{" "}
            <span
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={() => router.push("/signup")}
            >
              회원가입
            </span>

            <span className="mx-2 text-gray-300">|</span>

            <span
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={() => router.push("/forgot-password")}
            >
              비밀번호 찾기
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}
