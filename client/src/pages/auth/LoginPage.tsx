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
      if (r?.pendente) toast("Cadastro recebido! Aguarde ativaÃ§Ã£o.", { icon: "â³" });
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
        <img src="/logo.png" alt="ThomÃ©" className="h-24 w-auto object-contain" />
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">Painel Interno</p>
          <h1 className="text-white text-5xl font-thin leading-tight mb-6">Bem-vindo ao<br /><span className="text-[#c9a84c]">sistema ThomÃ©</span></h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm">Plataforma de gestÃ£o de imÃ³veis, leads e equipe de corretores.</p>
        </div>
        <p className="text-white/20 text-xs">Â© {new Date().getFullYear()} ThomÃ© Empreendimentos</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <img src="/logo.png" alt="ThomÃ©" className="h-16 w-auto object-contain" />
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
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 pr-12 text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/60 transition-colors rounded" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
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
            <p className="text-white/30 text-xs mb-3">Ainda nÃ£o tem cadastro?</p>
            <Link to="/registro" className="text-[#c9a84c] text-xs tracking-widest uppercase hover:underline">Cadastrar como corretor</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
