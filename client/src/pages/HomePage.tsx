import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { MapPin, Layers, ArrowRight, Phone, Mail, Instagram, DollarSign } from "lucide-react";
import { imoveisAPI, leadsAPI, type Imovel } from "../services/api";

const leadSchema = z.object({
  nome:     z.string().min(2, "Nome obrigatorio"),
  email:    z.string().email("E-mail invalido"),
  telefone: z.string().min(10, "Telefone invalido"),
  mensagem: z.string().optional(),
});
type LeadForm = z.infer<typeof leadSchema>;

const catLabel: Record<string, string> = {
  lancamento: "Lancamento", pronto: "Pronto", terceiros: "Parceiro", locacao: "Locacao",
};
const catColor: Record<string, string> = {
  lancamento: "text-[#c9a84c] border-[#c9a84c]/30 bg-[#c9a84c]/10",
  pronto:     "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  terceiros:  "text-blue-400 border-blue-500/30 bg-blue-500/10",
  locacao:    "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

function ImovelCard({ imovel }: { imovel: Imovel }) {
  const valor = imovel.valor_venda
    ? "R$ " + Number(imovel.valor_venda).toLocaleString("pt-BR")
    : imovel.valor_locacao
    ? "R$ " + Number(imovel.valor_locacao).toLocaleString("pt-BR") + "/mes"
    : null;

  return (
    <div className="group bg-[#111] border border-white/5 hover:border-[#c9a84c]/40 transition-all duration-500 overflow-hidden flex flex-col">
      <div className="relative h-52 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center">
        <img src="/logo_symbol.png" alt="" className="h-24 w-auto object-contain group-hover:opacity-20 transition-opacity duration-700" style={{ opacity: 0.75 }} />
        <div className="absolute top-4 left-4">
          <span className={"text-[10px] tracking-widest uppercase px-3 py-1 border rounded-full " + (catColor[imovel.categoria] || "")}>
            {catLabel[imovel.categoria]}
          </span>
        </div>
        {imovel.destaque && (
          <div className="absolute top-4 right-4 bg-[#c9a84c] text-black text-[9px] tracking-widest uppercase px-3 py-1 font-bold">
            Destaque
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-white text-base font-light tracking-wide mb-3 leading-snug">{imovel.titulo}</h3>
        <div className="space-y-1.5 mb-4 flex-1">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <MapPin size={11} className="text-[#c9a84c]/60 shrink-0" />
            {imovel.bairro ? imovel.bairro + ", " : ""}{imovel.cidade}
          </div>
          {imovel.quartos && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Layers size={11} className="text-[#c9a84c]/60 shrink-0" />
              {imovel.quartos} quartos{imovel.suites ? " - " + imovel.suites + " suites" : ""}{imovel.vagas ? " - " + imovel.vagas + " vagas" : ""}
            </div>
          )}
        </div>
        {valor && (
          <div className="flex items-center gap-1.5 text-[#c9a84c] font-medium text-sm mb-4">
            <DollarSign size={13} /> {valor}
          </div>
        )}
        <Link to="/empreendimentos" className="flex items-center gap-2 text-[#c9a84c] text-xs tracking-widest uppercase group-hover:gap-3 transition-all duration-300 mt-auto">
          Ver detalhes <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["imoveis-home"],
    queryFn:  () => imoveisAPI.listar().then(r => r.data.data as Imovel[]),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (values: LeadForm) => {
    try {
      await leadsAPI.criar(values);
      toast.success("Interesse registrado! Nossa equipe entrara em contato.");
      reset();
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    }
  };

  const destaques = (data || []).filter(i => i.destaque).slice(0, 3);
  const cards     = destaques.length > 0 ? destaques : (data || []).slice(0, 3);

  return (
    <main className="bg-[#0a0a0a] min-h-screen">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.025]"
          style={{ background: "repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)", backgroundSize: "28px 28px" }} />
        <div className="absolute left-1/2 top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/20 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24 pb-12">
          <p className="text-[#c9a84c]/70 text-[11px] tracking-[0.5em] uppercase mb-10">
            Ha mais de 15 anos edificando sonhos
          </p>
          <div className="flex justify-center mb-14">
            <img src="/logo_full.png" alt="Thome Empreendimentos" className="w-auto object-contain" style={{ height: "clamp(140px, 20vw, 220px)" }} />
          </div>
          <p className="text-white/40 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed mb-14 tracking-wide">
            Construimos com qualidade, comprometimento e a garantia de que cada projeto reflete o melhor conceito em morar bem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/empreendimentos" className="bg-[#c9a84c] text-black text-[11px] tracking-[0.35em] uppercase px-12 py-4 font-bold hover:bg-[#dbb85e] transition-colors duration-300">
              Nossos Projetos
            </Link>
            <a href="#contato" className="border border-[#c9a84c]/40 text-[#c9a84c] text-[11px] tracking-[0.35em] uppercase px-12 py-4 hover:bg-[#c9a84c]/8 transition-colors duration-300">
              Fale Conosco
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30">
          <div className="w-px h-12 bg-gradient-to-b from-[#c9a84c] to-transparent animate-pulse mx-auto" />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "15+",  label: "Anos de Mercado"           },
            { n: "5+",   label: "Obras Entregues"            },
            { n: "2",    label: "Engenheiros Especializados"  },
            { n: "100%", label: "Satisfacao dos Clientes"    },
          ].map(s => (
            <div key={s.n} className="text-center">
              <p className="text-[#c9a84c] text-4xl md:text-5xl font-thin tracking-wider mb-2">{s.n}</p>
              <p className="text-white/35 text-[10px] tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EMPREENDIMENTOS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-[#c9a84c] text-[10px] tracking-[0.45em] uppercase mb-3">Portfolio</p>
            <h2 className="text-white text-3xl md:text-4xl font-thin tracking-wide">Nossos Empreendimentos</h2>
          </div>
          <Link to="/empreendimentos" className="hidden md:flex items-center gap-2 text-[#c9a84c]/60 text-[10px] tracking-widest uppercase hover:text-[#c9a84c] transition-colors">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-96 bg-white/5 animate-pulse rounded" />)}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 text-white/20 text-sm">Nenhum empreendimento publicado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
          </div>
        )}
      </section>

      {/* SOBRE */}
      <section className="py-24 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#c9a84c] text-[10px] tracking-[0.45em] uppercase mb-5">Sobre a Thome</p>
            <h2 className="text-white text-3xl md:text-4xl font-thin tracking-wide mb-6 leading-tight">
              Viva bem,<br /><span className="text-[#c9a84c]">Viva Thome.</span>
            </h2>
            <p className="text-white/45 leading-relaxed mb-5 text-sm">
              Desde julho de 2003, trabalhamos com a construcao e incorporacao de empreendimentos imobiliarios, executando projetos com padrao de qualidade e confianca, edificando sonhos e o desejo de morar bem.
            </p>
            <p className="text-white/45 leading-relaxed mb-8 text-sm">
              Na busca total da satisfacao, contribuimos para o crescimento da comunidade, valorizando acima de tudo nossos clientes e colaboradores.
            </p>
            <a href="https://www.instagram.com/thomeempreendimentos" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-[#c9a84c] text-[10px] tracking-widest uppercase hover:underline">
              <Instagram size={13} /> @thomeempreendimentos
            </a>
          </div>
          <div className="relative flex items-center justify-center h-72 md:h-80">
            <div className="absolute inset-0 border border-[#c9a84c]/8 rounded" />
            <div className="absolute top-5 right-5 bottom-5 left-5 border border-[#c9a84c]/4 rounded" />
            <img src="/logo_full.png" alt="Thome Empreendimentos" className="relative z-10 h-52 w-auto object-contain" style={{ opacity: 0.75 }} />
            <div className="absolute bottom-6 right-8 text-right">
              <p className="text-[#c9a84c] text-4xl font-thin">2003</p>
              <p className="text-white/25 text-[9px] tracking-widest uppercase">Desde</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERESSE */}
      <section id="contato" className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[#c9a84c] text-[10px] tracking-[0.45em] uppercase mb-5">Interesse</p>
            <h2 className="text-white text-3xl md:text-4xl font-thin tracking-wide mb-5">Quero conhecer um projeto</h2>
            <p className="text-white/40 leading-relaxed mb-10 text-sm">
              Deixe seus dados e nossa equipe entrara em contato para apresentar as melhores opcoes de acordo com seu perfil.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-white/40 text-sm"><Phone size={14} className="text-[#c9a84c] mt-0.5 shrink-0" /> (47) 3311-2896</div>
              <div className="flex items-start gap-3 text-white/40 text-sm"><Mail size={14} className="text-[#c9a84c] mt-0.5 shrink-0" /> contato@thomeempreendimentos.com.br</div>
              <div className="flex items-start gap-3 text-white/40 text-sm"><MapPin size={14} className="text-[#c9a84c] mt-0.5 shrink-0" /> Rua 3122, no 75 - SL 04, Centro, Balneario Camboriu-SC</div>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input {...register("nome")} placeholder="Seu nome completo"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors" />
              {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <input {...register("email")} type="email" placeholder="Seu e-mail"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register("telefone")} placeholder="WhatsApp / Telefone"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors" />
              {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone.message}</p>}
            </div>
            <textarea {...register("mensagem")} rows={4} placeholder="Qual empreendimento te interessa? (opcional)"
              className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors resize-none" />
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#c9a84c] text-black font-bold text-[11px] tracking-[0.35em] uppercase py-5 hover:bg-[#dbb85e] transition-colors duration-300 disabled:opacity-50">
              {isSubmitting ? "Enviando..." : "Registrar Interesse"}
            </button>
          </form>
        </div>
      </section>

    </main>
  );
}
