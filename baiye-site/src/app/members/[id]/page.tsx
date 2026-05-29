import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  PawPrint,
  Star,
  TrendingUp,
  Calendar,
  Heart,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ROLE_COLORS } from "@/components/member-detail-dialog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id, isPublic: true },
    select: { nickname: true, intro: true, role: true },
  });

  if (!member) {
    return { title: "成员不存在 · 小猫来信" };
  }

  return {
    title: `${member.nickname} · 小猫来信百业`,
    description: member.intro || `${member.nickname} — ${member.role}，小猫来信百业成员`,
  };
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id, isPublic: true },
  });

  if (!member) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/members">
          <ArrowLeft className="size-4" />
          返回猫咪列表
        </Link>
      </Button>

      <Card className="gradient-card border-border/50 overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

        <CardHeader className="text-center pb-4 pt-8">
          <Avatar className="size-24 mx-auto mb-4 ring-4 ring-primary/20">
            <AvatarImage src={member.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {member.nickname.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-center gap-2">
            <PawPrint className="size-5 text-primary" />
            <CardTitle className="text-2xl">{member.nickname}</CardTitle>
            <Badge
              variant={ROLE_COLORS[member.role] || "outline"}
              className="ml-1"
            >
              {member.role}
            </Badge>
          </div>
          {member.profession && (
            <CardDescription className="text-base mt-1">
              🏷️ {member.profession}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {member.intro && (
            <p className="text-center text-muted-foreground italic leading-relaxed">
              「{member.intro}」
            </p>
          )}

          <Separator className="bg-border/50" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="space-y-1 p-3 rounded-lg bg-muted/30">
              <TrendingUp className="size-4 mx-auto text-primary" />
              <div className="text-lg font-semibold">{member.level}</div>
              <div className="text-xs text-muted-foreground">等级</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/30">
              <Star className="size-4 mx-auto text-accent" />
              <div className="text-lg font-semibold">
                {member.power.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">喵力值</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/30">
              <PawPrint className="size-4 mx-auto text-primary" />
              <div className="text-lg font-semibold">{member.role}</div>
              <div className="text-xs text-muted-foreground">职位</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/30">
              <Calendar className="size-4 mx-auto text-primary" />
              <div className="text-lg font-semibold">
                {member.createdAt.toLocaleDateString("zh-CN")}
              </div>
              <div className="text-xs text-muted-foreground">加入日期</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2">
            <Heart className="size-3 text-accent fill-accent" />
            <span>小猫来信百业成员</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
