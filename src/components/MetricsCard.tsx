import { ModelMetrics } from "@/lib/stockPredictor";
import { TrendingUp, TrendingDown, Activity, Target, BarChart2, Percent } from "lucide-react";

interface MetricsCardProps {
  metrics: ModelMetrics;
}

function MetricItem({
  label, value, icon: Icon, desc, good
}: {
  label: string; value: string; icon: any; desc: string; good: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 border border-border flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-mono uppercase tracking-wider">{label}</span>
        <Icon size={14} className={good ? "text-gain" : "text-loss"} />
      </div>
      <span className={`text-xl font-bold font-mono ${good ? "text-gain" : "text-foreground"}`}>{value}</span>
      <span className="text-muted-foreground text-xs">{desc}</span>
    </div>
  );
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <MetricItem
        label="Accuracy"
        value={`${metrics.accuracy}%`}
        icon={Percent}
        desc="Model accuracy score"
        good={metrics.accuracy > 90}
      />
      <MetricItem
        label="R² Score"
        value={metrics.r2.toFixed(4)}
        icon={Target}
        desc="Coefficient of determination"
        good={metrics.r2 > 0.8}
      />
      <MetricItem
        label="MAE"
        value={`$${metrics.mae.toFixed(2)}`}
        icon={Activity}
        desc="Mean Absolute Error"
        good={true}
      />
      <MetricItem
        label="MSE"
        value={metrics.mse.toFixed(2)}
        icon={BarChart2}
        desc="Mean Squared Error"
        good={true}
      />
      <MetricItem
        label="RMSE"
        value={`$${metrics.rmse.toFixed(2)}`}
        icon={TrendingUp}
        desc="Root Mean Squared Error"
        good={true}
      />
      <div className="bg-primary/10 rounded-lg p-3 border border-primary/30 flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Status</span>
        <span className="text-primary text-sm font-bold font-mono">MODEL READY</span>
        <span className="text-muted-foreground text-xs">Trained on 80% data split</span>
      </div>
    </div>
  );
}
