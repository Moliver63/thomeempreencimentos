// client/src/services/api.ts
import axios from "axios";

// Em produção usa VITE_API_URL, em dev usa proxy do Vite (/api → localhost:3001)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// ─── TIPOS ────────────────────────────────────────────────────────────────────
export interface Empreendimento {
  id: number;
  slug: string;
  nome: string;
  tipo: "residencial" | "comercial" | "obra_publica";
  status: "concluido" | "em_andamento" | "lancamento";
  descricao: string;
  endereco: string;
  cidade: string;
  estado: string;
  pavimentos: number | null;
  area_total: number | null;
  ano_entrega: number | null;
  destaque: boolean;
  galeria?: GaleriaItem[];
}

export interface GaleriaItem {
  id: number;
  url: string;
  alt: string | null;
  ordem: number;
  capa: boolean;
}

export interface LeadPayload {
  nome: string;
  email: string;
  telefone: string;
  empreendimento_id?: number;
  mensagem?: string;
}

export interface ContatoPayload {
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
}

export const empreendimentosAPI = {
  listar:      () => api.get<{ success: boolean; data: Empreendimento[] }>("/empreendimentos"),
  destaques:   () => api.get<{ success: boolean; data: Empreendimento[] }>("/empreendimentos/destaques"),
  buscarPorSlug: (slug: string) => api.get<{ success: boolean; data: Empreendimento }>(`/empreendimentos/${slug}`),
};

export const leadsAPI = {
  criar: (payload: LeadPayload) => api.post<{ success: boolean; message: string }>("/leads", payload),
};

export const contatosAPI = {
  enviar: (payload: ContatoPayload) => api.post<{ success: boolean; message: string }>("/contatos", payload),
};
