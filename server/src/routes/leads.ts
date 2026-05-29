import { Router, Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { contatos, leads } from "../db/schema";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const leadsRouter = Router();
export const contatosRouter = Router();

const STATUS_VALIDOS = ["novo", "contatado", "qualificado", "convertido", "perdido"] as const;

leadsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, imovel_id, mensagem, origem } = req.body;

    if (!nome || !email || !telefone) {
      return res.status(400).json({ success: false, error: "Nome, e-mail e telefone são obrigatórios" });
    }

    const payload = {
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      telefone: String(telefone).trim(),
      imovel_id: imovel_id ? Number(imovel_id) : null,
      corretor_id: null,
      mensagem: mensagem ? String(mensagem).trim() : null,
      origem: origem ? String(origem).trim() : "site",
    };

    const [novo] = await db.insert(leads).values(payload).returning();

    res.status(201).json({
      success: true,
      data: novo,
      message: "Interesse registrado! Entraremos em contato.",
    });
  } catch (err: any) {
    console.error("Erro ao registrar lead:", err?.message || err);
    res.status(500).json({ success: false, error: "Erro ao registrar lead" });
  }
});

leadsRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(leads).orderBy(desc(leads.created_at));
    res.json({ success: true, data: lista });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar leads" });
  }
});

leadsRouter.get("/meus", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Não autenticado" });
    }

    const lista = await db
      .select()
      .from(leads)
      .where(eq(leads.corretor_id, userId))
      .orderBy(desc(leads.created_at));

    res.json({ success: true, data: lista });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar leads" });
  }
});

leadsRouter.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const status = req.body.status;

    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ success: false, error: "Status inválido" });
    }

    const [atualizado] = await db
      .update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();

    res.json({ success: true, data: atualizado });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});

contatosRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, assunto, mensagem } = req.body;

    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
    }

    const [novo] = await db
      .insert(contatos)
      .values({
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        telefone: telefone ? String(telefone).trim() : null,
        assunto: String(assunto).trim(),
        mensagem: String(mensagem).trim(),
        lido: false,
      })
      .returning();

    res.status(201).json({ success: true, data: novo, message: "Mensagem enviada! Responderemos em breve." });
  } catch (err) {
    console.error("Erro ao enviar contato:", err);
    res.status(500).json({ success: false, error: "Erro ao enviar mensagem" });
  }
});

contatosRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(contatos).orderBy(desc(contatos.created_at));
    res.json({ success: true, data: lista });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar contatos" });
  }
});
