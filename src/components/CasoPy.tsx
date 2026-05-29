import { useMemo, useState } from "react";
import { runAnalysisPy, predictClusterPy } from "../lib/modelPy";
import { smToGs, SALARIO_MINIMO } from "../lib/dataPy";
import { ElbowChart } from "./Charts";
import { ClusterScatterPy, PcaScatterPy } from "./ChartsPy";

function Metric({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}



export function CasoPy() {
  const [k, setK] = useState(5);
  const [enriched, setEnriched] = useState(true);
  const result = useMemo(() => runAnalysisPy(k, enriched), [k, enriched]);

  // Clasificador
  const [income, setIncome] = useState(3);
  const [spending, setSpending] = useState(60);
  const [visits, setVisits] = useState(5);
  const [ticket, setTicket] = useState(500);
  const [pred, setPred] = useState<number | null>(null);

  const predict = () => {
    const point = enriched ? [income, spending, visits, ticket] : [income, spending];
    const centroids = result.clusters.map((c) => c.centroidScaled);
    setPred(predictClusterPy(point, centroids, result.scaler.mean, result.scaler.std));
  };
  const predInfo = pred !== null ? result.clusters.find((c) => c.cluster === pred) : null;

  const Slider = ({ label, value, set, min, max, unit }: any) => (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600" />
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Justificación de la contextualización */}
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-7 shadow-sm">
        <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          🇵🇾 Caso propio y contextualizado
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight">
          "Shopping del Este" — Ciudad del Este, Alto Paraná
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Para evitar una reproducción de tutorial, adaptamos el problema a un escenario{" "}
          <strong>real del comercio fronterizo paraguayo</strong> (Triple Frontera PY–BR–AR), uno de
          los polos comerciales más importantes de Sudamérica. Construimos un{" "}
          <strong>dataset propio de 200 clientes</strong> con variables enriquecidas y
          reglas de comportamiento que reflejan patrones locales reales.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["💵 Ingreso en SM", `Salario mínimo PY 2026 ≈ Gs. ${new Intl.NumberFormat("es-PY").format(SALARIO_MINIMO)}`],
            ["🌎 Origen del cliente", "Local · Brasileño · Argentino · Turista interno"],
            ["🔁 Frecuencia", "Visitas mensuales al shopping"],
            ["🧾 Ticket promedio", "Consumo medio en guaraníes (k Gs.)"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">{t}</div>
              <div className="mt-1 text-xs text-slate-500">{d}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-emerald-100 bg-white/70 p-4 text-sm text-slate-600">
          <strong className="text-emerald-700">Hipótesis local:</strong> en Ciudad del Este, el gasto no
          depende solo del ingreso. Los <em>turistas brasileños y argentinos</em> presentan alto gasto
          (electrónica, perfumería) aunque su ingreso declarado varíe — un patrón que K-Means logra
          capturar y que la segmentación manual tradicional pasaría por alto.
        </div>
      </section>

      {/* Controles + métricas */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="min-w-[220px] flex-1">
            <div className="mb-1 flex justify-between text-sm font-medium text-slate-700">
              <span>Número de clusters (k)</span>
              <span className="rounded-md bg-emerald-50 px-2 font-semibold text-emerald-700">{k}</span>
            </div>
            <input type="range" min={2} max={8} value={k} onChange={(e) => setK(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={enriched} onChange={(e) => setEnriched(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
            Usar variables enriquecidas (4D: + visitas y ticket)
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Silhouette" value={result.silhouette.toFixed(3)} hint="−1 a 1 · mayor mejor" color="#16a34a" />
          <Metric label="Davies-Bouldin" value={result.davies.toFixed(3)} hint="menor mejor" color="#2563eb" />
          <Metric label="WCSS" value={result.wcss.toFixed(2)} hint="inercia" color="#9333ea" />
          <Metric label="Variables" value={String(result.features.length)} hint={result.features.join(" · ")} color="#ea580c" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-bold text-slate-800">Método del codo</h3>
            <ElbowChart data={result.elbow} k={k} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-bold text-slate-800">Clusters: Ingreso (SM) vs. Gasto</h3>
            <ClusterScatterPy result={result} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 font-bold text-slate-800">
            Visualización PCA ({result.features.length} variables → 2 componentes)
          </h3>
          <p className="mb-3 text-xs text-slate-500">
            Varianza explicada total:{" "}
            {((result.pca.explained[0] + result.pca.explained[1]) * 100).toFixed(1)}%.
          </p>
          <PcaScatterPy result={result} />
        </div>
      </section>

      {/* Segmentos */}
      <section className="space-y-5">
        <h3 className="text-2xl font-bold">Perfiles del comercio fronterizo</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...result.clusters].sort((a, b) => b.size - a.size).map((c) => (
            <div key={c.cluster} className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderTop: `4px solid ${c.profile.color}` }}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.profile.emoji}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{c.size} clientes</span>
              </div>
              <h4 className="mt-3 font-bold" style={{ color: c.profile.color }}>{c.profile.name}</h4>
              <p className="text-xs text-slate-500">{c.profile.level}</p>
              <p className="mt-1 text-xs font-medium text-emerald-700">🌎 Origen predominante: {c.topOrigin}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold text-slate-700">{c.avgIncome.toFixed(1)} SM</div><div className="text-slate-400">≈ Gs. {smToGs(c.avgIncome)}</div></div>
                <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold text-slate-700">{c.avgSpending.toFixed(0)}</div><div className="text-slate-400">Gasto</div></div>
                <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold text-slate-700">{c.avgVisits.toFixed(1)}</div><div className="text-slate-400">Visitas/mes</div></div>
                <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold text-slate-700">{c.avgTicket.toFixed(0)}k</div><div className="text-slate-400">Ticket Gs.</div></div>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Estrategia local: </span>{c.profile.strategy}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clasificador contextualizado */}
      <section className="space-y-5">
        <h3 className="text-2xl font-bold">Clasificador de clientes (Shopping del Este)</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Datos del nuevo cliente</h4>
            <Slider label="Ingreso mensual" value={income} set={setIncome} min={1} max={12} unit=" SM" />
            <p className="-mt-3 text-xs text-slate-400">≈ Gs. {smToGs(income)} / mes</p>
            <Slider label="Puntaje de Gasto" value={spending} set={setSpending} min={1} max={99} unit="" />
            {enriched && <Slider label="Visitas al mes" value={visits} set={setVisits} min={1} max={12} unit="" />}
            {enriched && <Slider label="Ticket promedio" value={ticket} set={setTicket} min={40} max={1400} unit="k Gs." />}
            <button onClick={predict} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-semibold text-white shadow-md shadow-emerald-200 transition hover:brightness-110">
              Clasificar cliente →
            </button>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {predInfo ? (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-4xl" style={{ backgroundColor: predInfo.profile.color + "22", boxShadow: `0 8px 24px ${predInfo.profile.color}33` }}>{predInfo.profile.emoji}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cluster {predInfo.cluster}</div>
                <h4 className="text-xl font-bold" style={{ color: predInfo.profile.color }}>{predInfo.profile.name}</h4>
                <p className="text-sm text-slate-500">{predInfo.profile.level}</p>
                <p className="text-xs font-medium text-emerald-700">🌎 Predominio: {predInfo.topOrigin}</p>
                <div className="rounded-xl bg-slate-50 p-3 text-left text-sm text-slate-600"><span className="font-semibold text-slate-700">Estrategia: </span>{predInfo.profile.strategy}</div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <div className="mb-3 text-5xl">🇵🇾</div>
                <p className="text-sm">Ajusta los parámetros y presiona <strong>Clasificar</strong> para asignar el cliente a un segmento del Shopping del Este.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabla muestra */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-bold text-slate-800">Muestra del dataset propio etiquetado</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Sexo</th><th className="py-2 pr-3">Edad</th>
                <th className="py-2 pr-3">Origen</th><th className="py-2 pr-3">Ingreso (SM)</th><th className="py-2 pr-3">Gasto</th>
                <th className="py-2 pr-3">Vis/mes</th><th className="py-2 pr-3">Ticket</th><th className="py-2 pr-3">Segmento</th>
              </tr>
            </thead>
            <tbody>
              {result.customers.filter((_, i) => i % 17 === 0).slice(0, 12).map((m) => {
                const ci = result.clusters.find((c) => c.cluster === m.cluster)!;
                return (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium">{m.id}</td>
                    <td className="py-2 pr-3">{m.gender[0]}</td>
                    <td className="py-2 pr-3">{m.age}</td>
                    <td className="py-2 pr-3">{m.origin}</td>
                    <td className="py-2 pr-3">{m.incomeSM}</td>
                    <td className="py-2 pr-3">{m.spending}</td>
                    <td className="py-2 pr-3">{m.visitsMonth}</td>
                    <td className="py-2 pr-3">{m.ticketGs}k</td>
                    <td className="py-2 pr-3"><span className="whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: ci.profile.color }}>{ci.profile.emoji} {ci.profile.name}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comparación tutorial vs contextualizado */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
        <h3 className="mb-3 font-bold text-amber-900">¿Por qué esto NO es una reproducción de tutorial?</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-amber-200 text-amber-800"><th className="py-2 pr-4">Aspecto</th><th className="py-2 pr-4">Tutorial Mall Customers</th><th className="py-2 pr-4">Nuestro caso (Ciudad del Este)</th></tr></thead>
            <tbody className="text-slate-600">
              {[
                ["Datos", "Dataset genérico de Kaggle", "Dataset propio generado con reglas locales"],
                ["Ingreso", "Dólares (k$)", "Salarios mínimos PY → Guaraníes"],
                ["Variables", "2 (ingreso, gasto)", "Hasta 4 (+ visitas, ticket) + origen fronterizo"],
                ["Contexto", "Centro comercial abstracto", "Comercio fronterizo Triple Frontera"],
                ["Estrategias", "Genéricas", "Atención bilingüe, divisas, fechas locales"],
              ].map((r) => (
                <tr key={r[0]} className="border-b border-amber-100">
                  <td className="py-2 pr-4 font-semibold text-slate-700">{r[0]}</td>
                  <td className="py-2 pr-4">{r[1]}</td>
                  <td className="py-2 pr-4 font-medium text-emerald-700">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
