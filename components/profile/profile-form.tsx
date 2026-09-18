"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Ruler,
  Scale,
  Calendar,
  Activity,
  Flame,
  Zap,
  Target,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfileAction } from "@/actions/profile.actions";
import { calculateMetabolicProfile, PAL_MULTIPLIERS } from "@/lib/calculations/bmr";
import type { Profile } from "@/types/domain";
import type { ActivityLevel, Gender } from "@/types/database.types";

interface ProfileFormProps {
  initialProfile: Profile | null;
  hasWeightLogs: boolean;
}

export function ProfileForm({ initialProfile, hasWeightLogs }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  // Valeurs réactives pour le calculateur en direct
  const [gender, setGender] = React.useState<Gender>(
    initialProfile?.gender || "male"
  );
  const [birthDate, setBirthDate] = React.useState<string>(
    initialProfile?.birth_date || "1997-01-01"
  );
  const [heightCm, setHeightCm] = React.useState<number>(
    initialProfile?.height_cm ? Number(initialProfile.height_cm) : 178
  );
  const [weightKg, setWeightKg] = React.useState<number>(
    initialProfile?.current_weight_kg ? Number(initialProfile.current_weight_kg) : 75
  );
  const [targetWeightKg, setTargetWeightKg] = React.useState<string>(
    initialProfile?.target_weight_kg ? String(initialProfile.target_weight_kg) : ""
  );
  const [activityLevel, setActivityLevel] = React.useState<ActivityLevel>(
    initialProfile?.base_activity_level || "sedentary"
  );

  // Calcul dynamique instantané du métabolisme
  const metabolic = React.useMemo(() => {
    if (!heightCm || !weightKg || !birthDate) return null;
    try {
      return calculateMetabolicProfile(
        {
          weightKg,
          heightCm,
          birthDate,
          gender,
        },
        activityLevel
      );
    } catch {
      return null;
    }
  }, [gender, birthDate, heightCm, weightKg, activityLevel]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateProfileAction(formData);

      if (!res.success) {
        toast.error("Erreur d'enregistrement", {
          description: res.error,
        });
        return;
      }

      toast.success("Profil métabolique mis à jour !", {
        description: "Vos objectifs et calculs de dépenses sont synchronisés.",
      });
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Formulaire de configuration du profil (7 colonnes) */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Paramètres Physiques & Métaboliques
            </CardTitle>
            <CardDescription>
              Ces mesures sont utilisées pour calculer votre BMR et ajuster
              les dépenses caloriques de vos séances sportives.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom complet */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nom complet ou pseudo
                </label>
                <Input
                  name="fullName"
                  defaultValue={initialProfile?.full_name || ""}
                  placeholder="Alex"
                  disabled={loading}
                />
              </div>

              {/* Sexe biologique */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Sexe biologique (pour la formule métabolique)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "male", label: "Homme" },
                    { value: "female", label: "Femme" },
                    { value: "other", label: "Autre / Neutre" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value as Gender)}
                      className={`rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                        gender === option.value
                          ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="gender" value={gender} />
              </div>

              {/* Date de naissance et Taille */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Date de naissance
                  </label>
                  <Input
                    name="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    Taille (en cm)
                  </label>
                  <Input
                    name="heightCm"
                    type="number"
                    min={100}
                    max={250}
                    value={heightCm || ""}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    placeholder="180"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Poids actuel & Poids cible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    Poids de référence (kg)
                  </label>
                  <Input
                    name="initialWeightKg"
                    type="number"
                    step="0.1"
                    min={30}
                    max={300}
                    value={weightKg || ""}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    placeholder="78.0"
                    disabled={loading}
                  />
                  {hasWeightLogs && (
                    <span className="text-[11px] text-muted-foreground block">
                      Synchronisé avec vos pesées enregistrées.
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    Poids cible (kg, optionnel)
                  </label>
                  <Input
                    name="targetWeightKg"
                    type="number"
                    step="0.1"
                    min={30}
                    max={300}
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(e.target.value)}
                    placeholder="74.0"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Niveau d'activité de base (PAL) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  Niveau d&apos;activité quotidienne (hors sport)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: "sedentary",
                      title: "Sédentaire",
                      desc: "Travail de bureau, déplacements minimaux (x1.2)",
                    },
                    {
                      id: "lightly_active",
                      title: "Légèrement actif",
                      desc: "1 à 3 km de marche par jour (x1.375)",
                    },
                    {
                      id: "moderately_active",
                      title: "Modérément actif",
                      desc: "Travail debout ou déplacements fréquents (x1.55)",
                    },
                    {
                      id: "very_active",
                      title: "Très actif",
                      desc: "Travail physique soutenu (x1.725)",
                    },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setActivityLevel(level.id as ActivityLevel)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        activityLevel === level.id
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <div className="text-xs font-semibold text-foreground">
                        {level.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {level.desc}
                      </div>
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="baseActivityLevel"
                  value={activityLevel}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2 text-sm font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Enregistrer les paramètres
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Carte Visualisation Dynamique BMR & TDEE (5 colonnes) */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-primary/30 bg-primary/5 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4 fill-primary" />
              Calculateur Métabolique en Direct
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Bilan Énergétique Théorique
            </CardTitle>
            <CardDescription>
              Basé sur la formule de référence clinique{" "}
              <strong className="text-foreground">Mifflin-St Jeor</strong>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {metabolic ? (
              <>
                {/* 1. BMR */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        BMR (Métabolisme de base)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dépense vitale au repos absolu ({metabolic.age} ans)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-foreground">
                        {metabolic.bmr.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">kcal/j</span>
                    </div>
                  </div>
                </div>

                {/* 2. TDEE Base */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        TDEE Quotidien (hors sport)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Maintenance de base (PAL x {PAL_MULTIPLIERS[activityLevel]})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {metabolic.tdeeBase.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">kcal/j</span>
                    </div>
                  </div>
                </div>

                {/* 3. Cibles Recommandées */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Cibles Caloriques Suggérées
                  </div>

                  {/* Cible Maintenance */}
                  <div className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          Maintien du poids
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Équilibre neutre sans sport
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      ~ {metabolic.maintenanceCalories.toLocaleString("fr-FR")} kcal
                    </div>
                  </div>

                  {/* Cible Déficit Modéré */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Déficit modéré sain
                        </div>
                        <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                          -400 kcal / jour (~400g perte/semaine)
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      ~ {metabolic.moderateDeficitCalories.toLocaleString("fr-FR")} kcal
                    </div>
                  </div>
                </div>

                {/* Note pédagogique */}
                <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-[11px] text-muted-foreground mt-4">
                  <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span>
                    Chaque séance de sport enregistrée ajoutera automatiquement sa
                    fourchette de dépense énergétique à votre quota du jour !
                  </span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Renseignez votre taille, date de naissance et poids pour afficher vos métriques.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
