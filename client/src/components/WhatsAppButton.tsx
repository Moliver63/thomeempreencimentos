import { MessageCircle } from "lucide-react";

const PHONE = "554733112896";
const MESSAGE = encodeURIComponent("Olá! Quero saber mais sobre os imóveis da Thomé Empreendimentos.");

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${MESSAGE}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-[1.02]"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
