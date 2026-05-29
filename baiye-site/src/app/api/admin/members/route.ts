import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "未授权" }, { status: 401 });
}

// GET — 获取所有成员（管理端，含非公开成员）
export async function GET() {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("GET /api/admin/members error:", error);
    return NextResponse.json({ error: "获取成员列表失败" }, { status: 500 });
  }
}

// POST — 添加成员
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const body = await request.json();
    const member = await prisma.member.create({
      data: {
        nickname: body.nickname,
        role: body.role || "成员",
        profession: body.profession || null,
        level: body.level || 1,
        power: body.power || 0,
        intro: body.intro || null,
        isPublic: body.isPublic ?? true,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/members error:", error);
    return NextResponse.json({ error: "添加成员失败" }, { status: 500 });
  }
}
