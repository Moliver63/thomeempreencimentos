// client/src/pages/EmpreendimentosPage.tsx
import { useState }  from "react";
import { useQuery }  from "@tanstack/react-query";
import { Link }      from "react-router-dom";
import { imoveisAPI, type Imovel } from "../services/api";
import { MapPin, Layers, ArrowRight, DollarSign } from "lucide-react";

const CATS = [
  { value: "todos",      label: "Todos"      },
  { value: "lancamento", label: "Lançamento" },
  { value: "pronto",     label: "Pronto"     },
  { value: "locacao",    label: "Locação"    },
  { value: "terceiros",  label: "Terceiros"  },
];

const CAT_COLOR: Record<string,string> = {
  lancamento: "text-[#c9a84c] bg-[#c9a84c]/10 border-[#c9a84c]/30",
  pronto:     "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  terceiros:  "text-blue-400 bg-blue-500/10 border-blue-500/30",
  locacao:    "text-purple-400 bg-purple-500/10 border-purple-500/30",
};

const STATUS_LABEL: Record<string,string> = {
  disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido", locado: "Locado",
};

export function EmpreendimentosPage() {
  const [filtro, setFiltro] = useState("todos");

  const { data, isLoading } = useQuery({
    queryKey: ["imoveis-publicos"],
    queryFn:  () => imoveisAPI.listar().then(r => r.data.data as Imovel[]),
  });

  const filtrados = (data || []).filter((i: Imovel) =>
    filtro === "todos" ? true : i.categoria === filtro
  );

  return (
    <main className="bg-[#0a0a0a] min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">Portfólio Completo</p>
        <h1 className="text-white text-5xl font-thin tracking-wide mb-12">Empreendimentos</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-12 border-b border-white/10 pb-8">
          {CATS.map(o => (
            <button key={o.value} onClick={() => setFiltro(o.value)}
              className={`text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-300 ${
                filtro === o.value
                  ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                  : "border-white/20 text-white/50 hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
              }`}>
              {o.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map((im: Imovel) => {
              const valor = im.valor_venda
                ? `R$ ${Number(im.valor_venda).toLocaleString("pt-BR")}`
                : im.valor_locacao
                ? `R$ ${Number(im.valor_locacao).toLocaleString("pt-BR")}/mês`
                : null;
              return (
                <article key={im.id} className="group bg-[#111] border border-white/5 hover:border-[#c9a84c]/30 transition-all duration-500 flex flex-col">
                  {/* Imagem placeholder */}
                  <div className="h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center relative">
                    <img src="/logo_symbol.png" alt="" className="h-20 w-auto object-contain" style={{ opacity: 0.08 }} />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] tracking-widest uppercase px-3 py-1 border rounded-full ${CAT_COLOR[im.categoria]}`}>
                        {CATS.find(c => c.value === im.categoria)?.label}
                      </span>
                    </div>
                    {im.destaque && (
                      <div className="absolute top-4 right-4 bg-[#c9a84c] text-black text-[9px] tracking-widest uppercase px-3 py-1 font-bold">
                        Destaque
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-white text-lg font-light leading-snug mb-3">{im.titulo}</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">{im.descricao}</p>

                    <div className="space-y-1.5 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <MapPin size={11} className="text-[#c9a84c]/60 shrink-0" />
                        {im.bairro ? `${im.bairro}, ` : ""}{im.cidade}
                      </div>
                      {im.quartos && (
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <Layers size={11} className="text-[#c9a84c]/60 shrink-0" />
                          {im.quartos} quartos{im.suites ? ` · ${im.suites} suítes` : ""}{im.vagas ? ` · ${im.vagas} vagas` : ""}
                        </div>
                      )}
                    </div>

                    {valor && (
                      <div className="flex items-center gap-1.5 text-[#c9a84c] font-medium text-sm mb-4">
                        <DollarSign size={13} /> {valor}
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-white/30 text-xs">{STATUS_LABEL[im.status]}</span>
                      <a href="#contato"
                        className="flex items-center gap-2 text-[#c9a84c] text-xs tracking-widest uppercase group-hover:gap-3 transition-all duration-300">
                        Tenho interesse <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
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
