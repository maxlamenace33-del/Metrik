import Link from "next/link";
import { Flame } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar épurée avec toggle de thème */}
      <header className="flex h-16 w-full items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <Flame className="h-4 w-4 fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Metrik
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Contenu centré */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        Metrik — Suivi de santé décomplexé & personnel
      </footer>
    </div>
  );
}
