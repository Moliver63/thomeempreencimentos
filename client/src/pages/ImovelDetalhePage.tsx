import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Car,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Ruler,
} from "lucide-react";
import { imoveisAPI, leadsAPI, type Imovel } from "../services/api";
import { PropertyImage } from "../components/PropertyImage";
import { PropertyCarousel } from "../components/PropertyCarousel";
import { openPdfResource } from "../utils/pdf";

const PHONE = "5547997050616";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  mensagem: z.string().optional(),
});

type LeadForm = z.infer<typeof leadSchema>;

const CAT_LABEL: Record<string, string> = {
  lancamento: "Lançamento",
  pronto: "Pronto",
  terceiros: "Terceiros",
  locacao: "Locação",
};

const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  locado: "Locado",
};

function formatCurrency(value?: number | null, suffix = "") {
  if (!value) return null;
  return `R$ ${Number(value).toLocaleString("pt-BR")}${suffix}`;
}

export function ImovelDetalhePage() {
  const { slug = "" } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["imovel-detalhe", slug],
    queryFn: () => imoveisAPI.detalhe(slug).then((r) => r.data.data as Imovel),
    enabled: Boolean(slug),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  });

  const destaqueFinanceiro = useMemo(() => {
    if (!data) return null;
    return formatCurrency(data.valor_venda) || formatCurrency(data.valor_locacao, "/mês");
  }, [data]);

  const onSubmit = async (values: LeadForm) => {
    if (!data) return;

    try {
      await leadsAPI.criar({
        ...values,
        imovel_id: data.id,
        mensagem: values.mensagem || `Interesse no imóvel ${data.titulo}`,
      });
      toast.success("Interesse enviado com sucesso!");
      reset();
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 pb-24 pt-32">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-6 w-40 rounded bg-white/5" />
          <div className="h-[420px] rounded-3xl bg-white/5" />
          <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
            <div className="h-80 rounded-3xl bg-white/5" />
            <div className="h-80 rounded-3xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 pb-24 pt-32 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#111] p-10 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#c9a84c]">Imóvel</p>
          <h1 className="mb-4 text-3xl font-thin">Imóvel não encontrado</h1>
          <p className="mb-8 text-white/45">O imóvel solicitado não está disponível ou foi removido da vitrine pública.</p>
          <Link to="/empreendimentos" className="inline-flex items-center gap-2 bg-[#c9a84c] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black">
            <ArrowLeft size={14} /> Voltar para empreendimentos
          </Link>
        </div>
      </main>
    );
  }

  const enderecoCompleto = [data.endereco, data.bairro, `${data.cidade} - ${data.estado}`].filter(Boolean).join(", ");
  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no imóvel ${data.titulo}. Pode me passar mais informações?`);
  const fotosGaleria = (data.galeria || []).filter((foto) => Boolean(foto?.url));

  const specs = [
    data.quartos ? { icon: BedDouble, label: "Quartos", value: String(data.quartos) } : null,
    data.banheiros ? { icon: Bath, label: "Banheiros", value: String(data.banheiros) } : null,
    data.vagas ? { icon: Car, label: "Vagas", value: String(data.vagas) } : null,
    data.area_privativa ? { icon: Ruler, label: "Área privativa", value: `${data.area_privativa} m²` } : null,
    data.area_total ? { icon: Building2, label: "Área total", value: `${data.area_total} m²` } : null,
  ].filter(Boolean) as Array<{ icon: typeof BedDouble; label: string; value: string }>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-24 pt-28 text-white">
      <section className="mx-auto max-w-7xl px-6">
        <Link to="/empreendimentos" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#c9a84c] hover:opacity-80">
          <ArrowLeft size={14} /> Voltar para empreendimentos
        </Link>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#c9a84c]">{CAT_LABEL[data.categoria]}</p>
            <h1 className="max-w-3xl text-4xl font-thin leading-tight md:text-5xl">{data.titulo}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/50">
              <span className="rounded-full border border-white/10 px-3 py-1">{STATUS_LABEL[data.status]}</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-[#c9a84c]" /> {enderecoCompleto}</span>
            </div>
          </div>

          {destaqueFinanceiro && (
            <div className="rounded-2xl border border-[#c9a84c]/20 bg-[#c9a84c]/5 px-6 py-4">
              <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-[#c9a84c]/80">Valor</p>
              <p className="flex items-center gap-2 text-2xl font-semibold text-[#c9a84c]"><DollarSign size={18} /> {destaqueFinanceiro}</p>
            </div>
          )}
        </div>

        {fotosGaleria.length > 0 ? (
          <PropertyCarousel
            images={fotosGaleria}
            fallbackSrc={data.imagem_capa}
            title={data.titulo}
          />
        ) : (
          <PropertyImage
            src={data.imagem_capa}
            alt={data.titulo}
            className="h-[320px] rounded-[28px] border border-white/10 md:h-[520px]"
            fallbackLogoClassName="h-28 w-auto opacity-15"
          />
        )}
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-[#111] p-8">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Sobre o imóvel</p>
            <p className="text-base leading-8 text-white/75">{data.descricao}</p>
          </div>

          {fotosGaleria.length > 1 && (
            <div className="rounded-3xl border border-white/10 bg-[#111] p-8">
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Galeria</p>
              <h2 className="mb-2 text-2xl font-thin">Carrossel de fotos</h2>
              <p className="text-sm leading-7 text-white/45">
                Este imóvel possui {fotosGaleria.length} fotos cadastradas. Use as setas ou as miniaturas para navegar pela galeria.
              </p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-[#111] p-8">
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Características</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div key={spec.label} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <div className="mb-3 inline-flex rounded-full bg-[#c9a84c]/10 p-3 text-[#c9a84c]">
                        <Icon size={18} />
                      </div>
                      <p className="text-xs uppercase tracking-widest text-white/35">{spec.label}</p>
                      <p className="mt-1 text-lg text-white">{spec.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-[#111] p-8">
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Ficha técnica</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Categoria", CAT_LABEL[data.categoria]],
                ["Tipo", data.tipo.replaceAll("_", " ")],
                ["Cidade", data.cidade],
                ["Estado", data.estado],
                ["CEP", data.cep || "Não informado"],
                ["Condomínio", formatCurrency(data.valor_condominio) || "Sob consulta"],
                ["IPTU", formatCurrency(data.valor_iptu) || "Sob consulta"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-white/5 py-3 text-sm">
                  <span className="text-white/35">{label}</span>
                  <span className="text-right text-white/80">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-white/10 bg-[#111] p-7">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Atendimento</p>
            <h2 className="mb-3 text-2xl font-thin">Fale com a Thomé</h2>
            <p className="mb-6 text-sm leading-7 text-white/45">
              Receba condições, disponibilidade e orientações para visita diretamente com a equipe comercial.
            </p>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${PHONE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
              >
                <MessageCircle size={16} /> Falar no WhatsApp
              </a>
              <a href={`https://wa.me/${PHONE}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/75 hover:border-[#c9a84c]/30 hover:text-[#c9a84c]">
                <MessageCircle size={16} /> (47) 99705-0616
              </a>
              <a href="mailto:contato@thomeempreendimentos.com.br" className="flex w-full items-center justify-center gap-2 rounded-full border border-[#c9a84c]/30 px-5 py-3 text-sm text-[#c9a84c]">
                <Mail size={16} /> contato@thomeempreendimentos.com.br
              </a>
              {data.tabela_precos_url && (
                <button
                  type="button"
                  onClick={() => {
                    if (!openPdfResource(data.tabela_precos_url)) {
                      toast.error("Nao foi possivel abrir a tabela de precos.");
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/5 px-5 py-3 text-sm text-[#c9a84c] hover:bg-[#c9a84c]/10"
                >
                  <FileText size={16} /> Ver tabela de preços
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-white/10 bg-[#111] p-7">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Tenho interesse</p>
            <h2 className="mb-6 text-2xl font-thin">Solicitar atendimento</h2>
            <div className="space-y-4">
              <div>
                <input {...register("nome")} placeholder="Seu nome" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#c9a84c]/50 focus:outline-none" />
                {errors.nome && <p className="mt-1 text-xs text-red-400">{errors.nome.message}</p>}
              </div>
              <div>
                <input {...register("email")} type="email" placeholder="Seu e-mail" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#c9a84c]/50 focus:outline-none" />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div>
                <input {...register("telefone")} placeholder="WhatsApp / telefone" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#c9a84c]/50 focus:outline-none" />
                {errors.telefone && <p className="mt-1 text-xs text-red-400">{errors.telefone.message}</p>}
              </div>
              <textarea {...register("mensagem")} rows={4} placeholder="Mensagem (opcional)" className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-[#c9a84c]/50 focus:outline-none" />
              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold uppercase tracking-widest text-black disabled:opacity-50">
                {isSubmitting ? "Enviando..." : "Registrar interesse"}
              </button>
            </div>
          </form>
        </aside>
      </section>
    </main>
  );
}
