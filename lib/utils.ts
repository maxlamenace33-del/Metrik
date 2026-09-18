import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg === null || kg === undefined) return "--";
  return `${Number(kg).toFixed(1)} kg`;
}

export function formatCaloriesRange(min: number, max: number): string {
  return `${min.toLocaleString("fr-FR")} – ${max.toLocaleString("fr-FR")} kcal`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}
