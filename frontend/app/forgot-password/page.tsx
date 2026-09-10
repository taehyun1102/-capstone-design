"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isVerified, setIsVerified] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        "https://capstone-design-ip8n.onrender.com/api/auth/send-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("인증번호가 전송되었습니다.");
    } catch (err) {
      console.error(err);
      alert("인증번호 발송 실패");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch(
        "https://capstone-design-ip8n.onrender.com/api/auth/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setIsVerified(true);
      alert("이메일 인증 완료");
    } catch (err) {
      console.error(err);
      alert("인증 실패");
    }
  };

  const handleResetPassword = async () => {
    if (!isVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        "https://capstone-design-ip8n.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("비밀번호가 변경되었습니다.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("비밀번호 변경 실패");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          비밀번호 찾기
        </h1>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="mb-3 w-full rounded-lg border p-3 text-black"
        />

        <button
          onClick={handleSendCode}
          className="mb-4 w-full rounded-lg bg-blue-600 py-3 text-white"
        >
          인증번호 발송
        </button>

        <input
          type="text"
          placeholder="인증번호 입력"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          className="mb-3 w-full rounded-lg border p-3 text-black"
        />

        <button
          onClick={handleVerifyCode}
          className="mb-4 w-full rounded-lg bg-green-600 py-3 text-white"
        >
          인증번호 확인
        </button>

        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          className="mb-4 w-full rounded-lg border p-3 text-black"
        />

        <button
          onClick={handleResetPassword}
          className="w-full rounded-lg bg-black py-3 text-white"
        >
          비밀번호 변경
        </button>

      </div>
    </div>
  );
}