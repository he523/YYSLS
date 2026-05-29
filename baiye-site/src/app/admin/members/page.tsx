"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  nickname: string;
  role: string;
  profession: string | null;
  level: number;
  power: number;
  intro: string | null;
  isPublic: boolean;
}

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "会长": "default",
  "副会长": "destructive",
  "精英": "secondary",
  "成员": "outline",
};

const ROLES = ["会长", "副会长", "精英", "成员"];
const PROFESSIONS = ["侠客", "商人", "医生", "匠人", "盗贼", "乐师", "画师", "书生"];

const EMPTY_MEMBER = {
  nickname: "",
  role: "成员",
  profession: "",
  level: 1,
  power: 0,
  intro: "",
  isPublic: true,
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_MEMBER);
  const [saving, setSaving] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members");
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch {
      // 后端未就绪时不报错
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_MEMBER);
    setDialogOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditingId(member.id);
    setForm({
      nickname: member.nickname,
      role: member.role,
      profession: member.profession || "",
      level: member.level,
      power: member.power,
      intro: member.intro || "",
      isPublic: member.isPublic,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nickname.trim()) {
      toast.error("请填写昵称");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/members/${editingId}`
        : "/api/admin/members";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "操作失败");
      }

      toast.success(editingId ? "成员已更新" : "成员已添加");
      setDialogOpen(false);
      fetchMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该成员？")) return;

    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      toast.success("成员已删除");
      fetchMembers();
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">成员管理</h1>
          <p className="text-muted-foreground text-sm mt-1">
            共 {members.length} 位成员
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          添加成员
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无成员，点击上方按钮添加
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>昵称</TableHead>
                <TableHead>职位</TableHead>
                <TableHead>职业</TableHead>
                <TableHead>等级</TableHead>
                <TableHead>战力</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-xs">
                          {member.nickname.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {member.nickname}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_COLORS[member.role] || "outline"}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.profession || "-"}
                  </TableCell>
                  <TableCell>{member.level}</TableCell>
                  <TableCell>{member.power.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(member)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑成员" : "添加成员"}</DialogTitle>
            <DialogDescription>
              {editingId ? "修改成员信息" : "添加一位新的百业成员"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>昵称 *</Label>
              <Input
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                placeholder="成员昵称"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>职位</Label>
                <Select
                  value={form.role}
                  onValueChange={v => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>职业</Label>
                <Select
                  value={form.profession}
                  onValueChange={v => setForm({ ...form, profession: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择职业" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>等级</Label>
                <Input
                  type="number"
                  value={form.level}
                  onChange={e => setForm({ ...form, level: +e.target.value || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>战力</Label>
                <Input
                  type="number"
                  value={form.power}
                  onChange={e => setForm({ ...form, power: +e.target.value || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea
                value={form.intro}
                onChange={e => setForm({ ...form, intro: e.target.value })}
                placeholder="一句话简介"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingId ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
