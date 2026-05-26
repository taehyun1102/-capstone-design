"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  // 👤 이름 추가
  const [name, setName] = useState("");

  // 🆔 아이디
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<null | boolean>(null);

  // 📩 이메일
  const [email, setEmail] = useState("");

  // 🔐 비밀번호
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 📩 이메일 인증
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // 🆔 아이디 중복 체크
  const checkUsername = async () => {
    const res = await fetch("http://localhost:3001/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    setIsUsernameAvailable(data.available);
  };

  // 📩 인증 코드 전송
  const sendCode = async () => {
    await fetch("http://localhost:3001/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    alert("인증 코드가 이메일로 전송되었습니다.");
  };

  // 📩 인증 확인
  const verifyCode = async () => {
    const res = await fetch("http://localhost:3001/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (data.success) {
      setIsVerified(true);
      alert("이메일 인증 완료!");
    } else {
      alert("인증 실패");
    }
  };

  // 🧾 회원가입
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!username) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (isUsernameAvailable === false) {
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    if (!isVerified) {
      alert("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    console.log("회원가입:", { name, username, email, password });

    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-black">
          회원가입
        </h1>

        {/* 👤 이름 */}
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
        />

        {/* 🆔 아이디 + 중복확인 */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setIsUsernameAvailable(null);
            }}
            className="flex-1 rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
          />

          <button
            type="button"
            onClick={checkUsername}
            className="whitespace-nowrap rounded-lg bg-blue-500 px-3 text-sm text-white"
          >
            아이디 중복확인
          </button>
        </div>

        {isUsernameAvailable === true && (
          <p className="text-green-500 text-sm mb-2">
            사용 가능한 아이디입니다 ✔
          </p>
        )}

        {isUsernameAvailable === false && (
          <p className="text-red-500 text-sm mb-2">
            이미 사용 중인 아이디입니다 ❌
          </p>
        )}

        {/* 📩 이메일 + 코드받기 */}
        <div className="flex gap-2 mb-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
          />

          <button
            type="button"
            onClick={sendCode}
            className="whitespace-nowrap rounded-lg bg-blue-500 px-3 text-sm text-white"
          >
            인증코드 발송
          </button>
        </div>

        {/* 📩 인증 코드 + 확인 */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="인증 코드"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
          />

          <button
            type="button"
            onClick={verifyCode}
            className="whitespace-nowrap rounded-lg bg-green-500 px-3 text-sm text-white"
          >
            인증코드 확인
          </button>
        </div>

        {isVerified && (
          <p className="text-green-500 text-center mb-3">
            이메일 인증 완료 ✔
          </p>
        )}

        {/* 🔐 비밀번호 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
          required
        />

        {/* 🔐 비밀번호 확인 */}
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
          required
        />

        {/* 🚀 회원가입 */}
        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 transition"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}