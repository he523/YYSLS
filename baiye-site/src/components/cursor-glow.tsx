"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * CursorGlow — 光标跟随暖色光晕
 *
 * - 仅在支持精细指针（鼠标/触控板）的设备上渲染
 * - 鼠标移动时光晕跟随，悬停在可交互元素上时透明度增强
 * - 触摸设备或移动端不渲染（无意义）
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [intense, setIntense] = useState(false);
  const rafRef = useRef<number | null>(null);
  const targetPos = useRef({ x: -500, y: -500 });

  const hasFinePointer = useRef(true);

  useEffect(() => {
    // 检测是否为触摸设备
    hasFinePointer.current = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer.current) return;

    const glow = glowRef.current;
    if (!glow) return;

    const onMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 检测是否悬停在可交互元素上
      if (
        target.closest(
          "a, button, [role=button], input, select, textarea, .interactive, .tilt-perspective"
        )
      ) {
        setIntense(true);
      } else {
        setIntense(false);
      }
    };

    const onLeave = () => {
      setVisible(false);
    };

    // 用 rAF 平滑更新位置
    const update = () => {
      if (glow) {
        glow.style.left = `${targetPos.current.x}px`;
        glow.style.top = `${targetPos.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(update);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(update);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  if (!hasFinePointer.current) return null;

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      style={{
        opacity: visible ? (intense ? 1 : 0.6) : 0,
      }}
      aria-hidden="true"
    />
  );
}
