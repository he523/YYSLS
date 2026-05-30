"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

/**
 * ScrollReveal — 滚动触发揭示动画
 *
 * 当元素进入视口时，子元素以淡入 + 上移的方式显现。
 * 支持错峰 delay（stagger）实现逐个弹出的效果。
 *
 * 使用方式：
 *   <ScrollReveal>
 *     <div>进入视口时淡入</div>
 *   </ScrollReveal>
 *
 *   // 多个子元素逐个弹出
 *   <ScrollReveal stagger>
 *     <div>第一个弹出</div>
 *     <div>第二个弹出（延迟 100ms）</div>
 *     <div>第三个弹出（延迟 200ms）</div>
 *   </ScrollReveal>
 */

interface ScrollRevealProps {
  children: ReactNode;
  /** 是否逐个错峰揭示（子元素逐一弹出） */
  stagger?: boolean;
  /** 错峰间隔（ms），默认 100 */
  staggerDelay?: number;
  /** 触发阈值（0~1），默认 0.15（元素进入视口 15% 时触发） */
  threshold?: number;
  /** 根边距，默认 "0px 0px -40px 0px"（底部留 40px 余量） */
  rootMargin?: string;
  className?: string;
}

export function ScrollReveal({
  children,
  stagger = false,
  staggerDelay = 100,
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
  className,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {stagger
        ? // stagger 模式：用 CSS 变量传递 delay，配合 Tailwind 无法动态设置
          // 这里使用内联 style 控制 animation-delay
          (Array.isArray(children)
            ? children
            : [children]
          ).map((child, i) => (
            <div
              key={i}
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease-out ${i * staggerDelay}ms, transform 0.6s ease-out ${i * staggerDelay}ms`,
              }}
            >
              {child}
            </div>
          ))
        : // 单元素模式
          (() => {
            const transition = "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s";
            return (
              <div
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? "translateY(0)" : "translateY(24px)",
                  transition,
                }}
              >
                {children}
              </div>
            );
          })()}
    </div>
  );
}
