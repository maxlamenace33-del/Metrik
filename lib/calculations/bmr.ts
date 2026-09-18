import type { ActivityLevel, Gender } from "@/types/database.types";

export interface BMRCalculationInput {
  weightKg: number;
  heightCm: number;
  birthDate: string | Date;
  gender: Gender;
}

export interface MetabolicProfile {
  age: number;
  bmr: number;
  tdeeBase: number;
  maintenanceCalories: number;
  moderateDeficitCalories: number;
}

export const PAL_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Bureau, sédentaire, peu de marche
  lightly_active: 1.375, // 1 à 3 km de marche quotidienne
  moderately_active: 1.55, // Travail actif ou debout, déplacements
  very_active: 1.725, // Travail physique soutenu
};

/**
 * Calcule l'âge exact en années à partir d'une date de naissance
 */
export function calculateAge(birthDateInput: string | Date): number {
  const birthDate = typeof birthDateInput === "string" ? new Date(birthDateInput) : birthDateInput;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Calcule le BMR (Basal Metabolic Rate) selon la formule Mifflin-St Jeor
 * Homme: 10 * poids + 6.25 * taille - 5 * age + 5
 * Femme: 10 * poids + 6.25 * taille - 5 * age - 161
 */
export function calculateBMR({
  weightKg,
  heightCm,
  birthDate,
  gender,
}: BMRCalculationInput): number {
  const age = calculateAge(birthDate);
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "female") {
    return Math.round(base - 161);
  } else if (gender === "male") {
    return Math.round(base + 5);
  } else {
    // Si 'other', moyenne neutre
    return Math.round(base - 78);
  }
}

/**
 * Calcule le profil métabolique complet incluant BMR, TDEE hors sport et cibles
 */
export function calculateMetabolicProfile(
  input: BMRCalculationInput,
  activityLevel: ActivityLevel = "sedentary"
): MetabolicProfile {
  const age = calculateAge(input.birthDate);
  const bmr = calculateBMR(input);
  const multiplier = PAL_MULTIPLIERS[activityLevel] ?? 1.2;
  const tdeeBase = Math.round(bmr * multiplier);

  // Déficit modéré de 400 kcal (perte saine d'environ 350-450g / semaine)
  // Sécurité : la cible ne descend jamais en dessous du BMR strict
  const moderateDeficitCalories = Math.max(bmr, tdeeBase - 400);

  return {
    age,
    bmr,
    tdeeBase,
    maintenanceCalories: tdeeBase,
    moderateDeficitCalories,
  };
}
