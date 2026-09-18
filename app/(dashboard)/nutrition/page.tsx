import { redirect } from "next/navigation";
import { Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MealDialog } from "@/components/nutrition/meal-dialog";
import { DailyBalanceGauge } from "@/components/nutrition/daily-balance-gauge";
import { MealFeed } from "@/components/nutrition/meal-feed";
import { calculateMetabolicProfile } from "@/lib/calculations/bmr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrition Décomplexée — Metrik",
  description: "Suivez vos apports alimentaires en 5 secondes sans pesée au gramme.",
};

export default async function NutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Date du jour (format YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Requêtes parallèles : profil, repas complets, activités du jour
  const [{ data: profile }, { data: mealsRaw }, { data: activitiesRaw }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .gte("performed_at", `${todayStr}T00:00:00.000Z`),
    ]);

  const meals = mealsRaw || [];
  const todayActivities = activitiesRaw || [];

  // Repas d'aujourd'hui
  const todayMeals = meals.filter((m) => m.logged_at.slice(0, 10) === todayStr);

  // Calcul du TDEE base
  let tdeeBase = 2100;
  if (profile?.current_weight_kg && profile?.height_cm && profile?.birth_date) {
    const metabolic = calculateMetabolicProfile(
      {
        weightKg: Number(profile.current_weight_kg),
        heightCm: Number(profile.height_cm),
        birthDate: profile.birth_date,
        gender: profile.gender || "male",
      },
      profile.base_activity_level || "sedentary"
    );
    tdeeBase = metabolic.tdeeBase;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Utensils className="h-8 w-8 text-primary" />
            Nutrition Décomplexée
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisie rapide à la louche : fini de peser vos aliments ou de scanner des codes-barres.
          </p>
        </div>

        <MealDialog />
      </div>

      {/* Jauge de balance du jour */}
      <DailyBalanceGauge
        todayMeals={todayMeals}
        todayActivities={todayActivities}
        tdeeBase={tdeeBase}
      />

      {/* Liste des repas par jour */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Journal des Repas
        </h2>
        <MealFeed meals={meals} />
      </div>
    </div>
  );
}
