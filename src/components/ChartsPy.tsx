import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AnalysisPy } from "../lib/modelPy";

export function ClusterScatterPy({ result }: { result: AnalysisPy }) {
  const groups = result.clusters.map((c) => ({
    name: `${c.profile.emoji} ${c.profile.name}`,
    color: c.profile.color,
    data: result.customers
      .filter((m) => m.cluster === c.cluster)
      .map((m) => ({ x: m.incomeSM, y: m.spending })),
  }));
  const centroids = result.clusters.map((c) => ({ x: c.avgIncome, y: c.avgSpending }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" stroke="#64748b" label={{ value: "Ingreso (salarios mínimos)", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 12 }} />
          <YAxis type="number" dataKey="y" stroke="#64748b" width={40} label={{ value: "Gasto", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }} />
          <ZAxis range={[45, 45]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
          {groups.map((g) => (
            <Scatter key={g.name} name={g.name} data={g.data} fill={g.color} fillOpacity={0.75} />
          ))}
          <Scatter name="Centroides" data={centroids} fill="#0f172a" shape="cross" legendType="none" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PcaScatterPy({ result }: { result: AnalysisPy }) {
  const groups = result.clusters.map((c) => ({
    name: `${c.profile.emoji} ${c.profile.name}`,
    color: c.profile.color,
    data: result.pca.points
      .filter((p) => p.cluster === c.cluster)
      .map((p) => ({ x: p.x, y: p.y })),
  }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" stroke="#64748b" label={{ value: `PC1 (${(result.pca.explained[0] * 100).toFixed(1)}%)`, position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 12 }} />
          <YAxis type="number" dataKey="y" stroke="#64748b" width={40} label={{ value: `PC2 (${(result.pca.explained[1] * 100).toFixed(1)}%)`, angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }} />
          <ZAxis range={[45, 45]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {groups.map((g) => (
            <Scatter key={g.name} name={g.name} data={g.data} fill={g.color} fillOpacity={0.75} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
