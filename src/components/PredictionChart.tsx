import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { PredictionPoint } from "@/lib/stockPredictor";

interface PredictionChartProps {
  data: PredictionPoint[];
  lastActualDate: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl font-mono text-xs space-y-1">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any) => {
          if (entry.dataKey === "range") return null;
          return (
            <div key={entry.dataKey} className="flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="text-foreground font-semibold">
                ${Array.isArray(entry.value) ? `${entry.value[0]?.toFixed(2)} - ${entry.value[1]?.toFixed(2)}` : entry.value?.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function PredictionChart({ data, lastActualDate }: PredictionChartProps) {
  const chartData = data.map(d => ({
    ...d,
    date: d.date.slice(5),
    range: [d.lower, d.upper],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(200, 85%, 50%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(200, 85%, 50%)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickLine={false}
          interval={3}
          axisLine={{ stroke: "hsl(220, 20%, 18%)" }}
        />
        <YAxis
          tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", fontFamily: "JetBrains Mono", color: "hsl(215, 15%, 60%)" }}
        />
        <Area
          type="monotone"
          dataKey="range"
          fill="url(#confGrad)"
          stroke="none"
          name="Confidence"
        />
        {data.some(d => d.actual !== undefined) && (
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="hsl(162, 85%, 45%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="predicted"
          name="Predicted"
          stroke="hsl(200, 85%, 60%)"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={(props: any) => {
            if (props.payload.actual === undefined) {
              return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill="hsl(200, 85%, 60%)" />;
            }
            return <g key={props.index} />;
          }}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
