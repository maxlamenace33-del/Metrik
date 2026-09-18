"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Plus,
  Flame,
  Calendar,
  Loader2,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Apple,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logMealAction } from "@/actions/nutrition.actions";
import type { MealType } from "@/types/database.types";

interface MealDialogProps {
  triggerButton?: React.ReactNode;
}

export function MealDialog({ triggerButton }: MealDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [mealType, setMealType] = React.useState<MealType>("lunch");
  const [description, setDescription] = React.useState<string>("");
  const [calories, setCalories] = React.useState<number | "">(650);
  const [loggedAt, setLoggedAt] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  const mealTypeOptions = [
    { id: "breakfast", label: "Petit-déj", icon: Coffee, defaultKcal: 450 },
    { id: "lunch", label: "Déjeuner", icon: Sun, defaultKcal: 700 },
    { id: "dinner", label: "Dîner", icon: Moon, defaultKcal: 650 },
    { id: "snack", label: "Snack / Collation", icon: Apple, defaultKcal: 250 },
  ];

  function handleTypeSelect(type: MealType, defaultKcal: number) {
    setMealType(type);
    if (!calories || calories === 650 || calories === 450 || calories === 700 || calories === 250) {
      setCalories(defaultKcal);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Veuillez décrire brièvement votre repas.");
      return;
    }
    if (!calories || Number(calories) < 10 || Number(calories) > 5000) {
      toast.error("Veuillez renseigner une estimation calorique réaliste (10 à 5000 kcal).");
      return;
    }

    setLoading(true);

    try {
      const res = await logMealAction({
        mealType,
        description: description.trim(),
        estimatedCalories: Number(calories),
        loggedAt: new Date(loggedAt).toISOString(),
      });

      if (!res.success) {
        toast.error("Erreur lors de l'enregistrement", {
          description: res.error,
        });
        return;
      }

      toast.success("Repas enregistré ! 🍽️", {
        description: `~${Number(calories)} kcal ajoutées à votre balance du jour.`,
      });

      setOpen(false);
      setDescription("");
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Enregistrer un repas
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Saisie de Repas Décomplexée
          </DialogTitle>
          <DialogDescription>
            Enregistrez votre repas en 5 secondes sans pesée obligatoire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* 1. Type de repas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Moment du repas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = mealType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTypeSelect(opt.id as MealType, opt.defaultKcal)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Description libre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description du repas
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salade composée, filet de poulet, quinoa, fromage blanc..."
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* 3. Estimation Calorique directe */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-primary" />
                Estimation globale (kcal)
              </label>
              <span className="text-[11px] text-muted-foreground">À la louche</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                min={10}
                max={5000}
                value={calories}
                onChange={(e) =>
                  setCalories(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="text-lg font-bold h-12 pr-14"
                required
                disabled={loading}
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-muted-foreground pointer-events-none">
                kcal
              </span>
            </div>

            {/* Presets rapides de calories */}
            <div className="flex gap-1.5 pt-1">
              {[300, 500, 700, 900].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCalories(val)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    calories === val
                      ? "bg-primary text-white border-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ~{val}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Date & Heure */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Date et heure
            </label>
            <Input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Valider le repas
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
