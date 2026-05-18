// client/src/pages/EmpreendimentosPage.tsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Calendar, Layers, ArrowRight } from "lucide-react";
import { empreendimentosAPI, type Empreendimento } from "../services/api";

const tipoOpts = [
  { value: "todos",       label: "Todos" },
  { value: "residencial", label: "Residencial" },
  { value: "comercial",   label: "Comercial" },
  { value: "obra_publica",label: "Obras Públicas" },
];

const statusLabel: Record<Empreendimento["status"], string> = {
  concluido: "Entregue", em_andamento: "Em Andamento", lancamento: "Lançamento",
};

const statusColor: Record<Empreendimento["status"], string> = {
  concluido: "text-emerald-400", em_andamento: "text-amber-400", lancamento: "text-[#c9a84c]",
};

export function EmpreendimentosPage() {
  const [filtro, setFiltro] = useState("todos");
  const { data, isLoading } = useQuery({
    queryKey: ["empreendimentos"],
    queryFn: () => empreendimentosAPI.listar().then(r => r.data.data),
  });

  const filtrados = (data || []).filter(e =>
    filtro === "todos" ? true : e.tipo === filtro
  );

  return (
    <main className="bg-[#0a0a0a] min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">Portfólio Completo</p>
        <h1 className="text-white text-5xl font-thin tracking-wide mb-12">Empreendimentos</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-12 border-b border-white/10 pb-8">
          {tipoOpts.map(o => (
            <button
              key={o.value}
              onClick={() => setFiltro(o.value)}
              className={`text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-300 ${
                filtro === o.value
                  ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                  : "border-white/20 text-white/50 hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5].map(i => <div key={i} className="h-80 bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(emp => (
              <article key={emp.id} className="group bg-[#111] border border-white/5 hover:border-[#c9a84c]/30 transition-all duration-500 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className={`text-xs tracking-widest uppercase mb-1 ${statusColor[emp.status]}`}>
                      {statusLabel[emp.status]}
                    </p>
                    <h2 className="text-white text-xl font-light leading-snug">{emp.nome}</h2>
                  </div>
                  {emp.destaque && (
                    <span className="text-[#c9a84c] text-[9px] tracking-widest uppercase border border-[#c9a84c]/30 px-2 py-1 shrink-0">
                      Destaque
                    </span>
                  )}
                </div>

                <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3">{emp.descricao}</p>

                <div className="space-y-2 mb-6 text-white/40 text-xs">
                  <div className="flex items-center gap-2"><MapPin size={11} className="text-[#c9a84c]/60" /> {emp.endereco}</div>
                  <div className="flex items-center gap-2"><MapPin size={11} className="text-transparent" /> {emp.cidade}, {emp.estado}</div>
                  {emp.pavimentos && <div className="flex items-center gap-2"><Layers size={11} className="text-[#c9a84c]/60" /> {emp.pavimentos} pavimentos</div>}
                  {emp.area_total && <div className="flex items-center gap-2"><Layers size={11} className="text-transparent" /> {emp.area_total.toLocaleString("pt-BR")} m²</div>}
                  {emp.ano_entrega && <div className="flex items-center gap-2"><Calendar size={11} className="text-[#c9a84c]/60" /> {emp.ano_entrega}</div>}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <a
                    href="#contato"
                    className="flex items-center gap-2 text-[#c9a84c] text-xs tracking-widest uppercase group-hover:gap-3 transition-all duration-300"
                  >
                    Tenho interesse <ArrowRight size={12} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && filtrados.length === 0 && (
          <div className="text-center py-24 text-white/30">
            Nenhum empreendimento encontrado para este filtro.
          </div>
        )}
      </div>
    </main>
  );
}
