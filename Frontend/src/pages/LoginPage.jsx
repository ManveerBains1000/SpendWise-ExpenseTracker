import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { setUser } = useContext(AuthContext);
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
        "http://localhost:4000/api/v1/users/login",
        formData,
        { withCredentials: true }
      );

      setUser(res.data.data.user);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
      <div className="bg-[var(--card-dark)] p-8 rounded-lg w-full max-w-md border border-[var(--border-dark)]">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />

          <button
            type="submit"
            className="w-full bg-[var(--accent)] py-2 rounded font-semibold hover:opacity-90"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-[var(--text-muted)]">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[var(--accent)] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
