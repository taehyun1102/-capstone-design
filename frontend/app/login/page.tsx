"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: 나중에 백엔드 API 연결
    console.log("로그인 시도:", { email, password });

    // 임시 이동 (로그인 성공 가정)
    router.push("/input");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-black">로그인</h1>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 text-white hover:bg-gray-800"
        >
          로그인
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          아직 계정이 없나요?{" "}
          <span
            className="cursor-pointer text-blue-500"
            onClick={() => router.push("/signup")}
          >
            회원가입
          </span>
        </p>
      </form>
    </div>
  );
}