// client/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { HomePage } from "./pages/HomePage";
import { EmpreendimentosPage } from "./pages/EmpreendimentosPage";
import { ContatoPage } from "./pages/ContatoPage";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                   element={<HomePage />} />
          <Route path="/empreendimentos"    element={<EmpreendimentosPage />} />
          <Route path="/contato"            element={<ContatoPage />} />
        </Routes>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#1a1a1a", color: "#fff", border: "1px solid #c9a84c" },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
