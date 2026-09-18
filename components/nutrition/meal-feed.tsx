"use client";

import * as React from "react";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, Loader2, Coffee, Sun, Moon, Apple, Utensils } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteMealLogAction } from "@/actions/nutrition.actions";
import type { MealLog } from "@/types/domain";
import type { MealType } from "@/types/database.types";

interface MealFeedProps {
  meals: MealLog[];
}

export function MealFeed({ meals }: MealFeedProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer ce repas ?")) return;
    setDeletingId(id);

    try {
      const res = await deleteMealLogAction(id);
      if (!res.success) {
        toast.error("Erreur lors de la suppression", { description: res.error });
        return;
      }
      toast.success("Repas supprimé.");
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setDeletingId(null);
    }
  }

  // Regroupement par jour
  const groupedMeals = React.useMemo(() => {
    const groups = new Map<string, MealLog[]>();

    for (const meal of meals) {
      const dayKey = meal.logged_at.slice(0, 10);
      const list = groups.get(dayKey) || [];
      list.push(meal);
      groups.set(dayKey, list);
    }

    return Array.from(groups.entries()).sort(
      ([dayA], [dayB]) => new Date(dayB).getTime() - new Date(dayA).getTime()
    );
  }, [meals]);

  if (meals.length === 0) {
    return (
      <Card className="border-dashed border-border/80 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 mb-3">
          <Utensils className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Aucun repas enregistré pour le moment
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Enregistrez votre premier déjeuner ou snack en 5 secondes avec une estimation calorique globale.
        </p>
      </Card>
    );
  }

  function getMealTypeConfig(type: MealType) {
    switch (type) {
      case "breakfast":
        return {
          label: "Petit-déj",
          icon: Coffee,
          badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        };
      case "lunch":
        return {
          label: "Déjeuner",
          icon: Sun,
          badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        };
      case "dinner":
        return {
          label: "Dîner",
          icon: Moon,
          badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        };
      case "snack":
      default:
        return {
          label: "Collation",
          icon: Apple,
          badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
        };
    }
  }

  function formatDayTitle(dateStr: string) {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  }

  return (
    <div className="space-y-6">
      {groupedMeals.map(([dayKey, dayMeals]) => {
        const dayTotal = dayMeals.reduce(
          (acc, cur) => acc + cur.estimated_calories,
          0
        );

        return (
          <Card key={dayKey} className="border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 py-3 px-5 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground capitalize">
                {formatDayTitle(dayKey)}
              </CardTitle>
              <div className="text-xs font-extrabold text-foreground">
                Total : <span className="text-primary">{dayTotal.toLocaleString("fr-FR")} kcal</span>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-border/40">
              {dayMeals.map((meal) => {
                const config = getMealTypeConfig(meal.meal_type);
                const Icon = config.icon;
                const timeStr = format(new Date(meal.logged_at), "HH:mm");

                return (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 ${config.badgeClass}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{config.label}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {meal.description}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {timeStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-extrabold text-foreground">
                        ~{meal.estimated_calories.toLocaleString("fr-FR")} kcal
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(meal.id)}
                        disabled={deletingId === meal.id}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Supprimer ce repas"
                      >
                        {deletingId === meal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
