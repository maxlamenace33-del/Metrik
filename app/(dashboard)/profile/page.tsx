import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil & Métabolisme — Metrik",
  description: "Configurez vos mesures physiques et visualisez votre BMR en temps réel.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Récupération du profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Vérification s'il y a déjà des pesées dans weight_logs
  const { count } = await supabase
    .from("weight_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Profil & Métabolisme
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustez vos mesures corporelles pour calibrer avec précision le BMR et les dépenses METs.
        </p>
      </div>

      <ProfileForm
        initialProfile={profile}
        hasWeightLogs={Boolean(count && count > 0)}
      />
    </div>
  );
}
