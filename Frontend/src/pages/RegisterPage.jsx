import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name || !formData.username || !formData.email) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/v1/users/register",
        formData
      );

      toast.success("Registration successful");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
      <div className="bg-[var(--card-dark)] p-8 rounded-lg w-full max-w-md border border-[var(--border-dark)]">
        <h2 className="text-2xl font-bold text-center mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border-dark)] px-4 py-2 rounded text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
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
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
