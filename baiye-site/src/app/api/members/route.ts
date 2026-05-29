import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultRateLimit, strictRateLimit, getClientIp } from "@/lib/rate-limit";
import { memberCreateSchema } from "@/lib/validations";

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

  try {
    const url = request.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "12")));

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.member.count({ where: { isPublic: true } }),
    ]);

    return NextResponse.json({
      members,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/members error:", error);
    return NextResponse.json(
      { error: "获取成员列表失败" },
      { status: 500 }
    );
  }
}

// POST — 公开添加成员（任何访客均可添加）
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
    const body = await request.json();

    const parsed = memberCreateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "输入数据无效" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        nickname: parsed.data.nickname.trim(),
        role: parsed.data.role,
        profession: parsed.data.profession ?? null,
        level: parsed.data.level,
        power: parsed.data.power,
        intro: parsed.data.intro?.trim() || null,
        avatar: parsed.data.avatar ?? null,
        gameImage: parsed.data.gameImage ?? null,
        isPublic: true,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST /api/members error:", error);
    return NextResponse.json({ error: "添加成员失败" }, { status: 500 });
  }
}
