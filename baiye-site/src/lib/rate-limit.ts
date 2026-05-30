/**
 * 基于内存的 IP 速率限制器（滑动窗口）。
 *
 * 适用于单进程 Next.js 部署。多实例场景应替换为 Redis 方案。
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix ms
}

const store = new Map<string, RateLimitEntry>();

// 每 5 分钟清理一次过期条目，避免内存泄漏
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

/**
 * 检查并更新速率限制。
 *
 * @param key   唯一标识（通常为 IP）
 * @param maxRequests 窗口内允许的最大请求数
 * @param windowMs    滑动窗口时长（毫秒）
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // 首次请求或窗口已过期 — 新建窗口
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: maxRequests - 1, reset: resetAt };
  }

  if (entry.count >= maxRequests) {
    // 超出限制
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, reset: entry.resetAt };
}

/**
 * 默认限制器（60 秒 30 次）
 */
export function defaultRateLimit(ip: string): RateLimitResult {
  return rateLimit(ip, 30, 60_000);
}

/**
 * 严格限制器 — 适用于上传 / 删除等敏感操作（60 秒 10 次）
 */
export function strictRateLimit(ip: string): RateLimitResult {
  return rateLimit(ip, 10, 60_000);
}

/**
 * 从 NextRequest 提取客户端 IP。
 * 优先读取代理/平台注入的头部，回退到直连 IP。
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // 本地 / 直连 — 无法获取真实 IP
  return "127.0.0.1";
}
