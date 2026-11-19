
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://capstone-design-ip8n.onrender.com";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<null | boolean>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const securityQuestions = [
    "나의 고향은?",
    "내가 가장 좋아하는 음식은?",
    "내가 가장 좋아하는 색깔은?",
    "나의 첫 학교는?",
    "내가 가장 좋아하는 동물은?",
    "내가 가장 좋아하는 영화는?",
    "내가 가장 좋아하는 취미는?",
  ];

  // 아이디 중복 확인
  const checkUsername = async () => {
    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/check-username`,
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
        alert(data.message || "중복확인 실패");
        return;
      }

      setIsUsernameAvailable(data.available);
    } catch (err) {
      console.error(err);
      alert("아이디 중복확인 실패");
    }
  };

  // 회원가입
  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (isUsernameAvailable === null) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }

    if (isUsernameAvailable === false) {
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    if (password.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!securityQuestion) {
      alert("보안 질문을 선택해주세요.");
      return;
    }

    if (!securityAnswer.trim()) {
      alert("보안 질문의 답변을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim(),
            password,
            securityQuestion,
            securityAnswer: securityAnswer.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "회원가입 실패");
        return;
      }

      alert("회원가입 성공!");
      router.push("/login");
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert("서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff5f5] px-4 py-10">

      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#ff9b9b]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-[#a66cff]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-[#ffb36b]/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#ec71ce]/50 blur-3xl" />

      {/* 회원가입 카드 */}
      <section className="relative z-10 w-full max-w-[510px] overflow-hidden rounded-[32px] border border-white/80 bg-white/55 px-6 py-9 shadow-[0_25px_80px_rgba(125,65,150,0.18)] backdrop-blur-2xl sm:px-12 sm:py-11">

        {/* 카드 내부 장식 */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c18aff]/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#ff9b8d]/20 blur-2xl" />

        <div className="relative z-10">

          {/* 브랜드 로고 */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8955df] shadow-lg shadow-purple-300/40">
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

            <h1 className="text-3xl font-extrabold tracking-tight text-[#30204f]">
              마음의 하루
            </h1>

            <p className="mt-2 text-sm text-[#756482]">
              나만의 하루와 마음을 기록해보세요.
            </p>
          </div>

          {/* 제목 */}
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-extrabold text-[#33204f]">
              회원가입
            </h2>
            <p className="mt-2 text-sm text-[#796b89]">
              마음의 하루와 함께 새로운 기록을 시작해요.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-bold text-[#463454]">
                이름
              </label>
              <input
                id="name"
                type="text"
                placeholder="이름을 입력해주세요."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-13 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* 아이디 및 중복확인 */}
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-bold text-[#463454]">
                아이디
              </label>

              <div className="flex gap-2">
                <input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력해주세요."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setIsUsernameAvailable(null);
                  }}
                  required
                  className="h-13 min-w-0 flex-1 rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100"
                />

                <button
                  type="button"
                  onClick={checkUsername}
                  className="shrink-0 rounded-2xl bg-[#8955df] px-4 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#7432ca]"
                >
                  중복확인
                </button>
              </div>

              {isUsernameAvailable === true && (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  ✓ 사용 가능한 아이디입니다.
                </p>
              )}

              {isUsernameAvailable === false && (
                <p className="mt-2 text-xs font-semibold text-rose-600">
                  ✕ 이미 사용 중인 아이디입니다.
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#463454]">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호 6자 이상 입력해주세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-13 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-[#463454]">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-13 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100"
              />

              {confirmPassword && (
                <p className={`mt-2 text-xs font-semibold ${
                  password === confirmPassword
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}>
                  {password === confirmPassword
                    ? "✓ 비밀번호가 일치합니다."
                    : "✕ 비밀번호가 일치하지 않습니다."}
                </p>
              )}
            </div>

            {/* 보안 질문 */}
            <div>
              <label htmlFor="securityQuestion" className="mb-2 block text-sm font-bold text-[#463454]">
                보안 질문
              </label>
              <select
                id="securityQuestion"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                required
                className="h-13 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#665477] shadow-sm outline-none transition focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100"
              >
                <option value="">보안 질문을 선택해주세요.</option>
                {securityQuestions.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            {/* 보안 답변 */}
            <div>
              <label htmlFor="securityAnswer" className="mb-2 block text-sm font-bold text-[#463454]">
                보안 답변
              </label>
              <input
                id="securityAnswer"
                type="text"
                placeholder="보안 질문의 답변을 입력해주세요."
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
                className="h-13 w-full rounded-2xl border border-white bg-white/75 px-4 text-sm text-[#33204f] shadow-sm outline-none transition placeholder:text-[#ad9eb9] focus:border-[#ae83e9] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#873ee5] text-base font-bold text-white shadow-lg shadow-purple-300/40 transition hover:bg-[#7432ca] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "가입 중..." : "회원가입"}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          {/* 로그인 이동 */}
          <div className="mt-7 text-center text-sm text-[#796b89]">
            이미 계정이 있으신가요?
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="ml-2 font-bold text-[#8546d5] transition hover:text-[#5d269e]"
            >
              로그인
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-[#9b8ba6]">
            당신의 하루와 마음을 소중하게 기록해보세요.
          </p>

        </div>
      </section>
    </main>
  );
}

