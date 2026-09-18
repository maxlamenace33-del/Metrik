import { z } from "zod";

export const mealSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"], {
    message: "Type de repas invalide",
  }),
  description: z
    .string()
    .min(2, "La description doit contenir au moins 2 caractères")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  estimatedCalories: z
    .number({ message: "Les calories doivent être un nombre" })
    .int("Les calories doivent être un entier")
    .min(10, "L'apport minimum est de 10 kcal")
    .max(5000, "L'apport maximum est de 5000 kcal"),
  loggedAt: z.string().optional(),
});

export type MealInput = z.infer<typeof mealSchema>;
