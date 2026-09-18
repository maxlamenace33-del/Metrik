import { redirect } from "next/navigation";
import { Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { WeightTable } from "@/components/weight/weight-table";
import { QuickWeightDialog } from "@/components/weight/quick-weight-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi du Poids — Metrik",
  description: "Courbe d'évolution du poids lissée sur moyenne mobile 7 jours.",
};

export default async function WeightPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupération en parallèle du profil et des pesées
  const [{ data: profile }, { data: weightLogsRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false }),
  ]);

  const weightLogs = weightLogsRaw || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Scale className="h-8 w-8 text-primary" />
            Suivi du Poids & Évolution
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lissage par moyenne mobile 7 jours pour absorber les variations d&apos;eau naturelles.
          </p>
        </div>

        <QuickWeightDialog lastWeight={profile?.current_weight_kg} />
      </div>

      {/* Courbe Recharts */}
      <WeightChart
        logs={weightLogs}
        targetWeightKg={profile?.target_weight_kg}
      />

      {/* Tableau détaillé */}
      <WeightTable logs={weightLogs} />
    </div>
  );
}
