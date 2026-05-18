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
        <p className="text-white/50 mb-8">O administrador irÃ¡ revisar e ativar sua conta em breve.</p>
        <Link to="/login" className="text-[#c9a84c] text-xs tracking-widest uppercase hover:underline">Voltar ao login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10"><img src="/logo.png" alt="ThomÃ©" className="h-16 w-auto object-contain" /></div>
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-2">Corretor</p>
        <h2 className="text-white text-3xl font-thin mb-2">Cadastro</h2>
        <p className="text-white/40 text-sm mb-8">ApÃ³s o cadastro, aguarde a ativaÃ§Ã£o pelo administrador.</p>
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
        <p className="text-center mt-6 text-white/30 text-xs">JÃ¡ tem conta? <Link to="/login" className="text-[#c9a84c] hover:underline">Entrar</Link></p>
      </div>
    </div>
  );
}
