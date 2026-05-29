"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import {
  PawPrint,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  MemberDetailDialog,
  ROLE_COLORS,
  GAME_IMAGE_DEFAULT,
  type Member,
} from "@/components/member-detail-dialog";

// 猫咪主题角色
const ROLES = [
  "猫老大",
  "大猫",
  "橘猫",
  "小猫咪",
  "小奶猫",
  "喵星人",
  "猫护卫",
  "猫医官",
  "寻猫使",
  "猫掌柜",
] as const;

// 猫咪主题标签
const CAT_TAGS = [
  "铲屎官",
  "猫粮官",
  "摄影师",
  "云吸猫",
  "救助者",
  "繁育者",
  "猫奴",
  "野猫派",
] as const;

const AVATARS = [
  { path: "/avatars/cat-orange.svg", label: "橘猫" },
  { path: "/avatars/cat-black.svg", label: "黑猫" },
  { path: "/avatars/cat-white.svg", label: "白猫" },
  { path: "/avatars/cat-gray.svg", label: "灰猫" },
  { path: "/avatars/cat-calico.svg", label: "三花" },
  { path: "/avatars/cat-tabby.svg", label: "虎斑" },
  { path: "/avatars/cat-tuxedo.svg", label: "奶牛" },
  { path: "/avatars/cat-siamese.svg", label: "暹罗" },
];

const EMPTY_FORM = {
  nickname: "",
  role: "小猫咪",
  profession: "",
  level: 1,
  power: 0,
  intro: "",
  avatar: "/avatars/cat-orange.svg",
  gameImage: "",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 筛选状态
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterProfession, setFilterProfession] = useState<string | null>(null);

  // 添加弹窗状态
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // 编辑弹窗状态
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  // 详情弹窗
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // 少冬瓜图片上传
  const gameImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGame, setUploadingGame] = useState(false);

  // 删除弹窗状态
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMembers = useCallback(async (pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/members?page=${pageNum}&pageSize=12`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setMembers((prev) => [...prev, ...data.members]);
        } else {
          setMembers(data.members);
        }
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch {
      // API 不可用时保持空列表
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(1, false);
  }, [fetchMembers]);

  // 加载更多
  const handleLoadMore = () => {
    fetchMembers(page + 1, true);
  };

  // ====== 上传头像 ======
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "上传失败");
      }
      const { url } = await res.json();

      if (addOpen) {
        setForm((prev) => ({ ...prev, avatar: url }));
      } else if (editTarget) {
        setEditForm((prev) => ({ ...prev, avatar: url }));
      }

      toast.success("头像上传成功~ 📷");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ====== 少冬瓜图片上传 ======
  const handleGameImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGame(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "game");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "上传失败");
      }
      const { url } = await res.json();

      if (addOpen) {
        setForm((prev) => ({ ...prev, gameImage: url }));
      } else if (editTarget) {
        setEditForm((prev) => ({ ...prev, gameImage: url }));
      }

      toast.success("少冬瓜图片上传成功~ 🎮");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploadingGame(false);
      if (gameImageInputRef.current) gameImageInputRef.current.value = "";
    }
  };

  // ====== 添加 ======
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleSave = async () => {
    if (!form.nickname.trim()) {
      toast.error("请填写昵称喵~");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname.trim(),
          role: form.role,
          profession: form.profession || null,
          level: form.level,
          power: form.power,
          intro: form.intro.trim() || null,
          avatar: form.avatar || null,
          gameImage: form.gameImage || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "添加失败");
      }

      toast.success("新猫咪已加入百业！🐱");
      setAddOpen(false);
      fetchMembers(1, false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "添加失败，请稍后重试"
      );
    } finally {
      setSaving(false);
    }
  };

  // ====== 编辑 ======
  const openEdit = (member: Member, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(member);
    setEditForm({
      nickname: member.nickname,
      role: member.role,
      profession: member.profession || "",
      level: member.level,
      power: member.power,
      intro: member.intro || "",
      avatar: member.avatar || AVATARS[0].path,
      gameImage: member.gameImage || "",
    });
  };

  const handleUpdate = async () => {
    if (!editTarget || !editForm.nickname.trim()) {
      toast.error("请填写昵称喵~");
      return;
    }

    setEditing(true);
    try {
      const res = await fetch(`/api/members/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: editForm.nickname.trim(),
          role: editForm.role,
          profession: editForm.profession || null,
          level: editForm.level,
          power: editForm.power,
          intro: editForm.intro.trim() || null,
          avatar: editForm.avatar || null,
          gameImage: editForm.gameImage || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "编辑失败");
      }

      toast.success(`${editForm.nickname} 的资料已更新~ ✨`);
      setEditTarget(null);
      fetchMembers(1, false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "编辑失败，请稍后重试"
      );
    } finally {
      setEditing(false);
    }
  };

  // ====== 删除 ======
  const openDelete = (member: Member, e: React.MouseEvent) => {
    e.preventDefault(); // 阻止 Link 导航
    e.stopPropagation();
    setDeleteTarget(member);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/members/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }

      toast.success(`${deleteTarget.nickname} 已离开百业，有缘再见。`);
      setDeleteTarget(null);
      fetchMembers(1, false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "删除失败，请稍后重试"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PawPrint className="size-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">猫咪成员</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            共 {total} 只猫咪
            {(filterRole || filterProfession) && (
              <span className="text-primary ml-1">
                · 筛选「{[filterRole, filterProfession].filter(Boolean).join(" + ")}」
              </span>
            )}
          </p>
        </div>
        <Button onClick={openAdd} className="rounded-full">
          <Plus className="size-4" />
          添加猫咪
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={filterRole === null ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => setFilterRole(null)}
        >
          全部
          <span className="ml-1 text-[10px] opacity-70">({members.length})</span>
        </Badge>
        {ROLES.map((role) => {
          const count = members.filter((m) => m.role === role).length;
          return (
            <Badge
              key={role}
              variant={filterRole === role ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() =>
                setFilterRole((prev) => (prev === role ? null : role))
              }
            >
              {role}
              <span className="ml-1 text-[10px] opacity-70">({count})</span>
            </Badge>
          );
        })}
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={filterProfession === null ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-secondary/10 transition-colors"
          onClick={() => setFilterProfession(null)}
        >
          全部标签
          <span className="ml-1 text-[10px] opacity-70">({members.length})</span>
        </Badge>
        {CAT_TAGS.map((tag) => {
          const count = members.filter((m) => m.profession === tag).length;
          return (
            <Badge
              key={tag}
              variant={filterProfession === tag ? "secondary" : "outline"}
              className="cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() =>
                setFilterProfession((prev) => (prev === tag ? null : tag))
              }
            >
              {tag}
              <span className="ml-1 text-[10px] opacity-70">({count})</span>
            </Badge>
          );
        })}
      </div>

      {/* 成员列表 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          加载中...
        </div>
      ) : (() => {
        const filtered = members.filter((m) => {
          if (filterRole && m.role !== filterRole) return false;
          if (filterProfession && m.profession !== filterProfession) return false;
          return true;
        });

        if (filtered.length === 0) {
          const filterLabel = [filterRole, filterProfession].filter(Boolean).join(" + ");
          return (
            <Card className="gradient-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                {filterLabel
                  ? `暂无「${filterLabel}」的猫咪`
                  : "暂无猫咪成员，点击上方按钮添加第一只猫咪吧！"}
              </CardContent>
            </Card>
          );
        }

        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member) => (
            <div key={member.id} className="relative group/card">
              <div onClick={() => setSelectedMember(member)}>
                <Card className="h-full relative overflow-hidden aspect-[3/4] border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer group">
                  {/* 少冬瓜背景图 */}
                  <Image
                    src={member.gameImage || GAME_IMAGE_DEFAULT}
                    alt={member.nickname}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={!!member.gameImage}
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                  {/* 底部信息 */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="font-bold text-lg leading-tight drop-shadow-lg">
                          {member.nickname}
                        </h3>
                        <p className="text-xs text-white/80 mt-0.5">
                          Lv.{member.level} · 喵力值{" "}
                          {member.power.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={ROLE_COLORS[member.role] || "outline"}
                        className="shrink-0 bg-white/20 text-white border-white/30"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    {member.profession && (
                      <Badge
                        variant="secondary"
                        className="mt-2 text-xs bg-white/15 text-white/90 border-0"
                      >
                        {member.profession}
                      </Badge>
                    )}
                    {member.intro && (
                      <p className="text-xs text-white/70 mt-1.5 line-clamp-2 leading-snug">
                        {member.intro}
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* 编辑 & 删除按钮 — 悬浮在卡片右上角 */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={(e) => openEdit(member, e)}
                  title="编辑猫咪资料"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => openDelete(member, e)}
                  title="告别这只猫咪"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
          </div>
        );
      })()}

      {/* 加载更多按钮 */}
      {page < totalPages && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full px-8"
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                加载中...
              </>
            ) : (
              `加载更多 (${page}/${totalPages})`
            )}
          </Button>
        </div>
      )}

      {/* 添加猫咪弹窗 */}
      {mounted && (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新猫咪</DialogTitle>
              <DialogDescription>
                欢迎新的猫咪成员加入百业喵~
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>昵称 *</Label>
                <Input
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                  placeholder="猫咪的昵称"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>职位</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm({ ...form, role: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>标签</Label>
                  <Select
                    value={form.profession}
                    onValueChange={(v) =>
                      setForm({ ...form, profession: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择标签" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAT_TAGS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
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
                    min={1}
                    max={999}
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>喵力值</Label>
                  <Input
                    type="number"
                    min={0}
                    max={999999}
                    value={form.power}
                    onChange={(e) =>
                      setForm({ ...form, power: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>简介</Label>
                <Textarea
                  value={form.intro}
                  onChange={(e) =>
                    setForm({ ...form, intro: e.target.value })
                  }
                  placeholder="一句话介绍这只猫咪~"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>头像</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a.path}
                      type="button"
                      className={`size-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                        form.avatar === a.path
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setForm({ ...form, avatar: a.path })}
                      title={a.label}
                    >
                      <img
                        src={a.path}
                        alt={a.label}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}

                  {/* 自定义头像 */}
                  {!AVATARS.some((a) => a.path === form.avatar) && form.avatar && (
                    <button
                      type="button"
                      className="size-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 border-primary ring-2 ring-primary/30"
                      title="自定义头像"
                    >
                      <img
                        src={form.avatar}
                        alt="自定义"
                        className="size-full object-cover"
                      />
                    </button>
                  )}

                  {/* 上传按钮 */}
                  <button
                    type="button"
                    className="size-10 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center transition-all hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="上传自定义头像"
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>少冬瓜图片</Label>
                <div className="flex items-center gap-3">
                  {form.gameImage ? (
                    <div className="relative">
                      <img
                        src={form.gameImage}
                        alt="少冬瓜"
                        className="size-16 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs hover:bg-destructive/80"
                        onClick={() =>
                          setForm({ ...form, gameImage: "" })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="size-16 rounded-lg border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-xs text-muted-foreground">
                      未上传
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => gameImageInputRef.current?.click()}
                    disabled={uploadingGame}
                  >
                    {uploadingGame ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    <span className="ml-1">
                      {form.gameImage ? "更换" : "上传"}
                    </span>
                  </Button>
                  {!form.gameImage && (
                    <span className="text-xs text-muted-foreground">
                      默认使用通用少冬瓜形象
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={saving}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 编辑猫咪弹窗 */}
      {mounted && (
        <Dialog
          open={editTarget !== null}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑猫咪资料</DialogTitle>
              <DialogDescription>
                修改 {editTarget?.nickname} 的信息喵~
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>昵称 *</Label>
                <Input
                  value={editForm.nickname}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nickname: e.target.value })
                  }
                  placeholder="猫咪的昵称"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>职位</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(v) =>
                      setEditForm({ ...editForm, role: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>标签</Label>
                  <Select
                    value={editForm.profession}
                    onValueChange={(v) =>
                      setEditForm({ ...editForm, profession: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择标签" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAT_TAGS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
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
                    min={1}
                    max={999}
                    value={editForm.level}
                    onChange={(e) =>
                      setEditForm({ ...editForm, level: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>喵力值</Label>
                  <Input
                    type="number"
                    min={0}
                    max={999999}
                    value={editForm.power}
                    onChange={(e) =>
                      setEditForm({ ...editForm, power: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>简介</Label>
                <Textarea
                  value={editForm.intro}
                  onChange={(e) =>
                    setEditForm({ ...editForm, intro: e.target.value })
                  }
                  placeholder="一句话介绍这只猫咪~"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>头像</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a.path}
                      type="button"
                      className={`size-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                        editForm.avatar === a.path
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        setEditForm({ ...editForm, avatar: a.path })
                      }
                      title={a.label}
                    >
                      <img
                        src={a.path}
                        alt={a.label}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}

                  {/* 自定义头像 */}
                  {!AVATARS.some((a) => a.path === editForm.avatar) && editForm.avatar && (
                    <button
                      type="button"
                      className="size-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 border-primary ring-2 ring-primary/30"
                      title="自定义头像"
                    >
                      <img
                        src={editForm.avatar}
                        alt="自定义"
                        className="size-full object-cover"
                      />
                    </button>
                  )}

                  {/* 上传按钮 */}
                  <button
                    type="button"
                    className="size-10 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center transition-all hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="上传自定义头像"
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>少冬瓜图片</Label>
                <div className="flex items-center gap-3">
                  {editForm.gameImage ? (
                    <div className="relative">
                      <img
                        src={editForm.gameImage}
                        alt="少冬瓜"
                        className="size-16 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs hover:bg-destructive/80"
                        onClick={() =>
                          setEditForm({ ...editForm, gameImage: "" })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="size-16 rounded-lg border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-xs text-muted-foreground">
                      未上传
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => gameImageInputRef.current?.click()}
                    disabled={uploadingGame}
                  >
                    {uploadingGame ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    <span className="ml-1">
                      {editForm.gameImage ? "更换" : "上传"}
                    </span>
                  </Button>
                  {!editForm.gameImage && (
                    <span className="text-xs text-muted-foreground">
                      默认使用通用少冬瓜形象
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditTarget(null)}
                disabled={editing}
              >
                取消
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={editing}
                className="rounded-full"
              >
                {editing && <Loader2 className="size-4 animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 删除确认弹窗 */}
      {mounted && (
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-destructive/10 mx-auto mb-2">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <DialogTitle className="text-center">
                告别 {deleteTarget?.nickname}
              </DialogTitle>
              <DialogDescription className="text-center">
                此操作不可撤销，确定要让 {deleteTarget?.nickname} 离开百业吗？
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                确认告别
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 成员详情弹窗 */}
      {mounted && (
        <MemberDetailDialog
          member={selectedMember}
          open={selectedMember !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedMember(null);
          }}
        />
      )}

      {/* 隐藏的文件上传输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 少冬瓜图片上传输入 */}
      <input
        ref={gameImageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleGameImageChange}
      />
    </div>
  );
}
