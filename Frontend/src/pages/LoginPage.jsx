import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/env";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { setUser, setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/users/login`,
        formData,
        { withCredentials: true }
      );

      setUser(res.data.data.user);
      setAccessToken(res.data.data.accessToken);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">SpendWise</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your account</p>
        </div>

        <div className="bg-[var(--card-dark)] p-8 rounded-2xl border border-[var(--border-dark)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Username or Email</label>
              <input
                type="text"
                name="username"
                placeholder="you@example.com"
                onChange={handleChange}
                className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2.5 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2.5 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold transition-colors mt-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-violet-600 hover:text-violet-700 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;