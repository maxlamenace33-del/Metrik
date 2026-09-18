"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile.schema";
import type { ActionResult } from "@/types/domain";

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult<{ updated: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Utilisateur non authentifié." };
  }

  const rawData = {
    fullName: (formData.get("fullName") as string) || null,
    gender: formData.get("gender") as string,
    birthDate: formData.get("birthDate") as string,
    heightCm: formData.get("heightCm") ? Number(formData.get("heightCm")) : undefined,
    targetWeightKg: formData.get("targetWeightKg")
      ? Number(formData.get("targetWeightKg"))
      : null,
    baseActivityLevel: formData.get("baseActivityLevel") as string,
  };

  const parsed = profileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Certaines données sont invalides. Veuillez vérifier le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { fullName, gender, birthDate, heightCm, targetWeightKg, baseActivityLevel } =
    parsed.data;

  // 1. Mise à jour du profil
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      gender,
      birth_date: birthDate,
      height_cm: heightCm,
      target_weight_kg: targetWeightKg,
      base_activity_level: baseActivityLevel,
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // 2. Si un poids initial a été renseigné et que l'utilisateur n'a pas encore de pesée enregistrée
  const initialWeightInput = formData.get("initialWeightKg");
  if (initialWeightInput) {
    const initialWeight = Number(initialWeightInput);
    if (!isNaN(initialWeight) && initialWeight >= 30 && initialWeight <= 300) {
      // Vérifier si une pesée existe déjà
      const { count } = await supabase
        .from("weight_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count === 0) {
        // Insertion de la première pesée (le trigger mettra à jour profiles.current_weight_kg)
        await supabase.from("weight_logs").insert({
          user_id: user.id,
          weight_kg: initialWeight,
          notes: "Pesée initiale de profil",
          logged_at: new Date().toISOString(),
        });
      }
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true, data: { updated: true } };
}
