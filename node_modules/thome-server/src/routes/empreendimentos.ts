// server/src/routes/empreendimentos.ts
import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { empreendimentos, galeria } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const empreendimentosRouter = Router();

// GET /api/empreendimentos - Listar todos
empreendimentosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(empreendimentos)
      .orderBy(desc(empreendimentos.destaque), desc(empreendimentos.ano_entrega));
    res.json({ success: true, data: lista });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao buscar empreendimentos" });
  }
});

// GET /api/empreendimentos/destaques
empreendimentosRouter.get("/destaques", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(empreendimentos)
      .where(eq(empreendimentos.destaque, true))
      .orderBy(desc(empreendimentos.ano_entrega));
    res.json({ success: true, data: lista });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro ao buscar destaques" });
  }
});

// GET /api/empreendimentos/:slug - Detalhe com galeria
empreendimentosRouter.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const [emp] = await db
      .select()
      .from(empreendimentos)
      .where(eq(empreendimentos.slug, slug));

    if (!emp) {
      return res.status(404).json({ success: false, error: "Empreendimento não encontrado" });
    }

    const fotos = await db
      .select()
      .from(galeria)
      .where(eq(galeria.empreendimento_id, emp.id))
      .orderBy(galeria.ordem);

    res.json({ success: true, data: { ...emp, galeria: fotos } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

// POST /api/empreendimentos - Criar (admin)
const criarSchema = z.object({
  slug:        z.string().min(3),
  nome:        z.string().min(3),
  tipo:        z.enum(["residencial", "comercial", "obra_publica"]),
  status:      z.enum(["concluido", "em_andamento", "lancamento"]),
  descricao:   z.string().min(10),
  endereco:    z.string().min(5),
  cidade:      z.string().optional(),
  estado:      z.string().optional(),
  pavimentos:  z.number().optional(),
  area_total:  z.number().optional(),
  ano_entrega: z.number().optional(),
  destaque:    z.boolean().optional(),
});

empreendimentosRouter.post("/", async (req: Request, res: Response) => {
  const parse = criarSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.flatten() });
  }
  try {
    const [novo] = await db.insert(empreendimentos).values(parse.data).returning();
    res.status(201).json({ success: true, data: novo });
  } catch (err: any) {
    if (err.message?.includes("UNIQUE")) {
      return res.status(409).json({ success: false, error: "Slug já existe" });
    }
    res.status(500).json({ success: false, error: "Erro ao criar empreendimento" });
  }
});
