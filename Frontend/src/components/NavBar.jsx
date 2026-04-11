import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, setUser, setAccessToken, delegateContext, setDelegateContext } = useContext(AuthContext);
  const { connected } = useContext(SocketContext);
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      setUser(null);
      setAccessToken(null);
      setDelegateContext(null);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card-dark)] border-b border-[var(--border-dark)] px-6 py-3 flex justify-between items-center flex-wrap gap-2 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="text-[var(--text-primary)] font-bold text-lg tracking-tight">
          SpendWise
        </span>
        {/* Live connection dot */}
        <span
          title={connected ? "Real-time connected" : "Connecting…"}
          className={`w-2 h-2 rounded-full ml-1 ${connected ? "bg-green-500" : "bg-gray-300"}`}
        />
      </div>

      {user && (
        <div className="flex items-center gap-1 flex-wrap">
          <Link
            to="/dashboard"
            className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/add-expense"
            className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] rounded-lg transition-colors"
          >
            Add Expense
          </Link>
          <Link
            to="/budgets"
            className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] rounded-lg transition-colors"
          >
            Budgets
          </Link>
          <Link
            to="/delegations"
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          >
            {delegateContext ? (
              <span className="text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                🎭 Delegating
              </span>
            ) : (
              <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)]">
                Delegations
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[var(--border-dark)]">
            <ThemeToggle />
            <button
              onClick={logoutHandler}
              className="px-3 py-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
