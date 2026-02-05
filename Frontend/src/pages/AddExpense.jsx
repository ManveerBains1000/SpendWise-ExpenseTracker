import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavBar";
import { toast } from "react-toastify";

const AddExpense = () => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "General",
    recurring: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Frontend validation
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/v1/expense",
        formData,
        { withCredentials: true }
      );

      toast.success("Expense added successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add expense"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex justify-center items-center bg-[var(--bg-dark)]">
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card-dark)] p-6 rounded-lg w-full max-w-md space-y-4 border border-[var(--border-dark)]"
        >
          <h2 className="text-xl font-bold text-center">
            Add Expense
          </h2>

          <input
            type="text"
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />

          <select
            name="category"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)]"
          >
            <option>General</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="recurring"
              checked={formData.recurring}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-[var(--text-muted)] text-sm">Recurring (monthly)</span>
          </label>

          <button
            type="submit"
            className="w-full bg-[var(--accent)] py-2 rounded font-semibold hover:opacity-90"
          >
            Add Expense
          </button>
        </form>
      </div>
    </>
  );
};

export default AddExpense;
