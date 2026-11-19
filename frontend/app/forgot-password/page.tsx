
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = `${
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com"
}/api/auth`;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // 1단계: 보안 질문 불러오기
  const handleFindQuestion = async (e: FormEvent) => {
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

      setSecurityQuestion(data.securityQuestion);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 보안 답변 확인
  const handleVerifyAnswer = async (e: FormEvent) => {
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
            securityAnswer: securityAnswer.trim(),
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

  // 3단계: 새 비밀번호 설정
  const handleResetPassword = async (e: FormEvent) => {
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

  // 이전 단계로 이동
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

  // 로그인 페이지 이동
  const handleGoToLogin = () => {
    router.push("/login");
  };

  const stepTitles = [
    "아이디 확인",
    "본인 확인",
    "새 비밀번호",
    "변경 완료",
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff5f5] px-4 py-10">

      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#ff9b9b]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-[#a66cff]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-[#ffb36b]/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#ec71ce]/50 blur-3xl" />

      {/* 글래스모피즘 카드 */}
      <section className="relative z-10 w-full max-w-[510px] overflow-hidden rounded-[32px] border border-white/80 bg-white/55 px-6 py-10 shadow-[0_25px_80px_rgba(125,65,150,0.18)] backdrop-blur-2xl sm:px-12 sm:py-12">

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c18aff]/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#ff9b8d]/20 blur-2xl" />

        <div className="relative z-10">

          {/* 브랜드 로고 */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8955df] shadow-lg shadow-purple-300/40">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="h-9 w-9"
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

            <h1 className="text-3xl font-extrabold tracking-tight text-[#30204f]">
              마음의 하루
            </h1>

            <p className="mt-2 text-sm font-medium text-[#756482]">
              AI 기반 하루 흐름 분석 시스템
            </p>
          </div>

          {/* 단계 표시 */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#463454]">
                비밀번호 찾기
              </span>
              <span className="text-xs font-semibold text-[#8955df]">
                {step === 4 ? "완료" : `${step} / 3 단계`}
              </span>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-2 flex-1 rounded-full transition ${
                    step >= item
                      ? "bg-[#8955df]"
                      : "bg-[#e9dff2]"
                  }`}
                />
              ))}
            </div>

            <p className="mt-2 text-right text-xs text-[#907d9d]">
              {stepTitles[step - 1]}
            </p>
          </div>

          {/* 1단계 */}
          {step === 1 && (
            <form onSubmit={handleFindQuestion}>
              <div className="mb-7 text-center">
                <h2 className="text-2xl font-extrabold text-[#33204f]">
                  비밀번호 찾기
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#796b89]">
                  가입한 아이디를 입력해주세요.
                </p>
              </div>

              <label
                htmlFor="username"
                className="mb-2 block text-sm font-bold text-[#463454]"
              >
                아이디
              </label>

              <input
                id="username"
                type="text"
                placeholder="아이디를 입력해주세요."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="mb-6 h-14 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#873ee5] text-base font-bold text-white shadow-lg shadow-purple-300/40 transition hover:bg-[#7432ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "확인 중..." : "다음"}
                {!isLoading && <span>→</span>}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                disabled={isLoading}
                className="mt-5 w-full text-center text-sm font-semibold text-[#796b89] transition hover:text-[#8546d5]"
              >
                로그인으로 돌아가기
              </button>
            </form>
          )}

          {/* 2단계 */}
          {step === 2 && (
            <form onSubmit={handleVerifyAnswer}>
              <div className="mb-7 text-center">
                <h2 className="text-2xl font-extrabold text-[#33204f]">
                  본인 확인
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#796b89]">
                  가입할 때 등록한 보안 질문에 답변해주세요.
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-white bg-white/65 p-4 shadow-sm">
                <p className="mb-2 text-xs font-semibold text-[#9867bd]">
                  아이디
                </p>
                <p className="font-semibold text-[#33204f]">
                  {username}
                </p>
              </div>

              <div className="mb-5 rounded-2xl border border-purple-100 bg-purple-50/75 p-4">
                <p className="mb-2 text-xs font-bold text-[#8955df]">
                  보안 질문
                </p>
                <p className="font-semibold leading-relaxed text-[#463454]">
                  {securityQuestion}
                </p>
              </div>

              <label
                htmlFor="securityAnswer"
                className="mb-2 block text-sm font-bold text-[#463454]"
              >
                보안 답변
              </label>

              <input
                id="securityAnswer"
                type="text"
                placeholder="보안 질문의 답변을 입력해주세요."
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                disabled={isLoading}
                className="mb-6 h-14 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#873ee5] text-base font-bold text-white shadow-lg shadow-purple-300/40 transition hover:bg-[#7432ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "확인 중..." : "답변 확인"}
                {!isLoading && <span>→</span>}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="mt-5 w-full text-center text-sm font-semibold text-[#796b89] transition hover:text-[#8546d5]"
              >
                ← 이전 단계
              </button>
            </form>
          )}

          {/* 3단계 */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-7 text-center">
                <h2 className="text-2xl font-extrabold text-[#33204f]">
                  새 비밀번호 설정
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#796b89]">
                  새로운 비밀번호를 입력해주세요.
                </p>
              </div>

              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-bold text-[#463454]"
              >
                새 비밀번호
              </label>

              <input
                id="newPassword"
                type="password"
                placeholder="새 비밀번호를 입력해주세요."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="mb-4 h-14 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
              />

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold text-[#463454]"
              >
                새 비밀번호 확인
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="mb-2 h-14 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
              />

              {confirmPassword && (
                <p
                  className={`mb-4 text-xs font-semibold ${
                    newPassword === confirmPassword
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {newPassword === confirmPassword
                    ? "✓ 비밀번호가 일치합니다."
                    : "✕ 비밀번호가 일치하지 않습니다."}
                </p>
              )}

              {!confirmPassword && (
                <p className="mb-4 text-xs text-[#9b8ba6]">
                  비밀번호는 6자 이상이어야 합니다.
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#873ee5] text-base font-bold text-white shadow-lg shadow-purple-300/40 transition hover:bg-[#7432ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "변경 중..." : "비밀번호 변경"}
                {!isLoading && <span>→</span>}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="mt-5 w-full text-center text-sm font-semibold text-[#796b89] transition hover:text-[#8546d5]"
              >
                ← 이전 단계
              </button>
            </form>
          )}

          {/* 4단계 */}
          {step === 4 && (
            <div className="py-5 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0e4ff] text-4xl font-bold text-[#8955df] shadow-sm">
                ✓
              </div>

              <h2 className="mb-4 text-2xl font-extrabold text-[#33204f]">
                비밀번호 변경 완료!
              </h2>

              <p className="mb-8 text-sm leading-7 text-[#796b89]">
                비밀번호가 성공적으로 변경되었습니다.
                <br />
                새로운 비밀번호로 로그인해주세요.
              </p>

              <button
                type="button"
                onClick={handleGoToLogin}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#873ee5] text-base font-bold text-white shadow-lg shadow-purple-300/40 transition hover:bg-[#7432ca]"
              >
                로그인하러 가기
                <span>→</span>
              </button>
            </div>
          )}

          {/* 하단 안내 */}
          <p className="mt-8 text-center text-xs leading-relaxed text-[#9b8ba6]">
            당신의 하루와 마음을 소중하게 기록해보세요.
          </p>

        </div>
      </section>
    </main>
  );
}
