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
import { ArrowRight, PawPrint, Mail, Heart, Sparkles } from "lucide-react";
import { ContactDialog } from "@/components/contact-dialog";
import { DouyinEmbed } from "@/components/douyin-embed";
import { BlessingRain } from "@/components/blessing-rain";
import { HeroParticles } from "@/components/hero-particles";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TiltCard } from "@/components/tilt-card";
import { MagneticButton } from "@/components/magnetic-button";
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
    fetch("/api/members?pageSize=12")
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
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
        {/* 背景装饰 */}
        <div className="absolute inset-0 gradient-hero" />
        {/* 大圆形光晕 — 视差位移效果 */}
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          style={{ animation: "orb-drift-1 16s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          style={{ animation: "orb-drift-2 20s ease-in-out infinite" }}
        />

        {/* 浮动粒子 */}
        <HeroParticles count={32} />

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
            {/* 悬浮光晕 */}
            <div className="absolute inset-0 rounded-full bg-primary/0 group-hover/cat:bg-primary/10 blur-md transition-all duration-500" style={{ transform: "scale(1.6)" }} />
            <Avatar
              className="ring-2 ring-primary/20 shadow-lg transition-all duration-300 group-hover/cat:ring-primary group-hover/cat:ring-4 group-hover/cat:shadow-xl group-hover/cat:shadow-primary/30 group-hover/cat:scale-125"
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

        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 relative z-10 w-full">
          <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-1.5 text-sm bg-primary/5">
              <PawPrint className="size-4 text-primary" />
              <span className="text-muted-foreground text-sm">
                小猫来信 · 百业
                {homeError && " · 成员数据加载失败"}
              </span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              小猫来信
              <br />
              <span className="text-primary text-glow-strong">
                温暖每一个角落
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
              每一只猫咪都有它独一无二的故事。联系大猫，加入我们的百业大家庭。
            </p>

            {/* 按钮组 */}
            <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
              <MagneticButton>
                <Button size="lg" asChild className="rounded-full px-8 h-12 text-base">
                  <Link href="/members">
                    认识猫咪们 <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <ContactDialog
                  trigger={
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full px-8 h-12 text-base"
                    >
                      <Mail className="size-4" />
                      投递来信
                    </Button>
                  }
                />
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* 底部渐隐 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ============================================
          百业风采 — 抖音视频展示
          ============================================ */}
      <section className="relative overflow-hidden border-t border-border/30 bg-card/10 section-py">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl"
          style={{ animation: "orb-drift-3 15s ease-in-out infinite" }}
        />
        <div className="mx-auto max-w-2xl px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center section-header">
              <span className="section-label">
                <Sparkles className="size-3.5" />
                社区风采
              </span>
              <h2 className="text-3xl font-bold tracking-tight">百业风采</h2>
              <p className="body-text-sm mt-3">
                小猫来信诚招爱打百业战的小猫！
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* 视频卡片 — 独立宽容器 */}
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <DouyinEmbed shortUrl={DOUYIN_URL} />
          <p className="text-center text-sm text-muted-foreground/70 mt-5">
            六级金戈帮 · 周本不牢氛围超好 · 刀房常有 · 不定期团建活动
          </p>
        </div>
      </section>

      {/* ============================================
          特色卡片
          ============================================ */}
      <section className="section-py">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="text-center section-header">
              <span className="section-label">为什么选择我们</span>
              <h2 className="text-3xl font-bold tracking-tight">小猫来信社区</h2>
              <p className="body-text-sm mt-3 max-w-lg mx-auto">
                一个温暖、友爱的猫咪社区，每一只猫都是独一无二的家人。
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* 猫咪成员 */}
            <ScrollReveal>
              <TiltCard maxTilt={6}>
                <Link href="/members">
                  <Card className="gradient-card glass border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                    <CardHeader className="p-6 sm:p-8">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                        <PawPrint className="size-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl mb-2">猫咪成员</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        来自五湖四海的猫咪伙伴，每一只都有独特的性格与故事，等你来认识。
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </TiltCard>
            </ScrollReveal>

            {/* 联系大猫 */}
            <ScrollReveal>
              <TiltCard maxTilt={6}>
                <Card
                  className="gradient-card glass border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full"
                  onClick={() => setDialogOpen(true)}
                >
                  <CardHeader className="p-6 sm:p-8">
                    <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                      <Mail className="size-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl mb-2">联系大猫</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      添加大猫微信或QQ，了解更多百业信息，加入我们的大家庭。
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TiltCard>
            </ScrollReveal>

            {/* 温暖社区 */}
            <ScrollReveal>
              <TiltCard maxTilt={6}>
                <Card
                  className="gradient-card glass border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full"
                  onClick={() => setBlessingActive(true)}
                >
                  <CardHeader className="p-6 sm:p-8">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <Heart className="size-6 text-primary fill-primary/20" />
                    </div>
                    <CardTitle className="text-xl mb-2">温暖社区</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      互帮互助，分享养猫心得。在这个社区，你永远不会是一只孤单的猫。
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TiltCard>
            </ScrollReveal>
          </div>
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
      <section className="relative overflow-hidden border-t border-border/30 bg-card/10 section-py-sm">
        <div
          className="absolute -top-40 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          style={{ animation: "orb-drift-1 14s ease-in-out infinite" }}
        />
        <div className="mx-auto max-w-2xl px-6 text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              准备好加入我们了吗？
            </h2>
            <p className="body-text mt-3 mb-8">
              无论你是铲屎官还是云吸猫爱好者，这里总有你的位置。
            </p>
            <MagneticButton>
              <ContactDialog
                trigger={
                  <Button size="lg" className="rounded-full px-10 h-12 text-base">
                    <Mail className="size-4" />
                    联系大猫 <ArrowRight className="size-4" />
                  </Button>
                }
              />
            </MagneticButton>
          </ScrollReveal>
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
