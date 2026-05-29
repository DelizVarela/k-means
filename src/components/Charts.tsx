import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceDot,
  Legend,
} from "recharts";
import { AnalysisResult } from "../lib/model";

export function ElbowChart({ data, k }: { data: AnalysisResult["elbow"]; k: number }) {
  const elbowPoint = data.find((d) => d.k === k);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="k" stroke="#64748b" label={{ value: "Número de clusters (k)", position: "insideBottom", offset: -3, fill: "#64748b", fontSize: 12 }} />
          <YAxis stroke="#64748b" width={48} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
            formatter={(v: any) => [Number(v).toFixed(2), "WCSS"]}
            labelFormatter={(l) => `k = ${l}`}
          />
          <Line type="monotone" dataKey="wcss" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} />
          {elbowPoint && (
            <ReferenceDot x={elbowPoint.k} y={elbowPoint.wcss} r={8} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ScatterProps {
  result: AnalysisResult;
}

export function ClusterScatter({ result }: ScatterProps) {
  const groups = result.clusters.map((c) => ({
    name: `${c.profile.emoji} ${c.profile.name}`,
    color: c.profile.color,
    data: result.customers
      .filter((m) => m.cluster === c.cluster)
      .map((m) => ({ x: m.income, y: m.spending })),
  }));
  // centroides en escala original
  const centroids = result.clusters.map((c) => ({
    x: c.avgIncome,
    y: c.avgSpending,
    color: c.profile.color,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" name="Ingreso" stroke="#64748b" label={{ value: "Ingreso Anual (k$)", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 12 }} />
          <YAxis type="number" dataKey="y" name="Gasto" stroke="#64748b" width={40} label={{ value: "Gasto", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }} />
          <ZAxis range={[45, 45]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
            formatter={(v: any, n: any) => [v, n === "x" ? "Ingreso (k$)" : "Gasto"]}
          />
          {groups.map((g) => (
            <Scatter key={g.name} name={g.name} data={g.data} fill={g.color} fillOpacity={0.75} />
          ))}
          <Scatter
            name="Centroides"
            data={centroids}
            fill="#0f172a"
            shape="cross"
            legendType="none"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PcaScatter({ result }: ScatterProps) {
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
          <XAxis type="number" dataKey="x" name="PC1" stroke="#64748b" label={{ value: `PC1 (${(result.pca.explained[0] * 100).toFixed(1)}%)`, position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 12 }} />
          <YAxis type="number" dataKey="y" name="PC2" stroke="#64748b" width={40} label={{ value: `PC2 (${(result.pca.explained[1] * 100).toFixed(1)}%)`, angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }} />
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
