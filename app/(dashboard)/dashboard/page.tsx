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
  Plus,
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
import { QuickWeightDialog } from "@/components/weight/quick-weight-dialog";
import { ActivityDialog } from "@/components/activities/activity-dialog";
import { MealDialog } from "@/components/nutrition/meal-dialog";
import { DailyBalanceGauge } from "@/components/nutrition/daily-balance-gauge";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { WeeklyCalorieBar } from "@/components/dashboard/weekly-calorie-bar";
import { calculateMetabolicProfile, PAL_MULTIPLIERS } from "@/lib/calculations/bmr";
import { formatDuration, formatCaloriesRange } from "@/lib/utils";
import type { ActivityWithSport } from "@/types/domain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Metrik",
  description: "Tableau de bord de suivi fitness, métabolisme, consistance et poids.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  // Requêtes parallèles pour un chargement instantané :
  const [
    { data: profile },
    { data: sports },
    { data: weightLogsRaw },
    { data: activitiesRaw },
    { data: mealsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("sports").select("*").order("name"),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*, sports(*)")
      .eq("user_id", user.id)
      .order("performed_at", { ascending: false }),
    supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(60),
  ]);

  const weightLogs = weightLogsRaw || [];
  const activities = (activitiesRaw || []) as unknown as ActivityWithSport[];
  const meals = mealsRaw || [];

  // Filtrage des éléments d'aujourd'hui pour la jauge
  const todayMeals = meals.filter((m) => m.logged_at.slice(0, 10) === todayStr);
  const todayActivities = activities.filter(
    (a) => a.performed_at.slice(0, 10) === todayStr
  );

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

  const userWeight = profile?.current_weight_kg
    ? Number(profile.current_weight_kg)
    : 75;

  const tdeeBase = metabolic ? metabolic.tdeeBase : 2100;

  return (
    <div className="space-y-8">
      {/* Header avec bienvenue et boutons d'actions rapides */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Bonjour {profile?.full_name?.split(" ")[0] || "Athlète"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Voici votre tableau de bord santé et vos indicateurs de performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <QuickWeightDialog lastWeight={profile?.current_weight_kg} />
          <MealDialog
            triggerButton={
              <Button variant="outline" size="sm" className="gap-2">
                <Utensils className="h-4 w-4 text-purple-600" />
                Repas rapide
              </Button>
            }
          />
          <ActivityDialog
            sports={sports || []}
            userWeightKg={userWeight}
          />
        </div>
      </div>

      {/* Bannière d'onboarding si le profil n'est pas complété */}
      {!hasProfile && (
        <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                Complétez votre profil métabolique
              </div>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Renseignez votre taille, date de naissance et poids pour calibrer la
                formule clinique Mifflin-St Jeor et ajuster en direct vos dépenses sportives.
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

      {/* 1. KPIs Rapides */}
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
              <span>Cible perte saine</span>
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

      {/* 2. Jauge de Balance du Jour */}
      <DailyBalanceGauge
        todayMeals={todayMeals}
        todayActivities={todayActivities}
        tdeeBase={tdeeBase}
      />

      {/* 3. Courbe de Poids Interactive Recharts (lissage 7j et filtres) */}
      <WeightChart
        logs={weightLogs}
        targetWeightKg={profile?.target_weight_kg}
      />

      {/* 4. Calendrier d'Activité Annuelle façon GitHub (Heatmap 52 semaines) */}
      <ActivityHeatmap activities={activities} />

      {/* 5. Bar Chart Hebdomadaire (Dépenses vs Apports sur 7 jours) */}
      <WeeklyCalorieBar
        activities={activities}
        meals={meals}
        dailyBaseTdee={tdeeBase}
      />

      {/* 6. Dernières Séances Sportives Enregistrées */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            Dernières Séances Sportives
          </h2>
          <Link
            href="/activities"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Accéder au journal complet ({activities.length})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {activities.slice(0, 3).map((act) => (
              <Card key={act.id} className="p-4 border-border/70 card-hover-effect flex flex-col justify-between">
                <div>
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
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  {new Date(act.performed_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-border/70">
            <p className="text-xs text-muted-foreground">
              Aucune activité enregistrée récemment. Enregistrez un match de padel, une séance de five ou un footing pour voir apparaître vos statistiques ici !
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
