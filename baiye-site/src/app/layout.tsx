import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Link from "next/link";
import { PawPrint, Heart } from "lucide-react";
import { ContactDialog } from "@/components/contact-dialog";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CopyrightYear } from "@/components/copyright-year";
import { BackgroundMusic } from "@/components/background-music";
import { CursorGlow } from "@/components/cursor-glow";
import { NoiseOverlay } from "@/components/noise-overlay";
import { NavLinks } from "@/components/nav-links";
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
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        {/* 全局动态光晕背景 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(244,164,96,0.08) 0%, transparent 70%)",
              top: "10%",
              left: "-5%",
              animation: "orb-drift-1 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,182,193,0.06) 0%, transparent 70%)",
              top: "50%",
              right: "-8%",
              animation: "orb-drift-2 22s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(244,164,96,0.05) 0%, transparent 70%)",
              bottom: "5%",
              left: "30%",
              animation: "orb-drift-3 20s ease-in-out infinite",
            }}
          />
        </div>

        {/* 导航栏 — 深色毛玻璃 */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground hover:text-primary transition-colors"
            >
              <PawPrint className="size-6 text-primary" />
              <span>小猫来信</span>
            </Link>
            <NavLinks />
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">{children}</main>

        {/* 页脚 — 两列大布局 */}
        <footer className="border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-12 sm:grid-cols-2">
              {/* 左：品牌 */}
              <div className="space-y-4">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                  <PawPrint className="size-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xl tracking-tight">小猫来信</span>
                </Link>
                <p className="body-text-sm max-w-sm">
                  每一只猫咪都有它独一无二的故事。用信件连接彼此，温暖每一个角落。
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Heart className="size-3.5 text-accent fill-accent" />
                  <span>用爱发电</span>
                </div>
              </div>

              {/* 右：导航 + 联系 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">导航</h4>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      首页
                    </Link>
                    <Link
                      href="/members"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      猫咪成员
                    </Link>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">联系</h4>
                  <div className="flex flex-col gap-2">
                    <ContactDialog
                      trigger={
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left">
                          联系大猫
                        </button>
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      喵~ 欢迎加入百业
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-border/30 text-center">
              <p className="text-xs text-muted-foreground/70">
                &copy; <CopyrightYear /> 小猫来信 · 百业录
              </p>
            </div>
          </div>
        </footer>

        <Toaster position="top-center" richColors />
        <SmoothScroll />
        <BackgroundMusic />
        <CursorGlow />
        <NoiseOverlay />
      </body>
    </html>
  );
}
