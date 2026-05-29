import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Link from "next/link";
import { Users, Home, PawPrint, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "@/components/contact-dialog";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CopyrightYear } from "@/components/copyright-year";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "小猫来信 · 百业",
  description: "小猫来信百业成员展示与招募平台 — 每一只猫咪都有它的故事",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* 导航栏 — 深色毛玻璃 */}
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition-colors"
            >
              <PawPrint className="size-5 text-primary" />
              <span>小猫来信</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <Home className="size-4" />
                  首页
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/members">
                  <Users className="size-4" />
                  猫咪成员
                </Link>
              </Button>
              <ContactDialog
                trigger={
                  <Button variant="ghost" size="sm">
                    <Mail className="size-4" />
                    投递来信
                  </Button>
                }
              />
            </nav>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">{children}</main>

        {/* 页脚 */}
        <footer className="border-t border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-10">
            <div className="grid gap-8 sm:grid-cols-3">
              {/* 品牌 */}
              <div className="space-y-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <PawPrint className="size-5 text-primary" />
                  <h3 className="font-bold text-lg">小猫来信</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  每一只猫咪都有它的故事。
                  <br />
                  用信件连接彼此，温暖每一个角落。
                </p>
              </div>

              {/* 导航 */}
              <div className="space-y-3 text-center">
                <h4 className="font-semibold text-sm">快速导航</h4>
                <div className="flex flex-col gap-1.5">
                  <Link
                    href="/members"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    猫咪成员
                  </Link>
                  <ContactDialog
                    trigger={
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        联系大猫
                      </button>
                    }
                  />
                </div>
              </div>

              {/* 联系 */}
              <div className="space-y-3 text-center sm:text-right">
                <h4 className="font-semibold text-sm">小猫来信</h4>
                <p className="text-sm text-muted-foreground">
                  喵~ 欢迎加入我们的百业
                </p>
                <div className="flex items-center justify-center sm:justify-end gap-1 text-xs text-muted-foreground">
                  <Heart className="size-3 text-accent fill-accent" />
                  <span>用爱发电</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                &copy; <CopyrightYear /> 小猫来信 · 百业录 — 喵~
              </p>
            </div>
          </div>
        </footer>

        <Toaster position="top-center" richColors />
        <SmoothScroll />
      </body>
    </html>
  );
}
