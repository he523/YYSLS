"use client";

import { useMemo, useState, useEffect } from "react";
import { PawPrint } from "lucide-react";

/**
 * HeroParticles — Hero 区域背景浮动粒子
 *
 * 使用纯 CSS 动画（GPU 加速）渲染飘浮的 paw-print 图标和发光小点。
 * 仅在客户端挂载后才渲染，避免 SSR 水合时 Math.random() 不匹配。
 */

interface Particle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  isPaw: boolean;
  rotation: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 94 + 3,
    top: Math.random() * 90 + 5,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 6,
    size: Math.random() * 10 + 6,
    opacity: Math.random() * 0.25 + 0.15,
    isPaw: Math.random() > 0.55,
    rotation: Math.random() * 360,
  }));
}

interface HeroParticlesProps {
  count?: number;
}

export function HeroParticles({ count = 28 }: HeroParticlesProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(
    () => (mounted ? generateParticles(count) : []),
    [mounted, count]
  );

  // SSR 阶段不渲染任何粒子，避免水合不匹配
  if (!mounted) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-[5]"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: p.opacity,
          }}
        >
          {p.isPaw ? (
            <PawPrint
              className="text-primary/25"
              style={{
                width: p.size,
                height: p.size,
                transform: `rotate(${p.rotation}deg)`,
                filter: "blur(0.5px)",
              }}
            />
          ) : (
            <div
              className="rounded-full bg-primary/20"
              style={{
                width: p.size,
                height: p.size,
                animation: `particle-sparkle ${p.duration * 0.7}s ease-in-out ${p.delay}s infinite`,
                filter: "blur(1px)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
