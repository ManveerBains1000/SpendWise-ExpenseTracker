import { useContext, useEffect } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import Navbar from "../components/NavBar";
import Analytics from "../components/Analytics";

const Dashboard = () => {
  const { expenses, fetchExpenses, deleteExpense, loading } =
    useContext(ExpenseContext);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-6 bg-[var(--bg-dark)]">
        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        {/* Summary Card */}
        <div className="bg-[var(--card-dark)] p-6 rounded-lg mb-6 border border-[var(--border-dark)]">
          <h2 className="text-[var(--text-muted)] text-sm">
            Total Expense
          </h2>
          <p className="text-2xl font-bold text-[var(--danger)]">
            ₹{totalExpense}
          </p>
        </div>

        <Analytics />

        {/* Expense List */}
        <div className="bg-[var(--card-dark)] rounded-lg border border-[var(--border-dark)]">
          <h2 className="text-xl font-semibold p-4 border-b border-[var(--border-dark)]">
            Expense List
          </h2>

          {loading && (
            <p className="p-4 text-[var(--text-muted)]">
              Loading...
            </p>
          )}

          {!loading && expenses.length === 0 && (
            <p className="p-4 text-[var(--text-muted)]">
              No expenses found
            </p>
          )}

          <ul>
            {expenses.map((exp) => (
              <li
                key={exp._id}
                className="flex justify-between items-center p-4 border-b border-[var(--border-dark)]"
              >
                <div>
                  <p className="font-medium">
                    {exp.description}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {exp.category} •{" "}
                    {new Date(exp.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-[var(--danger)]">
                    ₹{exp.amount}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp._id)}
                    className="text-sm bg-[var(--danger)] px-3 py-1 rounded hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
