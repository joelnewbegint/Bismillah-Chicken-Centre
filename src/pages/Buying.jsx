import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { Button, DataTable, Panel } from "../components/ui";
import { formatCurrency, formatDateIso } from "../lib/metrics";
import { supabase } from "../lib/supabase";
import { createRunWithAuthRecovery } from "../lib/supabaseAuthRecovery";

const defaultDate = new Date().toISOString().slice(0, 10);
const pageSize = 8;

function Buying() {
  const navigate = useNavigate();
  const runWithAuthRecovery = useMemo(() => createRunWithAuthRecovery(navigate), [navigate]);
  const [form, setForm] = useState({
    date: defaultDate,
    chicken_type: "Broiler Chicken",
    quantity_kg: "",
    price_per_kg: "",
    supplier: "",
  });
  const [rows, setRows] = useState([]);
  const [salesRows, setSalesRows] = useState([]);
  const [salesLoadFailed, setSalesLoadFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const total = useMemo(() => Number(form.quantity_kg || 0) * Number(form.price_per_kg || 0), [form]);

  const fetchRows = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoadingRows(true);
    setError("");
    try {
      const [buyRes, salesRes] = await Promise.all([
        runWithAuthRecovery(() =>
          supabase
            .from("chicken_buying")
            .select("*")
            .order("date", { ascending: false })
            .order("id", { ascending: false }),
        ),
        runWithAuthRecovery(() => supabase.from("sales").select("chicken_type, weight")),
      ]);

      if (buyRes.error) {
        setError(buyRes.error.message);
        setRows([]);
      } else {
        setRows(buyRes.data || []);
      }

      if (salesRes.error) {
        setSalesLoadFailed(true);
        setSalesRows([]);
        if (!buyRes.error) setError(salesRes.error.message);
      } else {
        setSalesLoadFailed(false);
        setSalesRows(salesRes.data || []);
      }
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    void fetchRows();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const passType = filters.type ? row.chicken_type?.toLowerCase().includes(filters.type.toLowerCase()) : true;
        const passFrom = filters.from ? row.date >= filters.from : true;
        const passTo = filters.to ? row.date <= filters.to : true;
        return passType && passFrom && passTo;
      }),
    [rows, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safeCurrentPage]);

  const totalKg = useMemo(
    () => filteredRows.reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0),
    [filteredRows],
  );
  const totalBuying = useMemo(
    () => filteredRows.reduce((sum, row) => sum + Number(row.total || 0), 0),
    [filteredRows],
  );
  const avgPrice = totalKg > 0 ? totalBuying / totalKg : 0;

  const { remainingTotalKg, remainingByTypeEntries } = useMemo(() => {
    const boughtByType = {};
    for (const row of rows) {
      const t = String(row.chicken_type || "Other").trim() || "Other";
      boughtByType[t] = (boughtByType[t] || 0) + Number(row.quantity_kg || 0);
    }
    const soldByType = {};
    for (const s of salesRows) {
      const t = String(s.chicken_type || "Other").trim() || "Other";
      soldByType[t] = (soldByType[t] || 0) + Number(s.weight || 0);
    }
    const types = new Set([...Object.keys(boughtByType), ...Object.keys(soldByType)]);
    const entries = [];
    let sum = 0;
    for (const t of types) {
      const kg = Number(((boughtByType[t] || 0) - (soldByType[t] || 0)).toFixed(2));
      entries.push([t, kg]);
      sum += kg;
    }
    entries.sort(([a], [b]) => a.localeCompare(b));
    return { remainingTotalKg: Number(sum.toFixed(2)), remainingByTypeEntries: entries };
  }, [rows, salesRows]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const qty = Number(form.quantity_kg);
    const rate = Number(form.price_per_kg);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter a valid quantity greater than 0.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Enter a valid price per kg greater than 0.");
      setLoading(false);
      return;
    }

    const payload = {
      date: form.date,
      chicken_type: form.chicken_type,
      quantity_kg: qty,
      price_per_kg: rate,
      total: Number((qty * rate).toFixed(2)),
      supplier: form.supplier.trim() || null,
    };

    const { error: insertError } = await runWithAuthRecovery(() =>
      supabase.from("chicken_buying").insert(payload),
    );
    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage("Chicken buying entry saved.");
      setForm({
        date: defaultDate,
        chicken_type: "Broiler Chicken",
        quantity_kg: "",
        price_per_kg: "",
        supplier: "",
      });
      await fetchRows();
    }

    setLoading(false);
  };

  const deleteBuyingRow = async (rowId) => {
    const ok = window.confirm("Delete this buying record?");
    if (!ok) return;

    setLoading(true);
    setError("");
    setMessage("");
    const { error: deleteError } = await runWithAuthRecovery(() =>
      supabase.from("chicken_buying").delete().eq("id", rowId),
    );

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage("Buying record deleted.");
      await fetchRows();
    }
    setLoading(false);
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="pro-elevate rounded-xl border border-[#d6d3d1]/40 panel-dark p-5 shadow-sm transition hover:-translate-y-0.5">
          <p className="text-sm text-[#57534e]">Total Bought (kg)</p>
          <p className="mt-0.5 text-xs text-[#78716c]">Matches table filters below</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#1c1917]">{Number(totalKg || 0).toFixed(2)} kg</h3>
        </article>
        <article className="pro-elevate rounded-xl border border-[#d6d3d1]/40 panel-dark p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-[#f97316]/25">
          <p className="text-sm font-medium text-[#57534e]">Remaining chicken (kg)</p>
          <p className="mt-0.5 text-xs leading-snug text-[#78716c]">
            All-time bought minus all sales (by type). Negative means more sold than recorded bought.
          </p>
          {salesLoadFailed ? (
            <p className="mt-3 text-sm font-semibold text-[#b45309]">Could not load sales — remaining unknown.</p>
          ) : (
            <>
              <h3 className="mt-2 text-2xl font-semibold text-[#1c1917] dark:text-[#f8fafc]" style={{ color: "#1c1917" }}>
                {remainingTotalKg.toFixed(2)} kg
              </h3>
              {remainingByTypeEntries.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-[#57534e] dark:text-[#a8a29e]">
                  {remainingByTypeEntries.map(([type, kg]) => (
                    <li key={type} className="flex justify-between gap-2">
                      <span
                        className="min-w-0 truncate font-semibold text-[#1c1917] dark:text-[#f8fafc]"
                        style={{ color: "#1c1917" }}
                      >
                        {type}
                      </span>
                      <span
                        className="shrink-0 font-semibold tabular-nums text-[#1c1917] dark:text-[#f8fafc]"
                        style={{ color: "#1c1917" }}
                      >
                        {kg.toFixed(2)} kg
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#57534e]">No buying or sales yet.</p>
              )}
            </>
          )}
        </article>
        <Card title="Total Buying Amount" value={totalBuying} />
        <Card title="Avg Buying Rate / kg" value={avgPrice} />
      </div>

      <form onSubmit={onSubmit}>
        <Panel className="grid gap-4 md:grid-cols-2">
        <input
          type="date"
          required
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] focus:border-[#f97316] focus:outline-none"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
        />
        <select
          required
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] focus:border-[#f97316] focus:outline-none"
          value={form.chicken_type}
          onChange={(e) => setForm((prev) => ({ ...prev, chicken_type: e.target.value }))}
        >
          <option value="Broiler Chicken">Broiler Chicken</option>
          <option value="Country Chicken">Country Chicken</option>
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="Quantity (kg)"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
          value={form.quantity_kg}
          onChange={(e) => setForm((prev) => ({ ...prev, quantity_kg: e.target.value }))}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="Buying price per kg"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
          value={form.price_per_kg}
          onChange={(e) => setForm((prev) => ({ ...prev, price_per_kg: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Supplier name (optional)"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none md:col-span-2"
          value={form.supplier}
          onChange={(e) => setForm((prev) => ({ ...prev, supplier: e.target.value }))}
        />

        <p className="text-sm font-semibold text-[#57534e]">Total Buying: {formatCurrency(total)}</p>
        <Button type="submit" variant="primary" disabled={loading} className="disabled:opacity-70">
          {loading ? "Saving..." : "Add Buying Entry"}
        </Button>
        </Panel>
      </form>

      {message ? <p className="rounded-full bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">{message}</p> : null}
      {error ? <p className="rounded-full bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p> : null}

      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input
            type="date"
            className="rounded-full border border-[#d6d3d1] bg-white px-4 py-2 text-sm text-[#1c1917] focus:border-[#f97316] focus:outline-none"
            value={filters.from}
            onChange={(e) => {
              setCurrentPage(1);
              setFilters((prev) => ({ ...prev, from: e.target.value }));
            }}
          />
          <input
            type="date"
            className="rounded-full border border-[#d6d3d1] bg-white px-4 py-2 text-sm text-[#1c1917] focus:border-[#f97316] focus:outline-none"
            value={filters.to}
            onChange={(e) => {
              setCurrentPage(1);
              setFilters((prev) => ({ ...prev, to: e.target.value }));
            }}
          />
          <input
            type="text"
            placeholder="Filter by chicken type"
            className="rounded-full border border-[#d6d3d1] bg-white px-4 py-2 text-sm text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
            value={filters.type}
            onChange={(e) => {
              setCurrentPage(1);
              setFilters((prev) => ({ ...prev, type: e.target.value }));
            }}
          />
        </div>

        {loadingRows ? (
          <p className="text-sm text-[#57534e]">Loading buying records...</p>
        ) : (
          <DataTable columns={["Date", "Type", "Qty (kg)", "Rate/kg", "Total", "Supplier", "Actions"]}>
            {paginatedRows.map((row) => (
              <tr key={row.id} className="table-row-hover border-t border-[#e7e5e4] text-[#1c1917]">
                <td className="whitespace-nowrap px-3 py-2">{formatDateIso(row.date)}</td>
                <td className="px-3 py-2">{row.chicken_type}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{row.quantity_kg}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatCurrency(row.price_per_kg)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatCurrency(row.total)}</td>
                <td className="px-3 py-2">{row.supplier || "-"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="danger"
                      disabled={loading}
                      onClick={() => deleteBuyingRow(row.id)}
                      className="px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-[#57534e]">
            Page {safeCurrentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </Panel>
    </section>
  );
}

export default Buying;
