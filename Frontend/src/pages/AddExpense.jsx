import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavBar";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/env";

const AddExpense = () => {
  const { delegateContext } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "General",
    recurring: false,
  });

  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePredictCategory = async () => {
    if (!formData.description.trim()) {
      toast.error("Please enter a description first");
      return;
    }
    setIsLoadingPrediction(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/expense/predict-category`,
        { description: formData.description },
        { withCredentials: true }
      );
      const predictedCategory = response.data.data.category;
      setFormData({ ...formData, category: predictedCategory });
      toast.success(`Predicted category: ${predictedCategory}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to predict category");
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      const headers = delegateContext?.principalId
        ? { "X-Delegate-For": delegateContext.principalId }
        : {};
      await axios.post(`${API_BASE_URL}/api/v1/expense`, formData, {
        withCredentials: true,
        headers,
      });
      toast.success("Expense added successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-dark)]">
        <div className="max-w-lg mx-auto px-4 py-10">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add Expense</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Record a new expense entry</p>
          </div>

          {/* Delegate context banner */}
          {delegateContext && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-amber-800 text-sm">
              <span>🎭</span>
              <span>
                Submitting on behalf of{" "}
                <strong>
                  {delegateContext.principalName} (@{delegateContext.principalUsername})
                </strong>
              </span>
            </div>
          )}

          <div className="bg-[var(--card-dark)] rounded-2xl border border-[var(--border-dark)] shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description + AI Predict */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Description
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="description"
                    placeholder="e.g. Coffee at Starbucks"
                    value={formData.description}
                    onChange={handleChange}
                    className="flex-1 bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2.5 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={handlePredictCategory}
                    disabled={isLoadingPrediction || !formData.description.trim()}
                    title="AI-predict category from description"
                    className="px-3 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {isLoadingPrediction ? "..." : "🤖 AI"}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2.5 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2.5 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                >
                  <option>General</option>
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                </select>
              </div>

              {/* Recurring toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleChange}
                  className="w-4 h-4 accent-violet-600"
                />
                <span className="text-sm text-[var(--text-primary)]">
                  Recurring monthly expense
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddExpense;