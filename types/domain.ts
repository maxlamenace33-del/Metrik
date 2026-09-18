import type { Database } from "@/types/database.types";

export type Sport = Database["public"]["Tables"]["sports"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
export type MealLog = Database["public"]["Tables"]["meal_logs"]["Row"];

export interface ActivityWithSport extends Activity {
  sports: Sport | null;
}

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface DashboardSummary {
  profile: Profile | null;
  latestWeight: number | null;
  weightDelta7d: number | null;
  weightDeltaTotal: number | null;
  weeklySportCaloriesMin: number;
  weeklySportCaloriesMax: number;
  weeklyActiveDaysCount: number;
  todayFoodCalories: number;
  todaySportCaloriesMin: number;
  todaySportCaloriesMax: number;
  todayNetBalance: number;
}
