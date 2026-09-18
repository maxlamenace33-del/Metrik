"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Compresse l'image côté client via Canvas (redimensionne à max 1200px et exporte en WebP/JPEG)
   */
  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/webp",
            0.85
          );
        };
        img.onerror = () => reject(new Error("Erreur de décodage de l'image"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type MIME
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Vous devez être connecté pour téléverser une image.");
        return;
      }

      // 1. Compression
      const compressedBlob = await compressImage(file);

      // 2. Génération du chemin de stockage : user_id/timestamp-random.webp
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const filePath = `${user.id}/${Date.now()}-${randomSuffix}.webp`;

      // 3. Upload vers le bucket activity-images
      const { error: uploadError } = await supabase.storage
        .from("activity-images")
        .upload(filePath, compressedBlob, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 4. Récupération de l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from("activity-images").getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image ajoutée avec succès !");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error("Échec du téléversement", { description: message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemove() {
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/40 aspect-video w-full max-h-48 group">
          <Image
            src={value}
            alt="Capture d'activité"
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-destructive hover:text-white"
            title="Supprimer la photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 bg-card/50 p-6 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Optimisation et téléversement...</span>
            </div>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Ajouter un screenshot Strava ou photo perso
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WebP (optimisé automatiquement)
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
