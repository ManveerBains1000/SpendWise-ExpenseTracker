import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { SocketContext } from "../context/SocketContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/env";

/**
 * BudgetDashboard
 * Displays all shared department budgets the user is part of.
 * Receives live balance updates via Socket.io.
 */
const BudgetDashboard = () => {
  const { socket } = useContext(SocketContext);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create-budget form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", totalAmount: "" });
  const [submitting, setSubmitting] = useState(false);

  // Charge form
  const [charging, setCharging] = useState(null); // budget._id
  const [chargeAmount, setChargeAmount] = useState("");

  // ── Fetch all budgets ───────────────────────────────────────────────────────
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/budgets`, {
        withCredentials: true,
      });
      setBudgets(res.data.data || []);
    } catch {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // ── Subscribe to live budget updates via Socket.io ─────────────────────────
  useEffect(() => {
    if (!socket || budgets.length === 0) return;

    const budgetIds = budgets.map((b) => b._id);
    budgetIds.forEach((id) => socket.emit("join-budget", { budgetId: id }));

    const handleBudgetUpdate = ({ budget }) => {
      setBudgets((prev) =>
        prev.map((b) => (b._id === budget._id ? { ...b, ...budget } : b))
      );
    };
    socket.on("budget-update", handleBudgetUpdate);

    return () => {
      budgetIds.forEach((id) => socket.emit("leave-budget", { budgetId: id }));
      socket.off("budget-update", handleBudgetUpdate);
    };
  }, [socket, budgets.length]);

  // ── Create budget ───────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department || !form.totalAmount) {
      toast.error("All fields are required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/budgets`,
        { ...form, totalAmount: parseFloat(form.totalAmount) },
        { withCredentials: true }
      );
      setBudgets((prev) => [...prev, res.data.data]);
      setForm({ name: "", department: "", totalAmount: "" });
      setShowForm(false);
      toast.success("Budget created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Charge budget ───────────────────────────────────────────────────────────
  const handleCharge = async (budgetId) => {
    const amount = parseFloat(chargeAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/budgets/${budgetId}/charge`,
        { amount },
        { withCredentials: true }
      );
      // UI is updated by the budget-update socket event
      setCharging(null);
      setChargeAmount("");
      toast.success("Budget charged");
    } catch (err) {
      toast.error(err.response?.data?.message || "Charge failed");
    }
  };

  const pct = (budget) =>
    budget.totalAmount > 0
      ? Math.min(100, Math.round((budget.spentAmount / budget.totalAmount) * 100))
      : 0;

  const barColor = (p) =>
    p >= 90 ? "bg-red-500" : p >= 65 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="p-6 bg-[var(--bg-dark)] min-h-screen">
      <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Department Budgets</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Track shared team spending</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          {showForm ? "Cancel" : "+ New Budget"}
        </button>
      </div>

      {/* Create budget form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[var(--card-dark)] border border-[var(--border-dark)] rounded-2xl p-5 mb-6 space-y-3 shadow-sm"
        >
          <h2 className="font-semibold mb-2">Create Budget</h2>
          <input
            placeholder="Budget name (e.g. Q1 Marketing)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-3 py-2 rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-3 py-2 rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <input
            type="number"
            placeholder="Total amount (₹)"
            value={form.totalAmount}
            onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-3 py-2 rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <button
            type="submit"
            disabled={submitting}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </form>
      )}

      {loading && <p className="text-[var(--text-muted)]">Loading budgets…</p>}

      {!loading && budgets.length === 0 && (
        <p className="text-[var(--text-muted)]">
          No budgets yet. Create one to track shared department spending.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map((b) => {
          const p = pct(b);
          const remaining = b.totalAmount - b.spentAmount;
          return (
            <div
              key={b._id}
              className="bg-[var(--card-dark)] border border-[var(--border-dark)] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{b.department}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p >= 90
                      ? "bg-red-100 text-red-700"
                      : p >= 65
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {p}% used
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[var(--bg-dark)] rounded-full my-3 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barColor(p)}`}
                  style={{ width: `${p}%` }}
                />
              </div>

              <div className="flex justify-between text-sm mb-4">
                <span className="text-[var(--text-muted)]">
                  Spent: <span className="text-[var(--danger)] font-semibold">₹{b.spentAmount}</span>
                </span>
                <span className="text-[var(--text-muted)]">
                  Left:{" "}
                  <span className="text-green-600 font-semibold">
                    ₹{remaining}
                  </span>
                </span>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-3">
                Total: ₹{b.totalAmount} · Owner: {b.owner?.username}
              </p>

              {/* Members */}
              {b.members?.length > 0 && (
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Members:{" "}
                  {b.members.map((m) => m.username || m).join(", ")}
                </p>
              )}

              {/* Charge button */}
              {charging === b._id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="flex-1 bg-[var(--bg-dark)] border border-[var(--border-dark)] px-2 py-1 rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                  />
                  <button
                    onClick={() => handleCharge(b._id)}
                    className="bg-[var(--accent)] px-3 py-1 rounded text-sm hover:opacity-90"
                  >
                    Charge
                  </button>
                  <button
                    onClick={() => { setCharging(null); setChargeAmount(""); }}
                    className="text-[var(--text-muted)] text-sm hover:text-[var(--text-primary)] px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCharging(b._id)}
                  className="w-full border border-[var(--border-dark)] text-sm py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Charge expense to budget
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default BudgetDashboard;
