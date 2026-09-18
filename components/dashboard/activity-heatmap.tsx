"use client";

import * as React from "react";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Flame, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Activity } from "@/types/domain";

interface ActivityHeatmapProps {
  activities: Activity[];
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  // Générer les 52 dernières semaines (364 jours) jusqu'à aujourd'hui
  const days = React.useMemo(() => {
    const today = new Date();
    // 52 semaines = 364 jours
    const startDate = subDays(today, 364);
    const intervalDays = eachDayOfInterval({ start: startDate, end: today });

    // Carte des activités par date (YYYY-MM-DD)
    const activityMap = new Map<
      string,
      { count: number; minutes: number; minKcal: number; maxKcal: number }
    >();

    for (const act of activities) {
      const dateKey = act.performed_at.slice(0, 10);
      const existing = activityMap.get(dateKey) || {
        count: 0,
        minutes: 0,
        minKcal: 0,
        maxKcal: 0,
      };

      existing.count += 1;
      existing.minutes += act.duration_minutes;
      existing.minKcal += act.estimated_calories_min;
      existing.maxKcal += act.estimated_calories_max;
      activityMap.set(dateKey, existing);
    }

    return intervalDays.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const data = activityMap.get(dateKey);

      let level = 0;
      if (data && data.count > 0) {
        if (data.maxKcal > 600 || data.minutes >= 60) {
          level = 3;
        } else if (data.maxKcal >= 300 || data.minutes >= 30) {
          level = 2;
        } else {
          level = 1;
        }
      }

      return {
        date: day,
        dateKey,
        level,
        data,
      };
    });
  }, [activities]);

  // Statistiques de consistance
  const activeDaysCount = React.useMemo(() => {
    return days.filter((d) => d.level > 0).length;
  }, [days]);

  const consistencyRate = Math.round((activeDaysCount / days.length) * 100);

  // Groupement par colonnes de semaines (7 jours par colonne : Lun -> Dim)
  const weeks = React.useMemo(() => {
    const cols: typeof days[] = [];
    let currentWeek: typeof days = [];

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      cols.push(currentWeek);
    }
    return cols;
  }, [days]);

  // Couleurs des 4 niveaux d'intensité
  function getSquareColor(level: number) {
    switch (level) {
      case 3:
        return "bg-blue-600 dark:bg-blue-500 shadow-2xs border-blue-700/30";
      case 2:
        return "bg-blue-400 dark:bg-blue-600/70 border-blue-500/30";
      case 1:
        return "bg-blue-200 dark:bg-blue-900/50 border-blue-300/30";
      case 0:
      default:
        return "bg-muted/60 dark:bg-muted/30 border-transparent hover:border-border";
    }
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Consistance Sportive Annuelle
            </CardTitle>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Style GitHub
            </span>
          </div>
          <CardDescription className="text-xs mt-1">
            Visualisez votre régularité et votre volume d&apos;effort sur les 52 dernières semaines.
          </CardDescription>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <div className="font-extrabold text-foreground text-sm">
              {activeDaysCount} jours actifs
            </div>
            <div className="text-[11px] text-muted-foreground">
              {consistencyRate}% de régularité annuelle
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grille de la Heatmap */}
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto pb-2 pt-1">
            <div className="inline-flex flex-col gap-1 min-w-[720px]">
              {/* Jours de la semaine alignés verticalement (7 lignes) */}
              <div className="flex gap-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((dayItem) => {
                      const hasSport = dayItem.level > 0;
                      return (
                        <Tooltip key={dayItem.dateKey}>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-3 w-3 rounded-xs border transition-transform duration-150 hover:scale-125 cursor-pointer ${getSquareColor(
                                dayItem.level
                              )}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="text-xs p-2.5 rounded-xl border border-border bg-card text-foreground shadow-lg space-y-1">
                            <div className="font-bold capitalize">
                              {format(dayItem.date, "EEEE d MMMM yyyy", { locale: fr })}
                            </div>
                            {hasSport ? (
                              <div className="space-y-0.5 text-muted-foreground text-[11px]">
                                <div className="text-primary font-semibold">
                                  {dayItem.data?.count} séance{dayItem.data!.count > 1 ? "s" : ""} •{" "}
                                  {dayItem.data?.minutes} min d&apos;effort
                                </div>
                                <div className="text-foreground font-medium">
                                  🔥 {dayItem.data?.minKcal} – {dayItem.data?.maxKcal} kcal
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-muted-foreground">
                                Aucun sport enregistré ce jour-là
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* Légende de couleur */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          <span>52 semaines glissantes</span>
          <div className="flex items-center gap-1.5">
            <span>Moins</span>
            <div className="h-2.5 w-2.5 rounded-xs bg-muted/60 dark:bg-muted/30" />
            <div className="h-2.5 w-2.5 rounded-xs bg-blue-200 dark:bg-blue-900/50" />
            <div className="h-2.5 w-2.5 rounded-xs bg-blue-400 dark:bg-blue-600/70" />
            <div className="h-2.5 w-2.5 rounded-xs bg-blue-600 dark:bg-blue-500" />
            <span>Plus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
