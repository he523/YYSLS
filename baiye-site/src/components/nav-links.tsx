"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Users, Mail } from "lucide-react";
import { ContactDialog } from "@/components/contact-dialog";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/members", label: "猫咪成员", icon: Users },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            asChild
            className={`relative transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link href={href}>
              <Icon className="size-4" />
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          </Button>
        );
      })}
      <ContactDialog
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Mail className="size-4" />
            投递来信
          </Button>
        }
      />
    </nav>
  );
}
