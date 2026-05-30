// client/src/pages/ContatoPage.tsx
import { useForm }    from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z }          from "zod";
import toast          from "react-hot-toast";
import { contatosAPI } from "../services/api";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";

const schema = z.object({
  nome:     z.string().min(2, "Nome obrigatÃ³rio"),
  email:    z.string().email("E-mail invÃ¡lido"),
  telefone: z.string().optional(),
  assunto:  z.string().min(3, "Informe o assunto"),
  mensagem: z.string().min(10, "Mensagem muito curta"),
});
type Form = z.infer<typeof schema>;

export function ContatoPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Form) => {
    try {
      await contatosAPI.enviar(values);
      toast.success("Mensagem enviada! Responderemos em breve.");
      reset();
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    }
  };

  return (
    <main className="bg-[#0a0a0a] min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">Fale Conosco</p>
        <h1 className="text-white text-5xl font-thin tracking-wide mb-16">Contato</h1>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-white text-2xl font-light mb-8">Estamos aqui para ajudar</h2>
            <p className="text-white/50 leading-relaxed mb-10 text-sm">
              Nossa equipe estÃ¡ pronta para atendÃª-lo e apresentar as melhores soluÃ§Ãµes em empreendimentos imobiliÃ¡rios.
            </p>
            <div className="space-y-6">
              {[
                { Icon: Phone,     text: "(47) 99705-0616",                         href: "tel:+5547997050616" },
                { Icon: Mail,      text: "contato@thomeempreendimentos.com.br",      href: "mailto:contato@thomeempreendimentos.com.br" },
                { Icon: MapPin,    text: "Rua 3122, nÂº 75 - SL 04, Centro, BalneÃ¡rio CamboriÃº-SC", href: undefined },
                { Icon: Instagram, text: "@thomeempreendimentos",                   href: "https://www.instagram.com/thomeempreendimentos" },
              ].map(({ Icon, text, href }) => (
                <div key={text} className="flex gap-4">
                  <div className="w-10 h-10 border border-[#c9a84c]/30 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#c9a84c]" />
                  </div>
                  <div className="flex items-center">
                    {href
                      ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                          className="text-white hover:text-[#c9a84c] transition-colors text-sm">{text}</a>
                      : <span className="text-white/50 text-sm">{text}</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input {...register("nome")} placeholder="Nome"
                  className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors" />
                {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
              </div>
              <input {...register("telefone")} placeholder="Telefone (opcional)"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors" />
            </div>
            <div>
              <input {...register("email")} type="email" placeholder="E-mail"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register("assunto")} placeholder="Assunto"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors" />
              {errors.assunto && <p className="text-red-400 text-xs mt-1">{errors.assunto.message}</p>}
            </div>
            <div>
              <textarea {...register("mensagem")} rows={5} placeholder="Sua mensagem"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/60 transition-colors resize-none" />
              {errors.mensagem && <p className="text-red-400 text-xs mt-1">{errors.mensagem.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#c9a84c] text-black font-semibold text-xs tracking-[0.3em] uppercase py-5 hover:bg-[#dbb85e] transition-colors duration-300 disabled:opacity-50">
              {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
