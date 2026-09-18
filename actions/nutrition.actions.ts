"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mealSchema } from "@/lib/validations/meal.schema";
import type { ActionResult } from "@/types/domain";

export async function logMealAction(
  rawData: unknown
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Vous devez être connecté pour enregistrer un repas." };
  }

  // 1. Validation Zod
  const parsed = mealSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides. Veuillez vérifier le type et les calories.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { mealType, description, estimatedCalories, loggedAt } = parsed.data;

  // 2. Insertion dans meal_logs
  const { data: inserted, error: insertError } = await supabase
    .from("meal_logs")
    .insert({
      user_id: user.id,
      meal_type: mealType,
      description: description.trim(),
      estimated_calories: estimatedCalories,
      logged_at: loggedAt || new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    return {
      success: false,
      error: `Erreur lors de l'enregistrement : ${insertError.message}`,
    };
  }

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true, data: { id: inserted.id } };
}

export async function deleteMealLogAction(
  mealId: string
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
    .from("meal_logs")
    .delete()
    .eq("id", mealId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true, data: { deleted: true } };
}
