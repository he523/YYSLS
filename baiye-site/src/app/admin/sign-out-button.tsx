"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="justify-start text-muted-foreground md:w-full"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
    >
      <LogOut className="size-4" />
      <span className="hidden md:inline">退出登录</span>
    </Button>
  );
}
