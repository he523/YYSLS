"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Heart } from "lucide-react";

// ============================================
// 祝福语池
// ============================================
const BLESSINGS = [
  "愿每一只猫咪都被温柔以待 🐱",
  "猫粮自由，罐头自由 ✨",
  "你和猫咪都要幸福呀 💕",
  "温暖社区，有你更美好 🏠",
  "今天也要开心喵~ 😸",
  "云吸猫，快乐每一天 ☁️",
  "猫咪和你，都是宝藏 💎",
  "江湖路远，小猫相伴 🌙",
  "百业兴旺，猫肥家润 🏮",
  "愿你的生活充满猫猫 ❤️",
  "每一只小猫都值得被爱 🌸",
  "小鱼干自由，幸福自由 🐟",
  "心中有猫，万物可爱 🎀",
  "今日份猫猫能量已送达 ⚡",
  "愿你梦里也有猫咪咕噜声 🌛",
  "做一只快乐的猫，无忧无虑 🧶",
  "猫猫教，法力无边 🙏",
  "世界上最温柔的语言是「喵」",
  "你也是某只猫的全世界 🌍",
  "好运气正在向你飞奔而来 🐾",
];

// 6 种颜色
const COLORS = [
  "hsl(25 95% 53%)",
  "hsl(326 100% 65%)",
  "hsl(350 89% 60%)",
  "hsl(43 96% 56%)",
  "hsl(199 89% 48%)",
  "hsl(160 84% 39%)",
];

// 3 种缓动曲线
const EASINGS = [
  "cubic-bezier(0.22, 0.61, 0.36, 1)",     // 柔和 ease-out
  "cubic-bezier(0.33, 0.8, 0.45, 0.95)",    // 平稳飘落
  "cubic-bezier(0.15, 0.7, 0.38, 1.05)",    // 轻微弹性的感觉
];

// ============================================
// 祝福项
// ============================================
interface BlessingItem {
  id: number;
  text: string;
  left: number;
  delay: number;
  duration: number;
  fontSize: number;
  sway: number;           // 水平摆动幅度 px
  rotationDeg: number;    // 总旋转角度
  easing: string;
  color: string;
  initialOpacity: number;
  scale: number;
}

function generateBlessings(count: number): BlessingItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    text: BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)],
    left: Math.random() * 90 + 3,                    // 3% ~ 93%
    delay: Math.random() * 3.5,                       // 0 ~ 3.5s 错峰
    duration: Math.random() * 4 + 5,                  // 5 ~ 9s
    fontSize: Math.random() * 0.7 + 0.85,             // 0.85 ~ 1.55rem
    sway: Math.random() * 60 + 10,                    // 10 ~ 70px 摆动幅度
    rotationDeg: Math.random() * 180 + 60,             // 60° ~ 240° 总旋转
    easing: EASINGS[Math.floor(Math.random() * EASINGS.length)],
    color: COLORS[i % COLORS.length],
    initialOpacity: Math.random() * 0.25 + 0.7,        // 0.7 ~ 0.95
    scale: Math.random() * 0.25 + 0.9,                 // 0.9 ~ 1.15
  }));
}

// ============================================
// 组件
// ============================================
interface BlessingRainProps {
  active: boolean;
  onComplete: () => void;
}

export function BlessingRain({ active, onComplete }: BlessingRainProps) {
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [phase, setPhase] = useState<"enter" | "active" | "exit">("enter");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!active) {
      clearTimers();
      setPhase("enter");
      setBlessings([]);
      return;
    }

    setBlessings(generateBlessings(35));
    setPhase("enter");

    const t1 = setTimeout(() => setPhase("active"), 150);
    const t2 = setTimeout(() => setPhase("exit"), 8000);
    const t3 = setTimeout(() => onComplete(), 9200);

    timersRef.current = [t1, t2, t3];

    return () => {
      clearTimers();
    };
  }, [active, onComplete, clearTimers]);

  const handleClick = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (!active && blessings.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      onClick={handleClick}
      style={{ pointerEvents: phase === "exit" ? "none" : "auto" }}
    >
      {/* 半透明遮罩 */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-amber-50/10 via-orange-50/30 to-background/85 backdrop-blur-sm transition-opacity duration-[1200ms] ease-out ${
          phase === "exit" ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* 祝福飘落层 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {blessings.map((b) => {
          // 根据 id 分配动画名
          const animVariant = (b.id % 4) + 1;
          const animName = `blessing-drift-${animVariant}`;

          return (
            <span
              key={b.id}
              className={`absolute whitespace-nowrap font-medium select-none drop-shadow-sm ${
                phase === "exit" ? "opacity-0 transition-opacity duration-[1200ms] ease-out" : ""
              }`}
              style={{
                left: `${b.left}%`,
                top: "-4rem",
                fontSize: `${b.fontSize}rem`,
                opacity: b.initialOpacity,
                transform: `scale(${b.scale})`,
                animationName: animName,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
                animationTimingFunction: b.easing,
                animationFillMode: "forwards",
                // CSS 自定义属性，传入 keyframes 使用
                ["--sway" as string]: `${b.sway}px`,
                ["--rot-deg" as string]: `${b.rotationDeg}deg`,
                ["--initial-opacity" as string]: String(b.initialOpacity),
                color: b.color,
              }}
            >
              {b.text}
            </span>
          );
        })}
      </div>

      {/* 中心提示 */}
      <div
        className={`relative z-10 text-center transition-all duration-700 ease-out pointer-events-none ${
          phase === "exit" ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
      >
        <Heart className="size-16 text-rose-400 fill-rose-400/30 mx-auto mb-4 animate-pulse" />
        <p className="text-2xl font-bold text-primary mb-2 drop-shadow-sm">
          ✨ 欢迎来到温暖社区 ✨
        </p>
        <p className="text-sm text-muted-foreground">
          点击任意位置关闭
        </p>
      </div>

    </div>
  );
}
