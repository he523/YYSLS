import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultRateLimit, strictRateLimit, getClientIp } from "@/lib/rate-limit";
import { memberUpdateSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id, isPublic: true },
    });

    if (!member) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("GET /api/members/[id] error:", error);
    return NextResponse.json({ error: "获取成员详情失败" }, { status: 500 });
  }
}

// PATCH — 编辑成员信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();

    const parsed = memberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "输入数据无效" },
        { status: 400 }
      );
    }

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 });
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        nickname: parsed.data.nickname.trim(),
        role: parsed.data.role ?? existing.role,
        profession: parsed.data.profession !== undefined ? parsed.data.profession : existing.profession,
        intro: parsed.data.intro !== undefined ? (parsed.data.intro?.trim() || null) : existing.intro,
        avatar: parsed.data.avatar !== undefined ? parsed.data.avatar : existing.avatar,
        level: parsed.data.level ?? existing.level,
        power: parsed.data.power ?? existing.power,
        gameImage: parsed.data.gameImage !== undefined ? parsed.data.gameImage : existing.gameImage,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/members/[id] error:", error);
    return NextResponse.json({ error: "编辑成员失败" }, { status: 500 });
  }
}

// DELETE — 删除成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 });
    }

    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/members/[id] error:", error);
    return NextResponse.json({ error: "删除成员失败" }, { status: 500 });
  }
}
