// server/src/routes/galeria.ts
import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { galeria_imoveis } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const galeriaRouter = Router();

// GET /api/galeria/:imovel_id
galeriaRouter.get("/:imovel_id", async (req: Request, res: Response) => {
  try {
    const imovel_id = parseInt(req.params.imovel_id);
    const fotos = await db
      .select()
      .from(galeria_imoveis)
      .where(eq(galeria_imoveis.imovel_id, imovel_id))
      .orderBy(asc(galeria_imoveis.ordem));
    res.json({ success: true, data: fotos });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao buscar galeria" });
  }
});

// POST /api/galeria/:imovel_id — salva multiplas fotos
galeriaRouter.post("/:imovel_id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const imovel_id = parseInt(req.params.imovel_id);
    const { fotos } = req.body; // array de URLs

    if (!Array.isArray(fotos) || fotos.length === 0) {
      return res.status(400).json({ success: false, error: "Nenhuma foto fornecida" });
    }

    // Remove fotos antigas
    await db.delete(galeria_imoveis).where(eq(galeria_imoveis.imovel_id, imovel_id));

    // Insere novas
    const values = fotos
      .filter((url: string) => url && url.startsWith("http"))
      .map((url: string, i: number) => ({
        imovel_id,
        url,
        alt:   null,
        ordem: i,
        capa:  i === 0,
      }));

    if (values.length > 0) {
      await db.insert(galeria_imoveis).values(values);
    }

    res.json({ success: true, count: values.length });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao salvar galeria" });
  }
});

// DELETE /api/galeria/:imovel_id — limpa galeria
galeriaRouter.delete("/:imovel_id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.delete(galeria_imoveis).where(eq(galeria_imoveis.imovel_id, parseInt(req.params.imovel_id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao deletar galeria" });
  }
});
