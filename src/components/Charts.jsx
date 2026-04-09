import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../lib/metrics";

function Charts({ weeklySales, monthlyProfit, actualProfit, predictedProfit }) {
  const predictionRows = [
    ...actualProfit.map((item) => ({
      label: item.date,
      actual: item.profit,
      predicted: null,
    })),
    ...predictedProfit.map((item) => ({
      label: item.day,
      actual: null,
      predicted: item.predicted,
    })),
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="panel-dark pro-elevate rounded-[2rem] border border-[#d6d3d1]/40 p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#1c1917]">Weekly Sales</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklySales}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "var(--chart-axis)" }} />
              <YAxis tick={{ fill: "var(--chart-axis)" }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: "16px", border: "1px solid var(--chart-grid)" }}
              />
              <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel-dark pro-elevate rounded-[2rem] border border-[#d6d3d1]/40 p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#1c1917]">Monthly Profit</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProfit}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "var(--chart-axis)" }} />
              <YAxis tick={{ fill: "var(--chart-axis)" }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: "16px", border: "1px solid var(--chart-grid)" }}
              />
              <Bar dataKey="profit" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel-dark pro-elevate rounded-[2rem] border border-[#d6d3d1]/40 p-4 shadow-sm lg:col-span-2">
        <h3 className="mb-4 text-base font-semibold text-[#1c1917]">AI Profit Prediction</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionRows}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "var(--chart-axis)" }} />
              <YAxis tick={{ fill: "var(--chart-axis)" }} />
              <Tooltip
                formatter={(value) => (value == null ? "-" : formatCurrency(value))}
                contentStyle={{ borderRadius: "16px", border: "1px solid var(--chart-grid)" }}
              />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Actual Profit" />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#9333ea"
                strokeDasharray="6 6"
                strokeWidth={3}
                name="Predicted Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

export default Charts;
