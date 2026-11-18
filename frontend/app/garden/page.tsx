
"use client";

import { useRouter } from "next/navigation";

const menuItems = [
  {
    icon: "✿",
    title: "달빛 일기",
    subtitle: "오늘의 마음을 기록하다",
    path: "/diary/write",
    color: "from-pink-400/30 to-rose-300/10",
  },
  {
  icon: "◇",
  title: "달빛 다리",
  subtitle: "오늘의 마음을 들여다보다",
  path: "/today-dashboard",
  color: "from-cyan-400/30 to-blue-300/10",
  },
  {
    icon: "✧",
    title: "마음 연구소",
    subtitle: "나의 마음을 탐구하다",
    path: "/input",
    color: "from-violet-400/30 to-purple-300/10",
  },
  {
  icon: "☾",
  title: "달빛 전망대",
  subtitle: "나만의 이야기를 기록하고 돌아보다",
  path: "/diary/list",
  color: "from-indigo-400/30 to-blue-300/10",
  },
  {
    icon: "♧",
    title: "기억의 나무",
    subtitle: "지나온 마음을 기억하다",
    path: "/analysis-history",
    color: "from-emerald-400/30 to-teal-300/10",
  },
];




const gardenPlaces = [
  {
    title: "기억의 나무",
    subtitle: "지나온 마음을 기억하다",
    path: "/analysis-history",
    position: "left-[7%] top-[26%] w-[36%] h-[44%]",
    glow: "tree-glow",
  },
  {
    title: "마음 연구소",
    subtitle: "나의 마음을 탐구하다",
    path: "/input",
    position: "left-[47%] top-[24%] w-[18%] h-[26%]",
    glow: "portal-glow",
  },
  {
    title: "달빛 일기",
    subtitle: "오늘의 마음을 기록하다",
    path: "/diary/write",
    position: "left-[63%] top-[32%] w-[31%] h-[37%]",
    glow: "cottage-glow",
  },
  {
  title: "달빛 전망대",
  subtitle: "나만의 이야기를 기록하고 돌아보다",
  path: "/diary/list",
  position: "left-[79%] top-[6%] w-[17%] h-[27%]",
  glow: "moon-place-glow",
},
  {
    title: "달빛 다리",
    subtitle: "오늘의 마음을 들여다보다",
    path: "/today-dashboard",
    position: "left-[43%] top-[54%] w-[17%] h-[17%]",
    glow: "bridge-glow",
  },
];


const petals = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 1.73) % 14}s`,
  duration: `${10 + (i % 8) * 1.8}s`,
  size: `${9 + (i % 5) * 3}px`,
  rotation: `${i * 43}deg`,
}));

const fireflies = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 43) % 100}%`,
  top: `${15 + ((i * 29) % 65)}%`,
  delay: `${(i * 0.8) % 8}s`,
}));

export default function GardenPage() {
  const router = useRouter();

  return (
    <main className="relative h-screen min-w-[1024px] w-full overflow-hidden bg-[#090d29] text-white">

      {/* 배경 일러스트 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/garden-background.png')",
        }}
      />

      {/* 배경 분위기 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090d29]/40 via-transparent to-[#090d29]/80" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_30%,rgba(8,10,36,0.35)_100%)]" />


      {/* 호수의 은은한 물결 */}
      <div className="pointer-events-none absolute left-[34%] top-[59%] z-[2] h-[13%] w-[34%] overflow-hidden rounded-full">
      <div className="water-ripple ripple-one" />
      <div className="water-ripple ripple-two" />
      <div className="water-shimmer" />
      </div>

      {/* 달 주변의 빛 */}
      <div className="moon-glow pointer-events-none absolute right-[13%] top-[2%] z-[1] h-64 w-64 rounded-full" />

      {/* 오로라 분위기 */}
      <div className="aurora-glow pointer-events-none absolute left-[35%] top-0 z-[1] h-[35%] w-[35%]" />

      {/* 떨어지는 벚꽃잎 */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        {petals.map((petal, i) => (
          <div
            key={i}
            className="falling-petal absolute -top-8"
            style={{
              left: petal.left,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
              fontSize: petal.size,
              transform: `rotate(${petal.rotation})`,
            }}
          >
            {i % 3 === 0 ? "✿" : "🌸"}
          </div>
        ))}
      </div>

      {/* 반딧불이 */}
      <div className="pointer-events-none absolute inset-0 z-[3]">
        {fireflies.map((fly, i) => (
          <div
            key={i}
            className="firefly absolute"
            style={{
              left: fly.left,
              top: fly.top,
              animationDelay: fly.delay,
            }}
          />
        ))}
      </div>

      {/* 정원 클릭 영역 */}
      <div className="absolute inset-0 z-[4]">
        {gardenPlaces.map((place) => (
          
<button
  key={place.path}
  type="button"
  onClick={() => router.push(place.path)}
  aria-label={`${place.title} 페이지로 이동`}
  className={`garden-hotspot group absolute ${place.position} rounded-3xl`}
>
  {/* 장소별 빛 효과 */}
  <span
    className={`place-glow absolute inset-0 rounded-3xl ${place.glow}`}
  />

  
{/* 장소별 안내 팝업 */}
<span className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 translate-y-3 flex-col items-center whitespace-nowrap rounded-2xl border border-white/30 bg-[#17163e]/85 px-6 py-4 opacity-0 shadow-[0_0_35px_rgba(190,160,255,0.3)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-5 group-hover:opacity-100">

  <span className="text-base font-bold text-white">
    {place.title}
  </span>

  <span className="mt-1 text-xs text-white/75">
    {place.subtitle}
  </span>

  <span className="mt-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-semibold tracking-[0.2em] text-purple-100">
    CLICK TO EXPLORE ↗
  </span>

</span>

</button>

        ))}
      </div>

      {/* 상단 헤더 */}
      <header className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between px-14 pt-9">

        <div>
          <p className="text-[11px] font-semibold tracking-[0.5em] text-[#d8c8ff]">
            M O O N L I G H T G A R D E N
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white drop-shadow-[0_3px_18px_rgba(180,140,255,0.5)]">
            달빛 아래의 정원
          </h1>

          <p className="mt-3 text-sm tracking-wide text-[#e4ddff]">
            오늘의 마음이 머무는 특별한 공간
          </p>
        </div>

        <button
          onClick={() => router.push("/mypage")}
          className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm text-white shadow-lg backdrop-blur-xl transition hover:border-purple-200/60 hover:bg-white/20"
        >
          내 정보 <span className="ml-2">↗</span>
        </button>
      </header>

      {/* 중앙 안내 */}
      <div className="pointer-events-none absolute left-1/2 top-[48%] z-[5] -translate-x-1/2 text-center">
        <p className="text-xs tracking-[0.35em] text-white/75">
          YOUR OWN LITTLE UNIVERSE
        </p>
      </div>

      {/* 하단 메뉴 */}
      <section className="absolute bottom-9 left-0 right-0 z-10 px-12">

        <div className="mx-auto mb-5 max-w-4xl text-center">
          <p className="text-xs tracking-[0.25em] text-white/80">
            정원의 장소를 클릭해 오늘의 마음을 만나보세요
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-3">

          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${item.color} px-4 py-5 text-center shadow-[0_12px_40px_rgba(4,5,25,0.35)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:border-white/50 hover:shadow-[0_15px_40px_rgba(160,130,255,0.3)]`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 transition group-hover:opacity-100" />

              <span className="relative block text-3xl text-white drop-shadow-[0_0_12px_rgba(220,190,255,0.7)]">
                {item.icon}
              </span>

              <span className="relative mt-3 block text-base font-bold text-white">
                {item.title}
              </span>

              <span className="relative mt-2 block text-[11px] text-white/65">
                {item.subtitle}
              </span>
            </button>
          ))}

        </div>
      </section>

      {/* 하단 장식 */}
      <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-[5] text-center">
        <p className="text-[9px] tracking-[0.4em] text-white/35">
          A PLACE WHERE YOUR HEART CAN REST
        </p>
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx>{`

.water-ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(190, 225, 255, 0.65);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.2);
  animation: ripple-expand 5s ease-out infinite;
}

.ripple-two {
  animation-delay: 2.5s;
}

@keyframes ripple-expand {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }
  20% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(8);
  }
}

.water-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 20%,
    rgba(170, 220, 255, 0.18) 48%,
    transparent 75%
  );
  background-size: 200% 100%;
  animation: water-light 7s ease-in-out infinite;
}

@keyframes water-light {
  0%, 100% {
    background-position: 100% 0;
    opacity: 0.25;
  }
  50% {
    background-position: 0 0;
    opacity: 0.8;
  }
}

.moon-glow {
  background: radial-gradient(
    circle,
    rgba(215, 190, 255, 0.2) 0%,
    rgba(160, 150, 255, 0.1) 45%,
    transparent 72%
  );
  filter: blur(18px);
  animation: moon-breath 6s ease-in-out infinite;
}

@keyframes moon-breath {
  0%, 100% {
    opacity: 0.45;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

.aurora-glow {
  background: linear-gradient(
    110deg,
    transparent,
    rgba(90, 230, 220, 0.12),
    rgba(160, 110, 255, 0.16),
    transparent
  );
  filter: blur(35px);
  animation: aurora-move 12s ease-in-out infinite alternate;
}

@keyframes aurora-move {
  from {
    transform: translateX(-25px) skewX(-8deg);
    opacity: 0.4;
  }
  to {
    transform: translateX(35px) skewX(8deg);
    opacity: 0.9;
  }
}

        .falling-petal {
          color: #ffd0ed;
          opacity: 0;
          filter: drop-shadow(0 0 5px rgba(255, 180, 230, 0.8));
          animation-name: petal-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @keyframes petal-fall {
          0% {
            transform: translate3d(0, -5vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          50% {
            transform: translate3d(55px, 50vh, 0) rotate(180deg);
          }
          90% {
            opacity: 0.65;
          }
          100% {
            transform: translate3d(-35px, 110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        .firefly {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #c8fff6;
          box-shadow: 0 0 8px 3px rgba(125, 255, 232, 0.65);
          animation: firefly-glow 3s ease-in-out infinite;
        }

        @keyframes firefly-glow {
          0%, 100% {
            opacity: 0.15;
            transform: translate3d(0, 0, 0) scale(0.7);
          }
          50% {
            opacity: 1;
            transform: translate3d(12px, -18px, 0) scale(1.5);
          }
        }

        .garden-hotspot {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }


.place-glow {
  opacity: 0;
  transform: scale(0.94);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease,
    filter 0.5s ease;
  pointer-events: none;
}

.garden-hotspot:hover .place-glow {
  opacity: 1;
  transform: scale(1);
}

.tree-glow {
  background: radial-gradient(
    ellipse,
    rgba(255, 130, 220, 0.38),
    rgba(255, 130, 220, 0.08) 55%,
    transparent 75%
  );
  filter: blur(15px);
}

.cottage-glow {
  background: radial-gradient(
    ellipse,
    rgba(255, 195, 110, 0.4),
    rgba(255, 170, 90, 0.08) 55%,
    transparent 75%
  );
  filter: blur(15px);
}

.pond-glow {
  background: radial-gradient(
    ellipse,
    rgba(80, 225, 255, 0.4),
    rgba(80, 225, 255, 0.08) 60%,
    transparent 80%
  );
  filter: blur(12px);
}

.bridge-glow {
  background: radial-gradient(
    ellipse,
    rgba(135, 205, 255, 0.4),
    rgba(170, 145, 255, 0.16) 55%,
    transparent 80%
  );
  filter: blur(12px);
}

.moon-place-glow {
  background: radial-gradient(
    circle,
    rgba(205, 175, 255, 0.42),
    transparent 70%
  );
  filter: blur(18px);
}

.portal-glow {
  background: radial-gradient(
    ellipse,
    rgba(175, 115, 255, 0.45),
    rgba(110, 100, 255, 0.08) 60%,
    transparent 80%
  );
  filter: blur(15px);
}

        @media (prefers-reduced-motion: reduce) {
          .falling-petal,
          .firefly {
            animation: none;
          }
        }

        .aurora-place-glow {
  background: radial-gradient(
    ellipse,
    rgba(90, 240, 220, 0.35),
    rgba(160, 110, 255, 0.2) 50%,
    transparent 80%
  );
  filter: blur(20px);
}
      `}</style>

    </main>
  );
}


