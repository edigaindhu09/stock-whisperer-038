import { useState, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, Search, Download, RefreshCw, ChevronDown, Activity, BarChart2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import StockChart from "@/components/StockChart";
import PredictionChart from "@/components/PredictionChart";
import MetricsCard from "@/components/MetricsCard";
import {
  generateStockData, predictStockPrices, getStockName,
  POPULAR_TICKERS, ModelType
} from "@/lib/stockPredictor";
import heroBg from "@/assets/hero-bg.jpg";

const PERIOD_OPTIONS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

const MODEL_OPTIONS: { value: ModelType; label: string; badge: string }[] = [
  { value: "linear", label: "Linear Regression", badge: "Fast" },
  { value: "random_forest", label: "Random Forest", badge: "Balanced" },
  { value: "lstm", label: "LSTM Neural Net", badge: "Advanced" },
];

export default function Index() {
  const [ticker, setTicker] = useState("AAPL");
  const [inputTicker, setInputTicker] = useState("AAPL");
  const [period, setPeriod] = useState(180);
  const [model, setModel] = useState<ModelType>("linear");
  const [futureDays, setFutureDays] = useState("7");
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(false);
  const [activeTab, setActiveTab] = useState<"historical" | "prediction" | "metrics">("historical");
  const [isLoading, setIsLoading] = useState(false);

  const stockData = useMemo(() => generateStockData(ticker, period), [ticker, period]);
  const { predictions, metrics } = useMemo(
    () => predictStockPrices(stockData, parseInt(futureDays) || 7, model),
    [stockData, futureDays, model]
  );

  const lastClose = stockData[stockData.length - 1]?.close ?? 0;
  const prevClose = stockData[stockData.length - 2]?.close ?? lastClose;
  const change = lastClose - prevClose;
  const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;
  const isPositive = change >= 0;
  const stockName = getStockName(ticker);
  const nextPredicted = predictions.find(p => p.actual === undefined);

  const handleSearch = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTicker(inputTicker.toUpperCase());
      setIsLoading(false);
    }, 600);
  }, [inputTicker]);

  const handleDownload = () => {
    const rows = [
      ["Date", "Predicted", "Lower", "Upper", "Actual"],
      ...predictions.map(p => [p.date, p.predicted, p.lower, p.upper, p.actual ?? "N/A"]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticker}_predictions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header
        className="relative border-b border-border overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-primary" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase">ML Stock Predictor</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Stock Price{" "}
                <span className="text-primary" style={{ textShadow: "0 0 20px hsl(162 85% 45% / 0.5)" }}>
                  Predictor
                </span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Machine learning–powered price forecasting with moving averages
              </p>
            </div>

            {/* Live Quote */}
            <div className="terminal-border rounded-lg px-5 py-3 bg-card/80 backdrop-blur min-w-[200px]">
              <div className="font-mono text-xs text-muted-foreground mb-1">{stockName}</div>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold font-mono">${lastClose.toFixed(2)}</span>
                <span className={`flex items-center gap-1 text-sm font-mono pb-0.5 ${isPositive ? "text-gain" : "text-loss"}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? "+" : ""}{change.toFixed(2)} ({changePct.toFixed(2)}%)
                </span>
              </div>
              {nextPredicted && (
                <div className="mt-1 text-xs font-mono text-muted-foreground">
                  Next pred: <span className="text-accent">${nextPredicted.predicted.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Controls */}
        <div className="terminal-border rounded-xl bg-card p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Ticker input */}
            <div className="flex-1 min-w-[160px] max-w-[220px]">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Ticker Symbol
              </Label>
              <div className="flex gap-2">
                <Input
                  value={inputTicker}
                  onChange={e => setInputTicker(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="AAPL"
                  className="font-mono uppercase bg-muted/50 border-border focus:border-primary h-9"
                  maxLength={6}
                />
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-9 px-3"
                >
                  {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                </Button>
              </div>
            </div>

            {/* Model */}
            <div className="min-w-[180px]">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                ML Model
              </Label>
              <Select value={model} onValueChange={(v: ModelType) => setModel(v)}>
                <SelectTrigger className="h-9 bg-muted/50 border-border font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {MODEL_OPTIONS.map(m => (
                    <SelectItem key={m.value} value={m.value} className="font-mono text-sm">
                      <span className="flex items-center gap-2">
                        {m.label}
                        <span className="text-xs text-muted-foreground">({m.badge})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period */}
            <div>
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                History
              </Label>
              <div className="flex gap-1">
                {PERIOD_OPTIONS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setPeriod(p.days)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all border ${
                      period === p.days
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Future days */}
            <div className="min-w-[120px]">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Forecast Days
              </Label>
              <Select value={futureDays} onValueChange={setFutureDays}>
                <SelectTrigger className="h-9 bg-muted/50 border-border font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["3", "5", "7", "14", "30"].map(d => (
                    <SelectItem key={d} value={d} className="font-mono">{d} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Download */}
            <Button variant="outline" size="sm" onClick={handleDownload} className="h-9 border-border hover:border-primary/50 gap-2">
              <Download size={14} />
              <span className="hidden sm:inline font-mono text-xs">Export CSV</span>
            </Button>
          </div>

          {/* Popular tickers */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs font-mono text-muted-foreground self-center">Quick:</span>
            {POPULAR_TICKERS.map(t => (
              <button
                key={t}
                onClick={() => { setInputTicker(t); setTicker(t); }}
                className={`px-2 py-0.5 rounded text-xs font-mono border transition-all ${
                  ticker === t
                    ? "bg-primary/20 text-primary border-primary/50"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
          {([
            { key: "historical", label: "Historical", icon: BarChart2 },
            { key: "prediction", label: "Prediction", icon: TrendingUp },
            { key: "metrics", label: "Metrics", icon: Layers },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Historical Chart */}
        {activeTab === "historical" && (
          <div className="terminal-border rounded-xl bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-lg">
                  <span className="font-mono text-primary">{ticker}</span> — Historical Price
                </h2>
                <p className="text-muted-foreground text-xs font-mono">
                  {stockData.length} trading days · Close price with optional moving averages
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="ma50" checked={showMA50} onCheckedChange={setShowMA50} />
                  <Label htmlFor="ma50" className="text-xs font-mono text-muted-foreground cursor-pointer">MA 50</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="ma200" checked={showMA200} onCheckedChange={setShowMA200} />
                  <Label htmlFor="ma200" className="text-xs font-mono text-muted-foreground cursor-pointer">MA 200</Label>
                </div>
              </div>
            </div>
            <StockChart data={stockData} showMA50={showMA50} showMA200={showMA200} />

            {/* OHLCV Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-border">
              {[
                { label: "OPEN", value: stockData[stockData.length - 1]?.open },
                { label: "HIGH", value: stockData[stockData.length - 1]?.high },
                { label: "LOW", value: stockData[stockData.length - 1]?.low },
                { label: "CLOSE", value: stockData[stockData.length - 1]?.close },
                { label: "VOLUME", value: null, vol: stockData[stockData.length - 1]?.volume },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-muted-foreground text-xs font-mono uppercase">{item.label}</div>
                  <div className="font-mono font-semibold text-sm mt-0.5">
                    {item.vol !== undefined
                      ? `${(item.vol / 1_000_000).toFixed(1)}M`
                      : `$${item.value?.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prediction Chart */}
        {activeTab === "prediction" && (
          <div className="terminal-border rounded-xl bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-lg">
                  <span className="font-mono text-primary">{ticker}</span> — Price Forecast
                </h2>
                <p className="text-muted-foreground text-xs font-mono">
                  {MODEL_OPTIONS.find(m => m.value === model)?.label} · {futureDays}-day future prediction with confidence interval
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-primary border-primary/40 text-xs">
                {MODEL_OPTIONS.find(m => m.value === model)?.badge}
              </Badge>
            </div>
            <PredictionChart data={predictions} lastActualDate={stockData[stockData.length - 1]?.date} />

            {/* Predicted prices table */}
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Future Price Forecast
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-muted-foreground py-2 pr-4">Date</th>
                      <th className="text-right text-muted-foreground py-2 px-4">Predicted</th>
                      <th className="text-right text-muted-foreground py-2 px-4">Lower</th>
                      <th className="text-right text-muted-foreground py-2 px-4">Upper</th>
                      <th className="text-right text-muted-foreground py-2 pl-4">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions
                      .filter(p => p.actual === undefined)
                      .map((p, i) => {
                        const prev = i === 0 ? lastClose : predictions.filter(x => x.actual === undefined)[i - 1].predicted;
                        const chg = p.predicted - prev;
                        const pct = (chg / prev) * 100;
                        return (
                          <tr key={p.date} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 text-muted-foreground">{p.date}</td>
                            <td className="text-right py-2 px-4 font-semibold">${p.predicted.toFixed(2)}</td>
                            <td className="text-right py-2 px-4 text-muted-foreground">${p.lower.toFixed(2)}</td>
                            <td className="text-right py-2 px-4 text-muted-foreground">${p.upper.toFixed(2)}</td>
                            <td className={`text-right py-2 pl-4 ${chg >= 0 ? "text-gain" : "text-loss"}`}>
                              {chg >= 0 ? "+" : ""}{chg.toFixed(2)} ({pct.toFixed(2)}%)
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

        {/* Metrics */}
        {activeTab === "metrics" && (
          <div className="terminal-border rounded-xl bg-card p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-lg">
                <span className="font-mono text-primary">{MODEL_OPTIONS.find(m => m.value === model)?.label}</span> — Model Metrics
              </h2>
              <p className="text-muted-foreground text-xs font-mono">
                Evaluated on 20% test split · {ticker} · {period}-day history
              </p>
            </div>
            <MetricsCard metrics={metrics} />

            <div className="mt-5 p-4 rounded-lg bg-muted/30 border border-border font-mono text-xs text-muted-foreground space-y-1">
              <div className="text-foreground font-semibold mb-2">⚡ Model Pipeline</div>
              <div>1. <span className="text-primary">Data Collection</span> — Historical OHLCV data with {stockData.length} trading days</div>
              <div>2. <span className="text-primary">Preprocessing</span> — Min-max normalization, date encoding, feature engineering</div>
              <div>3. <span className="text-primary">Training</span> — 80/20 train-test split using {MODEL_OPTIONS.find(m => m.value === model)?.label}</div>
              <div>4. <span className="text-primary">Prediction</span> — {futureDays}-day rolling forecast with confidence intervals</div>
              <div>5. <span className="text-primary">Evaluation</span> — MAE: ${metrics.mae.toFixed(2)} · RMSE: ${metrics.rmse.toFixed(2)} · R²: {metrics.r2.toFixed(4)}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-muted-foreground text-xs font-mono pb-4">
          ⚠ For educational purposes only · Not financial advice · Data is simulated
        </div>
      </main>
    </div>
  );
}
