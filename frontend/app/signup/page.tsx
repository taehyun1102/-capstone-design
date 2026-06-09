"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<null | boolean>(null);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const checkUsername = async () => {
    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/check-username",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
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

  const sendCode = async () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/send-code",
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
        alert(data.message || "인증 코드 전송 실패");
        return;
      }

      alert("인증 코드가 이메일로 전송되었습니다.");
    } catch (err) {
      console.error(err);
      alert("인증 코드 전송 실패");
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      alert("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/verify-code",
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

      if (data.verified) {
        setIsVerified(true);
        alert("이메일 인증 완료!");
      } else {
        alert(data.message || "인증 실패");
      }
    } catch (err) {
      console.error(err);
      alert("인증 확인 실패");
    }
  };

  const handleSignup = async (
    e: React.FormEvent
  ) => {
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

    if (!isVerified) {
      alert("이메일 인증을 완료해주세요.");
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

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            email,
            password,
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
      console.error(err);
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          회원가입
        </h1>

        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
        />

        <div className="mb-2 flex gap-2">
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
            className="whitespace-nowrap rounded-lg bg-blue-500 px-3 text-sm text-white hover:bg-blue-600"
          >
            중복확인
          </button>
        </div>

        {isUsernameAvailable === true && (
          <p className="mb-2 text-sm text-green-500">
            사용 가능한 아이디입니다 ✔
          </p>
        )}

        {isUsernameAvailable === false && (
          <p className="mb-2 text-sm text-red-500">
            이미 사용 중인 아이디입니다 ❌
          </p>
        )}

        <div className="mb-3 flex gap-2">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            disabled={isVerified}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={sendCode}
            disabled={!email || isVerified}
            className="whitespace-nowrap rounded-lg bg-blue-500 px-3 text-sm text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            코드받기
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="인증 코드"
            value={code}
            disabled={isVerified}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={verifyCode}
            disabled={isVerified}
            className="whitespace-nowrap rounded-lg bg-green-500 px-3 text-sm text-white hover:bg-green-600 disabled:bg-gray-400"
          >
            확인
          </button>
        </div>

        {isVerified && (
          <p className="mb-3 text-center text-green-500">
            이메일 인증 완료 ✔
          </p>
        )}

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          className="mb-2 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400"
        />

        {confirmPassword && (
          <p
            className={`mb-4 text-sm ${
              password === confirmPassword
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {password === confirmPassword
              ? "비밀번호가 일치합니다 ✔"
              : "비밀번호가 일치하지 않습니다 ❌"}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800"
        >
          회원가입
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="ml-1 text-blue-500 hover:underline"
          >
            로그인
          </button>
        </p>
      </form>
    </div>
  );
}