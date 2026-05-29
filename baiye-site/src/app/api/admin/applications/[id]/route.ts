import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "未授权" }, { status: 401 });
}

// PUT — 审批申请（通过/拒绝）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await request.json();

    if (!["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "无效的状态" },
        { status: 400 }
      );
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        reviewedAt: new Date(),
        reviewedBy: session.user?.name || null,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("PUT /api/admin/applications/[id] error:", error);
    return NextResponse.json({ error: "审批失败" }, { status: 500 });
  }
}
