import { Scale, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WeightPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Suivi du Poids & Évolution
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lissage par moyenne mobile sur 7 jours pour absorber les variations d&apos;eau.
          </p>
        </div>

        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Pesée rapide
        </Button>
      </div>

      <Card className="border-dashed border-border/80 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
          <Scale className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Historique & Graphique Recharts (Phase 4)
        </h3>
        <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
          Prêt pour la courbe de poids interactive lissée 7j, les filtres de temporalité
          (7j, 30j, 90j, Tout) et l&apos;historique tabulaire des pesées.
        </p>
      </Card>
    </div>
  );
}
