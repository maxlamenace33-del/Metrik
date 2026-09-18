"use client";

import * as React from "react";
import { Flame, Sparkles, HelpCircle } from "lucide-react";
import { calculateCaloriesRange, resolveMETValue } from "@/lib/calculations/mets";
import type { Sport } from "@/types/domain";
import type { Intensity } from "@/types/database.types";

interface RealtimeMETCalculatorProps {
  selectedSport: Sport | null;
  durationMinutes: number;
  intensity: Intensity;
  userWeightKg: number;
}

export function RealtimeMETCalculator({
  selectedSport,
  durationMinutes,
  intensity,
  userWeightKg,
}: RealtimeMETCalculatorProps) {
  const calculation = React.useMemo(() => {
    if (!selectedSport || durationMinutes <= 0 || userWeightKg <= 0) {
      return null;
    }

    const met = resolveMETValue(selectedSport, intensity);
    const range = calculateCaloriesRange(met, userWeightKg, durationMinutes);

    return {
      met,
      ...range,
    };
  }, [selectedSport, durationMinutes, intensity, userWeightKg]);

  if (!calculation) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-center text-xs text-muted-foreground">
        Sélectionnez un sport et une durée pour calculer la dépense calorique.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-4 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Flame className="h-4 w-4 fill-primary" />
          <span>Dépense Énergétique Estimée</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground bg-card/80 px-2 py-0.5 rounded-md border border-border/50">
          MET {calculation.met.toFixed(1)} • {userWeightKg.toFixed(1)} kg
        </span>
      </div>

      {/* Fourchette Principale */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-3xl font-extrabold tracking-tight text-foreground">
            {calculation.minCalories.toLocaleString("fr-FR")} –{" "}
            {calculation.maxCalories.toLocaleString("fr-FR")}
          </span>
          <span className="text-sm font-semibold text-muted-foreground ml-1.5">
            kcal
          </span>
        </div>
        <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Marge honnête ±10%
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Calculé d&apos;après le ratio métabolique officiel du{" "}
        <strong className="text-foreground">{selectedSport?.name}</strong> indexé sur
        votre poids du jour.
      </p>
    </div>
  );
}
