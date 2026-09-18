import type { Intensity } from "@/types/database.types";

export interface SportMETConfig {
  slug: string;
  name: string;
  metLow: number;
  metMedium: number;
  metHigh: number;
}

export const PRECONFIGURED_SPORTS: Record<string, SportMETConfig> = {
  padel: {
    slug: "padel",
    name: "Padel",
    metLow: 5.5,
    metMedium: 7.0,
    metHigh: 8.5,
  },
  tennis: {
    slug: "tennis",
    name: "Tennis",
    metLow: 5.0,
    metMedium: 7.3,
    metHigh: 8.8,
  },
  football: {
    slug: "football",
    name: "Football",
    metLow: 6.5,
    metMedium: 8.0,
    metHigh: 10.0,
  },
  five: {
    slug: "five",
    name: "Football en salle (Five)",
    metLow: 7.5,
    metMedium: 9.0,
    metHigh: 11.0,
  },
  running: {
    slug: "running",
    name: "Course à pied",
    metLow: 7.0,
    metMedium: 9.8,
    metHigh: 12.5,
  },
  basketball: {
    slug: "basketball",
    name: "Basketball",
    metLow: 6.0,
    metMedium: 8.0,
    metHigh: 10.0,
  },
  swimming: {
    slug: "swimming",
    name: "Natation",
    metLow: 5.5,
    metMedium: 7.5,
    metHigh: 10.0,
  },
};

export interface CaloriesRangeResult {
  medianCalories: number;
  minCalories: number;
  maxCalories: number;
}

/**
 * Calcule la fourchette de calories estimée pour une activité sportive :
 * Formule : Calories = MET * Poids (kg) * Durée (heures)
 * Marge d'honnêteté scientifique : ±10%
 */
export function calculateCaloriesRange(
  met: number,
  weightKg: number,
  durationMinutes: number
): CaloriesRangeResult {
  if (met <= 0 || weightKg <= 0 || durationMinutes <= 0) {
    return { medianCalories: 0, minCalories: 0, maxCalories: 0 };
  }

  const durationHours = durationMinutes / 60;
  const medianCalories = met * weightKg * durationHours;

  const minCalories = Math.round(medianCalories * 0.9);
  const maxCalories = Math.round(medianCalories * 1.1);

  return {
    medianCalories: Math.round(medianCalories),
    minCalories,
    maxCalories,
  };
}

/**
 * Détermine la valeur MET exacte selon l'intensité choisie
 */
export function resolveMETValue(
  sport: { default_met_low: number; default_met_medium: number; default_met_high: number },
  intensity: Intensity
): number {
  switch (intensity) {
    case "low":
      return Number(sport.default_met_low);
    case "high":
      return Number(sport.default_met_high);
    case "medium":
    default:
      return Number(sport.default_met_medium);
  }
}
