import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Layers, DollarSign, Building2 } from "lucide-react";
import { imoveisAPI, type Imovel } from "../../services/api";
import { PropertyImage } from "../../components/PropertyImage";

const CAT_COLOR: Record<string, string> = {
  lancamento: "text-[#c9a84c] bg-[#c9a84c]/10",
  pronto: "text-emerald-400 bg-emerald-500/10",
  terceiros: "text-blue-400 bg-blue-500/10",
  locacao: "text-purple-400 bg-purple-500/10",
};

const CAT_LABEL: Record<string, string> = {
  lancamento: "Lançamento",
  pronto: "Pronto",
  terceiros: "Terceiros",
  locacao: "Locação",
};

export function PortfolioPage() {
  const [filtro, setFiltro] = useState("todos");

  const { data, isLoading } = useQuery({
    queryKey: ["corretor-portfolio"],
    queryFn: () => imoveisAPI.portfolio().then((r) => r.data.data),
  });

  const filtrados = (data || []).filter((i: Imovel) => filtro === "todos" || i.categoria === filtro);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs uppercase tracking-[0.4em] text-[#c9a84c]">Thomé</p>
        <h1 className="text-3xl font-thin text-white">Portfólio de Imóveis</h1>
        <p className="mt-1 text-sm text-white/40">Imóveis disponíveis para apresentação aos clientes</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["todos", "lancamento", "pronto", "locacao", "terceiros"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded border px-4 py-2 text-xs uppercase tracking-widest transition-all ${
              filtro === f
                ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                : "border-white/10 text-white/50 hover:border-[#c9a84c]/40"
            }`}
          >
            {f === "todos" ? "Todos" : CAT_LABEL[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-white/5" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="py-16 text-center text-white/20">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum imóvel nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((im: Imovel) => (
            <div key={im.id} className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#111] transition-all duration-300 hover:border-[#c9a84c]/30">
              <PropertyImage src={im.imagem_capa} alt={im.titulo} className="h-52" fallbackLogoClassName="h-16 w-auto opacity-10">
                <div className="absolute top-3 left-3 z-10">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${CAT_COLOR[im.categoria]}`}>
                    {CAT_LABEL[im.categoria]}
                  </span>
                </div>
                {im.destaque && (
                  <div className="absolute top-3 right-3 z-10 rounded bg-[#c9a84c] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">
                    Destaque
                  </div>
                )}
              </PropertyImage>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-3 font-light leading-snug text-white">{im.titulo}</h3>
                <div className="mb-4 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <MapPin size={11} className="text-[#c9a84c]/60" />
                    {im.bairro ? `${im.bairro}, ` : ""}
                    {im.cidade}
                  </div>
                  {im.quartos && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Layers size={11} className="text-[#c9a84c]/60" />
                      {im.quartos} quartos{im.suites ? ` · ${im.suites} suítes` : ""}{im.vagas ? ` · ${im.vagas} vagas` : ""}
                    </div>
                  )}
                  {(im.valor_venda || im.valor_locacao) && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#c9a84c]">
                      <DollarSign size={12} />
                      {im.valor_venda
                        ? `R$ ${Number(im.valor_venda).toLocaleString("pt-BR")}`
                        : `R$ ${Number(im.valor_locacao).toLocaleString("pt-BR")}/mês`}
                    </div>
                  )}
                </div>
                {im.construtora_parceira && (
                  <p className="border-t border-white/5 pt-3 text-xs text-white/30">
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
