"use client";

import { useState, useEffect } from "react";
import { Play, ExternalLink, Loader2, AlertCircle } from "lucide-react";

interface DouyinPreview {
  playerUrl: string;
  itemId: string;
  shareUrl: string;
  type: string;
  fallbackUrl: string;
}

interface DouyinEmbedProps {
  shortUrl: string;
}

/**
 * DouyinEmbed — 在页面内直接预览抖音视频/笔记
 *
 * 核心思路：
 * 1. 调用 /api/douyin-preview 解析短链接 → 拿到 itemId
 * 2. 用 open.douyin.com/player/video（官方嵌入播放器，无 X-Frame-Options 限制）作为 iframe src
 * 3. 用户可直接在页面内观看视频或浏览图文笔记
 */
export function DouyinEmbed({ shortUrl }: DouyinEmbedProps) {
  const [data, setData] = useState<DouyinPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setLoading(true);
      setError(null);
      setIframeReady(false);
      try {
        const res = await fetch(
          `/api/douyin-preview?url=${encodeURIComponent(shortUrl)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "解析失败");
        }
        const json: DouyinPreview = await res.json();
        if (!cancelled) {
          if (!json.playerUrl) {
            // 无法提取 ID 时的降级
            setError("无法解析该链接中的内容 ID");
          } else {
            setData(json);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [shortUrl]);

  // ============ Loading 态 ============
  if (loading) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="relative pb-[56.25%]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="size-16 sm:size-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
              <Loader2 className="size-7 sm:size-9 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">正在加载抖音内容...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ Error 态 ============
  if (error || !data || !data.playerUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="relative pb-[56.25%]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <AlertCircle className="size-10 text-muted-foreground" />
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {error || "无法加载抖音内容"}
              </p>
              <p className="text-xs text-muted-foreground/60">
                点击下方按钮在抖音中查看
              </p>
            </div>
            <a
              href={data?.fallbackUrl || shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/40 px-5 py-2 text-sm text-primary transition-colors"
            >
              在抖音中打开 <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============ 正常态：iframe 嵌入 open.douyin.com 官方播放器 ============
  return (
    <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30 bg-black transition-all duration-300 hover:border-primary/40 hover:shadow-primary/10 group">
      {/* 16:9 容器 */}
      <div className="relative pb-[56.25%]">
        {/* iframe 加载前的占位骨架 */}
        {!iframeReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-black via-gray-900 to-black z-10">
            <div className="size-16 sm:size-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <Play className="size-7 sm:size-9 text-primary fill-primary ml-1" />
            </div>
            <p className="text-sm text-muted-foreground">正在加载播放器...</p>
          </div>
        )}

        {/* open.douyin.com 官方嵌入播放器 — 无 X-Frame-Options 限制 */}
        <iframe
          src={data.playerUrl}
          className="absolute inset-0 w-full h-full"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setIframeReady(true)}
          title={`抖音${data.type === "note" ? "笔记" : "视频"}`}
        />
      </div>

      {/* 底部操作栏：在抖音中打开 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end">
        <a
          href={data.fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 backdrop-blur"
        >
          在抖音中打开 <ExternalLink className="size-3" />
        </a>
      </div>

      {/* 顶部渐变装饰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
