import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

export interface AuthUser {
  id:         number;
  nome:       string;
  email:      string;
  role:       "admin" | "corretor";
  avatar_url: string | null;
}

interface AuthCtx {
  user:        AuthUser | null;
  token:       string | null;
  loading:     boolean;
  login:       (email: string, senha: string) => Promise<void>;
  loginGoogle: (credential: string) => Promise<{ pendente?: boolean }>;
  logout:      () => void;
  isAdmin:     boolean;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("thome_token");
    if (t) {
      setToken(t);
      axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      axios.get("/api/auth/me")
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem("thome_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveSession = (tk: string, u: AuthUser) => {
    localStorage.setItem("thome_token", tk);
    axios.defaults.headers.common["Authorization"] = `Bearer ${tk}`;
    setToken(tk);
    setUser(u);
  };

  const login = async (email: string, senha: string) => {
    const { data } = await axios.post("/api/auth/login", { email, senha });
    if (!data.success) throw new Error(data.error);
    saveSession(data.token, data.user);
  };

  const loginGoogle = async (credential: string) => {
    const { data } = await axios.post("/api/auth/google", { credential });
    if (data.pendente) return { pendente: true };
    if (!data.success) throw new Error(data.error);
    saveSession(data.token, data.user);
    return {};
  };

  const logout = () => {
    localStorage.removeItem("thome_token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, token, loading, login, loginGoogle, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
