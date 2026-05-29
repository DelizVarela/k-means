// ---------------------------------------------------------------------------
// Implementación de K-Means y métricas de clustering en TypeScript.
// Replica el comportamiento de scikit-learn (k-means++, inercia, silhouette,
// Davies-Bouldin) y PCA para visualización.
// ---------------------------------------------------------------------------

export type Vec = number[];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (a: Vec, b: Vec) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return s;
};
const dist = (a: Vec, b: Vec) => Math.sqrt(dist2(a, b));

// StandardScaler: media 0, desviación estándar 1
export function standardize(data: Vec[]): { scaled: Vec[]; mean: Vec; std: Vec } {
  const d = data[0].length;
  const mean = new Array(d).fill(0);
  const std = new Array(d).fill(0);
  for (const row of data) for (let j = 0; j < d; j++) mean[j] += row[j];
  for (let j = 0; j < d; j++) mean[j] /= data.length;
  for (const row of data) for (let j = 0; j < d; j++) std[j] += (row[j] - mean[j]) ** 2;
  for (let j = 0; j < d; j++) std[j] = Math.sqrt(std[j] / data.length) || 1;
  const scaled = data.map((row) => row.map((v, j) => (v - mean[j]) / std[j]));
  return { scaled, mean, std };
}

export function scalePoint(p: Vec, mean: Vec, std: Vec): Vec {
  return p.map((v, j) => (v - mean[j]) / std[j]);
}

export interface KMeansResult {
  labels: number[];
  centroids: Vec[];
  inertia: number; // WCSS
  iterations: number;
}

// Inicialización k-means++
function kppInit(data: Vec[], k: number, rand: () => number): Vec[] {
  const centroids: Vec[] = [];
  centroids.push([...data[Math.floor(rand() * data.length)]]);
  while (centroids.length < k) {
    const d2 = data.map((p) => Math.min(...centroids.map((c) => dist2(p, c))));
    const sum = d2.reduce((a, b) => a + b, 0);
    let r = rand() * sum;
    let idx = 0;
    for (let i = 0; i < d2.length; i++) {
      r -= d2[i];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    centroids.push([...data[idx]]);
  }
  return centroids;
}

// Una sola corrida de Lloyd a partir de centroides ya inicializados
function kmeansSingle(
  data: Vec[],
  k: number,
  initCentroids: Vec[],
  maxIter: number,
  tol: number
): KMeansResult {
  const d = data[0].length;
  let centroids = initCentroids.map((c) => [...c]);
  const labels = new Array(data.length).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    iterations = iter + 1;
    // Asignación
    for (let i = 0; i < data.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const dd = dist2(data[i], centroids[c]);
        if (dd < bestD) {
          bestD = dd;
          best = c;
        }
      }
      labels[i] = best;
    }
    // Actualización
    const sums: Vec[] = Array.from({ length: k }, () => new Array(d).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < data.length; i++) {
      counts[labels[i]]++;
      for (let j = 0; j < d; j++) sums[labels[i]][j] += data[i][j];
    }
    // Reubicación de clusters vacíos: al punto más alejado de su centroide (como sklearn)
    const newCentroids = centroids.map((_c, ci) => {
      if (counts[ci] > 0) return sums[ci].map((s) => s / counts[ci]);
      let far = 0;
      let farD = -1;
      for (let i = 0; i < data.length; i++) {
        const dd = dist2(data[i], centroids[labels[i]]);
        if (dd > farD) {
          farD = dd;
          far = i;
        }
      }
      return [...data[far]];
    });
    const shift = Math.max(...newCentroids.map((c, ci) => dist(c, centroids[ci])));
    centroids = newCentroids;
    if (shift < tol) break;
  }

  let inertia = 0;
  for (let i = 0; i < data.length; i++) inertia += dist2(data[i], centroids[labels[i]]);

  return { labels, centroids, inertia, iterations };
}

// K-Means con n_init: corre varias inicializaciones y devuelve la de menor inercia
// (replica el comportamiento por defecto de scikit-learn, evitando mínimos locales).
export function kmeans(
  data: Vec[],
  k: number,
  opts: { maxIter?: number; tol?: number; seed?: number; nInit?: number } = {}
): KMeansResult {
  const { maxIter = 300, tol = 1e-4, seed = 42, nInit = 10 } = opts;
  let best: KMeansResult | null = null;

  for (let run = 0; run < nInit; run++) {
    const rand = mulberry32(seed + run * 7919); // semilla distinta y reproducible por corrida
    const init = kppInit(data, k, rand);
    const res = kmeansSingle(data, k, init, maxIter, tol);
    if (!best || res.inertia < best.inertia) best = res;
  }
  return best!;
}

// Método del codo: WCSS + mejora porcentual respecto a k-1 (para justificar k óptimo)
export function elbow(
  data: Vec[],
  maxK = 10
): { k: number; wcss: number; improvement: number }[] {
  const res: { k: number; wcss: number; improvement: number }[] = [];
  let prev = 0;
  for (let k = 1; k <= maxK; k++) {
    const wcss = kmeans(data, k).inertia;
    const improvement = k === 1 ? 0 : prev > 0 ? ((prev - wcss) / prev) * 100 : 0;
    res.push({ k, wcss, improvement });
    prev = wcss;
  }
  return res;
}

// Detecta el "codo" automáticamente por el método de la máxima distancia a la recta
// que une el primer y último punto de la curva WCSS (Kneedle simplificado).
export function detectElbow(elbowData: { k: number; wcss: number }[]): number {
  const n = elbowData.length;
  if (n < 3) return elbowData[0]?.k ?? 1;
  const x1 = elbowData[0].k,
    y1 = elbowData[0].wcss;
  const x2 = elbowData[n - 1].k,
    y2 = elbowData[n - 1].wcss;
  const denom = Math.hypot(y2 - y1, x2 - x1) || 1;
  let bestK = elbowData[0].k;
  let bestDist = -1;
  for (const p of elbowData) {
    const dist = Math.abs((y2 - y1) * p.k - (x2 - x1) * p.wcss + x2 * y1 - y2 * x1) / denom;
    if (dist > bestDist) {
      bestDist = dist;
      bestK = p.k;
    }
  }
  return bestK;
}

// Índice de Silhouette (promedio)
export function silhouetteScore(data: Vec[], labels: number[]): number {
  const n = data.length;
  const clusters: Record<number, number[]> = {};
  labels.forEach((l, i) => (clusters[l] ??= []).push(i));
  let total = 0;
  for (let i = 0; i < n; i++) {
    const own = clusters[labels[i]];
    let a = 0;
    if (own.length > 1) {
      for (const j of own) if (j !== i) a += dist(data[i], data[j]);
      a /= own.length - 1;
    }
    let b = Infinity;
    for (const c in clusters) {
      if (+c === labels[i]) continue;
      const grp = clusters[c];
      let mean = 0;
      for (const j of grp) mean += dist(data[i], data[j]);
      mean /= grp.length;
      if (mean < b) b = mean;
    }
    const s = own.length > 1 ? (b - a) / Math.max(a, b) : 0;
    total += s;
  }
  return total / n;
}

// Índice de Davies-Bouldin
export function daviesBouldin(data: Vec[], labels: number[], centroids: Vec[]): number {
  const k = centroids.length;
  const scatter = new Array(k).fill(0);
  const counts = new Array(k).fill(0);
  for (let i = 0; i < data.length; i++) {
    scatter[labels[i]] += dist(data[i], centroids[labels[i]]);
    counts[labels[i]]++;
  }
  for (let c = 0; c < k; c++) scatter[c] = counts[c] ? scatter[c] / counts[c] : 0;
  let db = 0;
  for (let i = 0; i < k; i++) {
    let max = 0;
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const r = (scatter[i] + scatter[j]) / dist(centroids[i], centroids[j]);
      if (r > max) max = r;
    }
    db += max;
  }
  return db / k;
}

// PCA a 2 componentes (potencia iterada sobre matriz de covarianza)
export function pca2(data: Vec[]): { points: { x: number; y: number }[]; explained: number[] } {
  const n = data.length;
  const d = data[0].length;
  const mean = new Array(d).fill(0);
  for (const row of data) for (let j = 0; j < d; j++) mean[j] += row[j];
  for (let j = 0; j < d; j++) mean[j] /= n;
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const row of data)
    for (let i = 0; i < d; i++)
      for (let j = 0; j < d; j++) cov[i][j] += (row[i] - mean[i]) * (row[j] - mean[j]);
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) cov[i][j] /= n;

  const totalVar = cov.reduce((a, r, i) => a + r[i], 0);

  function powerIter(matrix: number[][]): { vec: number[]; val: number } {
    let v = new Array(d).fill(0).map((_, i) => Math.sin(i + 1));
    let val = 0;
    for (let it = 0; it < 200; it++) {
      const nv = new Array(d).fill(0);
      for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) nv[i] += matrix[i][j] * v[j];
      const norm = Math.sqrt(nv.reduce((a, b) => a + b * b, 0)) || 1;
      for (let i = 0; i < d; i++) nv[i] /= norm;
      v = nv;
      val = norm;
    }
    return { vec: v, val };
  }

  const pc1 = powerIter(cov);
  // deflación para PC2
  const def = cov.map((row, i) => row.map((c, j) => c - pc1.val * pc1.vec[i] * pc1.vec[j]));
  const pc2 = powerIter(def);

  const points = data.map((row) => {
    const cen = row.map((v, j) => v - mean[j]);
    return {
      x: cen.reduce((a, v, j) => a + v * pc1.vec[j], 0),
      y: cen.reduce((a, v, j) => a + v * pc2.vec[j], 0),
    };
  });
  return {
    points,
    explained: [pc1.val / totalVar, pc2.val / totalVar],
  };
}
