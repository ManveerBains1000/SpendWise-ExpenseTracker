import { useContext, useEffect, useState } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/NavBar";
import Analytics from "../components/Analytics";
import ExpenseComments from "../components/ExpenseComments";

const Dashboard = () => {
  const { expenses, fetchExpenses, deleteExpense, loading } =
    useContext(ExpenseContext);
  const { delegateContext } = useContext(AuthContext);

  const [openCommentsId, setOpenCommentsId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [delegateContext]);

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const toggleComments = (expId) =>
    setOpenCommentsId((prev) => (prev === expId ? null : expId));

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[var(--bg-dark)]">
        <div className="max-w-5xl mx-auto p-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Track and manage your expenses</p>
          </div>

          {/* Delegate context banner */}
          {delegateContext && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-amber-800 text-sm">
              <span>🎭</span>
              <span>
                Viewing expenses for{" "}
                <strong>
                  {delegateContext.principalName} (@{delegateContext.principalUsername})
                </strong>
              </span>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-[var(--card-dark)] p-6 rounded-2xl mb-5 border border-[var(--border-dark)] shadow-sm">
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-500">₹{totalExpense.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{expenses.length} transaction{expenses.length !== 1 ? "s" : ""}</p>
          </div>

          <Analytics />

          {/* Expense List */}
          <div className="bg-[var(--card-dark)] rounded-2xl border border-[var(--border-dark)] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-dark)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Expense List</h2>
            </div>

            {loading && (
              <p className="p-5 text-sm text-[var(--text-muted)]">Loading...</p>
            )}

            {!loading && expenses.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm">No expenses yet. Add your first expense!</p>
              </div>
            )}

            <ul className="divide-y divide-[var(--border-dark)]">
              {expenses.map((exp) => (
                <li key={exp._id}>
                  <div className="flex justify-between items-center px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--text-primary)] truncate">{exp.description}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-dark)] text-xs font-medium">{exp.category}</span>
                          <span>·</span>
                          <span>{new Date(exp.date).toLocaleDateString()}</span>
                          {exp.submitted_by && (
                            <span className="text-amber-600">· @{exp.submitted_by.username}</span>
                          )}
                          {exp.budget && (
                            <span className="text-violet-600">· {exp.budget.name}</span>
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <span className="font-bold text-red-500">₹{exp.amount}</span>
                      <button
                        onClick={() => toggleComments(exp._id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          openCommentsId === exp._id
                            ? "bg-violet-600 border-violet-600 text-white"
                            : "border-[var(--border-dark)] text-[var(--text-muted)] hover:border-violet-400 hover:text-violet-600"
                        }`}
                      >
                        💬 Comments
                      </button>
                      <button
                        onClick={() => deleteExpense(exp._id)}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {openCommentsId === exp._id && (
                    <div className="px-5 pb-5 bg-[var(--bg-dark)]">
                      <ExpenseComments
                        expenseId={exp._id}
                        onClose={() => setOpenCommentsId(null)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;