"use client";

import { useRef, useCallback, useState, useEffect, type MouseEvent, type ReactNode } from "react";

/**
 * TiltCard — 3D 倾斜卡片包装器
 *
 * 包装任意子元素：
 * - hover 时跟随光标做 perspective rotateX/Y 变换
 * - 离开时平滑回弹到原始角度
 * - 仅 pointer:fine 设备启用，触摸设备直接渲染子元素
 *
 * 使用方式：
 *   <TiltCard className="...">
 *     <Card>...</Card>
 *   </TiltCard>
 */

interface TiltCardProps {
  children: ReactNode;
  /** 最大倾斜角度（度），默认 8 */
  maxTilt?: number;
  /** 是否启用光泽扫过，默认 true */
  gloss?: boolean;
  className?: string;
}

export function TiltCard({
  children,
  maxTilt = 8,
  gloss = true,
  className,
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setHasFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hasFinePointer || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // 计算相对于中心的偏移比例 (-1 ~ 1)
      const ratioX = (e.clientX - centerX) / (rect.width / 2);
      const ratioY = (e.clientY - centerY) / (rect.height / 2);
      setRotate({
        y: ratioX * maxTilt,
        x: -ratioY * maxTilt,
      });
    },
    [hasFinePointer, maxTilt]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setIsHovering(false);
  }, []);

  if (!hasFinePointer) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`tilt-perspective ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`tilt-child ${gloss ? "gloss gloss-sweep" : ""}`}
        style={{
          transform: isHovering
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovering
            ? "transform 0.1s ease-out"
            : "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
