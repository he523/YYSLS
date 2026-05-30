"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * BackgroundMusic — 全局背景音乐组件
 *
 * - 初始化时自动循环播放
 * - 页面中其他 <audio> / <video> 开始播放时自动暂停
 * - 其他媒体全部停止后自动恢复播放
 */
export function BackgroundMusic() {
  const bgmRef = useRef<HTMLAudioElement>(null);
  const manuallyStopped = useRef(false);
  /** 跟踪通过自定义事件请求暂停的来源数量（如 iframe 嵌入的抖音播放器） */
  const externalPauseRequests = useRef(0);

  /** 检查除 BGM 外是否还有正在播放的媒体 */
  const hasOtherPlayingMedia = useCallback(() => {
    const allMedia = document.querySelectorAll<HTMLAudioElement | HTMLVideoElement>(
      "audio, video"
    );
    for (const m of allMedia) {
      if (m !== bgmRef.current && !m.paused && !m.ended) return true;
    }
    return false;
  }, []);

  /** 安全恢复 BGM 播放 */
  const resumeBgm = useCallback(() => {
    const bgm = bgmRef.current;
    if (!bgm || !bgm.paused || manuallyStopped.current) return;
    // 仍有外部组件（如 iframe 嵌入播放器）占用中，不恢复
    if (externalPauseRequests.current > 0) return;
    if (!hasOtherPlayingMedia()) {
      bgm.play().catch(() => {});
    }
  }, [hasOtherPlayingMedia]);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;

    // 尝试自动播放（浏览器可能阻止，等待首次用户交互后重试）
    const attemptPlay = () => bgm.play().catch(() => {});
    attemptPlay();

    // 用户首次交互后重试自动播放
    const tryOnce = () => {
      attemptPlay();
      document.removeEventListener("click", tryOnce);
      document.removeEventListener("keydown", tryOnce);
      document.removeEventListener("touchstart", tryOnce);
    };
    document.addEventListener("click", tryOnce);
    document.addEventListener("keydown", tryOnce);
    document.addEventListener("touchstart", tryOnce);

    // ---- 监听页面内其他媒体 ----

    const onOtherPlay = (e: Event) => {
      const target = e.target;
      if (
        target === bgm ||
        !(target instanceof HTMLAudioElement || target instanceof HTMLVideoElement)
      )
        return;
      // 其他媒体开始播放 → 暂停 BGM
      if (!bgm.paused) {
        bgm.pause();
      }
    };

    const onOtherPause = (e: Event) => {
      const target = e.target;
      if (
        target === bgm ||
        !(target instanceof HTMLAudioElement || target instanceof HTMLVideoElement)
      )
        return;
      // 小延迟等待同一帧内的状态更新
      setTimeout(resumeBgm, 100);
    };

    const onOtherEnded = (e: Event) => {
      const target = e.target;
      if (
        target === bgm ||
        !(target instanceof HTMLAudioElement || target instanceof HTMLVideoElement)
      )
        return;
      setTimeout(resumeBgm, 100);
    };

    document.addEventListener("play", onOtherPlay, true);
    document.addEventListener("pause", onOtherPause, true);
    document.addEventListener("ended", onOtherEnded, true);

    // ---- 监听来自 iframe 嵌入组件的自定义暂停/恢复请求 ----
    const onExternalPause = () => {
      externalPauseRequests.current++;
      if (!bgm.paused && !manuallyStopped.current) {
        bgm.pause();
      }
    };
    const onExternalResume = () => {
      externalPauseRequests.current = Math.max(0, externalPauseRequests.current - 1);
      if (externalPauseRequests.current === 0) {
        resumeBgm();
      }
    };
    window.addEventListener("bgm:pause-request", onExternalPause);
    window.addEventListener("bgm:resume-request", onExternalResume);

    return () => {
      document.removeEventListener("click", tryOnce);
      document.removeEventListener("keydown", tryOnce);
      document.removeEventListener("touchstart", tryOnce);
      document.removeEventListener("play", onOtherPlay, true);
      document.removeEventListener("pause", onOtherPause, true);
      document.removeEventListener("ended", onOtherEnded, true);
      window.removeEventListener("bgm:pause-request", onExternalPause);
      window.removeEventListener("bgm:resume-request", onExternalResume);
    };
  }, [resumeBgm]);

  return (
    <audio
      ref={bgmRef}
      src="/music/background.mp3"
      loop
      preload="auto"
      className="hidden"
    />
  );
}
