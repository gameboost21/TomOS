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

    setUser({
      username: username
    });

    localStorage.setItem('user', JSON.stringify({ username }))

    navigate("/tasks");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/login");
  };

  const getAuthHeaders = () => {
    return token ? {
      "Authorization": `Bearer ${token}`,
      "Content-Type":"application/json"
    } : {
      "Content-Type":"application/json"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}