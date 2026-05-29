import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Shield, Search, ChevronRight } from "lucide-react";

// TODO: 后续替换为数据库查询
const ROLES = ["会长", "副会长", "精英", "成员"] as const;
const PROFESSIONS = ["侠客", "商人", "医生", "匠人", "盗贼", "乐师", "画师", "书生"] as const;

const MOCK_MEMBERS = [
  { id: "1", nickname: "云中鹤", role: "会长", profession: "侠客", level: 80, power: 158000, intro: "百业之主，仗剑天涯", avatar: null },
  { id: "2", nickname: "霜月影", role: "副会长", profession: "乐师", level: 75, power: 142000, intro: "一曲肝肠断，天涯何处觅知音", avatar: null },
  { id: "3", nickname: "铁骨铮铮", role: "精英", profession: "匠人", level: 72, power: 135000, intro: "千锤百炼，方成神兵", avatar: null },
  { id: "4", nickname: "妙手仁心", role: "精英", profession: "医生", level: 70, power: 128000, intro: "悬壶济世，医者仁心", avatar: null },
  { id: "5", nickname: "夜行客", role: "成员", profession: "盗贼", level: 68, power: 120000, intro: "月黑风高夜，最是出手时", avatar: null },
  { id: "6", nickname: "墨染青衫", role: "成员", profession: "书生", level: 65, power: 115000, intro: "腹有诗书气自华", avatar: null },
  { id: "7", nickname: "丹青妙手", role: "成员", profession: "画师", level: 63, power: 110000, intro: "一笔一世界", avatar: null },
  { id: "8", nickname: "金银满屋", role: "成员", profession: "商人", level: 60, power: 105000, intro: "通商天下，富甲一方", avatar: null },
];

// 职位与职业对应的徽章颜色
const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "会长": "default",
  "副会长": "destructive",
  "精英": "secondary",
  "成员": "outline",
};

function getInitials(name: string) {
  return name.slice(0, 2);
}

export default function MembersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">百业成员</h1>
        <p className="text-muted-foreground mt-1">
          共 {MOCK_MEMBERS.length} 位同袍
        </p>
      </div>

      {/* 筛选栏（展示用，后续接真实逻辑） */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="default" className="cursor-pointer">全部</Badge>
        {ROLES.map(role => (
          <Badge key={role} variant="outline" className="cursor-pointer hover:bg-accent">
            {role}
          </Badge>
        ))}
      </div>

      {/* 成员列表 */}
      {MOCK_MEMBERS.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无成员
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_MEMBERS.map(member => (
            <Link key={member.id} href={`/members/${member.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(member.nickname)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-1">
                          {member.nickname}
                          <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Lv.{member.level} · 战力 {member.power.toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={ROLE_COLORS[member.role] || "outline"}>
                      {member.role}
                    </Badge>
                  </div>
                </CardHeader>
                {member.intro && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{member.intro}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
