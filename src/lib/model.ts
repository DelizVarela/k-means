import { CUSTOMERS, Customer } from "./data";
import {
  standardize,
  scalePoint,
  kmeans,
  elbow,
  detectElbow,
  silhouetteScore,
  daviesBouldin,
  pca2,
  Vec,
} from "./kmeans";

export interface Profile {
  name: string;
  level: string; // descripción ingreso/gasto
  strategy: string;
  color: string;
  emoji: string;
}

type Band = "bajo" | "medio" | "alto";

// Catálogo de perfiles según combinación (ingreso, gasto)
const PROFILE_TABLE: Record<string, Omit<Profile, "level">> = {
  "alto|alto": { name: "Clientes Objetivo (VIP)", strategy: "Experiencias VIP, productos premium, atención exclusiva.", color: "#22c55e", emoji: "👑" },
  "alto|medio": { name: "Clientes Premium", strategy: "Up-selling, lanzamientos exclusivos, programa de puntos.", color: "#14b8a6", emoji: "🏆" },
  "alto|bajo": { name: "Ahorradores Premium", strategy: "Fidelización, descuentos exclusivos, incentivos de compra.", color: "#3b82f6", emoji: "💎" },
  "medio|alto": { name: "Entusiastas del Consumo", strategy: "Promos por volumen, bundles, recompensas por frecuencia.", color: "#ec4899", emoji: "🛍️" },
  "medio|medio": { name: "Clientes Promedio", strategy: "Comunicación regular, ofertas estacionales, ventas cruzadas.", color: "#a855f7", emoji: "⚖️" },
  "medio|bajo": { name: "Conservadores", strategy: "Reactivación, recordatorios, cupones de retorno.", color: "#6366f1", emoji: "🧭" },
  "bajo|alto": { name: "Compradores Impulsivos", strategy: "Productos trending, marketing emocional, cuotas accesibles.", color: "#f59e0b", emoji: "🔥" },
  "bajo|medio": { name: "Aspiracionales", strategy: "Financiación, ofertas de entrada, gamificación.", color: "#f97316", emoji: "🌱" },
  "bajo|bajo": { name: "Clientes Ocasionales", strategy: "Promociones accesibles, cuotas sin interés, cupones.", color: "#ef4444", emoji: "🪙" },
};

const LABEL_ES: Record<Band, string> = { bajo: "bajo", medio: "medio", alto: "alto" };

// Asigna una banda (bajo/medio/alto) a un valor según su RANKING relativo dentro
// del conjunto de centroides — se adapta a los datos, no usa umbrales fijos.
function bandByRank(value: number, sorted: number[], k: number): Band {
  const idx = sorted.indexOf(value);
  if (k <= 1) return "medio";
  if (k === 2) return idx === 0 ? "bajo" : "alto";
  // tercios del ranking
  const t = idx / (sorted.length - 1);
  if (t < 1 / 3) return "bajo";
  if (t < 2 / 3) return "medio";
  return "alto";
}

export function profileFromBands(incomeBand: Band, spendBand: Band): Profile {
  const base = PROFILE_TABLE[`${incomeBand}|${spendBand}`] ?? PROFILE_TABLE["medio|medio"];
  return { ...base, level: `Ingreso ${LABEL_ES[incomeBand]} · Gasto ${LABEL_ES[spendBand]}` };
}

export interface ClusterInfo {
  cluster: number;
  profile: Profile;
  size: number;
  avgIncome: number;
  avgSpending: number;
  avgAge: number;
  pctMale: number;
  centroidScaled: Vec;
}

export interface AnalysisResult {
  customers: (Customer & { cluster: number })[];
  k: number;
  optimalK: number;
  elbow: { k: number; wcss: number; improvement: number }[];
  silhouette: number;
  davies: number;
  wcss: number;
  iterations: number;
  clusters: ClusterInfo[];
  pca: { points: { x: number; y: number; cluster: number }[]; explained: number[] };
  scaler: { mean: Vec; std: Vec };
  features: string[];
}

// Ejecuta todo el pipeline para un k dado, usando 2 ó 3 features
export function runAnalysis(k = 5, useAge = false): AnalysisResult {
  const features = useAge
    ? ["Edad", "Ingreso Anual (k$)", "Puntaje de Gasto"]
    : ["Ingreso Anual (k$)", "Puntaje de Gasto"];

  const raw: Vec[] = CUSTOMERS.map((c) =>
    useAge ? [c.age, c.income, c.spending] : [c.income, c.spending]
  );
  const { scaled, mean, std } = standardize(raw);

  const elbowData = elbow(scaled, 10);
  const optimalK = detectElbow(elbowData);
  const km = kmeans(scaled, k);

  const sil = silhouetteScore(scaled, km.labels);
  const db = daviesBouldin(scaled, km.labels, km.centroids);

  const customers = CUSTOMERS.map((c, i) => ({ ...c, cluster: km.labels[i] }));

  // Estadísticas base por cluster
  const stats = Array.from({ length: k }, (_, c) => {
    const members = customers.filter((m) => m.cluster === c);
    const avg = (f: (x: Customer) => number) =>
      members.reduce((a, m) => a + f(m), 0) / (members.length || 1);
    return {
      c,
      members,
      avgIncome: avg((m) => m.income),
      avgSpending: avg((m) => m.spending),
      avgAge: avg((m) => m.age),
    };
  });

  // Bandas relativas (ranking) para asignar perfiles ÚNICOS y adaptados a los datos
  const incomeSorted = [...stats.map((s) => s.avgIncome)].sort((a, b) => a - b);
  const spendSorted = [...stats.map((s) => s.avgSpending)].sort((a, b) => a - b);

  const clusters: ClusterInfo[] = stats.map((s) => {
    const incomeBand = bandByRank(s.avgIncome, incomeSorted, k);
    const spendBand = bandByRank(s.avgSpending, spendSorted, k);
    return {
      cluster: s.c,
      profile: profileFromBands(incomeBand, spendBand),
      size: s.members.length,
      avgIncome: s.avgIncome,
      avgSpending: s.avgSpending,
      avgAge: s.avgAge,
      pctMale: (s.members.filter((m) => m.gender === "Male").length / (s.members.length || 1)) * 100,
      centroidScaled: km.centroids[s.c],
    };
  });

  const pcaRes = pca2(scaled);
  const pca = {
    points: pcaRes.points.map((p, i) => ({ ...p, cluster: km.labels[i] })),
    explained: pcaRes.explained,
  };

  return {
    customers,
    k,
    optimalK,
    elbow: elbowData,
    silhouette: sil,
    davies: db,
    wcss: km.inertia,
    iterations: km.iterations,
    clusters,
    pca,
    scaler: { mean, std },
    features,
  };
}

// Clasifica un nuevo cliente al cluster más cercano (predict)
export function predictCluster(
  point: Vec,
  centroidsScaled: Vec[],
  mean: Vec,
  std: Vec
): number {
  const scaled = scalePoint(point, mean, std);
  let best = 0;
  let bestD = Infinity;
  centroidsScaled.forEach((c, i) => {
    let d = 0;
    for (let j = 0; j < c.length; j++) d += (scaled[j] - c[j]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}
