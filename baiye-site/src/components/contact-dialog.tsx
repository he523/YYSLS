"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint, Copy, Check, Mail, Pencil, X } from "lucide-react";

// ============================================
// 大猫联系方式 — 默认值（运行时可在弹窗内编辑）
// ============================================
const DEFAULT_CONTACT_INFO = {
  wechat: "LittleCat_Letter",
  qq: "123456789",
  douyin: "小猫来信",
  message: "加好友请备注「小猫来信百业」喵~",
};

type FieldKey = "wechat" | "qq" | "douyin";

export function ContactDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const handleOpenChange = (open: boolean) => {
    if (!isControlled) setInternalOpen(open);
    controlledOnOpenChange?.(open);
  };
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // 可编辑的联系方式
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_INFO);
  const [editing, setEditing] = useState<FieldKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 仅在客户端挂载后才渲染 Dialog（避免 Radix Portal SSR 水合不匹配）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 进入编辑模式时自动聚焦输入框
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const startEdit = (key: FieldKey) => {
    setEditValue(contactInfo[key]);
    setEditing(key);
  };

  const saveEdit = () => {
    if (editing) {
      setContactInfo((prev) => ({ ...prev, [editing]: editValue }));
      setEditing(null);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // SSR 阶段只渲染触发按钮，避免 Portal 水合不匹配
  if (!mounted) {
    // 受控模式：无 trigger 时渲染空
    if (!trigger) return null;
    return <>{trigger}</>;
  }

  // 渲染单个联系方式行
  const renderContactRow = (
    key: FieldKey,
    label: string,
    colorClass: string,
  ) => {
    const isEditing = editing === key;

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`size-9 rounded-full ${colorClass} flex items-center justify-center shrink-0`}
          >
            <Mail className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="h-7 text-sm font-mono mt-0.5"
              />
            ) : (
              <div className="font-mono text-sm font-medium truncate">
                {contactInfo[key]}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="size-8 p-0"
                onClick={saveEdit}
              >
                <Check className="size-3.5 text-green-400" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="size-8 p-0"
                onClick={cancelEdit}
              >
                <X className="size-3.5 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="size-8 p-0"
                onClick={() => startEdit(key)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="size-8 p-0"
                onClick={() =>
                  copyToClipboard(contactInfo[key], key)
                }
              >
                {copied === key ? (
                  <Check className="size-3.5 text-green-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : null}
      <DialogContent className="gradient-card border-border/50 max-w-sm">
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-t-lg" />

        <DialogHeader className="text-center pt-4">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 mx-auto mb-2">
            <PawPrint className="size-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">联系大猫</DialogTitle>
          <DialogDescription>
            添加大猫好友，加入小猫来信百业
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {renderContactRow("wechat", "微信", "bg-green-500/10 [&_svg]:text-green-400")}
          {renderContactRow("qq", "QQ", "bg-blue-500/10 [&_svg]:text-blue-400")}
          {renderContactRow("douyin", "抖音", "bg-pink-500/10 [&_svg]:text-pink-400")}
        </div>

        <p className="text-center text-xs text-muted-foreground pt-1">
          {contactInfo.message}
        </p>
      </DialogContent>
    </Dialog>
  );
}
