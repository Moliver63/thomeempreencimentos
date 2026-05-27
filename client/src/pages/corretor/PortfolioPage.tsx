// client/src/pages/corretor/PortfolioPage.tsx
import { useState }  from "react";
import { useQuery }  from "@tanstack/react-query";
import { imoveisAPI, type Imovel } from "../../services/api";
import { MapPin, Layers, DollarSign, Building2 } from "lucide-react";

const CAT_COLOR: Record<string,string> = {
  lancamento: "text-[#c9a84c] bg-[#c9a84c]/10",
  pronto:     "text-emerald-400 bg-emerald-500/10",
  terceiros:  "text-blue-400 bg-blue-500/10",
  locacao:    "text-purple-400 bg-purple-500/10",
};
const CAT_LABEL: Record<string,string> = {
  lancamento: "Lançamento", pronto: "Pronto", terceiros: "Terceiros", locacao: "Locação",
};

export function PortfolioPage() {
  const [filtro, setFiltro] = useState("todos");

  const { data, isLoading } = useQuery({
    queryKey: ["corretor-portfolio"],
    queryFn:  () => imoveisAPI.portfolio().then(r => r.data.data),
  });

  const filtrados = (data || []).filter((i: Imovel) => filtro === "todos" || i.categoria === filtro);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-1">Thomé</p>
        <h1 className="text-white text-3xl font-thin">Portfólio de Imóveis</h1>
        <p className="text-white/40 text-sm mt-1">Imóveis disponíveis para apresentação aos clientes</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["todos","lancamento","pronto","locacao","terceiros"].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs tracking-widest uppercase px-4 py-2 rounded border transition-all ${
              filtro === f
                ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                : "border-white/10 text-white/50 hover:border-[#c9a84c]/40"
            }`}>
            {f === "todos" ? "Todos" : CAT_LABEL[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-lg" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum imóvel nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtrados.map((im: Imovel) => (
            <div key={im.id} className="bg-[#111] border border-white/5 hover:border-[#c9a84c]/30 rounded-lg overflow-hidden transition-all duration-300 group flex flex-col">
              <div className="h-44 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center relative">
                <img src="/logo_symbol.png" alt="" className="h-16 w-auto object-contain transition-opacity duration-300 group-hover:opacity-20" style={{ opacity: 0.08 }} />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full ${CAT_COLOR[im.categoria]}`}>
                    {CAT_LABEL[im.categoria]}
                  </span>
                </div>
                {im.destaque && (
                  <div className="absolute top-3 right-3 bg-[#c9a84c] text-black text-[9px] tracking-widest uppercase px-2 py-0.5 font-bold rounded">
                    Destaque
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-light mb-3 leading-snug">{im.titulo}</h3>
                <div className="space-y-1.5 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <MapPin size={11} className="text-[#c9a84c]/60" />
                    {im.bairro ? `${im.bairro}, ` : ""}{im.cidade}
                  </div>
                  {im.quartos && (
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Layers size={11} className="text-[#c9a84c]/60" />
                      {im.quartos} quartos{im.suites ? ` · ${im.suites} suítes` : ""}{im.vagas ? ` · ${im.vagas} vagas` : ""}
                    </div>
                  )}
                  {(im.valor_venda || im.valor_locacao) && (
                    <div className="flex items-center gap-1.5 text-[#c9a84c] text-sm font-medium mt-2">
                      <DollarSign size={12} />
                      {im.valor_venda
                        ? `R$ ${Number(im.valor_venda).toLocaleString("pt-BR")}`
                        : `R$ ${Number(im.valor_locacao).toLocaleString("pt-BR")}/mês`}
                    </div>
                  )}
                </div>
                {im.construtora_parceira && (
                  <p className="text-white/30 text-xs border-t border-white/5 pt-3">
                    Parceiro: {im.construtora_parceira}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
