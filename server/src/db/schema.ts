// server/src/db/schema.ts
// Banco de dados: SQLite via Drizzle ORM
// Tabelas: empreendimentos, leads, contatos, galeria, depoimentos

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── EMPREENDIMENTOS ───────────────────────────────────────────────────────────
export const empreendimentos = sqliteTable("empreendimentos", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  slug:        text("slug").notNull().unique(),
  nome:        text("nome").notNull(),
  tipo:        text("tipo", { enum: ["residencial", "comercial", "obra_publica"] }).notNull(),
  status:      text("status", { enum: ["concluido", "em_andamento", "lancamento"] }).notNull(),
  descricao:   text("descricao").notNull(),
  endereco:    text("endereco").notNull(),
  cidade:      text("cidade").notNull().default("Balneário Camboriú"),
  estado:      text("estado").notNull().default("SC"),
  pavimentos:  integer("pavimentos"),
  area_total:  real("area_total"),
  ano_entrega: integer("ano_entrega"),
  destaque:    integer("destaque", { mode: "boolean" }).default(false),
  created_at:  text("created_at").default(sql`(datetime('now'))`),
  updated_at:  text("updated_at").default(sql`(datetime('now'))`),
});

// ─── GALERIA DE IMAGENS ────────────────────────────────────────────────────────
export const galeria = sqliteTable("galeria", {
  id:                  integer("id").primaryKey({ autoIncrement: true }),
  empreendimento_id:   integer("empreendimento_id").references(() => empreendimentos.id, { onDelete: "cascade" }),
  url:                 text("url").notNull(),
  alt:                 text("alt"),
  ordem:               integer("ordem").default(0),
  capa:                integer("capa", { mode: "boolean" }).default(false),
  created_at:          text("created_at").default(sql`(datetime('now'))`),
});

// ─── LEADS / FORMULÁRIO DE INTERESSE ──────────────────────────────────────────
export const leads = sqliteTable("leads", {
  id:                  integer("id").primaryKey({ autoIncrement: true }),
  nome:                text("nome").notNull(),
  email:               text("email").notNull(),
  telefone:            text("telefone").notNull(),
  empreendimento_id:   integer("empreendimento_id").references(() => empreendimentos.id),
  mensagem:            text("mensagem"),
  origem:              text("origem").default("site"), // site, instagram, indicacao
  status:              text("status", { enum: ["novo", "contatado", "qualificado", "convertido", "perdido"] }).default("novo"),
  created_at:          text("created_at").default(sql`(datetime('now'))`),
});

// ─── CONTATO GERAL ─────────────────────────────────────────────────────────────
export const contatos = sqliteTable("contatos", {
  id:         integer("id").primaryKey({ autoIncrement: true }),
  nome:       text("nome").notNull(),
  email:      text("email").notNull(),
  telefone:   text("telefone"),
  assunto:    text("assunto").notNull(),
  mensagem:   text("mensagem").notNull(),
  lido:       integer("lido", { mode: "boolean" }).default(false),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

// ─── DEPOIMENTOS ──────────────────────────────────────────────────────────────
export const depoimentos = sqliteTable("depoimentos", {
  id:                  integer("id").primaryKey({ autoIncrement: true }),
  nome:                text("nome").notNull(),
  cargo:               text("cargo"),
  empreendimento_id:   integer("empreendimento_id").references(() => empreendimentos.id),
  texto:               text("texto").notNull(),
  nota:                integer("nota").default(5), // 1-5
  ativo:               integer("ativo", { mode: "boolean" }).default(true),
  created_at:          text("created_at").default(sql`(datetime('now'))`),
});

// ─── TIPOS INFERIDOS ──────────────────────────────────────────────────────────
export type Empreendimento   = typeof empreendimentos.$inferSelect;
export type NovoEmpreendimento = typeof empreendimentos.$inferInsert;
export type Galeria          = typeof galeria.$inferSelect;
export type Lead             = typeof leads.$inferSelect;
export type NovoLead         = typeof leads.$inferInsert;
export type Contato          = typeof contatos.$inferSelect;
export type NovoContato      = typeof contatos.$inferInsert;
export type Depoimento       = typeof depoimentos.$inferSelect;
