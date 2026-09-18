"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { activitySchema } from "@/lib/validations/activity.schema";
import { calculateCaloriesRange, resolveMETValue, PRECONFIGURED_SPORTS } from "@/lib/calculations/mets";
import type { ActionResult } from "@/types/domain";

export async function createActivityAction(
  rawData: unknown
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Vous devez être connecté pour enregistrer une activité." };
  }

  // 1. Validation des données Zod
  const parsed = activitySchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides. Veuillez vérifier le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { sportId, durationMinutes, intensity, imageUrl, notes, performedAt } =
    parsed.data;

  // 2. Récupération des informations sur le sport et le profil utilisateur
  const [{ data: sport, error: sportError }, { data: profile }] =
    await Promise.all([
      supabase.from("sports").select("*").eq("id", sportId).single(),
      supabase
        .from("profiles")
        .select("current_weight_kg")
        .eq("id", user.id)
        .single(),
    ]);

  if (sportError || !sport) {
    return {
      success: false,
      error: "Sport introuvable dans le référentiel.",
    };
  }

  // Poids à utiliser pour le calcul (poids actuel du profil ou valeur par défaut 75kg)
  const weightUsed = profile?.current_weight_kg ? Number(profile.current_weight_kg) : 75;

  // 3. Détermination du MET et calcul de la fourchette calorique honnête (±10%)
  const metValue = resolveMETValue(sport, intensity);
  const { minCalories, maxCalories } = calculateCaloriesRange(
    metValue,
    weightUsed,
    durationMinutes
  );

  // 4. Insertion en base de données
  const { data: inserted, error: insertError } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      sport_id: sportId,
      duration_minutes: durationMinutes,
      intensity,
      weight_used_kg: weightUsed,
      estimated_calories_min: minCalories,
      estimated_calories_max: maxCalories,
      image_url: imageUrl || null,
      notes: notes || null,
      performed_at: performedAt || new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    return {
      success: false,
      error: `Erreur lors de l'enregistrement : ${insertError.message}`,
    };
  }

  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true, data: { id: inserted.id } };
}

export async function deleteActivityAction(
  activityId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true, data: { deleted: true } };
}
