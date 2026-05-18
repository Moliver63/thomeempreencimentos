// server/src/routes/empreendimentos.ts
import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { imoveis } from "../db/schema";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export const empreendimentosRouter = Router();

// GET /api/empreendimentos — lista públicos
empreendimentosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.publicado, true))
      .orderBy(desc(imoveis.destaque), desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao buscar imóveis" });
  }
});

// GET /api/empreendimentos/destaques
empreendimentosRouter.get("/destaques", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .where(and(eq(imoveis.publicado, true), eq(imoveis.destaque, true)))
      .orderBy(desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar destaques" });
  }
});

// GET /api/empreendimentos/admin/todos — admin
empreendimentosRouter.get("/admin/todos", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .orderBy(desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar imóveis" });
  }
});

// GET /api/empreendimentos/corretor/portfolio
empreendimentosRouter.get("/corretor/portfolio", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.publicado, true))
      .orderBy(desc(imoveis.destaque), desc(imoveis.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar portfólio" });
  }
});

// GET /api/empreendimentos/:slug
empreendimentosRouter.get("/:slug", async (req: Request, res: Response) => {
  try {
    const [item] = await db
      .select()
      .from(imoveis)
      .where(and(eq(imoveis.slug, req.params.slug), eq(imoveis.publicado, true)));
    if (!item) return res.status(404).json({ success: false, error: "Não encontrado" });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

function toSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now();
}

// POST /api/empreendimentos
empreendimentosRouter.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.titulo || !body.descricao || !body.categoria || !body.tipo || !body.endereco) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
    }
    const slug = toSlug(body.titulo);
    const [novo] = await db.insert(imoveis).values({
      slug,
      titulo:               body.titulo,
      descricao:            body.descricao,
      categoria:            body.categoria,
      tipo:                 body.tipo,
      status:               body.status               || "disponivel",
      endereco:             body.endereco,
      bairro:               body.bairro               || null,
      cidade:               body.cidade               || "Balneário Camboriú",
      estado:               body.estado               || "SC",
      cep:                  body.cep                  || null,
      area_total:           body.area_total           ? Number(body.area_total)   : null,
      area_privativa:       body.area_privativa       ? Number(body.area_privativa): null,
      quartos:              body.quartos              ? Number(body.quartos)      : null,
      suites:               body.suites               ? Number(body.suites)       : null,
      banheiros:            body.banheiros            ? Number(body.banheiros)    : null,
      vagas:                body.vagas                ? Number(body.vagas)        : null,
      pavimentos:           body.pavimentos           ? Number(body.pavimentos)   : null,
      valor_venda:          body.valor_venda          ? Number(body.valor_venda)  : null,
      valor_locacao:        body.valor_locacao        ? Number(body.valor_locacao): null,
      valor_condominio:     body.valor_condominio     ? Number(body.valor_condominio): null,
      valor_iptu:           body.valor_iptu           ? Number(body.valor_iptu)   : null,
      construtora_parceira: body.construtora_parceira || null,
      contato_parceiro:     body.contato_parceiro     || null,
      destaque:             body.destaque             ?? false,
      publicado:            body.publicado            ?? false,
      corretor_id:          body.corretor_id          ? Number(body.corretor_id)  : null,
    }).returning();
    res.status(201).json({ success: true, data: novo });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao criar imóvel" });
  }
});

// PUT /api/empreendimentos/:id
empreendimentosRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id   = parseInt(req.params.id);
    const body = req.body;
    const [atualizado] = await db
      .update(imoveis)
      .set({
        ...(body.titulo               && { titulo: body.titulo }),
        ...(body.descricao            && { descricao: body.descricao }),
        ...(body.categoria            && { categoria: body.categoria }),
        ...(body.tipo                 && { tipo: body.tipo }),
        ...(body.status               && { status: body.status }),
        ...(body.endereco             && { endereco: body.endereco }),
        ...(body.bairro  !== undefined && { bairro: body.bairro }),
        ...(body.cidade               && { cidade: body.cidade }),
        ...(body.estado               && { estado: body.estado }),
        ...(body.quartos  !== undefined && { quartos: body.quartos ? Number(body.quartos) : null }),
        ...(body.suites   !== undefined && { suites:  body.suites  ? Number(body.suites)  : null }),
        ...(body.banheiros!== undefined && { banheiros: body.banheiros ? Number(body.banheiros): null }),
        ...(body.vagas    !== undefined && { vagas:   body.vagas   ? Number(body.vagas)   : null }),
        ...(body.valor_venda    !== undefined && { valor_venda:    body.valor_venda    ? Number(body.valor_venda)   : null }),
        ...(body.valor_locacao  !== undefined && { valor_locacao:  body.valor_locacao  ? Number(body.valor_locacao) : null }),
        ...(body.area_privativa !== undefined && { area_privativa: body.area_privativa ? Number(body.area_privativa): null }),
        ...(body.area_total     !== undefined && { area_total:     body.area_total     ? Number(body.area_total)    : null }),
        ...(body.construtora_parceira !== undefined && { construtora_parceira: body.construtora_parceira }),
        ...(body.contato_parceiro     !== undefined && { contato_parceiro:     body.contato_parceiro }),
        ...(body.destaque  !== undefined && { destaque:  body.destaque  }),
        ...(body.publicado !== undefined && { publicado: body.publicado }),
        updated_at: new Date(),
      })
      .where(eq(imoveis.id, id))
      .returning();
    res.json({ success: true, data: atualizado });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});

// DELETE /api/empreendimentos/:id
empreendimentosRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(imoveis).where(eq(imoveis.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao excluir" });
  }
});

// PATCH /api/empreendimentos/:id/toggle
empreendimentosRouter.patch("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const id    = parseInt(req.params.id);
    const campo = req.body.campo as "publicado" | "destaque";
    if (!["publicado", "destaque"].includes(campo)) {
      return res.status(400).json({ success: false, error: "Campo inválido" });
    }
    const [atual] = await db.select().from(imoveis).where(eq(imoveis.id, id));
    if (!atual) return res.status(404).json({ success: false, error: "Não encontrado" });
    const [atualizado] = await db
      .update(imoveis)
      .set({ [campo]: !atual[campo], updated_at: new Date() })
      .where(eq(imoveis.id, id))
      .returning();
    res.json({ success: true, data: atualizado });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});
