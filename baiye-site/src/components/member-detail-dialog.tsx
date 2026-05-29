"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

// ============================================
// 共享常量和类型
// ============================================

export const GAME_IMAGE_DEFAULT = "/uploads/game/default.jpg";

export const ROLE_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  猫老大: "default",
  大猫: "destructive",
  橘猫: "secondary",
  小猫咪: "outline",
};

export interface Member {
  id: string;
  nickname: string;
  role: string;
  profession: string | null;
  level: number;
  power: number;
  intro: string | null;
  avatar: string | null;
  gameImage: string | null;
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

// ============================================
// 成员详情弹窗
// ============================================

interface MemberDetailDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailDialog({
  member,
  open,
  onOpenChange,
}: MemberDetailDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogTitle className="sr-only">
          {member.nickname} 的少冬瓜详情
        </DialogTitle>
        <DialogDescription className="sr-only">
          {member.nickname}的角色卡，等级 {member.level}，喵力值 {member.power}，角色 {member.role}{member.profession ? `，职业 ${member.profession}` : ""}{member.intro ? `，简介：${member.intro}` : ""}
        </DialogDescription>
        <div className="relative flex flex-col items-center pt-10 pb-8 px-6">
          {/* 角色图片 */}
          <div className="relative w-full max-w-xs mx-auto animate-in fade-in zoom-in-95 duration-500 aspect-[3/4] max-h-[55vh]">
            <Image
              src={member.gameImage || GAME_IMAGE_DEFAULT}
              alt={member.nickname}
              fill
              className="object-contain rounded-xl shadow-2xl"
              unoptimized={!!member.gameImage}
            />

            {/* 昵称 — 顶部中央 */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-in slide-in-from-top-4 fade-in duration-300 delay-150 z-10">
              <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                {member.nickname}
              </span>
            </div>

            {/* 等级 — 左上 */}
            <div className="absolute top-6 -left-5 animate-in slide-in-from-left-4 fade-in duration-300 delay-300 z-10">
              <span className="inline-block px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                Lv.{member.level}
              </span>
            </div>

            {/* 喵力值 — 右上 */}
            <div className="absolute top-6 -right-5 animate-in slide-in-from-right-4 fade-in duration-300 delay-300 z-10">
              <span className="inline-block px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                喵力 {member.power.toLocaleString()}
              </span>
            </div>

            {/* 角色 — 左下 */}
            <div className="absolute bottom-10 -left-5 animate-in slide-in-from-left-4 fade-in duration-300 delay-500 z-10">
              <Badge
                variant={ROLE_COLORS[member.role] || "outline"}
                className="shadow-lg"
              >
                {member.role}
              </Badge>
            </div>

            {/* 标签 — 右下 */}
            {member.profession && (
              <div className="absolute bottom-10 -right-5 animate-in slide-in-from-right-4 fade-in duration-300 delay-500 z-10">
                <Badge variant="secondary" className="shadow-lg">
                  {member.profession}
                </Badge>
              </div>
            )}
          </div>

          {/* 简介 — 底部 */}
          {member.intro && (
            <div className="mt-8 text-center max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300 delay-700">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                「{member.intro}」
              </p>
            </div>
          )}

          {/* 头像小标识 */}
          <div className="mt-6 flex items-center gap-2 animate-in fade-in duration-300 delay-700">
            <Avatar className="size-8 ring-2 ring-primary/20">
              <AvatarImage src={member.avatar || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(member.nickname)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">猫咪头像</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
