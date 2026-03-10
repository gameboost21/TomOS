/**
 * Authentication context provider.
 *
 * Exposes `token`, `user`, `isAuthenticated`, `loading`, and helper methods
 * `login`, `logout`, and `getAuthHeaders` via context to child components.
 */
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const isAuthenticated = !!token;

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user')

    if (savedToken) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
   
    setToken(data.access_token)
    localStorage.setItem('token', data.access_token)

    const payload = JSON.parse(atob(data.access_token.split(".")[1]))
    const userData = {
      username: payload.username,
      role: payload.role,
      id: payload.sub
    };

    setUser(userData);
   
    localStorage.setItem('user', JSON.stringify(userData))

    navigate("/tasks");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}