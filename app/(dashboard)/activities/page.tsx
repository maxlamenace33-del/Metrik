import { Activity, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Activités Sportives
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualisez vos séances et vos dépenses calculées en fourchettes honnêtes.
          </p>
        </div>

        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Ajouter une activité
        </Button>
      </div>

      <Card className="border-dashed border-border/80 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <Activity className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Module Activités (Phase 3)
        </h3>
        <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
          Prêt pour le déploiement du feed style Airbnb, le téléversement de captures Strava
          et le calculateur de calories METs en temps réel.
        </p>
      </Card>
    </div>
  );
}
