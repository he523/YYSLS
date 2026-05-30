"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";

// ============================================
// 常量
// ============================================

export const ROLES = [
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

export const CAT_TAGS = [
  "铲屎官",
  "猫粮官",
  "摄影师",
  "云吸猫",
  "救助者",
  "繁育者",
  "猫奴",
  "野猫派",
] as const;

export const AVATARS = [
  { path: "/avatars/cat-orange.svg", label: "橘猫" },
  { path: "/avatars/cat-black.svg", label: "黑猫" },
  { path: "/avatars/cat-white.svg", label: "白猫" },
  { path: "/avatars/cat-gray.svg", label: "灰猫" },
  { path: "/avatars/cat-calico.svg", label: "三花" },
  { path: "/avatars/cat-tabby.svg", label: "虎斑" },
  { path: "/avatars/cat-tuxedo.svg", label: "奶牛" },
  { path: "/avatars/cat-siamese.svg", label: "暹罗" },
];

export const EMPTY_FORM = {
  nickname: "",
  role: "小猫咪",
  profession: "",
  level: 1,
  power: 0,
  intro: "",
  avatar: "/avatars/cat-orange.svg",
  gameImage: "",
};

export type MemberFormData = typeof EMPTY_FORM;

// ============================================
// 组件
// ============================================

interface MemberFormFieldsProps {
  form: MemberFormData;
  onChange: (updater: (prev: MemberFormData) => MemberFormData) => void;
  uploading: boolean;
  uploadingGame: boolean;
  onTriggerAvatarUpload: () => void;
  onTriggerGameUpload: () => void;
}

export function MemberFormFields({
  form,
  onChange,
  uploading,
  uploadingGame,
  onTriggerAvatarUpload,
  onTriggerGameUpload,
}: MemberFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>昵称 *</Label>
        <Input
          value={form.nickname}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, nickname: e.target.value }))
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
              onChange((prev) => ({ ...prev, role: v }))
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
              onChange((prev) => ({ ...prev, profession: v }))
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
              onChange((prev) => ({ ...prev, level: Number(e.target.value) || 1 }))
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
              onChange((prev) => ({ ...prev, power: Number(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>简介</Label>
        <Textarea
          value={form.intro}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, intro: e.target.value }))
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
              onClick={() => onChange((prev) => ({ ...prev, avatar: a.path }))}
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
            onClick={onTriggerAvatarUpload}
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
                onClick={() => onChange((prev) => ({ ...prev, gameImage: "" }))}
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
            onClick={onTriggerGameUpload}
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
  );
}
