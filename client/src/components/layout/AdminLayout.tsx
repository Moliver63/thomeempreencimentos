// client/src/components/layout/AdminLayout.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LayoutDashboard, Building2, Users, MessageSquare, LogOut, Menu, ChevronRight, Bell, X } from "lucide-react";

const nav = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard"  },
  { href: "/admin/imoveis",    icon: Building2,        label: "Imóveis"    },
  { href: "/admin/corretores", icon: Users,            label: "Corretores" },
  { href: "/admin/leads",      icon: MessageSquare,    label: "Leads"      },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64
        bg-[#050505] border-r border-[#c9a84c]/10
        flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-white/5">
          <img src="/logo_full.png" alt="Thomé" className="h-12 w-auto object-contain" />
          <p className="text-[#c9a84c] text-[9px] tracking-[0.3em] uppercase mt-2">Painel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-200 group ${
                  active
                    ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon size={16} className={active ? "text-[#c9a84c]" : "text-white/30 group-hover:text-white/60"} />
                <span className="tracking-wide">{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto text-[#c9a84c]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-8 h-8 rounded-full" alt={user.nome} />
              : <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] text-xs font-bold">
                  {user?.nome?.[0]}
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{user?.nome}</p>
              <p className="text-[#c9a84c] text-[9px] tracking-widest uppercase">Admin</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-white/40 hover:text-red-400 text-sm transition-colors rounded hover:bg-red-500/5">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#050505] border-b border-white/5 flex items-center justify-between px-6">
          <button onClick={() => setOpen(!open)} className="lg:hidden text-white/60 hover:text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-white/30 hover:text-white/60 text-xs tracking-widest uppercase">
              Ver site
            </Link>
            <Bell size={18} className="text-white/30 hover:text-white/60 cursor-pointer" />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
