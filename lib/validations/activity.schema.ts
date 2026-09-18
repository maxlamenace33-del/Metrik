import { z } from "zod";

export const activitySchema = z.object({
  sportId: z.string().uuid("Veuillez sélectionner un sport valide"),
  durationMinutes: z
    .number({ message: "La durée doit être un nombre" })
    .int("La durée doit être un nombre entier")
    .min(5, "La séance doit durer au moins 5 minutes")
    .max(720, "La séance ne peut excéder 12 heures"),
  intensity: z.enum(["low", "medium", "high"], {
    message: "Intensité invalide (faible, modérée ou élevée)",
  }),
  imageUrl: z
    .string()
    .url("L'URL de l'image est invalide")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "La note ne peut pas dépasser 1000 caractères")
    .optional()
    .nullable()
    .or(z.literal("")),
  performedAt: z.string().datetime().optional(),
});

export type ActivityInput = z.infer<typeof activitySchema>;
