# ============================================================
# SCRIPT DE ATUALIZAÇÃO — Thomé Empreendimentos v2
# Execute no PowerShell dentro de C:\Users\mixav\Downloads\thome
# ============================================================

$base = "C:\Users\mixav\Downloads\thome"

# Cria pastas novas
New-Item -ItemType Directory -Force -Path "$base\client\src\contexts"
New-Item -ItemType Directory -Force -Path "$base\client\src\components\layout"
New-Item -ItemType Directory -Force -Path "$base\client\src\pages\admin"
New-Item -ItemType Directory -Force -Path "$base\client\src\pages\auth"
New-Item -ItemType Directory -Force -Path "$base\client\src\pages\corretor"
New-Item -ItemType Directory -Force -Path "$base\server\src\middleware"

Write-Host "✅ Pastas criadas" -ForegroundColor Green

# ─── CLIENT: AuthContext ──────────────────────────────────────────────────────
@'
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
'@ | Set-Content -Encoding UTF8 "$base\client\src\contexts\AuthContext.tsx"

# ─── CLIENT: AdminLayout ──────────────────────────────────────────────────────
@'
import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LayoutDashboard, Building2, Users, MessageSquare, LogOut, Menu, X, ChevronRight, Bell } from "lucide-react";

const nav = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard"   },
  { href: "/admin/imoveis",    icon: Building2,        label: "Imóveis"     },
  { href: "/admin/corretores", icon: Users,            label: "Corretores"  },
  { href: "/admin/leads",      icon: MessageSquare,    label: "Leads"       },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#050505] border-r border-[#c9a84c]/10 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/5">
          <img src="/logo.png" alt="Thomé" className="h-12 w-auto object-contain" />
          <p className="text-[#c9a84c] text-[9px] tracking-[0.3em] uppercase mt-2">Painel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-200 group ${active ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <item.icon size={16} className={active ? "text-[#c9a84c]" : "text-white/30 group-hover:text-white/60"} />
                <span className="tracking-wide">{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto text-[#c9a84c]" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-8 h-8 rounded-full" />
              : <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] text-xs font-bold">{user?.nome[0]}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{user?.nome}</p>
              <p className="text-[#c9a84c] text-[9px] tracking-widest uppercase">Admin</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-white/40 hover:text-red-400 text-sm transition-colors rounded hover:bg-red-500/5">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#050505] border-b border-white/5 flex items-center justify-between px-6">
          <button onClick={() => setOpen(!open)} className="lg:hidden text-white/60 hover:text-white"><Menu size={20} /></button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="text-white/30 hover:text-white/60"><Bell size={18} /></button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "$base\client\src\components\layout\AdminLayout.tsx"

Write-Host "✅ AdminLayout criado" -ForegroundColor Green

# ─── CLIENT: LoginPage ────────────────────────────────────────────────────────
@'
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

declare global { interface Window { google?: any; } }

export function LoginPage() {
  const { login, loginGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/corretor", { replace: true });
  }, [user]);

  useEffect(() => {
    const ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";
    if (!ID || !window.google) return;
    window.google.accounts.id.initialize({ client_id: ID, callback: handleGoogle });
    window.google.accounts.id.renderButton(document.getElementById("google-btn"), { theme: "filled_black", size: "large", width: 340 });
  }, []);

  const handleGoogle = async (resp: any) => {
    setLoading(true);
    try {
      const r = await loginGoogle(resp.credential);
      if (r?.pendente) toast("Cadastro recebido! Aguarde ativação.", { icon: "⏳" });
    } catch (e: any) { setErro(e.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErro(""); setLoading(true);
    try { await login(email, senha); }
    catch (e: any) { setErro(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#050505] border-r border-[#c9a84c]/10 p-16">
        <img src="/logo.png" alt="Thomé" className="h-24 w-auto object-contain" />
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">Painel Interno</p>
          <h1 className="text-white text-5xl font-thin leading-tight mb-6">Bem-vindo ao<br /><span className="text-[#c9a84c]">sistema Thomé</span></h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm">Plataforma de gestão de imóveis, leads e equipe de corretores.</p>
        </div>
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Thomé Empreendimentos</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <img src="/logo.png" alt="Thomé" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-2">Acesso ao painel</p>
          <h2 className="text-white text-3xl font-thin mb-8">Entrar</h2>
          <div id="google-btn" className="mb-6 flex justify-center" />
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs tracking-widest uppercase">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded"><AlertCircle size={15} />{erro}</div>}
            <div>
              <label className="block text-white/50 text-xs tracking-widest uppercase mb-2">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/60 transition-colors rounded" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-white/50 text-xs tracking-widest uppercase mb-2">Senha</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 pr-12 text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/60 transition-colors rounded" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#c9a84c] text-black font-semibold text-xs tracking-[0.3em] uppercase py-4 hover:bg-[#dbb85e] transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Entrando..." : <><LogIn size={15} />Entrar</>}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-xs mb-3">Ainda não tem cadastro?</p>
            <Link to="/registro" className="text-[#c9a84c] text-xs tracking-widest uppercase hover:underline">Cadastrar como corretor</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "$base\client\src\pages\auth\LoginPage.tsx"

Write-Host "✅ LoginPage criado" -ForegroundColor Green

# ─── CLIENT: RegistroPage ─────────────────────────────────────────────────────
@'
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AlertCircle, CheckCircle } from "lucide-react";

export function RegistroPage() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", creci: "", telefone: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");
  const [ok, setOk]           = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErro(""); setLoading(true);
    try { await axios.post("/api/auth/registro", form); setOk(true); }
    catch (err: any) { setErro(err.response?.data?.error || "Erro ao cadastrar"); }
    finally { setLoading(false); }
  };

  if (ok) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <CheckCircle size={48} className="text-[#c9a84c] mx-auto mb-6" />
        <h2 className="text-white text-2xl font-thin mb-4">Cadastro enviado!</h2>
        <p className="text-white/50 mb-8">O administrador irá revisar e ativar sua conta em breve.</p>
        <Link to="/login" className="text-[#c9a84c] text-xs tracking-widest uppercase hover:underline">Voltar ao login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10"><img src="/logo.png" alt="Thomé" className="h-16 w-auto object-contain" /></div>
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-2">Corretor</p>
        <h2 className="text-white text-3xl font-thin mb-2">Cadastro</h2>
        <p className="text-white/40 text-sm mb-8">Após o cadastro, aguarde a ativação pelo administrador.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded"><AlertCircle size={15} />{erro}</div>}
          {[
            { name: "nome",     label: "Nome completo", type: "text",     required: true  },
            { name: "email",    label: "E-mail",        type: "email",    required: true  },
            { name: "senha",    label: "Senha",         type: "password", required: true  },
            { name: "creci",    label: "CRECI",         type: "text",     required: false },
            { name: "telefone", label: "WhatsApp",      type: "tel",      required: false },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-white/50 text-xs tracking-widest uppercase mb-2">{f.label}{f.required && <span className="text-[#c9a84c]"> *</span>}</label>
              <input name={f.name} type={f.type} required={f.required} value={(form as any)[f.name]} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]/60 transition-colors rounded" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-[#c9a84c] text-black font-semibold text-xs tracking-[0.3em] uppercase py-4 hover:bg-[#dbb85e] transition-colors rounded disabled:opacity-50">
            {loading ? "Enviando..." : "Solicitar Cadastro"}
          </button>
        </form>
        <p className="text-center mt-6 text-white/30 text-xs">Já tem conta? <Link to="/login" className="text-[#c9a84c] hover:underline">Entrar</Link></p>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "$base\client\src\pages\auth\RegistroPage.tsx"

Write-Host "✅ RegistroPage criado" -ForegroundColor Green

# ─── SERVER: auth middleware ──────────────────────────────────────────────────
@'
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "thome_secret_2024_change_in_production";

export interface JWTPayload { id: number; email: string; role: "admin" | "corretor"; nome: string; }

declare global { namespace Express { interface Request { user?: JWTPayload; } } }

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "Token não fornecido" });
  try { req.user = verifyToken(header.slice(7)); next(); }
  catch { res.status(401).json({ success: false, error: "Token inválido ou expirado" }); }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Acesso restrito ao administrador" });
    next();
  });
}
'@ | Set-Content -Encoding UTF8 "$base\server\src\middleware\auth.ts"

Write-Host "✅ auth middleware criado" -ForegroundColor Green

# ─── .env.example ─────────────────────────────────────────────────────────────
@'
# SERVER — crie server/.env com estas variáveis
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=troque_por_chave_segura_em_producao
GOOGLE_CLIENT_ID=SEU_CLIENT_ID.apps.googleusercontent.com

# CLIENT — crie client/.env com estas variáveis
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
'@ | Set-Content -Encoding UTF8 "$base\.env.example"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " CONCLUÍDO! Arquivos v2 criados com sucesso" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. npm install" -ForegroundColor White
Write-Host "2. npm run db:migrate" -ForegroundColor White
Write-Host "3. npm run db:seed" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Para fazer commit:" -ForegroundColor Yellow
Write-Host "git add ." -ForegroundColor White
Write-Host 'git commit -m "feat: v2 - admin + auth + corretores + leads"' -ForegroundColor White
Write-Host "git push origin main" -ForegroundColor White
