// Генетичний алгоритм для ранжування (перестановка)
// Знаходить оптимальну послідовність об'єктів, мінімізуючи
// сумарну відстань до думок усіх експертів.
// Два критерії: Адитивний (мін суми) та МінМакс (мін макс відхилення)

// Допоміжні функції

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

// Логіка обчислення відстані
// Кожен експерт голосував у Лаб 1: [{seriesId, rank}], rank 1 = 1-ше місце і т.д.
// Для перестановки-кандидата обчислюємо різницю позицій.

// Позиційна карта: seriesId -> індекс у перестановці
function buildPositionMap(permutation) {
  const map = {};
  permutation.forEach((id, idx) => { map[id] = idx; });
  return map;
}

// Відстань від одного експерта до перестановки-кандидата
function distanceToExpert(posMap, expertRankings, n) {
  let dist = 0;
  expertRankings.forEach(({ seriesId, rank }) => {
    if (posMap[seriesId] !== undefined) {
      dist += Math.abs(posMap[seriesId] - (rank - 1));
    }

  });
  return dist;
}

// Фітнес-функції

// Адитивний фітнес: -(сума відстаней до всіх експертів)
function fitnessAdditive(permutation, votes, n) {
  const posMap = buildPositionMap(permutation);
  let totalDist = 0;
  votes.forEach(vote => {
    if (!Array.isArray(vote.rankings)) return;
    totalDist += distanceToExpert(posMap, vote.rankings, n);
  });
  return -totalDist;
}

// МінМакс фітнес: -(макс відхилення від одного експерта)
function fitnessMinMax(permutation, votes, n) {
  const posMap = buildPositionMap(permutation);
  let maxDist = 0;
  votes.forEach(vote => {
    if (!Array.isArray(vote.rankings)) return;
    const d = distanceToExpert(posMap, vote.rankings, n);
    if (d > maxDist) maxDist = d;
  });
  return -maxDist;
}

// Турнірна селекція

function tournamentSelect(population, fitnesses, k = 3) {
  let bestIdx = randomInt(0, population.length);
  for (let i = 1; i < k; i++) {
    const idx = randomInt(0, population.length);
    if (fitnesses[idx] > fitnesses[bestIdx]) bestIdx = idx;
  }
  return population[bestIdx];
}

// Одноточковий кросовер порядку (OX1)
// Перша частина від батька A, решта заповнюється з батька B без дублікатів

export function onePointOrderCrossover(parentA, parentB) {
  const n = parentA.length;
  if (n <= 1) return [...parentA];

  const cp = randomInt(1, n); // crossover point: 1..n-1
  const child = parentA.slice(0, cp);
  const used = new Set(child);

  for (const gene of parentB) {
    if (!used.has(gene)) {
      child.push(gene);
      used.add(gene);
    }
  }
  return child;
}

// Мутація: обмін двох випадкових позицій

function mutate(chromosome) {
  const child = [...chromosome];
  const i = randomInt(0, child.length);
  let j = randomInt(0, child.length);
  while (j === i && child.length > 1) j = randomInt(0, child.length);
  [child[i], child[j]] = [child[j], child[i]];
  return child;
}

// Запуск GA для одного критерію

function runSingleGA({
  itemIds,
  votes,
  fitnessFn,
  populationSize = 50,
  generations = 100,
  mutationRate = 0.1,
  eliteCount = 2,
  onGeneration,
}) {
  const n = itemIds.length;
  const history = [];

  // Ініціалізація популяції
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(shuffle(itemIds));
  }

  let globalBest = null;
  let globalBestFitness = -Infinity;

  // 2. Evolve
  for (let gen = 0; gen < generations; gen++) {
    const fitnesses = population.map(chr => fitnessFn(chr, votes, n));

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

    // 3. Elitism
    const sortedIndices = fitnesses
      .map((f, i) => ({ f, i }))
      .sort((a, b) => b.f - a.f)
      .map(x => x.i);

    const newPop = [];
    for (let e = 0; e < eliteCount && e < sortedIndices.length; e++) {
      newPop.push([...population[sortedIndices[e]]]);
    }

    // 4. Breed new population
    while (newPop.length < populationSize) {
      const parentA = tournamentSelect(population, fitnesses);
      const parentB = tournamentSelect(population, fitnesses);
      let child = onePointOrderCrossover(parentA, parentB);

      if (Math.random() < mutationRate) {
        child = mutate(child);
      }
      newPop.push(child);
    }

    population = newPop;
  }

  return {
    bestChromosome: globalBest ?? [],
    bestFitness: globalBestFitness,
    history,
  };
}

// Головна функція — запускає GA для обох критеріїв

export function runGeneticAlgorithm({
  itemIds,
  votes,
  populationSize = 50,
  generations = 100,
  mutationRate = 0.1,
  eliteCount = 2,
  onGenerationAdditive,
  onGenerationMinMax,
}) {
  const additive = runSingleGA({
    itemIds,
    votes,
    fitnessFn: fitnessAdditive,
    populationSize,
    generations,
    mutationRate,
    eliteCount,
    onGeneration: onGenerationAdditive,
  });

  const minmax = runSingleGA({
    itemIds,
    votes,
    fitnessFn: fitnessMinMax,
    populationSize,
    generations,
    mutationRate,
    eliteCount,
    onGeneration: onGenerationMinMax,
  });

  return { additive, minmax };
}
