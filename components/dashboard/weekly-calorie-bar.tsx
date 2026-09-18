"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Flame, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Activity, MealLog } from "@/types/domain";

interface WeeklyCalorieBarProps {
  activities: Activity[];
  meals?: MealLog[];
  dailyBaseTdee: number;
}

export function WeeklyCalorieBar({
  activities,
  meals = [],
  dailyBaseTdee,
}: WeeklyCalorieBarProps) {
  // Calcul des 7 derniers jours (du 6e jour avant aujourd'hui jusqu'à aujourd'hui)
  const chartData = React.useMemo(() => {
    const today = new Date();
    const start = subDays(today, 6);
    const interval = eachDayOfInterval({ start, end: today });

    return interval.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");

      // Calories sportives du jour (moyenne min/max)
      const dayActivities = activities.filter(
        (a) => a.performed_at.slice(0, 10) === dayStr
      );
      const sportCalories = dayActivities.reduce((acc, cur) => {
        const avg = Math.round(
          (cur.estimated_calories_min + cur.estimated_calories_max) / 2
        );
        return acc + avg;
      }, 0);

      // Calories alimentaires du jour
      const dayMeals = meals.filter(
        (m) => m.logged_at.slice(0, 10) === dayStr
      );
      const foodCalories = dayMeals.reduce(
        (acc, cur) => acc + cur.estimated_calories,
        0
      );

      // Dépense totale estimée : TDEE base + sport
      const totalBurned = dailyBaseTdee + sportCalories;

      return {
        date: dayStr,
        dayLabel: format(day, "EEE d", { locale: fr }),
        depenses: totalBurned,
        apports: foodCalories,
        sportCalories,
      };
    });
  }, [activities, meals, dailyBaseTdee]);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Balance Énergétique Hebdomadaire
            </CardTitle>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              7 jours glissants
            </span>
          </div>
          <CardDescription className="text-xs mt-1">
            Comparaison entre dépense totale estimée (TDEE + Sport) et apports alimentaires.
          </CardDescription>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-xs bg-primary" />
            <span className="text-muted-foreground font-medium">Dépense totale</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-xs bg-purple-500" />
            <span className="text-muted-foreground font-medium">Apports repas</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[240px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/40"
                vertical={false}
              />
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px] fill-muted-foreground capitalize"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px] fill-muted-foreground"
                unit=" kcal"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                      <div className="font-bold text-foreground capitalize">
                        {format(new Date(data.date), "EEEE d MMMM", { locale: fr })}
                      </div>
                      <div className="text-primary font-semibold">
                        🔥 Dépense totale : {data.depenses.toLocaleString("fr-FR")} kcal
                        {data.sportCalories > 0 && (
                          <span className="text-[11px] font-normal text-muted-foreground block">
                            (dont +{data.sportCalories} kcal de sport)
                          </span>
                        )}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400 font-semibold">
                        🍽️ Apports repas : {data.apports > 0 ? `${data.apports.toLocaleString("fr-FR")} kcal` : "Non renseigné"}
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={dailyBaseTdee}
                stroke="#64748B"
                strokeDasharray="4 4"
                label={{
                  value: "Maintenance base",
                  position: "insideTopLeft",
                  fill: "#64748B",
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey="depenses"
                name="Dépense totale"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="apports"
                name="Apports repas"
                fill="#A855F7"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
