// client/src/components/Footer.tsx
import { Link } from "react-router-dom";
import { Phone, MapPin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* ── Brand ── */}
        <div>
          <Link to="/" className="inline-block mb-6">
            <img
              src="/logo.jpg"
              alt="Thomé Empreendimentos"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="text-white/30 text-sm leading-relaxed max-w-xs">
            Há mais de 15 anos edificando sonhos e criando o melhor conceito em morar bem.
          </p>
        </div>

        {/* ── Links ── */}
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-6">Navegação</p>
          <div className="space-y-3">
            {[
              { to: "/",                label: "Início" },
              { to: "/empreendimentos", label: "Empreendimentos" },
              { to: "/contato",         label: "Contato" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block text-white/40 text-sm hover:text-[#c9a84c] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Contact ── */}
        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-6">Contato</p>
          <div className="space-y-3 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#c9a84c]/60" /> (47) 3311-2896
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-[#c9a84c]/60 mt-0.5 shrink-0" />
              Rua 3122, nº 75 - SL 04<br />Centro, Balneário Camboriú-SC
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/thomeempreendimentos"
                target="_blank"
                rel="noreferrer"
                className="text-white/30 hover:text-[#c9a84c] transition-colors flex items-center gap-1"
              >
                <Instagram size={15} />
                <span className="text-xs">@thomeempreendimentos</span>
              </a>
            </div>
            <a
              href="https://www.thomeempreendimentos.com.br"
              target="_blank"
              rel="noreferrer"
              className="block text-white/30 hover:text-[#c9a84c] transition-colors text-xs"
            >
              thomeempreendimentos.com.br
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center">
        <p className="text-white/20 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} Thomé Empreendimentos — Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
