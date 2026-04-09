import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { Button, DataTable, Panel } from "../components/ui";
import { formatCurrency, formatDateIso } from "../lib/metrics";
import { supabase } from "../lib/supabase";

const defaultDate = new Date().toISOString().slice(0, 10);
const pageSize = 8;

function Buying() {
  const [form, setForm] = useState({
    date: defaultDate,
    chicken_type: "Broiler Chicken",
    quantity_kg: "",
    price_per_kg: "",
    supplier: "",
  });
  const [rows, setRows] = useState([]);
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
      const { data, error: fetchError } = await supabase
        .from("chicken_buying")
        .select("*")
        .order("date", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRows(data || []);
      }
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      date: form.date,
      chicken_type: form.chicken_type,
      quantity_kg: Number(form.quantity_kg),
      price_per_kg: Number(form.price_per_kg),
      total: Number(total.toFixed(2)),
      supplier: form.supplier.trim() || null,
    };

    const { error: insertError } = await supabase.from("chicken_buying").insert(payload);
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

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="pro-elevate rounded-xl border border-[#d6d3d1]/40 panel-dark p-5 shadow-sm transition hover:-translate-y-0.5">
          <p className="text-sm text-[#57534e]">Total Bought (kg)</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#1c1917]">{Number(totalKg || 0).toFixed(2)} kg</h3>
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
          <DataTable columns={["Date", "Type", "Qty (kg)", "Rate/kg", "Total", "Supplier"]}>
            {paginatedRows.map((row) => (
              <tr key={row.id} className="table-row-hover border-t border-[#e7e5e4] text-[#1c1917]">
                <td className="px-3 py-2">{formatDateIso(row.date)}</td>
                <td className="px-3 py-2">{row.chicken_type}</td>
                <td className="px-3 py-2">{row.quantity_kg}</td>
                <td className="px-3 py-2">{formatCurrency(row.price_per_kg)}</td>
                <td className="px-3 py-2">{formatCurrency(row.total)}</td>
                <td className="px-3 py-2">{row.supplier || "-"}</td>
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
