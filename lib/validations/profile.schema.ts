import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .max(100, "Le nom ne peut excéder 100 caractères")
    .optional()
    .nullable(),
  gender: z.enum(["male", "female", "other"], {
    message: "Sexe invalide",
  }),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  heightCm: z
    .number({ message: "La taille doit être un nombre en centimètres" })
    .min(100, "La taille minimum est de 100 cm")
    .max(250, "La taille maximum est de 250 cm"),
  targetWeightKg: z
    .number({ message: "Le poids cible doit être un nombre" })
    .min(30, "Le poids minimum est de 30 kg")
    .max(300, "Le poids maximum est de 300 kg")
    .optional()
    .nullable(),
  baseActivityLevel: z.enum(
    ["sedentary", "lightly_active", "moderately_active", "very_active"],
    {
      message: "Niveau d'activité invalide",
    }
  ),
});

export type ProfileInput = z.infer<typeof profileSchema>;
