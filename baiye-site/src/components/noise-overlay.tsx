"use client";

/**
 * NoiseOverlay — 全局 SVG 噪点纹理覆盖层
 *
 * 叠加一层极淡的胶片噪点，模拟纸质/胶片质感。
 * 仅客户端渲染，fixed 定位在所有内容之上但 pointer-events: none。
 */
export function NoiseOverlay() {
  return <div className="noise-texture" aria-hidden="true" />;
}
