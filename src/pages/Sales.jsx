import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { downloadCsv } from "../lib/exportCsv";
import { formatCurrency, formatDateIso } from "../lib/metrics";
import { supabase } from "../lib/supabase";
import { createRunWithAuthRecovery } from "../lib/supabaseAuthRecovery";
import { Button, DataTable, Panel } from "../components/ui";

const defaultDate = new Date().toISOString().slice(0, 10);
const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || "91XXXXXXXXXX";
const pageSize = 8;

function Sales() {
  const navigate = useNavigate();
  const runWithAuthRecovery = useMemo(() => createRunWithAuthRecovery(navigate), [navigate]);
  const [form, setForm] = useState({
    date: defaultDate,
    chicken_type: "Broiler Chicken",
    weight: "",
    price_per_kg: "",
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSales, setLoadingSales] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [latestSale, setLatestSale] = useState(null);
  const [filters, setFilters] = useState({ from: "", to: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", chicken_type: "", weight: "", price_per_kg: "" });

  const total = useMemo(() => Number(form.weight || 0) * Number(form.price_per_kg || 0), [form]);
  const filteredSales = useMemo(
    () =>
      sales.filter((sale) => {
        const passType = filters.type
          ? sale.chicken_type?.toLowerCase().includes(filters.type.toLowerCase())
          : true;
        const passFrom = filters.from ? sale.date >= filters.from : true;
        const passTo = filters.to ? sale.date <= filters.to : true;
        return passType && passFrom && passTo;
      }),
    [sales, filters],
  );
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSales = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, safeCurrentPage]);
  const editTotal = useMemo(
    () => Number(editForm.weight || 0) * Number(editForm.price_per_kg || 0),
    [editForm.weight, editForm.price_per_kg],
  );

  const fetchSales = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoadingSales(true);
    try {
      const { data, error: fetchError } = await runWithAuthRecovery(() =>
        supabase
          .from("sales")
          .select("*")
          .order("date", { ascending: false })
          .order("id", { ascending: false }),
      );

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSales(data || []);
      }
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    void fetchSales({ showLoading: false });
  }, []);

  const sendWhatsApp = (sale) => {
    const text = `🧾 Chicken Shop Bill

Type: ${sale.chicken_type}
Weight: ${sale.weight} kg
Price/kg: ₹${sale.price_per_kg}
Total: ₹${sale.total}
Date: ${formatDateIso(sale.date)}

Thank you!`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const parsedWeight = Number(form.weight);
    const parsedPrice = Number(form.price_per_kg);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Enter a valid weight greater than 0.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a valid price per kg greater than 0.");
      setLoading(false);
      return;
    }

    const payload = {
      date: form.date,
      chicken_type: form.chicken_type.trim(),
      weight: parsedWeight,
      price_per_kg: parsedPrice,
    };

    const { data, error: insertError } = await runWithAuthRecovery(() =>
      supabase.from("sales").insert(payload).select().single(),
    );

    if (insertError) {
      setError(insertError.message);
    } else {
      setLatestSale(data);
      setMessage("Sale saved successfully.");
      setCurrentPage(1);
      if (data) {
        setSales((prev) => [data, ...prev.filter((row) => row.id !== data.id)]);
      }
      setForm({
        date: defaultDate,
        chicken_type: "Broiler Chicken",
        weight: "",
        price_per_kg: "",
      });
      void fetchSales({ showLoading: false });
    }

    setLoading(false);
  };

  const startEdit = (sale) => {
    setEditingId(sale.id);
    setEditForm({
      date: sale.date || defaultDate,
      chicken_type: sale.chicken_type || "",
      weight: `${sale.weight ?? ""}`,
      price_per_kg: `${sale.price_per_kg ?? ""}`,
    });
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: "", chicken_type: "", weight: "", price_per_kg: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      date: editForm.date,
      chicken_type: editForm.chicken_type.trim(),
      weight: Number(editForm.weight),
      price_per_kg: Number(editForm.price_per_kg),
    };

    const { data, error: updateError } = await runWithAuthRecovery(() =>
      supabase
        .from("sales")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single(),
    );

    if (updateError) {
      setError(updateError.message);
    } else {
      setLatestSale(data);
      setMessage("Sale updated successfully.");
      cancelEdit();
      await fetchSales();
    }

    setLoading(false);
  };

  const deleteSale = async (saleId) => {
    const ok = window.confirm("Delete this sale record?");
    if (!ok) return;

    setLoading(true);
    setError("");
    setMessage("");
    const { error: deleteError } = await runWithAuthRecovery(() =>
      supabase.from("sales").delete().eq("id", saleId),
    );

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage("Sale deleted successfully.");
      if (editingId === saleId) cancelEdit();
      await fetchSales();
    }
    setLoading(false);
  };

  const downloadInvoice = (sale) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Chicken Shop Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${formatDateIso(sale.date)}`, 20, 35);
    doc.text(`Type: ${sale.chicken_type}`, 20, 45);
    doc.text(`Weight: ${sale.weight} kg`, 20, 55);
    doc.text(`Price per kg: ${formatCurrency(sale.price_per_kg)}`, 20, 65);
    doc.text(`Total: ${formatCurrency(sale.total)}`, 20, 75);
    doc.text("Thank you for your business!", 20, 90);
    doc.save(`invoice-sale-${sale.id}.pdf`);
  };

  const exportSales = () => {
    downloadCsv(
      `sales-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Type", "Weight (kg)", "Price per kg", "Total"],
      filteredSales.map((sale) => [
        formatDateIso(sale.date),
        sale.chicken_type,
        sale.weight,
        sale.price_per_kg,
        sale.total,
      ]),
    );
  };

  return (
    <section className="space-y-5">
      <Panel className="flex items-center gap-3">
        <img
          src="/bc-logo.png"
          alt="Bismillah Chicken Centre logo"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-[#f97316]/30"
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-[#57534e]">Chicken Shop Management</p>
          <h2 className="text-lg font-semibold text-[#1c1917]">Bismillah Chicken Centre</h2>
        </div>
      </Panel>

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
          placeholder="Weight (kg)"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
          value={form.weight}
          onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="Price per kg"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
          value={form.price_per_kg}
          onChange={(e) => setForm((prev) => ({ ...prev, price_per_kg: e.target.value }))}
        />

        <p className="text-sm font-semibold text-[#57534e]">Total: {formatCurrency(total)}</p>

        <Button type="submit" variant="primary" disabled={loading} className="disabled:opacity-70">
          {loading ? "Saving..." : "Add Sale"}
        </Button>
        </Panel>
      </form>

      {message ? <p className="rounded-full bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">{message}</p> : null}
      {error ? <p className="rounded-full bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p> : null}

      {latestSale ? (
        <Button type="button" variant="success" onClick={() => sendWhatsApp(latestSale)}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M20.52 3.48A11.84 11.84 0 0 0 12.03 0C5.4 0 .03 5.37.03 11.99c0 2.11.55 4.18 1.59 6.01L0 24l6.16-1.61a11.9 11.9 0 0 0 5.87 1.49h.01c6.62 0 11.99-5.37 11.99-11.99 0-3.2-1.25-6.21-3.51-8.41ZM12.04 21.9h-.01a9.9 9.9 0 0 1-5.03-1.37l-.36-.21-3.66.96.98-3.57-.24-.37a9.88 9.88 0 0 1-1.52-5.3C2.2 6.59 6.58 2.2 12.04 2.2c2.64 0 5.12 1.03 6.99 2.9a9.8 9.8 0 0 1 2.9 6.99c0 5.46-4.43 9.81-9.89 9.81Zm5.43-7.38c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.94 1.18-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.41-1.5-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.45 1.06 2.86 1.2 3.05.15.2 2.09 3.2 5.07 4.49.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.78-.73 2.03-1.44.25-.71.25-1.32.17-1.44-.07-.12-.27-.2-.57-.35Z" />
          </svg>
          Send via WhatsApp
        </Button>
      ) : null}

      <Panel>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#1c1917]">Recent Sales</h3>
          <Button type="button" variant="secondary" onClick={exportSales}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.29 1.4 1.4-4 4a1 1 0 0 1-1.4 0l-4-4 1.4-1.4L11 12.6V4a1 1 0 0 1 1-1Zm-7 14h14v2H5v-2Z" />
            </svg>
            Export CSV
          </Button>
        </div>
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
            placeholder="Filter by type"
            className="rounded-full border border-[#d6d3d1] bg-white px-4 py-2 text-sm text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
            value={filters.type}
            onChange={(e) => {
              setCurrentPage(1);
              setFilters((prev) => ({ ...prev, type: e.target.value }));
            }}
          />
        </div>
        {loadingSales ? (
          <p className="text-sm text-[#57534e]">Loading sales...</p>
        ) : (
          <DataTable columns={["Date", "Type", "Weight", "Price/kg", "Total", "Actions"]}>
                {paginatedSales.map((sale) => (
                  <tr key={sale.id} className="table-row-hover border-t border-[#e7e5e4] text-[#1c1917]">
                    <td className="whitespace-nowrap px-3 py-2">
                      {editingId === sale.id ? (
                        <input
                          type="date"
                          className="rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.date}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                        />
                      ) : (
                        formatDateIso(sale.date)
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === sale.id ? (
                        <input
                          type="text"
                          className="rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.chicken_type}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, chicken_type: e.target.value }))}
                        />
                      ) : (
                        sale.chicken_type
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {editingId === sale.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.weight}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))}
                        />
                      ) : (
                        sale.weight
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {editingId === sale.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.price_per_kg}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, price_per_kg: e.target.value }))}
                        />
                      ) : (
                        formatCurrency(sale.price_per_kg)
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {editingId === sale.id ? formatCurrency(editTotal) : formatCurrency(sale.total)}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === sale.id ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="success" onClick={saveEdit} className="px-3 py-1.5 text-xs">
                            Save
                          </Button>
                          <Button type="button" variant="muted" onClick={cancelEdit} className="px-3 py-1.5 text-xs">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="info" onClick={() => startEdit(sale)} className="px-3 py-1.5 text-xs">
                            Edit
                          </Button>
                          <Button type="button" variant="danger" onClick={() => deleteSale(sale.id)} className="px-3 py-1.5 text-xs">
                            Delete
                          </Button>
                          <Button type="button" variant="violet" onClick={() => downloadInvoice(sale)} className="px-3 py-1.5 text-xs">
                            Invoice PDF
                          </Button>
                        </div>
                      )}
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

export default Sales;
