"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, Loader2, Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { deleteWeightLogAction } from "@/actions/weight.actions";
import type { WeightLog } from "@/types/domain";

interface WeightTableProps {
  logs: WeightLog[];
}

export function WeightTable({ logs }: WeightTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cette pesée ?")) return;
    setDeletingId(id);

    try {
      const res = await deleteWeightLogAction(id);
      if (!res.success) {
        toast.error("Erreur lors de la suppression", { description: res.error });
        return;
      }
      toast.success("Pesée supprimée.");
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setDeletingId(null);
    }
  }

  if (logs.length === 0) return null;

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Historique Complet des Pesées
        </CardTitle>
        <CardDescription>
          Toutes vos saisies chronologiques avec notes de contexte.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 pl-2">Date & Heure</th>
                <th className="pb-3 px-4">Poids</th>
                <th className="pb-3 px-4">Évolution</th>
                <th className="pb-3 px-4">Contexte / Note</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.map((log, index) => {
                const nextLog = logs[index + 1];
                const diff =
                  nextLog !== undefined
                    ? Number((Number(log.weight_kg) - Number(nextLog.weight_kg)).toFixed(1))
                    : null;

                const dateFormatted = format(
                  new Date(log.logged_at),
                  "d MMMM yyyy 'à' HH:mm",
                  { locale: fr }
                );

                return (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 pl-2 font-medium text-foreground">
                      {dateFormatted}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-foreground">
                      {Number(log.weight_kg).toFixed(1)} kg
                    </td>
                    <td className="py-3.5 px-4">
                      {diff !== null ? (
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                            diff < 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : diff > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {diff < 0 ? (
                            <TrendingDown className="h-3.5 w-3.5" />
                          ) : diff > 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <Minus className="h-3.5 w-3.5" />
                          )}
                          {diff > 0 ? `+${diff}` : diff} kg
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Départ</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground italic">
                      {log.notes || "—"}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Supprimer cette pesée"
                      >
                        {deletingId === log.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
