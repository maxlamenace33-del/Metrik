"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { weightSchema } from "@/lib/validations/weight.schema";
import type { ActionResult } from "@/types/domain";

export async function logWeightAction(
  rawData: unknown
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Vous devez être connecté pour enregistrer une pesée." };
  }

  // 1. Validation Zod
  const parsed = weightSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides. Le poids doit être compris entre 30 et 300 kg.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { weightKg, loggedAt, notes } = parsed.data;

  // 2. Insertion en base de données
  // Note: Le trigger SQL on_weight_log_changed mettra à jour profiles.current_weight_kg automatiquement !
  const { data: inserted, error: insertError } = await supabase
    .from("weight_logs")
    .insert({
      user_id: user.id,
      weight_kg: weightKg,
      notes: notes && notes.trim() ? notes.trim() : null,
      logged_at: loggedAt || new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    return {
      success: false,
      error: `Erreur lors de l'enregistrement de la pesée : ${insertError.message}`,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/weight");
  revalidatePath("/profile");
  revalidatePath("/activities");
  revalidatePath("/");

  return { success: true, data: { id: inserted.id } };
}

export async function deleteWeightLogAction(
  logId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  // La suppression déclenchera aussi le trigger pour recalculer profiles.current_weight_kg
  // sur la pesée la plus récente restante !
  const { error: deleteError } = await supabase
    .from("weight_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/weight");
  revalidatePath("/profile");
  revalidatePath("/activities");
  revalidatePath("/");

  return { success: true, data: { deleted: true } };
}
