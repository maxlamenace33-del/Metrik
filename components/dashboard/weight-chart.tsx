"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickWeightDialog } from "@/components/weight/quick-weight-dialog";
import { calculate7DayMovingAverage } from "@/lib/calculations/moving-average";
import type { WeightLog } from "@/types/domain";

interface WeightChartProps {
  logs: WeightLog[];
  targetWeightKg?: number | null;
}

type Timeframe = "7d" | "30d" | "90d" | "all";

export function WeightChart({ logs, targetWeightKg }: WeightChartProps) {
  const [timeframe, setTimeframe] = React.useState<Timeframe>("30d");

  // Calcul de la moyenne mobile 7 jours
  const smoothedData = React.useMemo(() => {
    return calculate7DayMovingAverage(logs);
  }, [logs]);

  // Filtrage selon la granularité temporelle
  const filteredData = React.useMemo(() => {
    if (!smoothedData || smoothedData.length === 0) return [];

    const now = new Date();
    let cutoffDate: Date | null = null;

    if (timeframe === "7d") {
      cutoffDate = subDays(now, 7);
    } else if (timeframe === "30d") {
      cutoffDate = subDays(now, 30);
    } else if (timeframe === "90d") {
      cutoffDate = subDays(now, 90);
    }

    if (!cutoffDate) return smoothedData;

    return smoothedData.filter((point) => new Date(point.date) >= cutoffDate!);
  }, [smoothedData, timeframe]);

  // Calcul des bornes de l'axe Y pour une courbe bien visible
  const yDomain = React.useMemo(() => {
    if (filteredData.length === 0) return [60, 90];

    const weights = filteredData.flatMap((d) => [
      d.actualWeight ?? d.movingAverage7d,
      d.movingAverage7d,
    ]);

    if (targetWeightKg) {
      weights.push(Number(targetWeightKg));
    }

    const min = Math.min(...weights);
    const max = Math.max(...weights);

    return [Math.floor(min - 1.5), Math.ceil(max + 1.5)];
  }, [filteredData, targetWeightKg]);

  // Calcul des deltas (7 jours et total)
  const deltas = React.useMemo(() => {
    if (smoothedData.length === 0) return { delta7d: null, deltaTotal: null };

    const latest = smoothedData[smoothedData.length - 1]?.actualWeight;
    const first = smoothedData[0]?.actualWeight;

    // Delta total
    const deltaTotal =
      latest !== null && first !== null && latest !== undefined && first !== undefined
        ? Number((latest - first).toFixed(1))
        : null;

    // Delta 7 jours
    const sevenDaysAgoDate = subDays(new Date(), 7);
    const point7dAgo = [...smoothedData]
      .reverse()
      .find((p) => new Date(p.date) <= sevenDaysAgoDate);

    const delta7d =
      latest !== null && latest !== undefined && point7dAgo?.actualWeight
        ? Number((latest - point7dAgo.actualWeight).toFixed(1))
        : null;

    return { delta7d, deltaTotal };
  }, [smoothedData]);

  if (logs.length === 0) {
    return (
      <Card className="border-border/60 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Scale className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg font-bold">Aucune pesée enregistrée</CardTitle>
        <CardDescription className="max-w-md mx-auto mt-1 text-xs">
          Enregistrez votre première pesée pour débloquer la courbe de tendance lissée sur 7 jours.
        </CardDescription>
        <div className="mt-5 flex justify-center">
          <QuickWeightDialog />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Évolution du Poids
            </CardTitle>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Lissage 7j
            </span>
          </div>
          <CardDescription className="text-xs mt-1">
            Moyenne mobile pour filtrer les fluctuations d&apos;eau naturelles du corps.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de temporalité */}
          <div className="flex rounded-xl bg-secondary p-1">
            {[
              { id: "7d", label: "7j" },
              { id: "30d", label: "30j" },
              { id: "90d", label: "3m" },
              { id: "all", label: "Tout" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeframe(tab.id as Timeframe)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  timeframe === tab.id
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <QuickWeightDialog lastWeight={logs[0]?.weight_kg} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deltas rapides */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {deltas.delta7d !== null && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
              <span>Variation 7j :</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  deltas.delta7d < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : deltas.delta7d > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground"
                }`}
              >
                {deltas.delta7d < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : deltas.delta7d > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                {deltas.delta7d > 0 ? `+${deltas.delta7d}` : deltas.delta7d} kg
              </span>
            </div>
          )}

          {deltas.deltaTotal !== null && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
              <span>Variation totale :</span>
              <span className="font-bold text-foreground">
                {deltas.deltaTotal > 0 ? `+${deltas.deltaTotal}` : deltas.deltaTotal} kg
              </span>
            </div>
          )}

          {targetWeightKg && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 font-semibold ml-auto text-[11px]">
              <span>Cible : {Number(targetWeightKg).toFixed(1)} kg</span>
            </div>
          )}
        </div>

        {/* Graphique Recharts */}
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/40"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px] fill-muted-foreground"
                tickFormatter={(str) => {
                  try {
                    return format(new Date(str), "d MMM", { locale: fr });
                  } catch {
                    return str;
                  }
                }}
              />
              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px] fill-muted-foreground"
                unit="kg"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                      <div className="font-bold text-foreground capitalize">
                        {format(new Date(data.date), "EEEE d MMMM", { locale: fr })}
                      </div>
                      {data.actualWeight !== null && (
                        <div className="text-muted-foreground">
                          Pesée brute :{" "}
                          <strong className="text-foreground">
                            {data.actualWeight.toFixed(1)} kg
                          </strong>
                        </div>
                      )}
                      <div className="text-primary font-semibold">
                        Tendance (moy. 7j) : {data.movingAverage7d.toFixed(1)} kg
                      </div>
                    </div>
                  );
                }}
              />

              {/* Ligne de référence pour le poids cible */}
              {targetWeightKg && (
                <ReferenceLine
                  y={Number(targetWeightKg)}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}

              {/* Points des pesées réelles */}
              <Line
                type="monotone"
                dataKey="actualWeight"
                name="Pesée brute"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: "#94A3B8" }}
                activeDot={{ r: 5 }}
              />

              {/* Courbe lissée sur 7 jours */}
              <Line
                type="monotone"
                dataKey="movingAverage7d"
                name="Moyenne mobile 7j"
                stroke="#2563EB"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#2563EB" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
