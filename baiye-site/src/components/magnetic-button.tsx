"use client";

import { useRef, useCallback, useState, useEffect, type MouseEvent, type ReactNode } from "react";

/**
 * MagneticButton — 磁性悬停 + 涟漪点击包装器
 *
 * 包装任意子元素（必须接受 ref + className + onMouseEnter/Leave/Move + onClick）：
 * - hover 时向光标方向做微小平移（磁性吸引）
 * - click 时触发 ripple 扩散动画
 * - 仅 pointer:fine 设备启用电容效果，触摸设备直接渲染子元素
 *
 * 使用方式：
 *   <MagneticButton>
 *     <button className="...">点我</button>
 *   </MagneticButton>
 */

interface MagneticButtonProps {
  children: ReactNode;
  /** 磁吸强度，默认 0.3（0~1 之间） */
  strength?: number;
  /** 是否在点击时启用涟漪，默认 true */
  ripple?: boolean;
  className?: string;
}

export function MagneticButton({
  children,
  strength = 0.3,
  ripple = true,
  className,
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleIdRef = useRef(0);

  // 检测精细指针设备
  useEffect(() => {
    setHasFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hasFinePointer || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) * strength;
      const dy = (e.clientY - centerY) * strength;
      setOffset({ x: dx, y: dy });
    },
    [hasFinePointer, strength]
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hasFinePointer || !ripple || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev, { id, x, y }]);

      // 自动清理涟漪 DOM
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    },
    [hasFinePointer, ripple]
  );

  // 无精细指针时直接渲染子元素
  if (!hasFinePointer) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`ripple-effect inline-block ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        className="magnetic-transition"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        {children}
      </div>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-circle"
          style={{
            left: r.x,
            top: r.y,
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
          }}
        />
      ))}
    </div>
  );
}
