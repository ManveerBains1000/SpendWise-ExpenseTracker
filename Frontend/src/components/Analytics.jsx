import React, { useMemo, useState, useEffect, useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const presets = {
  "7d": { label: "Last 7 Days", days: 7 },
  month: { label: "Last Month", days: 30 },
  ytd: { label: "Year to Date", days: null },
};

const toStartOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const Analytics = () => {
  const { expenses, fetchExpenses } = useContext(ExpenseContext);
  const [range, setRange] = useState("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (!expenses || expenses.length === 0) fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    const now = new Date();
    let start;

    if (range === "custom") {
      start = customStart ? toStartOfDay(customStart) : null;
      const end = customEnd ? new Date(customEnd) : null;
      if (!start || !end) return [];
      return expenses.filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }

    if (range === "ytd") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      const days = presets[range]?.days || 7;
      start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    return expenses.filter((e) => new Date(e.date) >= start);
  }, [expenses, range, customStart, customEnd]);

  const categoryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "General";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    const labels = Object.keys(map);
    const data = labels.map((l) => map[l]);
    return { labels, data };
  }, [filteredExpenses]);

  const trendData = useMemo(() => {
    if (filteredExpenses.length === 0) return { labels: [], data: [] };

    // If range small, group by day. Otherwise group by month.
    const firstDate = new Date(
      Math.min(...filteredExpenses.map((e) => new Date(e.date).getTime()))
    );
    const lastDate = new Date(
      Math.max(...filteredExpenses.map((e) => new Date(e.date).getTime()))
    );
    const diffDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 31) {
      // group by day
      const labels = [];
      const buckets = {};
      for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
        const key = toStartOfDay(d).toISOString().slice(0, 10);
        labels.push(key);
        buckets[key] = 0;
      }
      filteredExpenses.forEach((e) => {
        const key = toStartOfDay(new Date(e.date)).toISOString().slice(0, 10);
        buckets[key] = (buckets[key] || 0) + Number(e.amount || 0);
      });
      return { labels, data: labels.map((l) => buckets[l] || 0) };
    } else {
      // group by month
      const buckets = {};
      filteredExpenses.forEach((e) => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets[key] = (buckets[key] || 0) + Number(e.amount || 0);
      });
      const labels = Object.keys(buckets).sort();
      return { labels, data: labels.map((l) => buckets[l]) };
    }
  }, [filteredExpenses]);

  return (
    <div className="bg-[var(--card-dark)] p-6 rounded-lg mb-6 border border-[var(--border-dark)]">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>

      <div className="flex gap-3 flex-wrap mb-4">
        <button
          onClick={() => setRange("7d")}
          className={`px-3 py-1 rounded ${range === "7d" ? "bg-[var(--accent)]" : "bg-[var(--bg-dark)]"}`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setRange("month")}
          className={`px-3 py-1 rounded ${range === "month" ? "bg-[var(--accent)]" : "bg-[var(--bg-dark)]"}`}
        >
          Last Month
        </button>
        <button
          onClick={() => setRange("ytd")}
          className={`px-3 py-1 rounded ${range === "ytd" ? "bg-[var(--accent)]" : "bg-[var(--bg-dark)]"}`}
        >
          Year to Date
        </button>
        <button
          onClick={() => setRange("custom")}
          className={`px-3 py-1 rounded ${range === "custom" ? "bg-[var(--accent)]" : "bg-[var(--bg-dark)]"}`}
        >
          Custom
        </button>

        {range === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 rounded bg-[var(--bg-dark)] border border-[var(--border-dark)]"
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 rounded bg-[var(--bg-dark)] border border-[var(--border-dark)]"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-[var(--bg-dark)] rounded">
          <h3 className="text-sm text-[var(--text-muted)] mb-2">Spending by Category</h3>
          {categoryData.labels.length === 0 ? (
            <p className="text-[var(--text-muted)]">No data</p>
          ) : (
            <Doughnut
              data={{
                labels: categoryData.labels,
                datasets: [
                  {
                    data: categoryData.data,
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                    ],
                  },
                ],
              }}
            />
          )}
        </div>

        <div className="p-4 bg-[var(--bg-dark)] rounded">
          <h3 className="text-sm text-[var(--text-muted)] mb-2">Spending Trend</h3>
          {trendData.labels.length === 0 ? (
            <p className="text-[var(--text-muted)]">No data</p>
          ) : (
            <Bar
              data={{
                labels: trendData.labels,
                datasets: [
                  {
                    label: "Amount",
                    data: trendData.data,
                    backgroundColor: "rgba(54,162,235,0.6)",
                  },
                ],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
