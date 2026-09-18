import { redirect } from "next/navigation";
import { Activity as ActivityIcon, Sparkles, Trophy, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ActivityDialog } from "@/components/activities/activity-dialog";
import { ActivityCard } from "@/components/activities/activity-card";
import { Card } from "@/components/ui/card";
import type { ActivityWithSport } from "@/types/domain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal d'Activités — Metrik",
  description: "Vos séances sportives et dépenses calculées en fourchettes honnêtes.",
};

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Requêtes parallèles : Sports, Profil (pour le poids), Activités
  const [{ data: sports }, { data: profile }, { data: activitiesRaw }] =
    await Promise.all([
      supabase.from("sports").select("*").order("name"),
      supabase.from("profiles").select("current_weight_kg").eq("id", user.id).single(),
      supabase
        .from("activities")
        .select("*, sports(*)")
        .eq("user_id", user.id)
        .order("performed_at", { ascending: false }),
    ]);

  const activities = (activitiesRaw || []) as unknown as ActivityWithSport[];
  const userWeight = profile?.current_weight_kg ? Number(profile.current_weight_kg) : 75;

  // Calcul du total calorique estimé sur les activités
  const totalCaloriesMin = activities.reduce(
    (acc, cur) => acc + cur.estimated_calories_min,
    0
  );
  const totalCaloriesMax = activities.reduce(
    (acc, cur) => acc + cur.estimated_calories_max,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header de la page avec résumé et bouton d'ajout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <ActivityIcon className="h-8 w-8 text-primary" />
            Journal d&apos;Activités
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vos dépenses réelles calculées scientifiquement par fourchettes honnêtes.
          </p>
        </div>

        <ActivityDialog
          sports={sports || []}
          userWeightKg={userWeight}
        />
      </div>

      {/* Résumé rapide si des activités existent */}
      {activities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4 border-border/60">
            <div className="text-xs font-semibold text-muted-foreground">
              Total séances enregistrées
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {activities.length} {activities.length > 1 ? "séances" : "séance"}
            </div>
          </Card>

          <Card className="p-4 border-border/60">
            <div className="text-xs font-semibold text-muted-foreground">
              Volume total d&apos;effort
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {activities.reduce((acc, cur) => acc + cur.duration_minutes, 0)} min
            </div>
          </Card>

          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 fill-primary" />
              Dépense cumulée
            </div>
            <div className="text-2xl font-bold text-primary mt-1">
              ~ {totalCaloriesMin.toLocaleString("fr-FR")} –{" "}
              {totalCaloriesMax.toLocaleString("fr-FR")} kcal
            </div>
          </Card>
        </div>
      )}

      {/* Liste des cartes d'activités (style Airbnb) ou état vide */}
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/80 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Trophy className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Aucune activité enregistrée pour le moment
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Padel, course à pied, tennis, match de foot à 5 ou natation : enregistrez votre
            première séance pour calibrer votre dépense énergétique !
          </p>
          <div className="mt-6 flex justify-center">
            <ActivityDialog
              sports={sports || []}
              userWeightKg={userWeight}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
