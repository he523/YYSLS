import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* 侧边栏 */}
      <aside className="w-56 border-r bg-muted/20 hidden md:block shrink-0">
        <nav className="flex flex-col gap-1 p-4">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            管理面板
          </div>
          <Button variant="ghost" size="sm" className="justify-start" asChild>
            <Link href="/admin/dashboard">
              <LayoutDashboard className="size-4" />
              仪表盘
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" asChild>
            <Link href="/admin/members">
              <Users className="size-4" />
              成员管理
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" asChild>
            <Link href="/admin/applications">
              <FileText className="size-4" />
              申请审批
            </Link>
          </Button>

          <div className="mt-auto pt-4 border-t">
            <SignOutButton />
          </div>
        </nav>
      </aside>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <nav className="flex items-center justify-around h-14">
          <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-1 gap-0.5">
            <Link href="/admin/dashboard">
              <LayoutDashboard className="size-4" />
              <span className="text-[10px]">仪表盘</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-1 gap-0.5">
            <Link href="/admin/members">
              <Users className="size-4" />
              <span className="text-[10px]">成员</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="flex-col h-auto py-1 gap-0.5">
            <Link href="/admin/applications">
              <FileText className="size-4" />
              <span className="text-[10px]">申请</span>
            </Link>
          </Button>
          <SignOutButton />
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 pb-14 md:pb-0">
        {children}
      </div>
    </div>
  );
}
