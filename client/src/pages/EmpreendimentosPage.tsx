import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Layers, ArrowRight, DollarSign, Search } from "lucide-react";
import { imoveisAPI, type Imovel } from "../services/api";
import { PropertyImage } from "../components/PropertyImage";

const CATS = [
  { value: "todos", label: "Todos" },
  { value: "lancamento", label: "Lançamento" },
  { value: "pronto", label: "Pronto" },
  { value: "locacao", label: "Locação" },
  { value: "terceiros", label: "Terceiros" },
];

const CAT_COLOR: Record<string, string> = {
  lancamento: "text-[#c9a84c] bg-[#c9a84c]/10 border-[#c9a84c]/30",
  pronto: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  terceiros: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  locacao: "text-purple-400 bg-purple-500/10 border-purple-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  locado: "Locado",
};

export function EmpreendimentosPage() {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["imoveis-publicos"],
    queryFn: () => imoveisAPI.listar().then((r) => r.data.data as Imovel[]),
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return (data || []).filter((i: Imovel) => {
      const matchCategoria = filtro === "todos" || i.categoria === filtro;
      const haystack = [i.titulo, i.descricao, i.bairro || "", i.cidade].join(" ").toLowerCase();
      const matchBusca = !termo || haystack.includes(termo);
      return matchCategoria && matchBusca;
    });
  }, [busca, data, filtro]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24 pt-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#c9a84c]">Portfólio Completo</p>
        <h1 className="mb-6 text-5xl font-thin tracking-wide text-white">Empreendimentos</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-white/40">
          Explore imóveis com imagens reais, localização, faixa de preço e acesso rápido à página de detalhes.
        </p>

        <div className="my-10 grid gap-4 rounded-2xl border border-white/5 bg-[#111] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, bairro ou cidade"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/25 focus:border-[#c9a84c]/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            {CATS.map((o) => (
              <button
                key={o.value}
                onClick={() => setFiltro(o.value)}
                className={`border px-5 py-2 text-xs uppercase tracking-widest transition-all duration-300 ${
                  filtro === o.value
                    ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                    : "border-white/20 text-white/50 hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((im: Imovel) => {
              const valor = im.valor_venda
                ? `R$ ${Number(im.valor_venda).toLocaleString("pt-BR")}`
                : im.valor_locacao
                  ? `R$ ${Number(im.valor_locacao).toLocaleString("pt-BR")}/mês`
                  : null;

              return (
                <article key={im.id} className="group flex flex-col overflow-hidden border border-white/5 bg-[#111] transition-all duration-500 hover:-translate-y-1 hover:border-[#c9a84c]/30">
                  <PropertyImage src={im.imagem_capa} alt={im.titulo} className="h-56" fallbackLogoClassName="h-20 w-auto opacity-15">
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest backdrop-blur-sm ${CAT_COLOR[im.categoria]}`}>
                        {CATS.find((c) => c.value === im.categoria)?.label}
                      </span>
                    </div>
                    {im.destaque && (
                      <div className="absolute top-4 right-4 z-10 bg-[#c9a84c] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black">
                        Destaque
                      </div>
                    )}
                  </PropertyImage>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="mb-3 text-lg font-light leading-snug text-white">{im.titulo}</h2>
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/40">{im.descricao}</p>

                    <div className="mb-4 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <MapPin size={11} className="shrink-0 text-[#c9a84c]/60" />
                        {im.bairro ? `${im.bairro}, ` : ""}
                        {im.cidade}
                      </div>
                      {(im.quartos || im.suites || im.vagas) && (
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <Layers size={11} className="shrink-0 text-[#c9a84c]/60" />
                          {im.quartos ? `${im.quartos} quartos` : "Consulte detalhes"}
                          {im.suites ? ` · ${im.suites} suítes` : ""}
                          {im.vagas ? ` · ${im.vagas} vagas` : ""}
                        </div>
                      )}
                    </div>

                    {valor && (
                      <div className="mb-4 flex items-center gap-1.5 text-sm font-medium text-[#c9a84c]">
                        <DollarSign size={13} /> {valor}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs text-white/30">{STATUS_LABEL[im.status]}</span>
                      <Link
                        to={`/empreendimentos/${im.slug}`}
                        className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#c9a84c] transition-all duration-300 group-hover:gap-3"
                      >
                        Ver imóvel <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && filtrados.length === 0 && (
          <div className="py-24 text-center text-white/30">
            Nenhum empreendimento encontrado para este filtro.
          </div>
        )}
      </div>
    </main>
  );
}
