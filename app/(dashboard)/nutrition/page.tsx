import { Utensils, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Nutrition Décomplexée
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi rapide de vos apports journaliers sans calcul au gramme près.
          </p>
        </div>

        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Enregistrer un repas
        </Button>
      </div>

      <Card className="border-dashed border-border/80 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 mb-4">
          <Utensils className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Journal de Nutrition (Phase 5)
        </h3>
        <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
          Prêt pour la saisie simplifiée des repas en 5 secondes et la jauge de balance
          énergétique quotidienne.
        </p>
      </Card>
    </div>
  );
}
