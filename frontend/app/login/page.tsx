"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
  "https://capstone-design-ip8n.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "이메일 또는 비밀번호가 올바르지 않습니다."
        );
        return;
      }

      localStorage.setItem(
        "userId",
        data.userId
      );

      localStorage.setItem(
        "userEmail",
        email
      );

      localStorage.setItem(
        "userName",
        data.name || ""
      );

      alert("로그인 성공!");

      router.push("/input");
    } catch (error) {
      console.error(error);
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
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
          required
        />

        <div className="relative mb-5">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="비밀번호"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 p-3 pr-16 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700"
          >
            {showPassword
              ? "숨김"
              : "보기"}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {isLoading
            ? "로그인 중..."
            : "로그인"}
        </button>

        <div className="mt-4 text-center text-sm">

          <p className="text-gray-500">
            아직 계정이 없나요?{" "}
            <span
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={() =>
                router.push("/signup")
              }
            >
              회원가입
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}