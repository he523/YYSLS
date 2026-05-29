import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield, Swords, TrendingUp, Calendar } from "lucide-react";

// TODO: 替换为数据库查询
const MOCK_MEMBERS: Record<string, {
  id: string; nickname: string; role: string; profession: string | null;
  level: number; power: number; intro: string | null; avatar: string | null;
  joinDate: string;
}> = {
  "1": { id: "1", nickname: "云中鹤", role: "会长", profession: "侠客", level: 80, power: 158000, intro: "百业之主，仗剑天涯。江湖路远，与诸君共勉。", avatar: null, joinDate: "2024-01-15" },
  "2": { id: "2", nickname: "霜月影", role: "副会长", profession: "乐师", level: 75, power: 142000, intro: "一曲肝肠断，天涯何处觅知音", avatar: null, joinDate: "2024-02-20" },
  "3": { id: "3", nickname: "铁骨铮铮", role: "精英", profession: "匠人", level: 72, power: 135000, intro: "千锤百炼，方成神兵", avatar: null, joinDate: "2024-03-10" },
  "4": { id: "4", nickname: "妙手仁心", role: "精英", profession: "医生", level: 70, power: 128000, intro: "悬壶济世，医者仁心", avatar: null, joinDate: "2024-03-15" },
  "5": { id: "5", nickname: "夜行客", role: "成员", profession: "盗贼", level: 68, power: 120000, intro: "月黑风高夜，最是出手时", avatar: null, joinDate: "2024-04-01" },
  "6": { id: "6", nickname: "墨染青衫", role: "成员", profession: "书生", level: 65, power: 115000, intro: "腹有诗书气自华", avatar: null, joinDate: "2024-04-20" },
  "7": { id: "7", nickname: "丹青妙手", role: "成员", profession: "画师", level: 63, power: 110000, intro: "一笔一世界", avatar: null, joinDate: "2024-05-05" },
  "8": { id: "8", nickname: "金银满屋", role: "成员", profession: "商人", level: 60, power: 105000, intro: "通商天下，富甲一方", avatar: null, joinDate: "2024-05-18" },
};

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "会长": "default",
  "副会长": "destructive",
  "精英": "secondary",
  "成员": "outline",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = MOCK_MEMBERS[id];

  if (!member) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/members">
          <ArrowLeft className="size-4" />
          返回成员列表
        </Link>
      </Button>

      <Card>
        <CardHeader className="text-center pb-4">
          <Avatar className="size-24 mx-auto mb-4">
            <AvatarImage src={member.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {member.nickname.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl">{member.nickname}</CardTitle>
            <Badge variant={ROLE_COLORS[member.role] || "outline"}>
              {member.role}
            </Badge>
          </div>
          {member.profession && (
            <CardDescription className="text-base mt-1">
              {member.profession}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {member.intro && (
            <p className="text-center text-muted-foreground italic">
              「{member.intro}」
            </p>
          )}

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <TrendingUp className="size-4 mx-auto text-muted-foreground" />
              <div className="text-lg font-semibold">{member.level}</div>
              <div className="text-xs text-muted-foreground">等级</div>
            </div>
            <div className="space-y-1">
              <Swords className="size-4 mx-auto text-muted-foreground" />
              <div className="text-lg font-semibold">{member.power.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">战力</div>
            </div>
            <div className="space-y-1">
              <Shield className="size-4 mx-auto text-muted-foreground" />
              <div className="text-lg font-semibold">{member.role}</div>
              <div className="text-xs text-muted-foreground">职位</div>
            </div>
            <div className="space-y-1">
              <Calendar className="size-4 mx-auto text-muted-foreground" />
              <div className="text-lg font-semibold">{member.joinDate}</div>
              <div className="text-xs text-muted-foreground">加入日期</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
