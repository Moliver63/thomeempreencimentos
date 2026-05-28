// server/src/routes/empreendimentos.ts
import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { imoveis } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const empreendimentosRouter = Router();

empreendimentosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(imoveis)
      .where(eq(imoveis.publicado, true))
      .orderBy(desc(imoveis.destaque), desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar imoveis" });
  }
});

empreendimentosRouter.get("/destaques", async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(imoveis)
      .where(and(eq(imoveis.publicado, true), eq(imoveis.destaque, true)))
      .orderBy(desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar destaques" });
  }
});

empreendimentosRouter.get("/admin/todos", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(imoveis).orderBy(desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar imoveis" });
  }
});

empreendimentosRouter.get("/corretor/portfolio", requireAuth, async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(imoveis)
      .where(eq(imoveis.publicado, true))
      .orderBy(desc(imoveis.destaque), desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar portfolio" });
  }
});

empreendimentosRouter.get("/:slug", async (req: Request, res: Response) => {
  try {
    const [item] = await db.select().from(imoveis)
      .where(and(eq(imoveis.slug, req.params.slug), eq(imoveis.publicado, true)));
    if (!item) return res.status(404).json({ success: false, error: "Nao encontrado" });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

function toSlug(titulo: string): string {
  return titulo.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now();
}

empreendimentosRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const b = req.body;
    if (!b.titulo || !b.descricao || !b.categoria || !b.tipo || !b.endereco) {
      return res.status(400).json({ success: false, error: "Campos obrigatorios faltando" });
    }
    const [novo] = await db.insert(imoveis).values({
      slug: toSlug(b.titulo), titulo: String(b.titulo), descricao: String(b.descricao),
      categoria: b.categoria, tipo: b.tipo,
      status: b.status || "disponivel", endereco: String(b.endereco),
      bairro: b.bairro || null, cidade: b.cidade || "Balneario Camboriu",
      estado: b.estado || "SC", cep: b.cep || null,
      area_total:       b.area_total       ? Number(b.area_total)       : null,
      area_privativa:   b.area_privativa   ? Number(b.area_privativa)   : null,
      quartos:          b.quartos          ? Number(b.quartos)          : null,
      suites:           b.suites           ? Number(b.suites)           : null,
      banheiros:        b.banheiros        ? Number(b.banheiros)        : null,
      vagas:            b.vagas            ? Number(b.vagas)            : null,
      pavimentos:       b.pavimentos       ? Number(b.pavimentos)       : null,
      valor_venda:      b.valor_venda      ? Number(b.valor_venda)      : null,
      valor_locacao:    b.valor_locacao    ? Number(b.valor_locacao)    : null,
      valor_condominio: b.valor_condominio ? Number(b.valor_condominio) : null,
      valor_iptu:       b.valor_iptu       ? Number(b.valor_iptu)       : null,
      construtora_parceira: b.construtora_parceira || null,
      contato_parceiro:     b.contato_parceiro     || null,
      destaque:  b.destaque  ?? false, publicado: b.publicado ?? false,
      corretor_id: b.corretor_id ? Number(b.corretor_id) : null,
    }).returning();
    res.status(201).json({ success: true, data: novo });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao criar imovel" });
  }
});

empreendimentosRouter.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const b  = req.body;
    const u: any = { updated_at: new Date() };
    if (b.titulo)               u.titulo               = String(b.titulo);
    if (b.descricao)            u.descricao            = String(b.descricao);
    if (b.categoria)            u.categoria            = b.categoria;
    if (b.tipo)                 u.tipo                 = b.tipo;
    if (b.status)               u.status               = b.status;
    if (b.endereco)             u.endereco             = String(b.endereco);
    if (b.bairro !== undefined)  u.bairro              = b.bairro;
    if (b.cidade)               u.cidade               = String(b.cidade);
    if (b.estado)               u.estado               = String(b.estado);
    if (b.quartos !== undefined)  u.quartos            = b.quartos ? Number(b.quartos) : null;
    if (b.suites  !== undefined)  u.suites             = b.suites  ? Number(b.suites)  : null;
    if (b.banheiros !== undefined) u.banheiros         = b.banheiros ? Number(b.banheiros) : null;
    if (b.vagas !== undefined)    u.vagas              = b.vagas ? Number(b.vagas) : null;
    if (b.valor_venda    !== undefined) u.valor_venda    = b.valor_venda    ? Number(b.valor_venda)    : null;
    if (b.valor_locacao  !== undefined) u.valor_locacao  = b.valor_locacao  ? Number(b.valor_locacao)  : null;
    if (b.area_privativa !== undefined) u.area_privativa = b.area_privativa ? Number(b.area_privativa) : null;
    if (b.area_total     !== undefined) u.area_total     = b.area_total     ? Number(b.area_total)     : null;
    if (b.construtora_parceira !== undefined) u.construtora_parceira = b.construtora_parceira;
    if (b.contato_parceiro     !== undefined) u.contato_parceiro     = b.contato_parceiro;
    if (b.destaque  !== undefined) u.destaque  = Boolean(b.destaque);
    if (b.publicado !== undefined) u.publicado = Boolean(b.publicado);
    const [atualizado] = await db.update(imoveis).set(u).where(eq(imoveis.id, id)).returning();
    res.json({ success: true, data: atualizado });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});

empreendimentosRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.delete(imoveis).where(eq(imoveis.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao excluir" });
  }
});

empreendimentosRouter.patch("/:id/toggle", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const campo = req.body.campo as "publicado" | "destaque";
    if (!["publicado", "destaque"].includes(campo)) {
      return res.status(400).json({ success: false, error: "Campo invalido" });
    }
    const [atual] = await db.select().from(imoveis).where(eq(imoveis.id, id));
    if (!atual) return res.status(404).json({ success: false, error: "Nao encontrado" });
    const [atualizado] = await db.update(imoveis)
      .set({ [campo]: !atual[campo], updated_at: new Date() })
      .where(eq(imoveis.id, id)).returning();
    res.json({ success: true, data: atualizado });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});
