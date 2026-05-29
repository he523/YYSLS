import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { strictRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

/**
 * 读取文件 magic bytes 验证真实类型，防止伪造 MIME type。
 */
const MAGIC_SIGNATURES: Record<string, number[]> = {
  "image/png":       [0x89, 0x50, 0x4E, 0x47],
  "image/jpeg":      [0xFF, 0xD8, 0xFF],
  "image/webp":      [0x52, 0x49, 0x46, 0x46], // "RIFF"
  "image/gif":       [0x47, 0x49, 0x46, 0x38], // "GIF8"
  "image/svg+xml":   [0x3C], // "<" — 宽松匹配
};

function detectRealType(buffer: Buffer): string | null {
  for (const [mime, sig] of Object.entries(MAGIC_SIGNATURES)) {
    if (sig.every((byte, i) => buffer[i] === byte)) return mime;
  }
  return null;
}

export async function POST(request: NextRequest) {
  // 严格速率限制
  const ip = getClientIp(request);
  const limit = strictRateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: "操作过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.reset - Date.now()) / 1000)) } },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    // 文件类型参数：avatar 或 game，默认 avatar
    const fileType = (formData.get("fileType") as string) || "avatar";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 PNG / JPEG / WebP / GIF / SVG 格式" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 2 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // magic bytes 校验
    const realType = detectRealType(buffer);
    if (!realType || !ALLOWED_TYPES.includes(realType)) {
      return NextResponse.json(
        { error: "文件类型校验失败，请上传真实的图片文件" },
        { status: 400 }
      );
    }

    // 生成唯一文件名，保留原始扩展名
    const ext = path.extname(file.name) || ".png";
    const name = `${crypto.randomUUID()}${ext}`;

    // 根据类型分目录：avatars 或 game
    const subDir = fileType === "game" ? "game" : "avatars";
    const uploadsDir = path.join(process.cwd(), "public", "uploads", subDir);
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, name);
    await writeFile(filePath, buffer);

    const url = `/uploads/${subDir}/${name}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "上传失败，请稍后重试" }, { status: 500 });
  }
}
