import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "未授权" }, { status: 401 });
}

// GET — 获取所有申请
export async function GET() {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/admin/applications error:", error);
    return NextResponse.json({ error: "获取申请列表失败" }, { status: 500 });
  }
}
