"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Scale, Calendar, FileText, Loader2, CheckCircle2, Plus } from "lucide-react";
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
import { logWeightAction } from "@/actions/weight.actions";

interface QuickWeightDialogProps {
  lastWeight?: number | null;
  triggerButton?: React.ReactNode;
}

export function QuickWeightDialog({ lastWeight, triggerButton }: QuickWeightDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [weightKg, setWeightKg] = React.useState<number | "">(
    lastWeight ? Number(lastWeight) : 75.0
  );
  const [loggedAt, setLoggedAt] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = React.useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weightKg || Number(weightKg) < 30 || Number(weightKg) > 300) {
      toast.error("Veuillez saisir un poids valide entre 30 et 300 kg.");
      return;
    }

    setLoading(true);

    try {
      const res = await logWeightAction({
        weightKg: Number(weightKg),
        loggedAt: new Date(loggedAt).toISOString(),
        notes: notes.trim() ? notes.trim() : null,
      });

      if (!res.success) {
        toast.error("Erreur lors de la pesée", { description: res.error });
        return;
      }

      toast.success("Pesée enregistrée ! ⚖️", {
        description: `${Number(weightKg).toFixed(1)} kg synchronisé avec votre profil et vos calculs.`,
      });

      setOpen(false);
      setNotes("");
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
          <Button variant="outline" size="sm" className="gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Pesée rapide
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Enregistrer une pesée
          </DialogTitle>
          <DialogDescription>
            Votre profil et votre courbe lissée sur 7 jours seront automatiquement mis à jour.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Poids (en kg)</span>
              {lastWeight && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  Dernier : {Number(lastWeight).toFixed(1)} kg
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min={30}
                max={300}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="78.4"
                className="text-lg font-bold h-12 pr-10"
                required
                autoFocus
                disabled={loading}
              />
              <span className="absolute right-3.5 top-3 text-sm font-semibold text-muted-foreground pointer-events-none">
                kg
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Date et heure de la pesée
            </label>
            <Input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Contexte ou note (optionnel)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: À jeun au réveil, post-repas de fête..."
              disabled={loading}
            />
          </div>

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
                  Enregistrer la pesée
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
