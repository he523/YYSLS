import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "未授权" }, { status: 401 });
}

// PUT — 更新成员
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await request.json();

    const member = await prisma.member.update({
      where: { id },
      data: {
        nickname: body.nickname,
        role: body.role,
        profession: body.profession || null,
        level: body.level,
        power: body.power,
        intro: body.intro || null,
        isPublic: body.isPublic ?? true,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("PUT /api/admin/members/[id] error:", error);
    return NextResponse.json({ error: "更新成员失败" }, { status: 500 });
  }
}

// DELETE — 删除成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;
    await prisma.member.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/members/[id] error:", error);
    return NextResponse.json({ error: "删除成员失败" }, { status: 500 });
  }
}
