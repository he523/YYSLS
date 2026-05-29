import { NextRequest, NextResponse } from "next/server";
import { defaultRateLimit, getClientIp } from "@/lib/rate-limit";

interface DouyinPreview {
  /** 可嵌入 iframe 的抖音官方播放器地址 */
  playerUrl: string;
  /** 抖音物品 ID（视频/笔记） */
  itemId: string;
  /** 原始 douyin.com 页面链接 */
  shareUrl: string;
  /** 类型：video / note */
  type: string;
  /** 备用：直接跳转链接 */
  fallbackUrl: string;
}

/**
 * GET /api/douyin-preview?url=https://v.douyin.com/Thsi-9TigM0/
 *
 * 解析 v.douyin.com 短链接 → 提取物品 ID → 构造 open.douyin.com 播放器地址
 *
 * open.douyin.com/player/video 是抖音官方嵌入播放器，无 X-Frame-Options 限制，
 * 支持视频和图文笔记两种类型。
 */
export async function GET(request: NextRequest) {
  // 速率限制
  const ip = getClientIp(request);
  const limit = defaultRateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.reset - Date.now()) / 1000)) } },
    );
  }

  const shortUrl = request.nextUrl.searchParams.get("url");

  if (!shortUrl) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  if (!shortUrl.includes("v.douyin.com")) {
    return NextResponse.json({ error: "仅支持 v.douyin.com 短链接" }, { status: 400 });
  }

  try {
    // 1. 跟随重定向拿真实 URL
    const redirectRes = await fetch(shortUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const location = redirectRes.headers.get("location");
    if (!location) {
      return NextResponse.json({ error: "无法解析短链接" }, { status: 502 });
    }

    // 2. 从重定向 URL 中提取物品 ID
    //    可能的格式：
    //      https://www.iesdouyin.com/share/video/7578759410726669155/...
    //      https://www.douyin.com/note/7578759410726669155?...
    //      https://www.douyin.com/video/7578759410726669155?...
    const idMatch = location.match(/\/(?:video|note)\/(\d+)/);
    const itemId = idMatch?.[1];

    if (!itemId) {
      // 无法提取 ID，降级为直接跳转链接
      return NextResponse.json({
        playerUrl: "",
        itemId: "",
        shareUrl: location,
        type: "unknown",
        fallbackUrl: location,
      });
    }

    // 3. 判断类型并构造各种 URL
    const type = location.includes("/note/") ? "note" : "video";
    const playerUrl = `https://open.douyin.com/player/video?vid=${itemId}&autoplay=0`;
    const fallbackUrl = `https://www.douyin.com/${type}/${itemId}`;

    const result: DouyinPreview = {
      playerUrl,
      itemId,
      shareUrl: location,
      type,
      fallbackUrl,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("解析抖音短链失败:", err);
    return NextResponse.json({ error: "解析失败" }, { status: 502 });
  }
}
