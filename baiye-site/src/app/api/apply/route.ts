import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applySchema = z.object({
  applicantName: z.string().min(1, "请填写昵称"),
  contactInfo: z.string().min(1, "请填写联系方式"),
  reason: z.string().min(1, "请填写申请理由"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: parsed.data,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/apply error:", error);
    return NextResponse.json(
      { error: "提交失败，请稍后重试" },
      { status: 500 }
    );
  }
}
