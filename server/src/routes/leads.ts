// server/src/routes/leads.ts
import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { leads, contatos } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const leadsRouter = Router();
export const contatosRouter = Router();

// ─── LEADS ────────────────────────────────────────────────────────────────────

const leadSchema = z.object({
  nome:                z.string().min(2, "Nome obrigatório"),
  email:               z.string().email("E-mail inválido"),
  telefone:            z.string().min(10, "Telefone inválido"),
  empreendimento_id:   z.number().optional(),
  mensagem:            z.string().optional(),
  origem:              z.string().optional(),
});

// POST /api/leads - Novo lead (formulário de interesse)
leadsRouter.post("/", async (req: Request, res: Response) => {
  const parse = leadSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.flatten().fieldErrors });
  }
  try {
    const [novo] = await db.insert(leads).values(parse.data).returning();
    res.status(201).json({ success: true, data: novo, message: "Interesse registrado! Nossa equipe entrará em contato." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao registrar interesse" });
  }
});

// GET /api/leads - Listar (admin)
leadsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(leads).orderBy(desc(leads.created_at));
    res.json({ success: true, data: lista });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao buscar leads" });
  }
});

// PATCH /api/leads/:id/status - Atualizar status
leadsRouter.patch("/:id/status", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const validos = ["novo", "contatado", "qualificado", "convertido", "perdido"] as const;
  if (!validos.includes(status)) {
    return res.status(400).json({ success: false, error: "Status inválido" });
  }
  try {
    const [atualizado] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    res.json({ success: true, data: atualizado });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});

// ─── CONTATOS ─────────────────────────────────────────────────────────────────

const contatoSchema = z.object({
  nome:      z.string().min(2),
  email:     z.string().email(),
  telefone:  z.string().optional(),
  assunto:   z.string().min(3),
  mensagem:  z.string().min(10),
});

// POST /api/contatos
contatosRouter.post("/", async (req: Request, res: Response) => {
  const parse = contatoSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.flatten().fieldErrors });
  }
  try {
    const [novo] = await db.insert(contatos).values(parse.data).returning();
    res.status(201).json({ success: true, data: novo, message: "Mensagem enviada! Responderemos em breve." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao enviar mensagem" });
  }
});

// GET /api/contatos
contatosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(contatos).orderBy(desc(contatos.created_at));
    res.json({ success: true, data: lista });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao buscar contatos" });
  }
});
