export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    Number(value || 0),
  );

export const formatDateIso = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return `${value}`;
  return parsed.toISOString().slice(0, 10);
};

export const groupSalesByDate = (sales = []) => {
  const buckets = {};
  for (const sale of sales) {
    const date = formatDateIso(sale.date);
    buckets[date] = (buckets[date] || 0) + Number(sale.total || 0);
  }
  return Object.entries(buckets)
    .map(([date, total]) => ({ date, sales: total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const groupMonthlyProfit = (sales = [], expenses = []) => {
  const salesByMonth = {};
  const expensesByMonth = {};

  for (const sale of sales) {
    const month = formatDateIso(sale.date)?.slice(0, 7);
    salesByMonth[month] = (salesByMonth[month] || 0) + Number(sale.total || 0);
  }

  for (const expense of expenses) {
    const month = formatDateIso(expense.date)?.slice(0, 7);
    expensesByMonth[month] = (expensesByMonth[month] || 0) + Number(expense.amount || 0);
  }

  return [...new Set([...Object.keys(salesByMonth), ...Object.keys(expensesByMonth)])]
    .filter(Boolean)
    .sort()
    .map((month) => ({
      month: `${month}-01`,
      profit: (salesByMonth[month] || 0) - (expensesByMonth[month] || 0),
    }));
};

export const dailyProfitData = (sales = [], expenses = []) => {
  const salesByDay = {};
  const expensesByDay = {};

  for (const sale of sales) {
    const date = formatDateIso(sale.date);
    salesByDay[date] = (salesByDay[date] || 0) + Number(sale.total || 0);
  }

  for (const expense of expenses) {
    const date = formatDateIso(expense.date);
    expensesByDay[date] = (expensesByDay[date] || 0) + Number(expense.amount || 0);
  }

  return [...new Set([...Object.keys(salesByDay), ...Object.keys(expensesByDay)])]
    .filter(Boolean)
    .sort()
    .map((date) => ({
      date,
      profit: (salesByDay[date] || 0) - (expensesByDay[date] || 0),
    }));
};

export const predictProfit = (data = []) => {
  if (data.length < 2) return [];

  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map((d) => d.profit);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (!denominator) return [];

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const predictions = [];
  for (let i = n; i < n + 7; i += 1) {
    predictions.push({
      day: `Day ${i + 1}`,
      predicted: Number((slope * i + intercept).toFixed(2)),
    });
  }

  return predictions;
};

export const insightLabel = (predictions = []) => {
  if (predictions.length < 2) return "Add more sales and expense entries to unlock AI trend insights.";
  return predictions[predictions.length - 1].predicted >= predictions[0].predicted
    ? "Business Growing 📈"
    : "Profit Decreasing 📉";
};
