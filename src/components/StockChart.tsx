import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { StockDataPoint } from "@/lib/stockPredictor";

interface StockChartProps {
  data: StockDataPoint[];
  showMA50: boolean;
  showMA200: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl font-mono text-xs space-y-1">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="text-foreground font-semibold">${entry.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function StockChart({ data, showMA50, showMA200 }: StockChartProps) {
  const displayData = data.slice(-90).map(d => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }));

  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(162, 85%, 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(162, 85%, 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickLine={false}
          interval={14}
          axisLine={{ stroke: "hsl(220, 20%, 18%)" }}
        />
        <YAxis
          domain={[minPrice, maxPrice]}
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
        <Line
          type="monotone"
          dataKey="close"
          name="Close"
          stroke="hsl(162, 85%, 45%)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "hsl(162, 85%, 45%)" }}
        />
        {showMA50 && (
          <Line
            type="monotone"
            dataKey="ma50"
            name="MA 50"
            stroke="hsl(200, 85%, 60%)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
          />
        )}
        {showMA200 && (
          <Line
            type="monotone"
            dataKey="ma200"
            name="MA 200"
            stroke="hsl(35, 90%, 60%)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
