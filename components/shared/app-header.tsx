"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  Activity,
  Utensils,
  Scale,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { signOutAction } from "@/actions/auth.actions";

interface AppHeaderProps {
  userEmail?: string | null;
  fullName?: string | null;
}

export function AppHeader({ userEmail, fullName }: AppHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/activities", label: "Activités", icon: Activity },
    { href: "/nutrition", label: "Nutrition", icon: Utensils },
    { href: "/weight", label: "Poids", icon: Scale },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <Flame className="h-5 w-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Metrik
            </span>
          </Link>

          {/* Liens de navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1">
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
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Infos utilisateur & déconnexion */}
          <div className="flex items-center gap-2 pl-2 border-l border-border/60">
            <Link href="/profile" className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                {fullName || userEmail?.split("@")[0] || "Mon Profil"}
              </div>
              <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {userEmail}
              </div>
            </Link>

            <form action={signOutAction}>
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                title="Déconnexion"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
