// client/src/pages/admin/DashboardPage.tsx
import { useQuery }      from "@tanstack/react-query";
import { Link }          from "react-router-dom";
import { imoveisAPI, leadsAPI, usuariosAPI, type Imovel, type Lead } from "../../services/api";
import { Building2, Users, MessageSquare, TrendingUp, Eye, Clock, CheckCircle, ArrowRight } from "lucide-react";

function Stat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-lg p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-white/40 text-xs tracking-widest uppercase">{label}</p>
        <p className="text-white text-2xl font-light mt-1">{value ?? "—"}</p>
      </div>
    </div>
  );
}

const statusCfg: Record<string, { label: string; color: string }> = {
  novo:        { label: "Novo",        color: "text-blue-400"    },
  contatado:   { label: "Contatado",   color: "text-yellow-400"  },
  qualificado: { label: "Qualificado", color: "text-[#c9a84c]"   },
  convertido:  { label: "Convertido",  color: "text-emerald-400" },
  perdido:     { label: "Perdido",     color: "text-red-400"     },
};

const catLabel: Record<string, string> = {
  lancamento: "Lançamento", pronto: "Pronto", terceiros: "Terceiros", locacao: "Locação",
};

export function DashboardPage() {
  const { data: imoveis }    = useQuery({ queryKey: ["admin-imoveis"],    queryFn: () => imoveisAPI.adminTodos().then(r => r.data.data) });
  const { data: leads }      = useQuery({ queryKey: ["admin-leads"],      queryFn: () => leadsAPI.listar().then(r => r.data.data) });
  const { data: corretores } = useQuery({ queryKey: ["admin-corretores"], queryFn: () => usuariosAPI.corretores().then(r => r.data.data) });

  const publicados   = (imoveis    || []).filter((i: Imovel) => i.publicado).length;
  const leadsNovos   = (leads      || []).filter((l: Lead)   => l.status === "novo").length;
  const ativos       = (corretores || []).filter((c: any)    => c.ativo).length;
  const convertidos  = (leads      || []).filter((l: Lead)   => l.status === "convertido").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">Visão Geral</p>
        <h1 className="text-white text-3xl font-thin">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Imóveis"          value={(imoveis    || []).length} icon={Building2}     color="bg-[#c9a84c]/10 text-[#c9a84c]" />
        <Stat label="Publicados"       value={publicados}                icon={Eye}           color="bg-emerald-500/10 text-emerald-400" />
        <Stat label="Leads"            value={(leads      || []).length} icon={MessageSquare} color="bg-blue-500/10 text-blue-400" />
        <Stat label="Corretores Ativos" value={ativos}                   icon={Users}         color="bg-purple-500/10 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Leads recentes */}
        <div className="bg-[#111] border border-white/5 rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-white font-light">Leads Recentes</h2>
            <div className="flex items-center gap-3">
              <span className="text-[#c9a84c] text-xs bg-[#c9a84c]/10 px-2 py-1 rounded">{leadsNovos} novos</span>
              <Link to="/admin/leads" className="text-white/30 hover:text-[#c9a84c] transition-colors">
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {(leads || []).slice(0, 5).length === 0 && (
              <p className="text-white/30 text-sm p-5">Nenhum lead ainda.</p>
            )}
            {(leads || []).slice(0, 5).map((l: Lead) => {
              const cfg = statusCfg[l.status] || statusCfg.novo;
              return (
                <div key={l.id} className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold shrink-0">
                    {l.nome[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{l.nome}</p>
                    <p className="text-white/40 text-xs truncate">{l.email}</p>
                  </div>
                  <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Imóveis recentes */}
        <div className="bg-[#111] border border-white/5 rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-white font-light">Imóveis Recentes</h2>
            <Link to="/admin/imoveis" className="text-white/30 hover:text-[#c9a84c] transition-colors">
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {(imoveis || []).slice(0, 5).length === 0 && (
              <p className="text-white/30 text-sm p-5">Nenhum imóvel.</p>
            )}
            {(imoveis || []).slice(0, 5).map((im: Imovel) => (
              <div key={im.id} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded bg-[#c9a84c]/10 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-[#c9a84c]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{im.titulo}</p>
                  <p className="text-white/40 text-xs">{catLabel[im.categoria]} · {im.cidade}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  im.publicado
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : "text-white/30 border-white/10"
                }`}>
                  {im.publicado ? "Publicado" : "Rascunho"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats secundários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Lançamentos",  value: (imoveis||[]).filter((i:Imovel) => i.categoria === "lancamento").length, color: "text-[#c9a84c]" },
          { label: "Prontos",      value: (imoveis||[]).filter((i:Imovel) => i.categoria === "pronto").length,     color: "text-emerald-400" },
          { label: "Locação",      value: (imoveis||[]).filter((i:Imovel) => i.categoria === "locacao").length,    color: "text-purple-400" },
          { label: "Convertidos",  value: convertidos,                                                              color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-white/5 rounded-lg p-5 text-center">
            <p className={`text-3xl font-light ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
