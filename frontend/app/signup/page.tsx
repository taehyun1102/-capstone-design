"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // TODO: 백엔드 회원가입 API 연결
    console.log("회원가입:", { email, password });

    // 임시로 로그인 페이지 이동
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-black">회원가입</h1>

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
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 transition"
        >
          회원가입
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <span
            className="cursor-pointer text-blue-500"
            onClick={() => router.push("/login")}
          >
            로그인
          </span>
        </p>
      </form>
    </div>
  );
}