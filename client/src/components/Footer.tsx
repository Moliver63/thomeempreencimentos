// client/src/components/Footer.tsx
import { Link } from "react-router-dom";
import { Phone, MapPin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        <div>
          <Link to="/" className="inline-block mb-6">
            <img src="/logo_full.png" alt="Thomé Empreendimentos" className="h-20 w-auto object-contain" />
          </Link>
          <p className="text-white/30 text-sm leading-relaxed max-w-xs">
            Há mais de 15 anos edificando sonhos em Balneário Camboriú, SC.
          </p>
        </div>

        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-6">Navegação</p>
          <div className="space-y-3">
            {[
              { to: "/",                label: "Início" },
              { to: "/empreendimentos", label: "Empreendimentos" },
              { to: "/contato",         label: "Contato" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="block text-white/40 text-sm hover:text-[#c9a84c] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[#c9a84c] text-xs tracking-[0.3em] uppercase mb-6">Contato</p>
          <div className="space-y-3 text-white/40 text-sm">
            <div className="flex items-center gap-2"><Phone size={12} className="text-[#c9a84c]/60" /> (47) 3311-2896</div>
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-[#c9a84c]/60 mt-0.5 shrink-0" />
              Rua 3122, nº 75 - SL 04<br />Centro, Balneário Camboriú-SC
            </div>
            <a href="https://www.instagram.com/thomeempreendimentos" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-[#c9a84c] transition-colors">
              <Instagram size={14} /> @thomeempreendimentos
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
