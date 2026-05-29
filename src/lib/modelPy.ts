import { CUSTOMERS_PY, CustomerPy } from "./dataPy";
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

export interface ProfilePy {
  name: string;
  level: string;
  strategy: string;
  color: string;
  emoji: string;
}

type Band = "bajo" | "medio" | "alto";
const LBL: Record<Band, string> = { bajo: "bajo", medio: "medio", alto: "alto" };

// Catálogo de perfiles fronterizos según (ingreso, gasto)
const PROFILE_TABLE_PY: Record<string, Omit<ProfilePy, "level">> = {
  "alto|alto": { name: "Compradores Fronterizos VIP", strategy: "Atención bilingüe (PT/ES), packs de electrónica y perfumería, beneficios para turistas BR/AR, cambio de divisas preferencial.", color: "#16a34a", emoji: "🛒" },
  "alto|medio": { name: "Profesionales Consumidores", strategy: "Up-selling tecnológico, lanzamientos exclusivos, programa de millas/puntos.", color: "#14b8a6", emoji: "🏆" },
  "alto|bajo": { name: "Profesionales Ahorradores", strategy: "Fidelización local, financiación en cuotas, ofertas en hogar y tecnología de gama alta.", color: "#2563eb", emoji: "💼" },
  "medio|alto": { name: "Familias Compradoras Activas", strategy: "Bundles familiares, recompensas por frecuencia, promos por volumen.", color: "#ec4899", emoji: "🛍️" },
  "medio|medio": { name: "Familias Locales de Clase Media", strategy: "Comunicación regular, ofertas escolares, ventas cruzadas, eventos en el shopping.", color: "#a855f7", emoji: "👨‍👩‍👧" },
  "medio|bajo": { name: "Compradores Prudentes", strategy: "Reactivación, recordatorios, cupones de retorno y segunda compra.", color: "#6366f1", emoji: "🧭" },
  "bajo|alto": { name: "Jóvenes Impulsivos", strategy: "Productos trending (celulares, moda, gaming), marketing en redes, promos relámpago, cuotas sin interés.", color: "#f59e0b", emoji: "📱" },
  "bajo|medio": { name: "Aspiracionales", strategy: "Ofertas de entrada, financiación accesible, gamificación de compras.", color: "#f97316", emoji: "🌱" },
  "bajo|bajo": { name: "Clientes Ocasionales Locales", strategy: "Cupones, promociones en fechas clave (Día de la Madre, Reyes), productos de primera necesidad.", color: "#ef4444", emoji: "🪙" },
};

function bandByRank(value: number, sorted: number[], k: number): Band {
  const idx = sorted.indexOf(value);
  if (k <= 1) return "medio";
  if (k === 2) return idx === 0 ? "bajo" : "alto";
  const t = idx / (sorted.length - 1);
  if (t < 1 / 3) return "bajo";
  if (t < 2 / 3) return "medio";
  return "alto";
}

export function profileFromBandsPy(incomeBand: Band, spendBand: Band): ProfilePy {
  const base = PROFILE_TABLE_PY[`${incomeBand}|${spendBand}`] ?? PROFILE_TABLE_PY["medio|medio"];
  return { ...base, level: `Ingreso ${LBL[incomeBand]} · Gasto ${LBL[spendBand]}` };
}

export interface ClusterInfoPy {
  cluster: number;
  profile: ProfilePy;
  size: number;
  avgIncome: number;
  avgSpending: number;
  avgAge: number;
  avgVisits: number;
  avgTicket: number;
  topOrigin: string;
  centroidScaled: Vec;
}

export interface AnalysisPy {
  customers: (CustomerPy & { cluster: number })[];
  k: number;
  optimalK: number;
  elbow: { k: number; wcss: number; improvement: number }[];
  silhouette: number;
  davies: number;
  wcss: number;
  iterations: number;
  clusters: ClusterInfoPy[];
  pca: { points: { x: number; y: number; cluster: number }[]; explained: number[] };
  scaler: { mean: Vec; std: Vec };
  features: string[];
}

// Pipeline para el caso PY. Variables enriquecidas: ingreso, gasto, visitas, ticket.
export function runAnalysisPy(k = 5, enriched = true): AnalysisPy {
  const features = enriched
    ? ["Ingreso (SM)", "Puntaje de Gasto", "Visitas/mes", "Ticket prom. (kGs)"]
    : ["Ingreso (SM)", "Puntaje de Gasto"];

  const raw: Vec[] = CUSTOMERS_PY.map((c) =>
    enriched ? [c.incomeSM, c.spending, c.visitsMonth, c.ticketGs] : [c.incomeSM, c.spending]
  );
  const { scaled, mean, std } = standardize(raw);

  const elbowData = elbow(scaled, 10);
  const optimalK = detectElbow(elbowData);
  const km = kmeans(scaled, k);
  const sil = silhouetteScore(scaled, km.labels);
  const db = daviesBouldin(scaled, km.labels, km.centroids);

  const customers = CUSTOMERS_PY.map((c, i) => ({ ...c, cluster: km.labels[i] }));

  // Estadísticas por cluster
  const stats = Array.from({ length: k }, (_, c) => {
    const members = customers.filter((m) => m.cluster === c);
    const avg = (f: (x: CustomerPy) => number) =>
      members.reduce((a, m) => a + f(m), 0) / (members.length || 1);
    const counts: Record<string, number> = {};
    members.forEach((m) => (counts[m.origin] = (counts[m.origin] || 0) + 1));
    return {
      c,
      members,
      avgIncome: avg((m) => m.incomeSM),
      avgSpending: avg((m) => m.spending),
      avgAge: avg((m) => m.age),
      avgVisits: avg((m) => m.visitsMonth),
      avgTicket: avg((m) => m.ticketGs),
      topOrigin: Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Local",
    };
  });

  // Bandas relativas (ranking) → perfiles únicos adaptados a los datos
  const incomeSorted = [...stats.map((s) => s.avgIncome)].sort((a, b) => a - b);
  const spendSorted = [...stats.map((s) => s.avgSpending)].sort((a, b) => a - b);

  const clusters: ClusterInfoPy[] = stats.map((s) => ({
    cluster: s.c,
    profile: profileFromBandsPy(
      bandByRank(s.avgIncome, incomeSorted, k),
      bandByRank(s.avgSpending, spendSorted, k)
    ),
    size: s.members.length,
    avgIncome: s.avgIncome,
    avgSpending: s.avgSpending,
    avgAge: s.avgAge,
    avgVisits: s.avgVisits,
    avgTicket: s.avgTicket,
    topOrigin: s.topOrigin,
    centroidScaled: km.centroids[s.c],
  }));

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

export function predictClusterPy(point: Vec, centroidsScaled: Vec[], mean: Vec, std: Vec): number {
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
