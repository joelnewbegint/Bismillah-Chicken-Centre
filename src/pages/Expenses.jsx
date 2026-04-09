import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadCsv } from "../lib/exportCsv";
import { formatCurrency, formatDateIso } from "../lib/metrics";
import { supabase } from "../lib/supabase";
import { createRunWithAuthRecovery } from "../lib/supabaseAuthRecovery";
import { Button, DataTable, Panel } from "../components/ui";

const defaultDate = new Date().toISOString().slice(0, 10);
const pageSize = 8;

function Expenses() {
  const navigate = useNavigate();
  const runWithAuthRecovery = useMemo(() => createRunWithAuthRecovery(navigate), [navigate]);
  const [form, setForm] = useState({
    date: defaultDate,
    type: "",
    amount: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", type: "", amount: "" });

  const fetchExpenses = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoadingExpenses(true);
    try {
      const { data, error: fetchError } = await runWithAuthRecovery(() =>
        supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: false })
          .order("id", { ascending: false }),
      );

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setExpenses(data || []);
      }
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    void fetchExpenses({ showLoading: false });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const payload = {
      date: form.date,
      type: form.type.trim(),
      amount: Number(form.amount),
    };

    const { error: insertError } = await runWithAuthRecovery(() =>
      supabase.from("expenses").insert(payload),
    );
    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage("Expense saved successfully.");
      setForm({
        date: defaultDate,
        type: "",
        amount: "",
      });
      void fetchExpenses();
    }

    setLoading(false);
  };

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const passType = filters.type ? expense.type?.toLowerCase().includes(filters.type.toLowerCase()) : true;
        const passFrom = filters.from ? expense.date >= filters.from : true;
        const passTo = filters.to ? expense.date <= filters.to : true;
        return passType && passFrom && passTo;
      }),
    [expenses, filters],
  );
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExpenses = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, safeCurrentPage]);

  const exportExpenses = () => {
    downloadCsv(
      `expenses-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Type", "Amount"],
      filteredExpenses.map((expense) => [formatDateIso(expense.date), expense.type, expense.amount]),
    );
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      date: expense.date || defaultDate,
      type: expense.type || "",
      amount: `${expense.amount ?? ""}`,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: "", type: "", amount: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    setError("");
    setMessage("");

    const { error: updateError } = await runWithAuthRecovery(() =>
      supabase
        .from("expenses")
        .update({
          date: editForm.date,
          type: editForm.type.trim(),
          amount: Number(editForm.amount),
        })
        .eq("id", editingId),
    );

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Expense updated successfully.");
      cancelEdit();
      await fetchExpenses();
    }

    setLoading(false);
  };

  const deleteExpense = async (expenseId) => {
    const ok = window.confirm("Delete this expense record?");
    if (!ok) return;

    setLoading(true);
    setError("");
    setMessage("");
    const { error: deleteError } = await runWithAuthRecovery(() =>
      supabase.from("expenses").delete().eq("id", expenseId),
    );

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage("Expense deleted successfully.");
      if (editingId === expenseId) cancelEdit();
      await fetchExpenses();
    }

    setLoading(false);
  };

  return (
    <section className="space-y-5">
      <form onSubmit={onSubmit}>
        <Panel className="grid gap-4 md:grid-cols-2">
        <input
          type="date"
          required
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] focus:border-[#f97316] focus:outline-none"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
        />
        <input
          type="text"
          required
          placeholder="Expense Type"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
          value={form.type}
          onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="Amount"
          className="rounded-full border border-[#d6d3d1] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
          value={form.amount}
          onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
        />

        <Button type="submit" variant="primary" disabled={loading} className="disabled:opacity-70">
          {loading ? "Saving..." : "Add Expense"}
        </Button>
        </Panel>
      </form>

      {message ? <p className="rounded-full bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">{message}</p> : null}
      {error ? <p className="rounded-full bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p> : null}

      <Panel>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#1c1917]">Recent Expenses</h3>
          <Button type="button" variant="secondary" onClick={exportExpenses}>
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
            placeholder="Filter by expense type"
            className="rounded-full border border-[#d6d3d1] bg-white px-4 py-2 text-sm text-[#1c1917] placeholder:text-[#78716c] focus:border-[#f97316] focus:outline-none"
            value={filters.type}
            onChange={(e) => {
              setCurrentPage(1);
              setFilters((prev) => ({ ...prev, type: e.target.value }));
            }}
          />
        </div>
        {loadingExpenses ? (
          <p className="text-sm text-[#57534e]">Loading expenses...</p>
        ) : (
          <DataTable columns={["Date", "Type", "Amount", "Actions"]}>
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id} className="table-row-hover border-t border-[#e7e5e4] text-[#1c1917]">
                    <td className="px-3 py-2">
                      {editingId === expense.id ? (
                        <input
                          type="date"
                          className="rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.date}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                        />
                      ) : (
                        formatDateIso(expense.date)
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === expense.id ? (
                        <input
                          type="text"
                          className="rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.type}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                        />
                      ) : (
                        expense.type
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === expense.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 rounded border border-[#d6d3d1] bg-white px-2 py-1 text-[#1c1917]"
                          value={editForm.amount}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                        />
                      ) : (
                        formatCurrency(expense.amount)
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === expense.id ? (
                        <div className="flex gap-2">
                          <Button type="button" variant="success" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button type="button" variant="muted" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button type="button" variant="info" onClick={() => startEdit(expense)}>
                            Edit
                          </Button>
                          <Button type="button" variant="danger" onClick={() => deleteExpense(expense.id)}>
                            Delete
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

export default Expenses;
