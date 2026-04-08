// Евристики Лаб #2
// filter(scores) повертає ID серій, що відповідають умові (для видалення)

export const HEURISTICS = [
  {
    id: 'E1',
    label: 'E1',
    description: 'Appears exactly once in 3rd place',
    color: 'rgba(255, 149, 0, 0.13)',
    borderColor: 'rgba(255, 149, 0, 0.5)',
    filter(scores) {
      return Object.entries(scores)
        .filter(([, s]) => s.rank3 === 1)
        .map(([id]) => id);
    },
  },
  {
    id: 'E2',
    label: 'E2',
    description: 'Appears exactly once in 2nd place',
    color: 'rgba(10, 132, 255, 0.12)',
    borderColor: 'rgba(10, 132, 255, 0.45)',
    filter(scores) {
      return Object.entries(scores)
        .filter(([, s]) => s.rank2 === 1)
        .map(([id]) => id);
    },
  },
  {
    id: 'E3',
    label: 'E3',
    description: 'Appears exactly once in 1st place',
    color: 'rgba(255, 215, 0, 0.11)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    filter(scores) {
      return Object.entries(scores)
        .filter(([, s]) => s.rank1 === 1)
        .map(([id]) => id);
    },
  },
  {
    id: 'E4',
    label: 'E4',
    description: 'Appears in exactly two 3rd-place rankings',
    color: 'rgba(175, 82, 222, 0.12)',
    borderColor: 'rgba(175, 82, 222, 0.45)',
    filter(scores) {
      return Object.entries(scores)
        .filter(([, s]) => s.rank3 === 2)
        .map(([id]) => id);
    },
  },
  {
    id: 'E5',
    label: 'E5',
    description: 'Appears in one 3rd place and one 2nd place',
    color: 'rgba(48, 209, 88, 0.11)',
    borderColor: 'rgba(48, 209, 88, 0.4)',
    filter(scores) {
      return Object.entries(scores)
        .filter(([, s]) => s.rank3 === 1 && s.rank2 === 1)
        .map(([id]) => id);
    },
  },
  {
    id: 'E6',
    label: 'E6',
    description: 'Never appeared in TOP-3 (zero 1st/2nd/3rd votes)',
    color: 'rgba(255, 59, 48, 0.11)',
    borderColor: 'rgba(255, 59, 48, 0.4)',
    filter(scores) {
      return Object.entries(scores)
        .filter(([, s]) => (s.rank1 + s.rank2 + s.rank3) === 0)
        .map(([id]) => id);
    },
  },
  {
    id: 'E7',
    label: 'E7',
    description: 'Has the lowest total score among all objects',
    color: 'rgba(100, 100, 100, 0.15)',
    borderColor: 'rgba(120, 120, 120, 0.45)',
    filter(scores) {
      const entries = Object.entries(scores);
      if (entries.length === 0) return [];
      const minTotal = Math.min(...entries.map(([, s]) => s.total));
      return entries
        .filter(([, s]) => s.total === minTotal)
        .map(([id]) => id);
    },
  },
];

// Агрегація рейтингів евристик від експертів
export function aggregateHeuristicPopularity(rankings) {
  const weights = {};
  const counts = {};
  HEURISTICS.forEach(h => { weights[h.id] = 0; counts[h.id] = 0; });

  rankings.forEach(({ ranking }) => {
    if (!Array.isArray(ranking)) return;
    ranking.forEach((hId, idx) => {
      const w = HEURISTICS.length - idx;
      weights[hId] = (weights[hId] ?? 0) + w;
      if (idx === 0) counts[hId] = (counts[hId] ?? 0) + 1;
    });
  });

  return { weights, counts };
}
