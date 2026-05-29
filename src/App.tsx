import { useMemo, useState } from "react";
import { runAnalysis } from "./lib/model";
import { ElbowChart, ClusterScatter, PcaScatter } from "./components/Charts";
import { Classifier } from "./components/Classifier";
import { Report } from "./components/Report";
import { CasoPy } from "./components/CasoPy";

type Tab = "inicio" | "caso-py" | "demo" | "segmentos" | "clasificador" | "informe";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "inicio", label: "Inicio", icon: "🏠" },
  { id: "caso-py", label: "Caso Paraguay 🇵🇾", icon: "🇵🇾" },
  { id: "demo", label: "Demostración", icon: "🧪" },
  { id: "segmentos", label: "Segmentos", icon: "👥" },
  { id: "clasificador", label: "Clasificador", icon: "🎯" },
  { id: "informe", label: "Informe", icon: "📄" },
];

function MetricCard({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("inicio");
  const [k, setK] = useState(5);
  const [useAge, setUseAge] = useState(false);

  const result = useMemo(() => runAnalysis(k, useAge), [k, useAge]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg shadow-md shadow-indigo-200">
              📊
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Segmentación de Clientes · K-Means</div>
              <div className="text-[11px] text-slate-500">Inteligencia Artificial II · UNE — FP</div>
            </div>
          </div>
          <nav className="hidden gap-1 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* ---------------- INICIO ---------------- */}
        {tab === "inicio" && (
          <div className="space-y-10">
            <section className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Trabajo Práctico Final · Tema 7: Clustering
                </span>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                  Segmentación de clientes con{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    K-Means
                  </span>
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  Aprendizaje no supervisado aplicado al dataset <em>Mall Customers</em> para descubrir
                  perfiles de clientes y diseñar estrategias comerciales personalizadas — todo
                  ejecutándose en vivo en tu navegador.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setTab("caso-py")}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-semibold text-white shadow-md shadow-emerald-200 transition hover:brightness-110"
                  >
                    Caso real Paraguay 🇵🇾
                  </button>
                  <button
                    onClick={() => setTab("demo")}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Demostración base 🧪
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-indigo-100/50">
                <ClusterScatter result={runAnalysis(5, false)} />
                <p className="px-2 pb-1 text-center text-xs text-slate-400">
                  Clusters de clientes en vivo (Ingreso vs. Gasto)
                </p>
              </div>
            </section>

            {/* Portada / ficha */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Ficha del trabajo</h2>
              <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Universidad", "Universidad Nacional del Este"],
                  ["Facultad", "Facultad Politécnica"],
                  ["Carrera", "Ingeniería de Sistemas"],
                  ["Asignatura", "Inteligencia Artificial II — 7º semestre"],
                  ["Docente", "Ing. Carlos Domingo Almeida Delgado"],
                  ["Técnica de IA", "K-Means (clustering no supervisado)"],
                  ["Dataset", "Mall Customers (200 registros)"],
                  ["Año", "2026"],
                ].map(([k2, v]) => (
                  <div key={k2} className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k2}</div>
                    <div className="font-medium text-slate-700">{v}</div>
                  </div>
                ))}
              </div>
            </section>

            <section
              onClick={() => setTab("caso-py")}
              className="cursor-pointer rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-600 p-7 text-white shadow-lg transition hover:brightness-105"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    🇵🇾 Datos propios y contextualizados
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold">Caso real: Shopping del Este, Ciudad del Este</h2>
                  <p className="mt-1 max-w-2xl text-sm text-emerald-50">
                    Dataset propio de 200 clientes del comercio fronterizo (Triple Frontera), con
                    ingresos en salarios mínimos / guaraníes, origen del cliente, frecuencia de visitas
                    y ticket promedio. Cumple el requisito de contextualización de la guía.
                  </p>
                </div>
                <span className="text-3xl">→</span>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                ["⚙️", "Pipeline completo", "Normalización → Codo → K-Means++ → PCA → Métricas, implementado en TypeScript puro."],
                ["📈", "Métricas reales", "Silhouette, Davies-Bouldin e inercia (WCSS) calculadas en vivo sobre los datos."],
                ["🎯", "Predicción interactiva", "Ingresa un cliente nuevo y descubre a qué segmento pertenece al instante."],
              ].map(([i, t, d]) => (
                <div key={t} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-3xl">{i}</div>
                  <h3 className="mt-3 font-bold text-slate-800">{t}</h3>
                  <p className="mt-1 text-sm text-slate-500">{d}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ---------------- CASO PARAGUAY ---------------- */}
        {tab === "caso-py" && <CasoPy />}

        {/* ---------------- DEMO ---------------- */}
        {tab === "demo" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Demostración práctica</h2>
              <p className="mt-1 text-slate-500">
                Ajusta los hiperparámetros y observa cómo el modelo K-Means se reentrena en tiempo real.
              </p>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex-1 min-w-[220px]">
                <div className="mb-1 flex justify-between text-sm font-medium text-slate-700">
                  <span>Número de clusters (k)</span>
                  <span className="rounded-md bg-indigo-50 px-2 font-semibold text-indigo-600">{k}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={k}
                  onChange={(e) => setK(+e.target.value)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={useAge}
                  onChange={(e) => setUseAge(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Incluir variable Edad (3D + PCA)
              </label>
            </div>

            {/* Métricas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Silhouette" value={result.silhouette.toFixed(3)} hint="−1 a 1 · mayor es mejor" color="#16a34a" />
              <MetricCard label="Davies-Bouldin" value={result.davies.toFixed(3)} hint="menor es mejor" color="#2563eb" />
              <MetricCard label="WCSS (inercia)" value={result.wcss.toFixed(2)} hint="compacidad de clusters" color="#9333ea" />
              <MetricCard label="Iteraciones" value={String(result.iterations)} hint="hasta converger" color="#ea580c" />
            </div>

            {/* Codo + Scatter */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-bold text-slate-800">Método del codo</h3>
                <p className="mb-3 text-xs text-slate-500">
                  El punto rojo marca la k actual. El algoritmo Kneedle detecta automáticamente el
                  codo en{" "}
                  <strong className="text-rose-600">k = {result.optimalK}</strong>.
                </p>
                <ElbowChart data={result.elbow} k={k} />
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="pr-3 font-medium">k</th>
                        <th className="pr-3 font-medium">WCSS</th>
                        <th className="font-medium">Mejora vs. k−1</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.elbow.slice(1, 7).map((e) => (
                        <tr key={e.k} className={e.k === result.optimalK ? "font-bold text-rose-600" : "text-slate-600"}>
                          <td className="pr-3">{e.k}</td>
                          <td className="pr-3">{e.wcss.toFixed(2)}</td>
                          <td>{e.improvement.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-bold text-slate-800">Clusters: Ingreso vs. Gasto</h3>
                <p className="mb-3 text-xs text-slate-500">Las cruces oscuras son los centroides.</p>
                <ClusterScatter result={result} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 font-bold text-slate-800">
                Visualización con PCA ({result.features.length} variables → 2 componentes)
              </h3>
              <p className="mb-3 text-xs text-slate-500">
                Varianza explicada: PC1 {(result.pca.explained[0] * 100).toFixed(1)}% + PC2{" "}
                {(result.pca.explained[1] * 100).toFixed(1)}% ={" "}
                {((result.pca.explained[0] + result.pca.explained[1]) * 100).toFixed(1)}%.
              </p>
              <PcaScatter result={result} />
            </div>
          </div>
        )}

        {/* ---------------- SEGMENTOS ---------------- */}
        {tab === "segmentos" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Perfiles de los {result.k} segmentos</h2>
              <p className="mt-1 text-slate-500">
                Interpretación de cada cluster con su estrategia comercial sugerida.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...result.clusters]
                .sort((a, b) => b.size - a.size)
                .map((c) => (
                  <div
                    key={c.cluster}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                    style={{ borderTop: `4px solid ${c.profile.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{c.profile.emoji}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {c.size} clientes
                      </span>
                    </div>
                    <h3 className="mt-3 font-bold" style={{ color: c.profile.color }}>
                      {c.profile.name}
                    </h3>
                    <p className="text-xs text-slate-500">{c.profile.level}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <div className="font-bold text-slate-700">{c.avgIncome.toFixed(0)}k</div>
                        <div className="text-slate-400">Ingreso</div>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <div className="font-bold text-slate-700">{c.avgSpending.toFixed(0)}</div>
                        <div className="text-slate-400">Gasto</div>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <div className="font-bold text-slate-700">{c.avgAge.toFixed(0)}</div>
                        <div className="text-slate-400">Edad</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Estrategia: </span>
                      {c.profile.strategy}
                    </div>
                  </div>
                ))}
            </div>

            {/* Tabla de muestra */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-bold text-slate-800">Muestra del dataset etiquetado</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Género</th>
                      <th className="py-2 pr-4">Edad</th>
                      <th className="py-2 pr-4">Ingreso (k$)</th>
                      <th className="py-2 pr-4">Gasto</th>
                      <th className="py-2 pr-4">Segmento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.customers.slice(0, 12).map((m) => {
                      const ci = result.clusters.find((c) => c.cluster === m.cluster)!;
                      return (
                        <tr key={m.id} className="border-b border-slate-100">
                          <td className="py-2 pr-4 font-medium">{m.id}</td>
                          <td className="py-2 pr-4">{m.gender === "Male" ? "M" : "F"}</td>
                          <td className="py-2 pr-4">{m.age}</td>
                          <td className="py-2 pr-4">{m.income}</td>
                          <td className="py-2 pr-4">{m.spending}</td>
                          <td className="py-2 pr-4">
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                              style={{ backgroundColor: ci.profile.color }}
                            >
                              {ci.profile.emoji} {ci.profile.name}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CLASIFICADOR ---------------- */}
        {tab === "clasificador" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Clasificador de clientes (predict)</h2>
              <p className="mt-1 text-slate-500">
                Demostración del flujo: <strong>entrada de datos → procesamiento con IA → salida →
                interpretación</strong>. Asigna un cliente nuevo al centroide más cercano.
              </p>
            </div>
            <Classifier result={result} />
          </div>
        )}

        {/* ---------------- INFORME ---------------- */}
        {tab === "informe" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Informe académico</h2>
              <p className="mt-1 text-slate-500">
                Estructura completa según la guía didáctica. Haz clic en cada sección para expandir.
              </p>
            </div>
            <Report />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        IA2_2026_TPF · Segmentación de Clientes con K-Means · Universidad Nacional del Este — Facultad Politécnica
      </footer>
    </div>
  );
}
