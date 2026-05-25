// server/src/routes/leads.ts
import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { leads, contatos, usuarios } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const leadsRouter   = Router();
export const contatosRouter = Router();

// ─── LEADS ────────────────────────────────────────────────────────────────────

// POST /api/leads — público
leadsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, imovel_id, mensagem, origem } = req.body;
    if (!nome || !email || !telefone) {
      return res.status(400).json({ success: false, error: "Nome, e-mail e telefone são obrigatórios" });
    }
    const [novo] = await db.insert(leads).values({
      nome:       String(nome),
      email:      String(email),
      telefone:   String(telefone),
      imovel_id:  imovel_id   ? Number(imovel_id)   : null,
      corretor_id: null,
      mensagem:   mensagem    ? String(mensagem)     : null,
      origem:     origem      ? String(origem)       : "site",
      status:     "novo",
    }).returning();
    res.status(201).json({ success: true, data: novo, message: "Interesse registrado! Entraremos em contato." });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao registrar lead" });
  }
});

// GET /api/leads — admin
leadsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(leads).orderBy(desc(leads.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar leads" });
  }
});

// GET /api/leads/meus — corretor
leadsRouter.get("/meus", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Não autenticado" });
    const lista = await db.select().from(leads)
      .where(eq(leads.corretor_id, userId))
      .orderBy(desc(leads.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar leads" });
  }
});

// PATCH /api/leads/:id/status
leadsRouter.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const id     = parseInt(req.params.id);
    const status = req.body.status;
    const validos = ["novo", "contatado", "qualificado", "convertido", "perdido"];
    if (!validos.includes(status)) {
      return res.status(400).json({ success: false, error: "Status inválido" });
    }
    const [atualizado] = await db
      .update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();
    res.json({ success: true, data: atualizado });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});

// ─── CONTATOS ─────────────────────────────────────────────────────────────────

// POST /api/contatos — público
contatosRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, assunto, mensagem } = req.body;
    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
    }
    const [novo] = await db.insert(contatos).values({
      nome:     String(nome),
      email:    String(email),
      telefone: telefone ? String(telefone) : null,
      assunto:  String(assunto),
      mensagem: String(mensagem),
      lido:     false,
    }).returning();
    res.status(201).json({ success: true, data: novo, message: "Mensagem enviada! Responderemos em breve." });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao enviar mensagem" });
  }
});

// GET /api/contatos — admin
contatosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(contatos).orderBy(desc(contatos.created_at));
    res.json({ success: true, data: lista });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar contatos" });
  }
});
