// client/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider }        from "@tanstack/react-query";
import { Toaster }                                 from "react-hot-toast";
import { AuthProvider, useAuth }                   from "./contexts/AuthContext";

// Public
import { Navbar }              from "./components/Navbar";
import { Footer }              from "./components/Footer";
import { HomePage }            from "./pages/HomePage";
import { EmpreendimentosPage } from "./pages/EmpreendimentosPage";
import { ContatoPage }         from "./pages/ContatoPage";

// Auth
import { LoginPage }    from "./pages/auth/LoginPage";
import { RegistroPage } from "./pages/auth/RegistroPage";

// Admin
import { AdminLayout }         from "./components/layout/AdminLayout";
import { DashboardPage }       from "./pages/admin/DashboardPage";
import { ImoveisAdminPage }    from "./pages/admin/ImoveisAdminPage";
import { CorretoresAdminPage } from "./pages/admin/CorretoresAdminPage";
import { LeadsAdminPage }      from "./pages/admin/LeadsAdminPage";

// Corretor
import { CorretorLayout } from "./pages/corretor/CorretorLayout";
import { PortfolioPage }  from "./pages/corretor/PortfolioPage";

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });

// ─── GUARDS ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)             return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/corretor" replace />;
  return children;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicLayout({ children }: { children: JSX.Element }) {
  return <><Navbar />{children}<Footer /></>;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Público ── */}
            <Route path="/"                element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/empreendimentos" element={<PublicLayout><EmpreendimentosPage /></PublicLayout>} />
            <Route path="/contato"         element={<PublicLayout><ContatoPage /></PublicLayout>} />

            {/* ── Auth ── */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />

            {/* ── Admin ── */}
            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index             element={<DashboardPage />} />
              <Route path="imoveis"    element={<ImoveisAdminPage />} />
              <Route path="corretores" element={<CorretoresAdminPage />} />
              <Route path="leads"      element={<LeadsAdminPage />} />
            </Route>

            {/* ── Corretor ── */}
            <Route path="/corretor" element={<RequireAuth><CorretorLayout /></RequireAuth>}>
              <Route index element={<PortfolioPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster position="bottom-right" toastOptions={{
            style: { background: "#1a1a1a", color: "#fff", border: "1px solid #c9a84c" },
          }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
