import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AddExpense from "./pages/AddExpense";
import BudgetDashboard from "./components/BudgetDashboard";
import DelegationManager from "./components/DelegationManager";
import Navbar from "./components/NavBar";
import LandingPage from "./pages/LandingPage";

// Reusable wrapper that adds the Navbar above a component
const WithNav = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <Routes>
      {/* Landing page at root */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-expense"
        element={
          <ProtectedRoute>
            <AddExpense />
          </ProtectedRoute>
        }
      />

      {/* Feature: Shared Department Budgets */}
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <WithNav>
              <BudgetDashboard />
            </WithNav>
          </ProtectedRoute>
        }
      />

      {/* Feature: Delegation & Impersonation */}
      <Route
        path="/delegations"
        element={
          <ProtectedRoute>
            <WithNav>
              <DelegationManager />
            </WithNav>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
