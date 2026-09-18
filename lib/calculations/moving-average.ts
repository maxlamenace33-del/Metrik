export interface WeightPoint {
  date: string; // Format YYYY-MM-DD
  weightKg: number;
}

export interface SmoothedWeightPoint {
  date: string;
  actualWeight: number | null;
  movingAverage7d: number;
}

/**
 * Calcule la moyenne mobile sur 7 jours d'un ensemble de pesées
 * Les données d'entrée peuvent avoir des jours manquants ou être dans le désordre.
 */
export function calculate7DayMovingAverage(
  logs: Array<{ logged_at: string; weight_kg: number }>
): SmoothedWeightPoint[] {
  if (!logs || logs.length === 0) return [];

  // 1. Agréger par jour (garder la dernière pesée du jour si plusieurs le même jour)
  const dailyWeights = new Map<string, number>();

  // Tri chronologique croissant
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  for (const log of sortedLogs) {
    const dayKey = log.logged_at.slice(0, 10);
    dailyWeights.set(dayKey, Number(log.weight_kg));
  }

  const sortedDays = Array.from(dailyWeights.entries()).sort(
    ([dayA], [dayB]) => new Date(dayA).getTime() - new Date(dayB).getTime()
  );

  if (sortedDays.length === 0) return [];

  const result: SmoothedWeightPoint[] = [];

  // 2. Pour chaque jour avec pesée, calculer la moyenne des pesées disponibles dans la fenêtre des 7 jours précédents
  for (let i = 0; i < sortedDays.length; i++) {
    const [currentDayStr, currentWeight] = sortedDays[i];
    const currentDate = new Date(currentDayStr);

    // Fenêtre glissante de 7 jours (entre current - 6 jours et current)
    const windowStart = new Date(currentDate);
    windowStart.setDate(windowStart.getDate() - 6);

    let sum = 0;
    let count = 0;

    for (let j = 0; j <= i; j++) {
      const [pastDayStr, pastWeight] = sortedDays[j];
      const pastDate = new Date(pastDayStr);

      if (pastDate >= windowStart && pastDate <= currentDate) {
        sum += pastWeight;
        count++;
      }
    }

    const average = count > 0 ? Number((sum / count).toFixed(2)) : currentWeight;

    result.push({
      date: currentDayStr,
      actualWeight: currentWeight,
      movingAverage7d: average,
    });
  }

  return result;
}
