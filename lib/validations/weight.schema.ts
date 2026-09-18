import { z } from "zod";

export const weightSchema = z.object({
  weightKg: z
    .number({ message: "Le poids doit être un nombre" })
    .min(30, "Le poids minimum est de 30 kg")
    .max(300, "Le poids maximum est de 300 kg"),
  loggedAt: z.string().optional(),
  notes: z
    .string()
    .max(500, "La note ne peut pas dépasser 500 caractères")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type WeightInput = z.infer<typeof weightSchema>;
