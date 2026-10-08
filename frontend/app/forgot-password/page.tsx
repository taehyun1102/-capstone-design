"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  "https://capstone-design-ip8n.onrender.com/api/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] =
    useState("");
  const [securityAnswer, setSecurityAnswer] =
    useState("");

  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [isLoading, setIsLoading] = useState(false);

  // 1단계
  // 아이디를 입력하고 보안 질문을 가져옵니다.
  const handleFindQuestion = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/forgot-password/question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "보안 질문을 불러오지 못했습니다."
        );
        return;
      }

      setSecurityQuestion(
        data.securityQuestion
      );

      setStep(2);
    } catch (error) {
      console.error(error);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계
  // 보안 질문의 답변을 확인합니다.
  const handleVerifyAnswer = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!securityAnswer.trim()) {
      alert("보안 질문의 답변을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/forgot-password/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            securityAnswer:
              securityAnswer.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "보안 답변 확인에 실패했습니다."
        );
        return;
      }

      setResetToken(data.resetToken);

      setStep(3);
    } catch (error) {
      console.error(error);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계
  // 새 비밀번호를 설정합니다.
  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!resetToken) {
      alert(
        "인증 정보가 없습니다. 비밀번호 찾기를 다시 진행해주세요."
      );
      setStep(1);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "비밀번호 변경에 실패했습니다."
        );
        return;
      }

      setStep(4);
    } catch (error) {
      console.error(error);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 이전 단계로 돌아가기
  const handleBack = () => {
    if (isLoading) {
      return;
    }

    if (step === 1) {
      router.push("/login");
      return;
    }

    if (step === 2) {
      setSecurityAnswer("");
      setStep(1);
      return;
    }

    if (step === 3) {
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setStep(2);
      return;
    }
  };

  // 완료 후 로그인 페이지로 이동
  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* 1단계 */}
        {step === 1 && (
          <form onSubmit={handleFindQuestion}>
            <p className="mb-2 text-center text-sm font-semibold text-blue-600">
              AI 기반 하루 흐름 분석 시스템
            </p>

            <h1 className="mb-2 text-center text-2xl font-bold text-black">
              비밀번호 찾기
            </h1>

            <p className="mb-6 text-center text-sm text-gray-500">
              가입한 아이디를 입력해주세요.
            </p>

            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {isLoading
                ? "확인 중..."
                : "다음"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
              disabled={isLoading}
              className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-800"
            >
              로그인으로 돌아가기
            </button>
          </form>
        )}

        {/* 2단계 */}
        {step === 2 && (
          <form onSubmit={handleVerifyAnswer}>
            <p className="mb-2 text-center text-sm font-semibold text-blue-600">
              비밀번호 찾기
            </p>

            <h1 className="mb-6 text-center text-2xl font-bold text-black">
              본인 확인
            </h1>

            <div className="mb-4 rounded-lg bg-gray-100 p-4">
              <p className="mb-2 text-xs text-gray-500">
                아이디
              </p>

              <p className="font-medium text-gray-900">
                {username}
              </p>
            </div>

            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="mb-2 text-xs font-medium text-blue-600">
                보안 질문
              </p>

              <p className="font-medium text-gray-900">
                {securityQuestion}
              </p>
            </div>

            <input
              type="text"
              placeholder="보안 질문의 답변"
              value={securityAnswer}
              onChange={(e) =>
                setSecurityAnswer(e.target.value)
              }
              className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {isLoading
                ? "확인 중..."
                : "답변 확인"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-800"
            >
              이전으로
            </button>
          </form>
        )}

        {/* 3단계 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p className="mb-2 text-center text-sm font-semibold text-blue-600">
              비밀번호 찾기
            </p>

            <h1 className="mb-2 text-center text-2xl font-bold text-black">
              새 비밀번호 설정
            </h1>

            <p className="mb-6 text-center text-sm text-gray-500">
              새로운 비밀번호를 입력해주세요.
            </p>

            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
              disabled={isLoading}
            />

            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="mb-2 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
              disabled={isLoading}
            />

            {confirmPassword && (
              <p
                className={`mb-4 text-sm ${
                  newPassword === confirmPassword
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {newPassword === confirmPassword
                  ? "비밀번호가 일치합니다 ✔"
                  : "비밀번호가 일치하지 않습니다 ❌"}
              </p>
            )}

            {!confirmPassword && (
              <p className="mb-4 text-xs text-gray-400">
                비밀번호는 6자 이상이어야 합니다.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {isLoading
                ? "변경 중..."
                : "비밀번호 변경"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-800"
            >
              이전으로
            </button>
          </form>
        )}

        {/* 4단계 */}
        {step === 4 && (
          <div className="text-center">
            <div className="mb-4 text-5xl">
              ✓
            </div>

            <h1 className="mb-3 text-2xl font-bold text-black">
              비밀번호 변경 완료
            </h1>

            <p className="mb-6 text-sm leading-6 text-gray-500">
              비밀번호가 성공적으로 변경되었습니다.
              <br />
              새로운 비밀번호로 로그인해주세요.
            </p>

            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800"
            >
              로그인하러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}