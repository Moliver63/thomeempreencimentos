import axios from "axios";

const BASE = (import.meta as any).env?.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("thome_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface GaleriaImagem {
  id?: number;
  imovel_id?: number;
  url: string;
  alt?: string | null;
  ordem?: number | null;
  capa?: boolean | null;
}

export interface Imovel {
  id: number;
  slug: string;
  titulo: string;
  descricao: string;
  categoria: "lancamento" | "pronto" | "terceiros" | "locacao";
  tipo: "apartamento" | "casa" | "cobertura" | "sala_comercial" | "terreno" | "galpao";
  status: "disponivel" | "reservado" | "vendido" | "locado";
  endereco: string;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  pavimentos: number | null;
  andar?: number | null;
  area_total: number | null;
  area_privativa: number | null;
  valor_venda: number | null;
  valor_locacao: number | null;
  valor_condominio: number | null;
  valor_iptu?: number | null;
  construtora_parceira: string | null;
  contato_parceiro: string | null;
  imagem_capa: string | null;
  galeria?: GaleriaImagem[];
  corretor_id: number | null;
  destaque: boolean;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  imovel_id: number | null;
  corretor_id: number | null;
  mensagem: string | null;
  origem: string;
  status: "novo" | "contatado" | "qualificado" | "convertido" | "perdido";
  created_at: string;
}

export interface Corretor {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "corretor";
  ativo: boolean;
  creci: string | null;
  telefone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const imoveisAPI = {
  listar: () => api.get<{ success: boolean; data: Imovel[] }>("/empreendimentos"),
  destaques: () => api.get<{ success: boolean; data: Imovel[] }>("/empreendimentos/destaques"),
  detalhe: (slug: string) => api.get<{ success: boolean; data: Imovel }>(`/empreendimentos/${slug}`),
  adminTodos: () => api.get<{ success: boolean; data: Imovel[] }>("/empreendimentos/admin/todos"),
  portfolio: () => api.get<{ success: boolean; data: Imovel[] }>("/empreendimentos/corretor/portfolio"),
  criar: (data: Partial<Imovel>) => api.post<{ success: boolean; data: Imovel }>("/empreendimentos", data),
  atualizar: (id: number, data: Partial<Imovel>) => api.put<{ success: boolean; data: Imovel }>(`/empreendimentos/${id}`, data),
  excluir: (id: number) => api.delete(`/empreendimentos/${id}`),
  toggle: (id: number, campo: "publicado" | "destaque") => api.patch(`/empreendimentos/${id}/toggle`, { campo }),
};

export const leadsAPI = {
  criar: (data: { nome: string; email: string; telefone: string; imovel_id?: number; mensagem?: string }) =>
    api.post<{ success: boolean; message: string }>("/leads", data),
  listar: () => api.get<{ success: boolean; data: Lead[] }>("/leads"),
  meus: () => api.get<{ success: boolean; data: Lead[] }>("/leads/meus"),
  atualizarStatus: (id: number, status: Lead["status"]) => api.patch(`/leads/${id}/status`, { status }),
};

export const contatosAPI = {
  enviar: (data: { nome: string; email: string; telefone?: string; assunto: string; mensagem: string }) =>
    api.post<{ success: boolean; message: string }>("/contatos", data),
};

export const usuariosAPI = {
  corretores: () => api.get<{ success: boolean; data: Corretor[] }>("/usuarios/corretores"),
  toggleAtivo: (id: number) => api.patch(`/usuarios/${id}/ativo`),
  mudarRole: (id: number, role: "admin" | "corretor") => api.patch(`/usuarios/${id}/role`, { role }),
  excluir: (id: number) => api.delete(`/usuarios/${id}`),
};

export const authAPI = {
  login: (email: string, senha: string) => api.post("/auth/login", { email, senha }),
  google: (credential: string) => api.post("/auth/google", { credential }),
  registro: (data: any) => api.post("/auth/registro", data),
  me: () => api.get("/auth/me"),
};
