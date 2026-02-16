import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    adminSecret: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-xl w-96 space-y-4"
        >
          <h2 className="text-3xl font-bold text-center text-indigo-600">
            Create Account
          </h2>

          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          {/* ROLE */}

          <select
            name="role"
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            disabled={loading}
            className="bg-indigo-600 text-white w-full py-2 rounded"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-center">
            Already have account?
            <Link to="/login" className="text-indigo-600 ml-1">
              Login
            </Link>
          </p>
        </form>

      </div>
    </>
  );
}
