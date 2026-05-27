// client/src/pages/HomePage.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { MapPin, Calendar, Layers, ArrowRight, Star, Phone, Mail, Instagram } from "lucide-react";
import { imoveisAPI, leadsAPI, type Imovel } from "../services/api";

// â”€â”€â”€ FORM SCHEMA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const leadSchema = z.object({
  nome:      z.string().min(2, "Nome obrigatÃ³rio"),
  email:     z.string().email("E-mail invÃ¡lido"),
  telefone:  z.string().min(10, "Telefone invÃ¡lido"),
  mensagem:  z.string().optional(),
});
type LeadForm = z.infer<typeof leadSchema>;

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tipoLabel: Record<Empreendimento["tipo"], string> = {
  residencial:  "Residencial",
  comercial:    "Comercial",
  obra_publica: "Obra PÃºblica",
};

const statusColor: Record<Empreendimento["status"], string> = {
  concluido:    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  em_andamento: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  lancamento:   "bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30",
};

const statusLabel: Record<Empreendimento["status"], string> = {
  concluido:    "Entregue",
  em_andamento: "Em Andamento",
  lancamento:   "LanÃ§amento",
};

// â”€â”€â”€ CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EmpCard({ emp }: { emp: Empreendimento }) {
  return (
    <div className="group relative bg-[#111] border border-white/5 hover:border-[#c9a84c]/40 transition-all duration-500 overflow-hidden">
      {/* Imagem placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 80 80" fill="none" className="w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
            <rect x="8" y="8" width="64" height="8" fill="#c9a84c"/>
            <rect x="32" y="16" width="16" height="56" fill="#c9a84c"/>
            <rect x="20" y="32" width="10" height="40" fill="#c9a84c"/>
            <rect x="50" y="24" width="10" height="48" fill="#c9a84c"/>
          </svg>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className={`text-[10px] tracking-widest uppercase px-3 py-1 border rounded-full ${statusColor[emp.status]}`}>
            {statusLabel[emp.status]}
          </span>
        </div>
        {emp.destaque && (
          <div className="absolute top-4 right-4 bg-[#c9a84c] text-black text-[9px] tracking-widest uppercase px-3 py-1 font-bold">
            Destaque
          </div>
        )}
      </div>

      <div className="p-6">
        <p className="text-[#c9a84c] text-[10px] tracking-[0.3em] uppercase mb-2">
          {tipoLabel[emp.tipo]}
        </p>
        <h3 className="text-white text-lg font-light tracking-wide mb-4 leading-snug">
          {emp.nome}
        </h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <MapPin size={12} className="text-[#c9a84c]/60" />
            {emp.cidade}, {emp.estado}
          </div>
          {emp.pavimentos && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Layers size={12} className="text-[#c9a84c]/60" />
              {emp.pavimentos} pavimentos
            </div>
          )}
          {emp.ano_entrega && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Calendar size={12} className="text-[#c9a84c]/60" />
              Entregue em {emp.ano_entrega}
            </div>
          )}
        </div>

        <Link
          to={`/empreendimentos`}
          className="flex items-center gap-2 text-[#c9a84c] text-xs tracking-widest uppercase group-hover:gap-3 transition-all duration-300"
        >
          Ver detalhes <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// â”€â”€â”€ PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["empreendimentos"],
    queryFn: () => empreendimentosAPI.listar().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (values: LeadForm) => {
    try {
      await leadsAPI.criar(values as LeadPayload);
      toast.success("Interesse registrado! Nossa equipe entrarÃ¡ em contato.");
      reset();
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    }
  };

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      {/* â”€â”€ HERO â”€â”€ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background geometry */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
            style={{ background: "repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)", backgroundSize: "30px 30px" }} />
        </div>

        {/* Golden vertical line */}
        <div className="absolute left-1/2 top-20 bottom-20 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/30 to-transparent" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Eyebrow */}
          <p className="text-[#c9a84c] text-xs tracking-[0.5em] uppercase mb-8 opacity-80">
            HÃ¡ mais de 15 anos edificando sonhos
          </p>

          {/* Logo mark */}
          <div className="flex justify-center mb-10">
            <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
              <rect x="10" y="10" width="100" height="14" fill="#c9a84c"/>
              <rect x="53" y="24" width="14" height="86" fill="#c9a84c"/>
              <rect x="30" y="48" width="16" height="62" fill="#b8943e" opacity="0.8"/>
              <rect x="74" y="36" width="16" height="74" fill="#b8943e" opacity="0.8"/>
            </svg>
          </div>

          <h1 className="text-white text-6xl md:text-8xl font-thin tracking-[0.2em] uppercase mb-2">
            ThomÃ©
          </h1>
          <p className="text-[#c9a84c]/80 text-sm tracking-[0.6em] uppercase mb-10">
            Empreendimentos
          </p>

          <p className="text-white/50 text-lg font-light max-w-2xl mx-auto leading-relaxed mb-12">
            ConstruÃ­mos com qualidade, comprometimento e a garantia de que cada projeto reflete o melhor conceito em morar bem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/empreendimentos"
              className="bg-[#c9a84c] text-black text-xs tracking-[0.3em] uppercase px-10 py-4 font-semibold hover:bg-[#dbb85e] transition-colors duration-300"
            >
              Nossos Projetos
            </Link>
            <a
              href="#contato"
              className="border border-[#c9a84c]/50 text-[#c9a84c] text-xs tracking-[0.3em] uppercase px-10 py-4 hover:bg-[#c9a84c]/10 transition-colors duration-300"
            >
              Fale Conosco
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-[#c9a84c] to-transparent animate-pulse" />
        </div>
      </section>

      {/* â”€â”€ STATS â”€â”€ */}
      <section className="border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "15+", label: "Anos de Mercado" },
            { n: "5+",  label: "Obras Entregues" },
            { n: "2",   label: "Engenheiros Especializados" },
            { n: "100%", label: "SatisfaÃ§Ã£o dos Clientes" },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <p className="text-[#c9a84c] text-4xl font-thin tracking-wider mb-2">{s.n}</p>
              <p className="text-white/40 text-xs tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ EMPREENDIMENTOS â”€â”€ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">PortfÃ³lio</p>
            <h2 className="text-white text-4xl font-thin tracking-wide">
              Nossos Empreendimentos
            </h2>
          </div>
          <Link
            to="/empreendimentos"
            className="hidden md:flex items-center gap-2 text-[#c9a84c]/70 text-xs tracking-widest uppercase hover:text-[#c9a84c] transition-colors"
          >
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-96 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data || []).map(emp => <EmpCard key={emp.id} emp={emp} />)}
          </div>
        )}
      </section>

      {/* â”€â”€ SOBRE â”€â”€ */}
      <section className="py-24 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-6">Sobre a ThomÃ©</p>
            <h2 className="text-white text-4xl font-thin tracking-wide mb-6 leading-tight">
              Viva bem,<br /><span className="text-[#c9a84c]">Viva ThomÃ©.</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-6">
              Desde julho de 2003, trabalhamos com a construÃ§Ã£o e incorporaÃ§Ã£o de empreendimentos imobiliÃ¡rios,
              buscando executar projetos com padrÃ£o de qualidade e confianÃ§a, edificando sonhos e o desejo de morar bem.
            </p>
            <p className="text-white/50 leading-relaxed mb-8">
              Na busca total da satisfaÃ§Ã£o, contribuÃ­mos para o crescimento da comunidade, valorizando acima de tudo
              nossos clientes e colaboradores.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/thomeempreendimentos" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[#c9a84c] text-xs tracking-widest uppercase hover:underline">
                <Instagram size={14} /> @thomeempreendimentos
              </a>
            </div>
          </div>

          {/* Decorative */}
          <div className="relative flex items-center justify-center h-80">
            <div className="absolute inset-0 border border-[#c9a84c]/10" />
            <div className="absolute top-6 right-6 bottom-6 left-6 border border-[#c9a84c]/5" />
            <svg viewBox="0 0 200 200" fill="none" className="w-48 h-48 opacity-20">
              <rect x="20" y="20" width="160" height="20" fill="#c9a84c"/>
              <rect x="85" y="40" width="30" height="140" fill="#c9a84c"/>
              <rect x="50" y="80" width="25" height="100" fill="#c9a84c"/>
              <rect x="125" y="60" width="25" height="120" fill="#c9a84c"/>
            </svg>
            <div className="absolute bottom-8 right-8 text-right">
              <p className="text-[#c9a84c] text-5xl font-thin">2003</p>
              <p className="text-white/30 text-xs tracking-widest uppercase">Desde</p>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ FORMULÃRIO DE INTERESSE â”€â”€ */}
      <section id="contato" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-6">Interesse</p>
            <h2 className="text-white text-4xl font-thin tracking-wide mb-6">
              Quero conhecer um projeto
            </h2>
            <p className="text-white/50 leading-relaxed mb-10">
              Deixe seus dados e nossa equipe entrarÃ¡ em contato para apresentar as melhores opÃ§Ãµes de acordo com seu perfil.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Phone size={14} className="text-[#c9a84c]" /> (47) 3311-2896
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Mail size={14} className="text-[#c9a84c]" /> contato@thomeempreendimentos.com.br
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin size={14} className="text-[#c9a84c]" /> Rua 3122, nÂº 75 - SL 04, Centro, BalneÃ¡rio CamboriÃº-SC
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("nome")}
                placeholder="Seu nome completo"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors"
              />
              {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Seu e-mail"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register("telefone")}
                placeholder="WhatsApp / Telefone"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors"
              />
              {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone.message}</p>}
            </div>
            <div>
              <textarea
                {...register("mensagem")}
                rows={4}
                placeholder="Qual empreendimento te interessa? (opcional)"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#c9a84c] text-black font-semibold text-xs tracking-[0.3em] uppercase py-5 hover:bg-[#dbb85e] transition-colors duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Registrar Interesse"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
