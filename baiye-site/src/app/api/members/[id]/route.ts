import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
