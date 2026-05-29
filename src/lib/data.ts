// ---------------------------------------------------------------------------
// Dataset "Mall Customers" — reproducción determinista de su estructura.
// 200 registros con la misma distribución que genera los 5 clusters clásicos.
// Variables: Edad, Ingreso Anual (k$), Puntaje de Gasto (1-100), Género.
// ---------------------------------------------------------------------------

export interface Customer {
  id: number;
  gender: "Female" | "Male";
  age: number;
  income: number; // Annual Income (k$)
  spending: number; // Spending Score (1-100)
}

// PRNG determinista (mulberry32) para reproducibilidad (equivalente a random_state=42)
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

// Distribución normal (Box-Muller)
function gaussian(rand: () => number, mean: number, std: number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * std;
}

const clamp = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.round(x)));

// Centros conocidos del dataset Mall Customers (Income, Spending, Age aprox.)
const groups = [
  { n: 35, income: 26, spend: 20, age: 45, gMale: 0.4 }, // bajo ingreso / bajo gasto
  { n: 22, income: 26, spend: 79, age: 25, gMale: 0.35 }, // bajo ingreso / alto gasto
  { n: 81, income: 55, spend: 50, age: 43, gMale: 0.4 }, // medio / medio
  { n: 35, income: 88, spend: 17, age: 41, gMale: 0.55 }, // alto / bajo
  { n: 27, income: 86, spend: 82, age: 33, gMale: 0.46 }, // alto / alto
];

export function buildDataset(): Customer[] {
  const rand = mulberry32(42);
  const out: Customer[] = [];
  let id = 1;
  for (const g of groups) {
    for (let i = 0; i < g.n; i++) {
      out.push({
        id: id++,
        gender: rand() < g.gMale ? "Male" : "Female",
        age: clamp(gaussian(rand, g.age, 11), 18, 70),
        income: clamp(gaussian(rand, g.income, 6), 15, 137),
        spending: clamp(gaussian(rand, g.spend, 9), 1, 99),
      });
    }
  }
  return out;
}

export const CUSTOMERS = buildDataset();
