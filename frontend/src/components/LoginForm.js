import React, { useState } from "react";

export default function LoginForm({ role, onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Simulate API call
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    // Replace with your actual API call:
    // const res = await loginUser({ ...form, role });
    // if (res.success) onLoginSuccess(role);
    // else setError(res.message);
    // For demo:
    onLoginSuccess(role);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Login to UpLink</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">
        Login
      </button>
    </form>
  );
}