import { createContext, useContext, useEffect, useState } from "react";
import api, { apiError } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = async () => {
    const token = localStorage.getItem("qc_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem("qc_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("qc_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      const msg = apiError(err);
      setError(msg);
      return { ok: false, message: msg };
    }
  };

  const register = async (payload) => {
    setError(null);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("qc_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      const msg = apiError(err);
      setError(msg);
      return { ok: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("qc_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
