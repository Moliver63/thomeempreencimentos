import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { MapPin, Layers, ArrowRight, Phone, Mail, Instagram, DollarSign } from "lucide-react";
import { imoveisAPI, leadsAPI, type Imovel } from "../services/api";
import { PropertyImage } from "../components/PropertyImage";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  mensagem: z.string().optional(),
});

type LeadForm = z.infer<typeof leadSchema>;

const catLabel: Record<string, string> = {
  lancamento: "Lançamento",
  pronto: "Pronto",
  terceiros: "Parceiro",
  locacao: "Locação",
};

const catColor: Record<string, string> = {
  lancamento: "text-[#c9a84c] border-[#c9a84c]/30 bg-[#c9a84c]/10",
  pronto: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  terceiros: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  locacao: "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

function ImovelCard({ imovel }: { imovel: Imovel }) {
  const valor = imovel.valor_venda
    ? "R$ " + Number(imovel.valor_venda).toLocaleString("pt-BR")
    : imovel.valor_locacao
      ? "R$ " + Number(imovel.valor_locacao).toLocaleString("pt-BR") + "/mês"
      : null;

  return (
    <div className="group overflow-hidden border border-white/5 bg-[#111] transition-all duration-500 hover:border-[#c9a84c]/40 hover:-translate-y-1 flex flex-col">
      <PropertyImage
        src={imovel.imagem_capa}
        alt={imovel.titulo}
        className="h-56"
        fallbackLogoClassName="h-24 w-auto opacity-15"
      >
        <div className="absolute top-4 left-4 z-10">
          <span className={"text-[10px] tracking-widest uppercase px-3 py-1 border rounded-full backdrop-blur-sm " + (catColor[imovel.categoria] || "") }>
            {catLabel[imovel.categoria]}
          </span>
        </div>
        {imovel.destaque && (
          <div className="absolute top-4 right-4 z-10 bg-[#c9a84c] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black">
            Destaque
          </div>
        )}
      </PropertyImage>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 text-base font-light leading-snug tracking-wide text-white">{imovel.titulo}</h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/45">{imovel.descricao}</p>

        <div className="mb-4 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <MapPin size={11} className="shrink-0 text-[#c9a84c]/60" />
            {imovel.bairro ? imovel.bairro + ", " : ""}
            {imovel.cidade}
          </div>
          {(imovel.quartos || imovel.suites || imovel.vagas) && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Layers size={11} className="shrink-0 text-[#c9a84c]/60" />
              {imovel.quartos ? `${imovel.quartos} quartos` : "Consulte detalhes"}
              {imovel.suites ? ` · ${imovel.suites} suítes` : ""}
              {imovel.vagas ? ` · ${imovel.vagas} vagas` : ""}
            </div>
          )}
        </div>

        {valor && (
          <div className="mb-4 flex items-center gap-1.5 text-sm font-medium text-[#c9a84c]">
            <DollarSign size={13} /> {valor}
          </div>
        )}

        <Link
          to={`/empreendimentos/${imovel.slug}`}
          className="mt-auto flex items-center gap-2 text-xs uppercase tracking-widest text-[#c9a84c] transition-all duration-300 group-hover:gap-3"
        >
          Ver detalhes <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["imoveis-home"],
    queryFn: () => imoveisAPI.listar().then((r) => r.data.data as Imovel[]),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (values: LeadForm) => {
    try {
      await leadsAPI.criar(values);
      toast.success("Interesse registrado! Nossa equipe entrará em contato.");
      reset();
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    }
  };

  const destaques = (data || []).filter((i) => i.destaque).slice(0, 3);
  const cards = destaques.length > 0 ? destaques : (data || []).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a]" />
        <div
          className="absolute right-0 top-0 h-full w-1/2 opacity-[0.025]"
          style={{
            background: "repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute bottom-24 top-24 left-1/2 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-12 pt-24 text-center">
          <p className="mb-10 text-[11px] uppercase tracking-[0.5em] text-[#c9a84c]/70">
            Há mais de 15 anos edificando sonhos
          </p>
          <div className="mb-14 flex justify-center">
            <img src="/logo_full.png" alt="Thomé Empreendimentos" className="w-auto object-contain" style={{ height: "clamp(140px, 20vw, 220px)" }} />
          </div>
          <p className="mx-auto mb-14 max-w-xl text-base font-light leading-relaxed tracking-wide text-white/40 md:text-lg">
            Construímos com qualidade, comprometimento e a garantia de que cada projeto reflete o melhor conceito em morar bem.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/empreendimentos" className="bg-[#c9a84c] px-12 py-4 text-[11px] font-bold uppercase tracking-[0.35em] text-black transition-colors duration-300 hover:bg-[#dbb85e]">
              Nossos Projetos
            </Link>
            <a href="#contato" className="border border-[#c9a84c]/40 px-12 py-4 text-[11px] uppercase tracking-[0.35em] text-[#c9a84c] transition-colors duration-300 hover:bg-[#c9a84c]/8">
              Fale Conosco
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30">
          <div className="mx-auto h-12 w-px animate-pulse bg-gradient-to-b from-[#c9a84c] to-transparent" />
        </div>
      </section>

      <section className="border-y border-white/5 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { n: "15+", label: "Anos de Mercado" },
            { n: "5+", label: "Obras Entregues" },
            { n: "2", label: "Engenheiros Especializados" },
            { n: "100%", label: "Satisfação dos Clientes" },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <p className="mb-2 text-4xl font-thin tracking-wider text-[#c9a84c] md:text-5xl">{s.n}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/35">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-[#c9a84c]">Portfólio</p>
            <h2 className="text-3xl font-thin tracking-wide text-white md:text-4xl">Nossos Empreendimentos</h2>
          </div>
          <Link to="/empreendimentos" className="hidden items-center gap-2 text-[10px] uppercase tracking-widest text-[#c9a84c]/60 transition-colors hover:text-[#c9a84c] md:flex">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded bg-white/5" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/20">Nenhum empreendimento publicado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-white/5 bg-[#0d0d0d] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.45em] text-[#c9a84c]">Sobre a Thomé</p>
            <h2 className="mb-6 text-3xl font-thin leading-tight tracking-wide text-white md:text-4xl">
              Viva bem,<nobr /> <br />
              <span className="text-[#c9a84c]">Viva Thomé.</span>
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-white/45">
              Desde julho de 2003, trabalhamos com a construção e incorporação de empreendimentos imobiliários, executando projetos com padrão de qualidade e confiança, edificando sonhos e o desejo de morar bem.
            </p>
            <p className="mb-8 text-sm leading-relaxed text-white/45">
              Na busca total da satisfação, contribuímos para o crescimento da comunidade, valorizando acima de tudo nossos clientes e colaboradores.
            </p>
            <a href="https://www.instagram.com/thomeempreendimentos" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#c9a84c] hover:underline">
              <Instagram size={13} /> @thomeempreendimentos
            </a>
          </div>
          <div className="relative flex h-72 items-center justify-center md:h-80">
            <div className="absolute inset-0 rounded border border-[#c9a84c]/8" />
            <div className="absolute inset-5 rounded border border-[#c9a84c]/4" />
            <img src="/logo_full.png" alt="Thomé Empreendimentos" className="relative z-10 h-52 w-auto object-contain" style={{ opacity: 0.75 }} />
            <div className="absolute bottom-6 right-8 text-right">
              <p className="text-4xl font-thin text-[#c9a84c]">2003</p>
              <p className="text-[9px] uppercase tracking-widest text-white/25">Desde</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-start gap-16 md:grid-cols-2">
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.45em] text-[#c9a84c]">Interesse</p>
            <h2 className="mb-5 text-3xl font-thin tracking-wide text-white md:text-4xl">Quero conhecer um projeto</h2>
            <p className="mb-10 text-sm leading-relaxed text-white/40">
              Deixe seus dados e nossa equipe entrará em contato para apresentar as melhores opções de acordo com seu perfil.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-white/40"><Phone size={14} className="mt-0.5 shrink-0 text-[#c9a84c]" /> (47) 99705-0616</div>
              <div className="flex items-start gap-3 text-sm text-white/40"><Mail size={14} className="mt-0.5 shrink-0 text-[#c9a84c]" /> contato@thomeempreendimentos.com.br</div>
              <div className="flex items-start gap-3 text-sm text-white/40"><MapPin size={14} className="mt-0.5 shrink-0 text-[#c9a84c]" /> Rua 3122, nº 75 - SL 04, Centro, Balneário Camboriú-SC</div>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("nome")}
                placeholder="Seu nome completo"
                className="w-full border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder-white/25 transition-colors focus:border-[#c9a84c]/50 focus:outline-none"
              />
              {errors.nome && <p className="mt-1 text-xs text-red-400">{errors.nome.message}</p>}
            </div>
            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Seu e-mail"
                className="w-full border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder-white/25 transition-colors focus:border-[#c9a84c]/50 focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register("telefone")}
                placeholder="WhatsApp / Telefone"
                className="w-full border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder-white/25 transition-colors focus:border-[#c9a84c]/50 focus:outline-none"
              />
              {errors.telefone && <p className="mt-1 text-xs text-red-400">{errors.telefone.message}</p>}
            </div>
            <textarea
              {...register("mensagem")}
              rows={4}
              placeholder="Qual empreendimento te interessa? (opcional)"
              className="w-full resize-none border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder-white/25 transition-colors focus:border-[#c9a84c]/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#c9a84c] py-5 text-[11px] font-bold uppercase tracking-[0.35em] text-black transition-colors duration-300 hover:bg-[#dbb85e] disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Registrar Interesse"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
