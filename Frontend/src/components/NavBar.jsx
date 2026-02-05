import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="bg-[var(--card-dark)] border-b border-[var(--border-dark)] shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-[var(--accent)] font-bold text-xl">
        Expense Tracker
      </h1>

      {user && (
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="hover:text-[var(--accent)]"
          >
            Dashboard
          </Link>

          <Link
            to="/add-expense"
            className="hover:text-[var(--accent)]"
          >
            Add Expense
          </Link>

          <button
            onClick={logoutHandler}
            className="bg-[var(--danger)] px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
