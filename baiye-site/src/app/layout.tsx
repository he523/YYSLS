import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Link from "next/link";
import { Users, Home, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  title: "百业 · 燕云十六声",
  description: "燕云十六声百业成员展示与招募平台",
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
        {/* 导航栏 */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Shield className="size-5 text-primary" />
              <span>百业录</span>
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
                  成员
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/apply">
                  <FileText className="size-4" />
                  申请加入
                </Link>
              </Button>
            </nav>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">{children}</main>

        {/* 页脚 */}
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <div className="container mx-auto px-4">
            燕云十六声 · 百业录 — 江湖路远，幸与君同
          </div>
        </footer>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
