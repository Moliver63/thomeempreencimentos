// client/src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

export function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname }            = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/",                label: "Início" },
    { href: "/empreendimentos", label: "Empreendimentos" },
    { href: "/contato",         label: "Contato" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_2px_30px_rgba(201,168,76,0.15)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="Thomé Empreendimentos"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                pathname === l.href
                  ? "text-[#c9a84c]"
                  : "text-white/70 hover:text-[#c9a84c]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── CTA Phone ── */}
        <a
          href="tel:+554733112896"
          className="hidden md:flex items-center gap-2 border border-[#c9a84c]/50 text-[#c9a84c] px-5 py-2 text-xs tracking-widest uppercase hover:bg-[#c9a84c] hover:text-black transition-all duration-300"
        >
          <Phone size={13} />
          (47) 3311-2896
        </a>

        {/* ── Mobile Toggle ── */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {open && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#c9a84c]/20">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-4 text-white/80 hover:text-[#c9a84c] hover:bg-white/5 text-sm tracking-widest uppercase border-b border-white/5"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="tel:+554733112896"
            className="flex items-center gap-2 px-6 py-4 text-[#c9a84c] text-sm"
          >
            <Phone size={14} /> (47) 3311-2896
          </a>
        </div>
      )}
    </header>
  );
}
