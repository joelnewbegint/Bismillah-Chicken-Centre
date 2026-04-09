import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../lib/metrics";

const GOLD = "#fbb03b";
const PROFIT_POS = "#15803d";
const PROFIT_NEG = "#b91c1c";
const AI = "#7c3aed";

function formatDayTick(dateStr) {
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
  } catch {
    return String(dateStr).slice(5);
  }
}

function formatMonthTick(isoMonth) {
  try {
    return new Date(isoMonth).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  } catch {
    return isoMonth;
  }
}

function ChartPanel({ title, description, empty, emptyMessage, children, chartKey }) {
  return (
    <article className="panel-dark pro-elevate rounded-[2rem] border border-[#d6d3d1]/40 p-4 shadow-sm dark:border-[#484847]/40">
      <h3 className="mb-1 text-base font-semibold text-[#1c1917] dark:text-[#f8fafc]">{title}</h3>
      <p className="mb-4 text-xs leading-relaxed text-[#78716c] dark:text-[#a8a29e]">{description}</p>
      <div className="h-72 min-h-[16rem] w-full">
        {empty ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#78716c] dark:text-[#a8a29e]">
            {emptyMessage}
          </div>
        ) : (
          children(chartKey)
        )}
      </div>
    </article>
  );
}

function WeeklySalesChart({ data, chartKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        key={chartKey}
        data={data}
        margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
        barCategoryGap="18%"
      >
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} interval={0} height={48} />
        <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} width={52} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(_, payload) => (payload?.[0]?.payload?.date ? `Date: ${payload[0].payload.date}` : "")}
          contentStyle={{ borderRadius: "16px", border: "1px solid var(--chart-grid)" }}
          cursor={{ fill: "var(--chart-grid)", opacity: 0.12 }}
        />
        <Bar
          dataKey="sales"
          name="Sales"
          fill={GOLD}
          radius={[8, 8, 0, 0]}
          maxBarSize={48}
          isAnimationActive
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MonthlyProfitChart({ data, chartKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        key={chartKey}
        data={data}
        margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
        barCategoryGap="16%"
      >
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
          interval={0}
          angle={-20}
          dy={8}
          height={52}
          textAnchor="end"
        />
        <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} width={52} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(_, payload) => (payload?.[0]?.payload?.month ? `Month: ${formatMonthTick(payload[0].payload.month)}` : "")}
          contentStyle={{ borderRadius: "16px", border: "1px solid var(--chart-grid)" }}
          cursor={{ fill: "var(--chart-grid)", opacity: 0.12 }}
        />
        <Bar
          dataKey="profit"
          name="Profit"
          radius={[8, 8, 0, 0]}
          maxBarSize={44}
          isAnimationActive
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((row, i) => (
            <Cell key={`m-${i}`} fill={row.profit >= 0 ? PROFIT_POS : PROFIT_NEG} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AiPredictionChart({ data, chartKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        key={chartKey}
        data={data}
        margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
        barCategoryGap="20%"
      >
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} interval={0} height={44} />
        <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 11 }} width={52} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(label) => `Forecast: ${label}`}
          contentStyle={{ borderRadius: "16px", border: "1px solid var(--chart-grid)" }}
          cursor={{ fill: "var(--chart-grid)", opacity: 0.12 }}
        />
        <Bar
          dataKey="predicted"
          name="Predicted profit"
          fill={AI}
          radius={[8, 8, 0, 0]}
          maxBarSize={44}
          isAnimationActive
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((row, i) => (
            <Cell key={`ai-${i}`} fill={row.predicted >= 0 ? AI : PROFIT_NEG} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Charts({ weeklySales, monthlyProfit, predictedProfit }) {
  const weeklyData = useMemo(
    () =>
      weeklySales.map((d) => ({
        date: d.date,
        label: formatDayTick(d.date),
        sales: Number(Number(d.sales || 0).toFixed(2)),
      })),
    [weeklySales],
  );

  const monthlyData = useMemo(
    () =>
      monthlyProfit.slice(-12).map((d) => ({
        month: d.month,
        label: formatMonthTick(d.month),
        profit: Number(Number(d.profit || 0).toFixed(2)),
      })),
    [monthlyProfit],
  );

  const aiData = useMemo(
    () =>
      predictedProfit.map((d) => ({
        label: d.day,
        predicted: Number(Number(d.predicted || 0).toFixed(2)),
      })),
    [predictedProfit],
  );

  const keyWeekly = weeklyData.map((d) => d.sales).join("-");
  const keyMonthly = monthlyData.map((d) => d.profit).join("-");
  const keyAi = aiData.map((d) => d.predicted).join("-");

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <ChartPanel
        title="Weekly Sales"
        description="Each bar is one day among the last 7 days that have sales in your selected range. Hover for the exact date and amount."
        empty={weeklyData.length === 0}
        emptyMessage="No sales in this period yet — add sales to see daily totals here."
        chartKey={keyWeekly}
      >
        {(k) => <WeeklySalesChart data={weeklyData} chartKey={k} />}
      </ChartPanel>

      <ChartPanel
        title="Monthly Profit"
        description="Profit per calendar month (sales minus expenses and buying) for up to the last 12 months in range. Green bars are positive, red are negative."
        empty={monthlyData.length === 0}
        emptyMessage="No monthly profit to show yet — record sales and costs across different months."
        chartKey={keyMonthly}
      >
        {(k) => <MonthlyProfitChart data={monthlyData} chartKey={k} />}
      </ChartPanel>

      <ChartPanel
        title="AI Profit Prediction"
        description="Simple trend extrapolation from daily profit: each bar is one future step in the 7-day forecast window."
        empty={aiData.length === 0}
        emptyMessage="Need at least two days of profit history to build a forecast — keep logging sales and costs."
        chartKey={keyAi}
      >
        {(k) => <AiPredictionChart data={aiData} chartKey={k} />}
      </ChartPanel>
    </section>
  );
}

export default Charts;
