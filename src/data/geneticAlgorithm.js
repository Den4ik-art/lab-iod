// ── Genetic Algorithm for Rank-Aggregation / Subset Selection ─────────
// Implements a GA that finds the optimal subset of ≤10 LEGO series
// by maximizing agreement with expert votes and penalising heuristic violations.

import { HEURISTICS } from './heuristics';

// ── Helpers ──────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Fitness ──────────────────────────────────────────────────────────
// Higher = better.
// +totalPoints of every included series
// -penalty for each heuristic violation (series that should have been removed
//  by a top-ranked heuristic is still present)

function calcFitness(chromosome, scores, heuristicWeights, allIds) {
  let fitness = 0;

  // Sum expert points for the included series
  chromosome.forEach(id => {
    const s = scores[id];
    if (s) fitness += s.total;
  });

  // Penalty: for each heuristic, check how many of its "should remove" ids
  // are still in the chromosome. Weight the penalty by the heuristic's
  // expert-determined priority (higher weight = harsher penalty).
  HEURISTICS.forEach(h => {
    const w = heuristicWeights[h.id] ?? 1;
    const toRemove = h.filter(scores);
    toRemove.forEach(id => {
      if (chromosome.includes(id)) {
        // Penalty proportional to heuristic weight
        fitness -= w * 1.5;
      }
    });
  });

  return fitness;
}

// ── Selection: Tournament ────────────────────────────────────────────

function tournamentSelect(population, fitnesses, k = 3) {
  let bestIdx = randomInt(0, population.length);
  for (let i = 1; i < k; i++) {
    const idx = randomInt(0, population.length);
    if (fitnesses[idx] > fitnesses[bestIdx]) bestIdx = idx;
  }
  return population[bestIdx];
}

// ── Crossover: Subset crossover ─────────────────────────────────────
// Takes two parent subsets of size targetSize and produces a child of the
// same size which mixes genes from both parents. Guarantees uniqueness.

function crossover(parentA, parentB, allIds, targetSize) {
  const pool = new Set([...parentA, ...parentB]);
  const child = [];

  // First: randomly take from the union of both parents
  const poolArr = shuffle([...pool]);
  for (const id of poolArr) {
    if (child.length >= targetSize) break;
    child.push(id);
  }

  // If still not enough (shouldn't happen since |A ∪ B| ≥ targetSize), fill from allIds
  if (child.length < targetSize) {
    const remaining = allIds.filter(id => !child.includes(id));
    const shuffled = shuffle(remaining);
    while (child.length < targetSize && shuffled.length) {
      child.push(shuffled.pop());
    }
  }

  return child;
}

// ── Mutation: Swap mutation ─────────────────────────────────────────
// Replaces one random element in the subset with a random element NOT in the subset.

function mutate(chromosome, allIds) {
  const outside = allIds.filter(id => !chromosome.includes(id));
  if (outside.length === 0) return [...chromosome];

  const child = [...chromosome];
  const removeIdx = randomInt(0, child.length);
  const addIdx = randomInt(0, outside.length);
  child[removeIdx] = outside[addIdx];
  return child;
}

// ── Main GA runner ──────────────────────────────────────────────────
// Returns { bestChromosome, bestFitness, history[] }
// history[i] = { generation, bestFitness, avgFitness }

export function runGeneticAlgorithm({
  allSeriesIds,       // string[] — all 20 IDs
  scores,             // { [id]: { total, rank1, rank2, rank3 } }
  heuristicWeights,   // { [hId]: number } from expert popularity
  targetSize = 10,    // how many series in the final core
  populationSize = 50,
  generations = 100,
  mutationRate = 0.1, // 0..1
  eliteCount = 2,
  onGeneration,       // optional callback(genData) for live updates
}) {
  const allIds = [...allSeriesIds];
  const history = [];

  // ── 1. Initialize population ─────────────────────────────────────
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(shuffle(allIds).slice(0, targetSize));
  }

  let globalBest = null;
  let globalBestFitness = -Infinity;

  // ── 2. Evolve ─────────────────────────────────────────────────────
  for (let gen = 0; gen < generations; gen++) {
    // Evaluate fitness
    const fitnesses = population.map(chr =>
      calcFitness(chr, scores, heuristicWeights, allIds)
    );

    // Track best
    let genBest = 0;
    let totalFitness = 0;
    fitnesses.forEach((f, i) => {
      totalFitness += f;
      if (f > fitnesses[genBest]) genBest = i;
    });

    const genBestFitness = fitnesses[genBest];
    const avgFitness = totalFitness / populationSize;

    if (genBestFitness > globalBestFitness) {
      globalBestFitness = genBestFitness;
      globalBest = [...population[genBest]];
    }

    const genData = {
      generation: gen + 1,
      bestFitness: genBestFitness,
      avgFitness: Math.round(avgFitness * 100) / 100,
      globalBestFitness,
    };
    history.push(genData);

    if (onGeneration) onGeneration(genData);

    // ── 3. Elitism ──────────────────────────────────────────────────
    const sortedIndices = fitnesses
      .map((f, i) => ({ f, i }))
      .sort((a, b) => b.f - a.f)
      .map(x => x.i);

    const newPop = [];
    for (let e = 0; e < eliteCount && e < sortedIndices.length; e++) {
      newPop.push([...population[sortedIndices[e]]]);
    }

    // ── 4. Breed new population ──────────────────────────────────────
    while (newPop.length < populationSize) {
      const parentA = tournamentSelect(population, fitnesses);
      const parentB = tournamentSelect(population, fitnesses);
      let child = crossover(parentA, parentB, allIds, targetSize);

      if (Math.random() < mutationRate) {
        child = mutate(child, allIds);
      }

      newPop.push(child);
    }

    population = newPop;
  }

  // Sort the best chromosome by score (highest first) for display
  const sorted = globalBest
    ? [...globalBest].sort((a, b) => (scores[b]?.total ?? 0) - (scores[a]?.total ?? 0))
    : [];

  return {
    bestChromosome: sorted,
    bestFitness: globalBestFitness,
    history,
  };
}
