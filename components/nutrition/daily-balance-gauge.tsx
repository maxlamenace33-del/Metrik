"use client";

import * as React from "react";
import { Flame, Utensils, Zap, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Activity, MealLog } from "@/types/domain";

interface DailyBalanceGaugeProps {
  todayMeals: MealLog[];
  todayActivities: Activity[];
  tdeeBase: number;
}

export function DailyBalanceGauge({
  todayMeals,
  todayActivities,
  tdeeBase,
}: DailyBalanceGaugeProps) {
  // Calculs du jour
  const caloriesIn = React.useMemo(() => {
    return todayMeals.reduce((acc, m) => acc + m.estimated_calories, 0);
  }, [todayMeals]);

  const sportCalories = React.useMemo(() => {
    return todayActivities.reduce((acc, a) => {
      const avg = Math.round(
        (a.estimated_calories_min + a.estimated_calories_max) / 2
      );
      return acc + avg;
    }, 0);
  }, [todayActivities]);

  const totalExpenditure = tdeeBase + sportCalories;
  const netBalance = caloriesIn - totalExpenditure;

  // Cible de déficit modéré (-400 kcal)
  const targetCalories = Math.max(tdeeBase - 400 + sportCalories, 1200);

  // Pourcentage par rapport à la dépense totale
  const percentage = Math.min(
    Math.round((caloriesIn / Math.max(totalExpenditure, 1)) * 100),
    150
  );

  // Statut
  let statusColor = "text-blue-600 dark:text-blue-400";
  let statusText = "En équilibre";
  let statusBadgeClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

  if (netBalance < -200) {
    statusColor = "text-emerald-600 dark:text-emerald-400";
    statusText = "Déficit calorique (perte)";
    statusBadgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (netBalance > 200) {
    statusColor = "text-amber-600 dark:text-amber-400";
    statusText = "Surplus calorique (prise)";
    statusBadgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Balance Énergétique du Jour
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Dépense totale estimée vs total des repas enregistrés aujourd&apos;hui.
            </CardDescription>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold self-start sm:self-auto ${statusBadgeClass}`}
          >
            {netBalance < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : netBalance > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span>{statusText}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* 3 Blocs Métriques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Apports */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Utensils className="h-4 w-4" />
              <span>Apports (Repas)</span>
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {caloriesIn.toLocaleString("fr-FR")}{" "}
              <span className="text-xs text-muted-foreground font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {todayMeals.length} repas consigné{todayMeals.length > 1 ? "s" : ""}
            </div>
          </div>

          {/* 2. Dépense totale */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Flame className="h-4 w-4" />
              <span>Dépense Estimée</span>
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {totalExpenditure.toLocaleString("fr-FR")}{" "}
              <span className="text-xs text-muted-foreground font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Base {tdeeBase} {sportCalories > 0 ? `+ ${sportCalories} sport` : "(sans sport)"}
            </div>
          </div>

          {/* 3. Solde Net */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="text-xs font-semibold text-muted-foreground">
              Solde Énergétique Net
            </div>
            <div className={`text-2xl font-extrabold mt-1 ${statusColor}`}>
              {netBalance > 0 ? `+${netBalance}` : netBalance}{" "}
              <span className="text-xs text-muted-foreground font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Cible idéale : ~{targetCalories.toLocaleString("fr-FR")} kcal
            </div>
          </div>
        </div>

        {/* Barre de Progression Visuelle */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Remplissage du quota énergétique</span>
            <span className="text-foreground">{percentage}%</span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 105
                  ? "bg-amber-500"
                  : percentage >= 80
                  ? "bg-emerald-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>0 kcal</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Cible déficit : {targetCalories} kcal
            </span>
            <span>Maintenance : {totalExpenditure} kcal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
