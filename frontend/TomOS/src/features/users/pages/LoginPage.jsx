import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Login page component.
 *
 * Handles user credential input and calls `login` from `useAuth`.
 */
export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true)

    try {
      await login(username, password);
    } catch {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "logging in" : "Login"}
        </button>

        <p className="text-sm mt-4 text-center">
          No account?{" "}
          <Link to="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}