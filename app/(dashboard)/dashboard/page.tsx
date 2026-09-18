import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Flame,
  Scale,
  Activity as ActivityIcon,
  Utensils,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingDown,
  Calendar,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateMetabolicProfile, PAL_MULTIPLIERS } from "@/lib/calculations/bmr";
import { formatDuration, formatCaloriesRange } from "@/lib/utils";
import type { ActivityWithSport } from "@/types/domain";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Requêtes parallèles : profil, pesées, activités récentes
  const [{ data: profile }, { data: weightLogs }, { data: recentActivitiesRaw }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("weight_logs")
        .select("weight_kg, logged_at")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(7),
      supabase
        .from("activities")
        .select("*, sports(*)")
        .eq("user_id", user.id)
        .order("performed_at", { ascending: false })
        .limit(3),
    ]);

  const recentActivities = (recentActivitiesRaw || []) as unknown as ActivityWithSport[];

  const hasProfile = Boolean(
    profile?.height_cm && profile?.birth_date && profile?.current_weight_kg
  );

  const metabolic = hasProfile
    ? calculateMetabolicProfile(
        {
          weightKg: Number(profile!.current_weight_kg),
          heightCm: Number(profile!.height_cm),
          birthDate: profile!.birth_date!,
          gender: profile!.gender || "male",
        },
        profile!.base_activity_level || "sedentary"
      )
    : null;

  return (
    <div className="space-y-8">
      {/* Header Bienvenue */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Bonjour {profile?.full_name?.split(" ")[0] || "Athlète"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici votre tableau de bord santé et vos métriques du jour.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Mon Profil & BMR
            </Button>
          </Link>
          <Link href="/activities">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <ActivityIcon className="h-4 w-4" />
              Journal d&apos;activités
            </Button>
          </Link>
        </div>
      </div>

      {/* Bannière d'onboarding si le profil n'est pas encore complété */}
      {!hasProfile && (
        <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                Complétez votre profil métabolique
              </div>
              <p className="text-xs text-muted-foreground max-w-xl">
                Renseignez votre taille, date de naissance et poids pour calibrer la
                formule Mifflin-St Jeor et activer le calculateur de calories METs en temps réel.
              </p>
            </div>
            <Link href="/profile">
              <Button size="sm" className="gap-2 shrink-0">
                Configurer mon profil
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Grille des KPIs Rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Poids Actuel */}
        <Card className="card-hover-effect border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Poids actuel</span>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {profile?.current_weight_kg
                ? `${Number(profile.current_weight_kg).toFixed(1)} kg`
                : "-- kg"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            {profile?.target_weight_kg ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Cible : {Number(profile.target_weight_kg).toFixed(1)} kg
              </span>
            ) : (
              "Aucun poids cible défini"
            )}
          </CardContent>
        </Card>

        {/* BMR */}
        <Card className="card-hover-effect border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>BMR (Repos vital)</span>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {metabolic ? `${metabolic.bmr.toLocaleString("fr-FR")} kcal` : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            {metabolic ? `Âge métabolique : ${metabolic.age} ans` : "Profil incomplet"}
          </CardContent>
        </Card>

        {/* Maintenance TDEE */}
        <Card className="card-hover-effect border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Maintenance (TDEE base)</span>
              <Flame className="h-4 w-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {metabolic
                ? `${metabolic.tdeeBase.toLocaleString("fr-FR")} kcal`
                : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            {metabolic
              ? `PAL x ${PAL_MULTIPLIERS[profile?.base_activity_level || "sedentary"]}`
              : "Activité sédentaire"}
          </CardContent>
        </Card>

        {/* Cible Déficit Doux */}
        <Card className="card-hover-effect border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium flex items-center justify-between">
              <span>Cible perte douce</span>
              <TrendingDown className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metabolic
                ? `${metabolic.moderateDeficitCalories.toLocaleString("fr-FR")} kcal`
                : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            -400 kcal / jour sous maintenance
          </CardContent>
        </Card>
      </div>

      {/* Dernières activités sportives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            Dernières Séances Sportives
          </h2>
          <Link
            href="/activities"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Voir tout le journal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentActivities.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {recentActivities.map((act) => (
              <Card key={act.id} className="p-4 border-border/70 card-hover-effect">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-foreground text-sm">
                    {act.sports?.name || "Sport"}
                  </div>
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {formatDuration(act.duration_minutes)}
                  </span>
                </div>
                <div className="mt-2 text-xs font-extrabold text-foreground flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  {formatCaloriesRange(
                    act.estimated_calories_min,
                    act.estimated_calories_max
                  )}
                </div>
                {act.notes && (
                  <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 italic">
                    &ldquo;{act.notes}&rdquo;
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center border-dashed border-border/70">
            <p className="text-xs text-muted-foreground">
              Aucune activité enregistrée récemment. Cliquez sur &ldquo;Journal d&apos;activités&rdquo; pour ajouter votre séance de padel, foot ou course.
            </p>
          </Card>
        )}
      </div>

      {/* Raccourcis Nutrition & Poids */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Nutrition Décomplexée
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log en 5 secondes sans pesée au gramme et jauge de balance journalière.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
            <Link href="/nutrition">
              <Button size="sm" variant="outline" className="gap-1.5">
                Journal de repas
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-border/60 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Suivi du Poids & Lissage 7j
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Courbe de tendance Recharts avec moyenne mobile pour gommer les variations d&apos;eau.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
            <Link href="/weight">
              <Button size="sm" variant="outline" className="gap-1.5">
                Suivre mon poids
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
