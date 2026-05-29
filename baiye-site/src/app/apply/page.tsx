"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle } from "lucide-react";

export default function ApplyPage() {
  const [form, setForm] = useState({
    applicantName: "",
    contactInfo: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.applicantName.trim() || !form.contactInfo.trim() || !form.reason.trim()) {
      setError("请填写所有必填字段");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "提交失败");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8 space-y-4">
            <CheckCircle className="size-16 mx-auto text-green-500" />
            <CardTitle className="text-2xl">申请已提交</CardTitle>
            <CardDescription>
              我们会尽快审核你的申请，请留意联系方式的通知。
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">申请加入</h1>
        <p className="text-muted-foreground mt-1">
          填写以下信息，我们将尽快审核你的申请
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="applicantName">游戏昵称 *</Label>
              <Input
                id="applicantName"
                placeholder="你在燕云十六声中的角色名"
                value={form.applicantName}
                onChange={e => setForm({ ...form, applicantName: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">联系方式 *</Label>
              <Input
                id="contactInfo"
                placeholder="QQ / 微信 / 游戏ID"
                value={form.contactInfo}
                onChange={e => setForm({ ...form, contactInfo: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">申请理由 *</Label>
              <Textarea
                id="reason"
                placeholder="简单介绍一下自己，以及为什么想加入我们？"
                rows={4}
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  提交申请
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              提交后请耐心等待，我们会在 24 小时内处理
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
