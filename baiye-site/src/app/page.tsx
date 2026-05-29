import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Swords, Star, ArrowRight, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
              <Shield className="size-4 text-primary" />
              燕云十六声 · 百业
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              江湖路远
              <span className="text-primary">幸与君同</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              百业汇聚，共赴江湖。在这里找到志同道合的伙伴，一起闯荡燕云世界。
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/members">
                  查看成员 <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/apply">申请加入</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 特色卡片 */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="size-8 text-primary mb-2" />
              <CardTitle>精英汇聚</CardTitle>
              <CardDescription>
                来自五湖四海的侠客，不同职业身份，各怀绝技。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Swords className="size-8 text-primary mb-2" />
              <CardTitle>仗剑同行</CardTitle>
              <CardDescription>
                组队副本、百业任务、世界 Boss，同袍并肩作战。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Star className="size-8 text-primary mb-2" />
              <CardTitle>十六行当</CardTitle>
              <CardDescription>
                侠客、商人、医者、匠人……十六种身份，各展所长。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 快速入口 */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">加入我们的百业</h2>
              <p className="text-sm text-muted-foreground mt-1">
                无论你是独行侠还是军团领袖，总有一个位置等你。
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/apply">
                立即申请 <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
