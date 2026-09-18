"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Flame,
  Clock,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  Trophy,
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
import { ImageUploader } from "@/components/activities/image-uploader";
import { RealtimeMETCalculator } from "@/components/activities/realtime-met-calculator";
import { createActivityAction } from "@/actions/activities.actions";
import type { Sport } from "@/types/domain";
import type { Intensity } from "@/types/database.types";

interface ActivityDialogProps {
  sports: Sport[];
  userWeightKg: number;
}

export function ActivityDialog({ sports, userWeightKg }: ActivityDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // État local du formulaire
  const [selectedSportId, setSelectedSportId] = React.useState<string>(
    sports[0]?.id || ""
  );
  const [durationMinutes, setDurationMinutes] = React.useState<number>(90);
  const [intensity, setIntensity] = React.useState<Intensity>("medium");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<string>("");
  const [performedAt, setPerformedAt] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  const selectedSport = React.useMemo(() => {
    return sports.find((s) => s.id === selectedSportId) || sports[0] || null;
  }, [sports, selectedSportId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSportId) {
      toast.error("Veuillez sélectionner un sport.");
      return;
    }

    setLoading(true);

    try {
      const res = await createActivityAction({
        sportId: selectedSportId,
        durationMinutes,
        intensity,
        imageUrl,
        notes: notes.trim() ? notes : null,
        performedAt: new Date(performedAt).toISOString(),
      });

      if (!res.success) {
        toast.error("Erreur lors de l'enregistrement", {
          description: res.error,
        });
        return;
      }

      toast.success("Séance enregistrée avec succès ! 🔥", {
        description: `${selectedSport?.name} (${durationMinutes} min) ajouté à votre journal.`,
      });

      setOpen(false);
      // Réinitialiser les champs libres
      setNotes("");
      setImageUrl(null);
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
        <Button className="gap-2 shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          Nouvelle activité
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Enregistrer une séance de sport
          </DialogTitle>
          <DialogDescription>
            Calcul honnête de la dépense calorique basé sur votre poids actuel ({userWeightKg.toFixed(1)} kg).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. Sélection du Sport */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Discipline sportive
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sports.map((sport) => {
                const isSelected = sport.id === selectedSportId;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSportId(sport.id)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">
                      {sport.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Durée & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Durée (en minutes)
              </label>
              <Input
                type="number"
                min={5}
                max={720}
                value={durationMinutes || ""}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                disabled={loading}
              />
              <div className="flex gap-1.5 pt-1">
                {[45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                      durationMinutes === mins
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Date et heure
              </label>
              <Input
                type="datetime-local"
                value={performedAt}
                onChange={(e) => setPerformedAt(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 3. Intensité */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Intensité de l&apos;effort
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: "low",
                  label: "Faible",
                  desc: "Rythme calme / Échauffement",
                  color: "hover:border-emerald-500",
                },
                {
                  value: "medium",
                  label: "Modérée",
                  desc: "Match standard / Régulier",
                  color: "hover:border-blue-500",
                },
                {
                  value: "high",
                  label: "Élevée",
                  desc: "Compétition / Cardio intense",
                  color: "hover:border-amber-500",
                },
              ].map((lvl) => {
                const isSelected = intensity === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setIntensity(lvl.value as Intensity)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${lvl.color} ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-card"
                    }`}
                  >
                    <div
                      className={`text-xs font-bold ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {lvl.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {lvl.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Calculateur METs Dynamique en Direct */}
          <RealtimeMETCalculator
            selectedSport={selectedSport}
            durationMinutes={durationMinutes}
            intensity={intensity}
            userWeightKg={userWeightKg}
          />

          {/* 5. Upload Photo ou Capture Strava */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Preuve visuelle (optionnel)
            </label>
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              disabled={loading}
            />
          </div>

          {/* 6. Ressenti / Note libre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Ressenti ou note libre (optionnel)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Super sensations en attaque, victoire 6/4 7/5..."
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              disabled={loading}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-2">
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
                  Enregistrer l&apos;activité
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
