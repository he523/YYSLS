"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, PawPrint, Mail, Heart } from "lucide-react";
import { ContactDialog } from "@/components/contact-dialog";
import { DouyinEmbed } from "@/components/douyin-embed";
import { BlessingRain } from "@/components/blessing-rain";
import {
  MemberDetailDialog,
  type Member,
} from "@/components/member-detail-dialog";

const DOUYIN_URL = "https://v.douyin.com/Thsi-9TigM0/";

// 浮动猫咪的预设位置（相对于 hero section 的百分比）
const FLOAT_POSITIONS = [
  { left: 5,  top: 15 },  { left: 88, top: 12 },
  { left: 12, top: 55 },  { left: 92, top: 50 },
  { left: 8,  top: 80 },  { left: 85, top: 78 },
  { left: 25, top: 8 },   { left: 72, top: 6 },
  { left: 50, top: 5 },   { left: 35, top: 85 },
  { left: 65, top: 82 },  { left: 48, top: 88 },
];

// 随机打乱数组
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blessingActive, setBlessingActive] = useState(false);

  // 猫咪成员
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // 加载时获取成员列表
  const [homeError, setHomeError] = useState(false);
  useEffect(() => {
    fetch("/api/members?pageSize=50")
      .then((res) => {
        if (!res.ok) throw new Error("加载失败");
        return res.json();
      })
      .then((data: { members: Member[] }) => setAllMembers(data.members || []))
      .catch(() => setHomeError(true));
  }, []);

  // 随机选取 5~8 只猫咪 + 随机位置
  const floatingCats = useMemo(() => {
    if (allMembers.length === 0) return [];
    const count = Math.min(Math.max(5, Math.floor(allMembers.length * 0.6)), 8);
    const picked = shuffle(allMembers).slice(0, count);
    const positions = shuffle(FLOAT_POSITIONS).slice(0, count);
    return picked.map((member, i) => ({
      member,
      position: positions[i],
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 3,   // 3~5s
      size: Math.random() * 16 + 40,      // 40~56px
    }));
  }, [allMembers]);

  return (
    <div className="flex flex-col">
      {/* ============================================
          Hero 区域 — 全屏沉浸式
          ============================================ */}
      <section className="relative overflow-hidden min-h-[calc(100vh-3.5rem)] flex items-center">
        {/* 背景装饰 */}
        <div className="absolute inset-0 gradient-hero" />
        {/* 大圆形光晕 */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        {/* 浮动猫咪 */}
        {floatingCats.map(({ member, position, delay, duration, size }) => (
          <button
            key={member.id}
            className="absolute z-20 group/cat cursor-pointer"
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
              animation: `float-cat ${duration}s ease-in-out ${delay}s infinite`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMember(member);
            }}
            title={member.nickname}
          >
            <Avatar
              className="ring-2 ring-primary/20 shadow-lg transition-all duration-300 group-hover/cat:ring-primary group-hover/cat:ring-4 group-hover/cat:shadow-xl group-hover/cat:scale-125"
              style={{ width: size, height: size }}
            >
              <AvatarImage src={member.avatar || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {member.nickname.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* 悬浮昵称提示 */}
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap opacity-0 group-hover/cat:opacity-100 transition-opacity duration-200 pointer-events-none">
              {member.nickname}
            </span>
          </button>
        ))}

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-sm bg-primary/5">
              <PawPrint className="size-4 text-primary" />
              <span className="text-muted-foreground">
                小猫来信 · 百业
                {homeError && " · 成员数据加载失败"}
              </span>
            </div>

            {/* 主标题 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              小猫来信
              <br />
              <span className="text-primary text-glow">
                温暖每一个角落
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              每一只猫咪都有它独一无二的故事。
              <br />
              联系大猫，加入我们的百业大家庭。
            </p>

            {/* 按钮组 */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link href="/members">
                  认识猫咪们 <ArrowRight className="size-4" />
                </Link>
              </Button>
              <ContactDialog
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8"
                  >
                    <Mail className="size-4" />
                    投递来信
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* 底部渐隐 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ============================================
          百业风采 — 抖音视频展示
          ============================================ */}
      <section className="relative overflow-hidden border-t border-border/50 bg-card/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">百业风采</h2>
            <p className="text-muted-foreground mt-2">
              小猫来信诚招爱打百业战的小猫！
            </p>
          </div>

          {/* 视频卡片 — 页面内直接预览 */}
          <div className="max-w-3xl mx-auto">
            <DouyinEmbed shortUrl={DOUYIN_URL} />
            <p className="text-center text-xs text-muted-foreground mt-4">
              六级金戈帮 · 周本不牢氛围超好 · 刀房常有 · 不定期团建活动
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          特色卡片
          ============================================ */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">为什么选择小猫来信？</h2>
          <p className="text-muted-foreground mt-2">
            一个温暖、友爱的猫咪社区
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* 猫咪成员 — 跳转到成员列表页 */}
          <Link href="/members">
            <Card className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <PawPrint className="size-10 text-primary mb-3" />
                <CardTitle>猫咪成员</CardTitle>
                <CardDescription>
                  来自五湖四海的猫咪伙伴，每一只都有独特的性格与故事，等你来认识。
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* 联系大猫 — 点击打开联系弹窗 */}
          <Card
            className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <CardHeader>
              <Mail className="size-10 text-accent mb-3" />
              <CardTitle>联系大猫</CardTitle>
              <CardDescription>
                添加大猫微信或QQ，了解更多百业信息，加入我们的大家庭。
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 温暖社区 — 小彩蛋：点击触发祝福雨 */}
          <Card
            className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
            onClick={() => setBlessingActive(true)}
          >
            <CardHeader>
              <Heart className="size-10 text-primary mb-3 fill-primary/20" />
              <CardTitle>温暖社区</CardTitle>
              <CardDescription>
                互帮互助，分享养猫心得。在这个社区，你永远不会是一只孤单的猫。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 共享联系弹窗（受控模式） */}
        <ContactDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </section>

      {/* ============================================
          CTA 区域
          ============================================ */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold">加入小猫来信</h2>
              <p className="text-sm text-muted-foreground mt-1">
                无论你是铲屎官还是云吸猫爱好者，这里总有你的位置。
              </p>
            </div>
            <ContactDialog
              trigger={
                <Button size="lg" className="rounded-full">
                  <Mail className="size-4" />
                  联系大猫 <ArrowRight className="size-4" />
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* ============================================
          祝福雨彩蛋（温暖社区卡片触发）
          ============================================ */}
      <BlessingRain
        active={blessingActive}
        onComplete={() => setBlessingActive(false)}
      />

      {/* ============================================
          成员详情弹窗
          ============================================ */}
      <MemberDetailDialog
        member={selectedMember}
        open={selectedMember !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
      />

    </div>
  );
}
