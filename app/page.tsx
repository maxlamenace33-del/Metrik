import Link from "next/link";
import {
  Activity,
  Flame,
  Scale,
  Utensils,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function HomePage() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("example_anon_key")
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header de navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <Flame className="h-5 w-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Metrik
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              v1.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Connexion
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5">
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="h-3.5 w-3.5" />
            Tracking fitness, poids et nutrition sans abonnement freemium
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground max-w-3xl mx-auto leading-[1.15]">
            Reprenez le contrôle de votre forme{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              sans obsession
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fourchettes caloriques honnêtes basées sur la science métabolique,
            journal d’activités digne d’une plateforme haut de gamme, et zéro
            comptage d’ingrédients au gramme près.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 h-12 px-7 text-base">
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-7 text-base">
                Ouvrir le Dashboard
              </Button>
            </Link>
          </div>

          {/* Statut de la configuration Supabase */}
          <div className="mt-12 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 text-left shadow-sm">
            <div className="flex items-start gap-3">
              {isSupabaseConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-semibold text-foreground">
                  {isSupabaseConfigured
                    ? "Supabase configuré avec succès"
                    : "Configuration Supabase requise"}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {isSupabaseConfigured
                    ? "Votre application est connectée à votre instance Supabase."
                    : "Renseignez vos clés dans .env.local et exécutez le script SQL de DATABASE.md."}
                </div>
              </div>
            </div>
          </div>

          {/* Grille des fonctionnalités clés */}
          <div className="mt-20 grid gap-6 sm:grid-cols-3 text-left">
            <div className="card-hover-effect rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Dépenses sportives honnêtes
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Calcul dynamique par METs indexé sur votre dernier poids avec fourchette réaliste de ±10% pour vos matchs de padel, football, courses et séances.
              </p>
            </div>

            <div className="card-hover-effect rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Poids lissé sur 7 jours
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Moyenne mobile sur 7 jours pour absorber les fluctuations d’eau naturelles et suivre votre réelle tendance corporelle.
              </p>
            </div>

            <div className="card-hover-effect rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
                <Utensils className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Nutrition décomplexée
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Enregistrez un repas en 5 secondes avec une estimation globale. Fini de scanner des codes-barres ou de peser chaque ingrédient.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>Metrik — Conçu pour la performance et la sérénité. Open-source & personnel.</p>
      </footer>
    </div>
  );
}
