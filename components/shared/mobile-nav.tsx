"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Utensils,
  Scale,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
    { href: "/activities", label: "Sport", icon: Activity },
    { href: "/nutrition", label: "Repas", icon: Utensils },
    { href: "/weight", label: "Poids", icon: Scale },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-border/60 bg-background/95 backdrop-blur-md px-2 md:hidden">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] tracking-tight">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
