// client/src/pages/corretor/CorretorLayout.tsx
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth }   from "../../contexts/AuthContext";
import { Building2, MessageSquare, LogOut, ChevronRight } from "lucide-react";

const nav = [
  { href: "/corretor",       icon: Building2,     label: "Portfólio"  },
];

export function CorretorLayout() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="hidden lg:flex flex-col w-60 bg-[#050505] border-r border-[#c9a84c]/10">
        <div className="p-6 border-b border-white/5">
          <img src="/logo_full.png" alt="Thomé" className="h-10 w-auto object-contain" />
          <p className="text-[#c9a84c] text-[9px] tracking-[0.3em] uppercase mt-2">Painel Corretor</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-all ${
                  active ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon size={16} className={active ? "text-[#c9a84c]" : "text-white/30"} />
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto text-[#c9a84c]" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-8 h-8 rounded-full" alt={user.nome} />
              : <div className="w-8 h-8 rounded-full bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] text-xs font-bold">{user?.nome?.[0]}</div>
            }
            <div className="min-w-0">
              <p className="text-white text-sm truncate">{user?.nome}</p>
              <p className="text-white/30 text-[9px] tracking-widest uppercase">Corretor</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-white/40 hover:text-red-400 text-sm rounded hover:bg-red-500/5 transition-colors">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-[#050505] border-b border-white/5 flex items-center px-6 lg:hidden justify-between">
          <img src="/logo_full.png" alt="Thomé" className="h-8 w-auto object-contain" />
          <button onClick={() => { logout(); navigate("/login"); }} className="text-white/40 text-xs uppercase tracking-widest">Sair</button>
        </header>
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
