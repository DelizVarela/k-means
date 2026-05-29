// ---------------------------------------------------------------------------
// DATASET PROPIO Y CONTEXTUALIZADO — Caso real adaptado a Paraguay.
// "Shopping del Este" — centro comercial ubicado en Ciudad del Este (Alto Paraná),
// zona de intenso comercio fronterizo (Triple Frontera: PY-BR-AR).
//
// El dataset adapta la estructura de Mall Customers a la realidad local:
//  - Ingresos expresados en SALARIOS MÍNIMOS mensuales (PY 2026 ≈ Gs. 2.800.000).
//  - Se incorporan variables propias del contexto fronterizo:
//      * origen del cliente (Local / Brasileño / Argentino / Turista)
//      * frecuencia de visitas mensuales
//      * ticket promedio en guaraníes
//  - El comportamiento de gasto refleja patrones reales de compra fronteriza:
//    los turistas brasileños/argentinos suelen tener gasto alto aunque su ingreso
//    declarado varíe (compra de electrónica, perfumería, etc.).
// ---------------------------------------------------------------------------

export type Origin = "Local" | "Brasileño" | "Argentino" | "Turista interno";

export interface CustomerPy {
  id: number;
  gender: "Femenino" | "Masculino";
  age: number;
  origin: Origin;
  incomeSM: number; // ingreso mensual en salarios mínimos
  spending: number; // puntaje de gasto 1-100
  visitsMonth: number; // frecuencia de visitas al mes
  ticketGs: number; // ticket promedio en miles de guaraníes (k Gs.)
}

const SALARIO_MINIMO_GS = 2800000; // referencia 2026

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
function gaussian(rand: () => number, mean: number, std: number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return mean + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std;
}
const clampR = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(x)));
const clampF = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Perfiles esperados del comercio fronterizo de Ciudad del Este (centros conocidos):
//  income (salarios mín.), spend, age, origen dominante
const groups = [
  // Compradores fronterizos de alto volumen (turistas BR/AR con gasto alto)
  { n: 38, incomeSM: 4.0, spend: 82, age: 34, originW: { Brasileño: 0.5, Argentino: 0.35, Local: 0.1, "Turista interno": 0.05 }, gMale: 0.5 },
  // Familias locales de clase media (compra estacional)
  { n: 70, incomeSM: 2.2, spend: 50, age: 40, originW: { Local: 0.75, "Turista interno": 0.15, Brasileño: 0.07, Argentino: 0.03 }, gMale: 0.42 },
  // Profesionales locales de alto ingreso, gasto moderado (ahorradores)
  { n: 34, incomeSM: 6.5, spend: 24, age: 44, originW: { Local: 0.8, Brasileño: 0.1, Argentino: 0.05, "Turista interno": 0.05 }, gMale: 0.55 },
  // Jóvenes/estudiantes ingreso bajo, gasto impulsivo (tecnología, moda)
  { n: 30, incomeSM: 1.3, spend: 78, age: 24, originW: { Local: 0.6, "Turista interno": 0.2, Brasileño: 0.13, Argentino: 0.07 }, gMale: 0.45 },
  // Clientes ocasionales ingreso bajo, gasto bajo
  { n: 28, incomeSM: 1.4, spend: 22, age: 47, originW: { Local: 0.85, "Turista interno": 0.1, Brasileño: 0.03, Argentino: 0.02 }, gMale: 0.4 },
];

function pickOrigin(rand: () => number, w: Record<string, number>): Origin {
  let r = rand();
  for (const k in w) {
    r -= w[k];
    if (r <= 0) return k as Origin;
  }
  return "Local";
}

export function buildDatasetPy(): CustomerPy[] {
  const rand = mulberry32(2026);
  const out: CustomerPy[] = [];
  let id = 1;
  for (const g of groups) {
    for (let i = 0; i < g.n; i++) {
      const incomeSM = clampF(gaussian(rand, g.incomeSM, g.incomeSM * 0.22), 0.8, 12);
      const spending = clampR(gaussian(rand, g.spend, 10), 1, 99);
      // visitas correlacionadas con gasto; ticket correlacionado con gasto e ingreso
      const visits = clampR(gaussian(rand, 1 + (spending / 100) * 7, 1.5), 1, 12);
      const ticket = clampR(gaussian(rand, 120 + spending * 9 + incomeSM * 18, 60), 40, 1400);
      out.push({
        id: id++,
        gender: rand() < g.gMale ? "Masculino" : "Femenino",
        age: clampR(gaussian(rand, g.age, 10), 18, 72),
        origin: pickOrigin(rand, g.originW),
        incomeSM: Math.round(incomeSM * 10) / 10,
        spending,
        visitsMonth: visits,
        ticketGs: ticket,
      });
    }
  }
  return out;
}

export const CUSTOMERS_PY = buildDatasetPy();
export const SALARIO_MINIMO = SALARIO_MINIMO_GS;

// Convierte salarios mínimos a guaraníes mensuales formateados
export function smToGs(sm: number): string {
  const gs = sm * SALARIO_MINIMO_GS;
  return new Intl.NumberFormat("es-PY").format(Math.round(gs / 1000) * 1000);
}
