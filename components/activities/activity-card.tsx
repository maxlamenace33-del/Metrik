"use client";

import * as React from "react";
import Image from "next/image";
import {
  Clock,
  Calendar,
  Flame,
  Trash2,
  Maximize2,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDuration, formatCaloriesRange } from "@/lib/utils";
import { deleteActivityAction } from "@/actions/activities.actions";
import type { ActivityWithSport } from "@/types/domain";

interface ActivityCardProps {
  activity: ActivityWithSport;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [deleting, setDeleting] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);

  const sportName = activity.sports?.name || "Activité sportive";
  const sportSlug = activity.sports?.slug || "running";

  // Image source : image uploadée (Strava/photo) ou SVG par défaut du sport
  const imageSrc =
    activity.image_url ||
    activity.sports?.default_image_url ||
    `/images/sports/${sportSlug}.svg`;

  const isUserUploaded = Boolean(activity.image_url);

  // Formatage de la date en français
  const dateFormatted = React.useMemo(() => {
    try {
      const date = new Date(activity.performed_at);
      return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return activity.performed_at;
    }
  }, [activity.performed_at]);

  async function handleDelete() {
    if (!confirm("Voulez-vous vraiment supprimer cette activité ?")) return;
    setDeleting(true);

    try {
      const res = await deleteActivityAction(activity.id);
      if (!res.success) {
        toast.error("Erreur lors de la suppression", {
          description: res.error,
        });
        return;
      }
      toast.success("Activité supprimée avec succès.");
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setDeleting(false);
    }
  }

  // Configuration du badge d'intensité
  const intensityConfig = {
    low: {
      label: "Intensité Faible",
      variant: "intensityLow" as const,
    },
    medium: {
      label: "Intensité Modérée",
      variant: "intensityMedium" as const,
    },
    high: {
      label: "Intensité Élevée",
      variant: "intensityHigh" as const,
    },
  }[activity.intensity] || {
    label: "Modérée",
    variant: "intensityMedium" as const,
  };

  return (
    <>
      <div className="card-hover-effect overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all flex flex-col sm:flex-row">
        {/* Section Gauche : Visuel de l'activité façon Airbnb (~38% largeur desktop) */}
        <div className="relative aspect-video sm:aspect-auto sm:w-2/5 min-h-[190px] bg-muted shrink-0 overflow-hidden group">
          <Image
            src={imageSrc}
            alt={sportName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 350px"
          />

          {/* Badge "Preuve Strava / Photo" si image custom uploadée */}
          {isUserUploaded && (
            <div className="absolute top-3 left-3 z-10">
              <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white border border-white/20">
                Photo perso / Strava
              </span>
            </div>
          )}

          {/* Bouton pour agrandir l'image si c'est une photo */}
          {isUserUploaded && (
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/70 text-white backdrop-blur-md transition-opacity opacity-0 group-hover:opacity-100 hover:bg-black"
              title="Agrandir l'image"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Section Droite : Données et ressenti (~62% largeur desktop) */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
          <div className="space-y-3">
            {/* Header : Titre + Badge d'intensité + Action suppression */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {sportName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 capitalize">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{dateFormatted}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={intensityConfig.variant} className="text-[11px] py-1">
                  {intensityConfig.label}
                </Badge>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Supprimer la séance"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Métriques clés : Durée & Fourchette Calorique */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDuration(activity.duration_minutes)}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-bold text-primary">
                <Flame className="h-4 w-4 fill-primary" />
                <span>
                  {formatCaloriesRange(
                    activity.estimated_calories_min,
                    activity.estimated_calories_max
                  )}
                </span>
              </div>
            </div>

            {/* Note / Ressenti libre */}
            {activity.notes && (
              <p className="text-xs text-muted-foreground/90 italic bg-muted/30 p-3 rounded-xl border border-border/40 leading-relaxed">
                &ldquo;{activity.notes}&rdquo;
              </p>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 flex justify-between items-center">
            <span>Indexé sur pesée de référence : {Number(activity.weight_used_kg).toFixed(1)} kg</span>
            <span className="font-mono text-[10px]">METs Formula</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal de zoom photo */}
      {isUserUploaded && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-3xl p-2 bg-black/95 border-neutral-800">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl">
              <Image
                src={imageSrc}
                alt="Capture d'activité en grand"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
