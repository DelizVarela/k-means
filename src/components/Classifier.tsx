import { useState } from "react";
import { AnalysisResult, predictCluster } from "../lib/model";

export function Classifier({ result }: { result: AnalysisResult }) {
  const useAge = result.features.length === 3;
  const [age, setAge] = useState(35);
  const [income, setIncome] = useState(60);
  const [spending, setSpending] = useState(55);
  const [predicted, setPredicted] = useState<number | null>(null);

  const handlePredict = () => {
    const point = useAge ? [age, income, spending] : [income, spending];
    const centroids = result.clusters.map((c) => c.centroidScaled);
    const c = predictCluster(point, centroids, result.scaler.mean, result.scaler.std);
    setPredicted(c);
  };

  const info = predicted !== null ? result.clusters.find((c) => c.cluster === predicted) : null;

  const Slider = ({
    label,
    value,
    set,
    min,
    max,
    unit,
  }: {
    label: string;
    value: number;
    set: (v: number) => void;
    min: number;
    max: number;
    unit?: string;
  }) => (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-600">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(+e.target.value)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
      />
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Datos del nuevo cliente</h3>
        {useAge && <Slider label="Edad" value={age} set={setAge} min={18} max={70} unit=" años" />}
        <Slider label="Ingreso Anual" value={income} set={setIncome} min={15} max={140} unit=" k$" />
        <Slider label="Puntaje de Gasto" value={spending} set={setSpending} min={1} max={99} />
        <button
          onClick={handlePredict}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-md shadow-indigo-200 transition hover:brightness-110"
        >
          Clasificar cliente →
        </button>
      </div>

      <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {info ? (
          <div className="space-y-3 text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
              style={{ backgroundColor: info.profile.color + "22", boxShadow: `0 8px 24px ${info.profile.color}33` }}
            >
              {info.profile.emoji}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cluster {info.cluster}
            </div>
            <h3 className="text-xl font-bold" style={{ color: info.profile.color }}>
              {info.profile.name}
            </h3>
            <p className="text-sm text-slate-500">{info.profile.level}</p>
            <div className="rounded-xl bg-slate-50 p-3 text-left text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Estrategia sugerida: </span>
              {info.profile.strategy}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <div className="mb-3 text-5xl">🎯</div>
            <p className="text-sm">
              Ajusta los parámetros y presiona <strong>Clasificar</strong> para ver a qué segmento
              pertenece el cliente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
