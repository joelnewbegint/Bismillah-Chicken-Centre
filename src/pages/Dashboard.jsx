import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Charts from "../components/Charts";
import { Badge, Panel } from "../components/ui";
import {
  dailyProfitData,
  groupMonthlyProfit,
  groupSalesByDate,
  insightLabel,
  predictProfit,
} from "../lib/metrics";
import { supabase } from "../lib/supabase";
import { createRunWithAuthRecovery } from "../lib/supabaseAuthRecovery";

function Dashboard() {
  const navigate = useNavigate();
  const runWithAuthRecovery = useMemo(() => createRunWithAuthRecovery(navigate), [navigate]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [buying, setBuying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      const [salesRes, expenseRes, buyingRes] = await Promise.all([
        runWithAuthRecovery(() => supabase.from("sales").select("*").order("date", { ascending: true })),
        runWithAuthRecovery(() => supabase.from("expenses").select("*").order("date", { ascending: true })),
        runWithAuthRecovery(() => supabase.from("chicken_buying").select("*").order("date", { ascending: true })),
      ]);

      if (salesRes.error || expenseRes.error || buyingRes.error) {
        setError(
          salesRes.error?.message ||
            expenseRes.error?.message ||
            buyingRes.error?.message ||
            "Failed to load dashboard data.",
        );
      } else {
        setSales(salesRes.data || []);
        setExpenses(expenseRes.data || []);
        setBuying(buyingRes.data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredSales = useMemo(() => {
    if (range === "all") return sales;
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffString = cutoff.toISOString().slice(0, 10);
    return sales.filter((sale) => sale.date >= cutoffString);
  }, [sales, range]);

  const filteredExpenses = useMemo(() => {
    if (range === "all") return expenses;
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffString = cutoff.toISOString().slice(0, 10);
    return expenses.filter((expense) => expense.date >= cutoffString);
  }, [expenses, range]);

  const filteredBuying = useMemo(() => {
    if (range === "all") return buying;
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffString = cutoff.toISOString().slice(0, 10);
    return buying.filter((entry) => entry.date >= cutoffString);
  }, [buying, range]);

  const totalSales = useMemo(() => filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0), [filteredSales]);
  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [filteredExpenses],
  );
  const totalBuying = useMemo(
    () => filteredBuying.reduce((sum, b) => sum + Number(b.total || 0), 0),
    [filteredBuying],
  );
  const totalCost = totalExpenses + totalBuying;
  const profit = totalSales - totalCost;

  const combinedCosts = useMemo(
    () => [
      ...filteredExpenses.map((e) => ({ date: e.date, amount: Number(e.amount || 0) })),
      ...filteredBuying.map((b) => ({ date: b.date, amount: Number(b.total || 0) })),
    ],
    [filteredExpenses, filteredBuying],
  );

  const weeklySales = useMemo(() => groupSalesByDate(filteredSales).slice(-7), [filteredSales]);
  const monthlyProfit = useMemo(() => groupMonthlyProfit(filteredSales, combinedCosts), [filteredSales, combinedCosts]);
  const actualProfit = useMemo(() => dailyProfitData(filteredSales, combinedCosts), [filteredSales, combinedCosts]);
  const predictedProfit = useMemo(() => predictProfit(actualProfit), [actualProfit]);

  if (loading) {
    return <Panel className="rounded-[2rem]">Loading dashboard...</Panel>;
  }

  return (
    <section className="space-y-5">
      <Panel className="pro-elevate flex flex-wrap items-center justify-between gap-3 rounded-[2rem] p-4">
        <h2 className="text-xl font-semibold text-[#1c1917]">Dashboard</h2>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-full border border-[#d6d3d1] bg-white px-3 py-1.5 text-sm text-[#1c1917] focus:border-[#f97316] focus:outline-none"
          >
            <option value="all">All time</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Badge variant="primary">{insightLabel(predictedProfit)}</Badge>
        </div>
      </Panel>

      {error ? <p className="rounded-full bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Total Sales" value={totalSales} />
        <Card title="Expenses + Buying" value={totalCost} variant="danger" />
        <Card title="Profit" value={profit} variant={profit >= 0 ? "success" : "danger"} />
      </div>

      <Charts weeklySales={weeklySales} monthlyProfit={monthlyProfit} predictedProfit={predictedProfit} />
    </section>
  );
}

export default Dashboard;
