import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname }            = useLocation();
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/",                label: "Inicio"          },
    { href: "/empreendimentos", label: "Empreendimentos" },
    { href: "/contato",         label: "Contato"         },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const dashboardHref = user?.role === "admin" ? "/admin" : "/corretor";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_2px_30px_rgba(201,168,76,0.15)]" : "bg-transparent"
    }`}>
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src="/logo_full.png" alt="Thome Empreendimentos" className="h-24 w-auto object-contain" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} to={l.href}
              className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                pathname === l.href ? "text-[#c9a84c]" : "text-white/70 hover:text-[#c9a84c]"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Lado direito */}
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+554733112896"
            className="flex items-center gap-2 border border-[#c9a84c]/50 text-[#c9a84c] px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#c9a84c] hover:text-black transition-all duration-300">
            <Phone size={13} /> (47) 3311-2896
          </a>

          {user ? (
            /* Usuario logado */
            <div className="flex items-center gap-2">
              <Link to={dashboardHref}
                className="flex items-center gap-2 bg-[#c9a84c] text-black px-4 py-2 text-xs tracking-widest uppercase font-bold hover:bg-[#dbb85e] transition-colors">
                <LayoutDashboard size={13} />
                {user.role === "admin" ? "Admin" : "Painel"}
              </Link>
              <button onClick={handleLogout}
                className="text-white/40 hover:text-white/70 text-xs tracking-widest uppercase px-3 py-2 transition-colors">
                Sair
              </button>
            </div>
          ) : (
            /* Nao logado */
            <Link to="/login"
              className="flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/40 text-[#c9a84c] px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#c9a84c] hover:text-black transition-all duration-300">
              <LogIn size={13} /> Entrar
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#c9a84c]/20">
          {links.map((l) => (
            <Link key={l.href} to={l.href} onClick={() => setOpen(false)}
              className="block px-6 py-4 text-white/80 hover:text-[#c9a84c] hover:bg-white/5 text-sm tracking-widest uppercase border-b border-white/5">
              {l.label}
            </Link>
          ))}

          <a href="tel:+554733112896"
            className="flex items-center gap-2 px-6 py-4 text-[#c9a84c] text-sm border-b border-white/5">
            <Phone size={14} /> (47) 3311-2896
          </a>

          {user ? (
            <>
              <Link to={dashboardHref} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-6 py-4 text-[#c9a84c] text-sm tracking-widest uppercase">
                <LayoutDashboard size={14} />
                {user.role === "admin" ? "Painel Admin" : "Meu Painel"}
              </Link>
              <button onClick={handleLogout}
                className="w-full text-left px-6 py-4 text-white/40 text-sm tracking-widest uppercase">
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-6 py-4 text-[#c9a84c] text-sm tracking-widest uppercase">
              <LogIn size={14} /> Entrar / Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
