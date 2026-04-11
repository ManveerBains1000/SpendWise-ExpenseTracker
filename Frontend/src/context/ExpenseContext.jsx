import { createContext, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { delegateContext } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Build headers that include the delegation context when active */
  const delegateHeaders = () => {
    if (!delegateContext?.principalId) return {};
    return { "X-Delegate-For": delegateContext.principalId };
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:4000/api/v1/expense",
        { withCredentials: true, headers: delegateHeaders() }
      );
      setExpenses(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/v1/expense/${id}`,
        { withCredentials: true, headers: delegateHeaders() }
      );
      setExpenses(expenses.filter(exp => exp._id !== id));
      toast.success("Expense is successfully deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <ExpenseContext.Provider
      value={{ expenses, fetchExpenses, deleteExpense, loading }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
