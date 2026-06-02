import { Router, Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { galeria_imoveis, imoveis } from "../db/schema";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const empreendimentosRouter = Router();

type ImovelRow = typeof imoveis.$inferSelect;
type GaleriaRow = typeof galeria_imoveis.$inferSelect;
type GaleriaInput = {
  url: string;
  alt?: string | null;
  ordem?: number | null;
  capa?: boolean | null;
};

async function attachGallery(items: ImovelRow[]) {
  const enriched = await Promise.all(
    items.map(async (item) => {
      const galeria = await db
        .select()
        .from(galeria_imoveis)
        .where(eq(galeria_imoveis.imovel_id, item.id))
        .orderBy(galeria_imoveis.ordem, galeria_imoveis.id);

      return {
        ...item,
        galeria,
      };
    })
  );

  return enriched;
}

async function attachGalleryToOne(item: ImovelRow | undefined) {
  if (!item) return undefined;
  const [enriched] = await attachGallery([item]);
  return enriched;
}

const DEFAULT_CITY = "BalneÃ¡rio CamboriÃº";
const DEFAULT_STATE = "SC";

function normalizeText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeOptionalText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeCep(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 8);
  if (!digits) return null;
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function parseNullableNumber(value: unknown, label: string, integer = false): { value: number | null; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${label} invÃ¡lido.` };
  }

  if (parsed < 0) {
    return { value: null, error: `${label} nÃ£o pode ser negativo.` };
  }

  if (integer && !Number.isInteger(parsed)) {
    return { value: null, error: `${label} deve ser um nÃºmero inteiro.` };
  }

  return { value: parsed };
}

function normalizeGalleryInput(input: unknown): GaleriaInput[] {
  if (!Array.isArray(input)) return [];

  const fotos = input
    .map<GaleriaInput | null>((entry, index) => {
      if (typeof entry === "string") {
        const url = entry.trim();
        return url ? { url, alt: null, ordem: index, capa: index === 0 } : null;
      }

      if (entry && typeof entry === "object" && "url" in entry && typeof (entry as any).url === "string") {
        const url = (entry as any).url.trim();
        if (!url) return null;

        return {
          url,
          alt: typeof (entry as any).alt === "string" ? (entry as any).alt.trim() : null,
          ordem: typeof (entry as any).ordem === "number" ? (entry as any).ordem : index,
          capa: Boolean((entry as any).capa),
        };
      }

      return null;
    })
    .filter((item): item is GaleriaInput => Boolean(item))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const capaIndex = fotos.findIndex((foto) => foto.capa);

  return fotos.map((foto, index) => ({
    ...foto,
    ordem: index,
    capa: capaIndex >= 0 ? index === capaIndex : index === 0,
  }));
}

async function persistGallery(imovelId: number, titulo: string, fotos: GaleriaInput[]) {
  await db.delete(galeria_imoveis).where(eq(galeria_imoveis.imovel_id, imovelId));

  if (fotos.length === 0) return;

  await db.insert(galeria_imoveis).values(
    fotos.map((foto, index) => ({
      imovel_id: imovelId,
      url: foto.url,
      alt: foto.alt?.trim() || `${titulo} - Foto ${index + 1}`,
      ordem: index,
      capa: Boolean(foto.capa),
    }))
  );
}

empreendimentosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.publicado, true))
      .orderBy(desc(imoveis.destaque), desc(imoveis.created_at));

    const data = await attachGallery(lista);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar imÃ³veis" });
  }
});

empreendimentosRouter.get("/destaques", async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .where(and(eq(imoveis.publicado, true), eq(imoveis.destaque, true)))
      .orderBy(desc(imoveis.created_at));

    const data = await attachGallery(lista);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar destaques" });
  }
});

empreendimentosRouter.get("/admin/todos", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const lista = await db.select().from(imoveis).orderBy(desc(imoveis.created_at));
    const data = await attachGallery(lista);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar imÃ³veis" });
  }
});

empreendimentosRouter.get("/corretor/portfolio", requireAuth, async (_req: Request, res: Response) => {
  try {
    const lista = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.publicado, true))
      .orderBy(desc(imoveis.destaque), desc(imoveis.created_at));

    const data = await attachGallery(lista);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao buscar portfÃ³lio" });
  }
});


empreendimentosRouter.get("/admin/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [item] = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.id, parseInt(req.params.id)));
    if (!item) return res.status(404).json({ success: false, error: "Nao encontrado" });
    const data = await attachGalleryToOne(item);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});
empreendimentosRouter.get("/:slug", async (req: Request, res: Response) => {
  try {
    const [item] = await db
      .select()
      .from(imoveis)
      .where(and(eq(imoveis.slug, req.params.slug), eq(imoveis.publicado, true)));

    if (!item) {
      return res.status(404).json({ success: false, error: "NÃ£o encontrado" });
    }

    const data = await attachGalleryToOne(item);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

function toSlug(titulo: string): string {
  return (
    titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now()
  );
}

empreendimentosRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const b = req.body;
    const titulo = normalizeText(b.titulo);
    const descricao = normalizeText(b.descricao);
    const endereco = normalizeText(b.endereco);
    const cidade = normalizeText(b.cidade) || DEFAULT_CITY;
    const estado = (normalizeText(b.estado) || DEFAULT_STATE).toUpperCase();
    const cep = normalizeCep(b.cep);

    if (!titulo) return res.status(400).json({ success: false, error: "TÃ­tulo Ã© obrigatÃ³rio" });
    if (titulo.length < 4) return res.status(400).json({ success: false, error: "TÃ­tulo deve ter pelo menos 4 caracteres" });
    if (!descricao) return res.status(400).json({ success: false, error: "DescriÃ§Ã£o Ã© obrigatÃ³ria" });
    if (descricao.length < 20) return res.status(400).json({ success: false, error: "DescriÃ§Ã£o deve ter pelo menos 20 caracteres" });
    if (!b.categoria || !b.tipo) return res.status(400).json({ success: false, error: "Categoria e tipo sÃ£o obrigatÃ³rios" });
    if (!endereco) return res.status(400).json({ success: false, error: "EndereÃ§o Ã© obrigatÃ³rio" });
    if (!cidade) return res.status(400).json({ success: false, error: "Cidade Ã© obrigatÃ³ria" });
    if (!estado || estado.length !== 2) return res.status(400).json({ success: false, error: "Estado deve ter 2 letras" });
    if (cep && !/^\d{5}-\d{3}$/.test(cep)) return res.status(400).json({ success: false, error: "CEP invÃ¡lido" });

    const areaTotal = parseNullableNumber(b.area_total, "Ãrea total");
    const areaPrivativa = parseNullableNumber(b.area_privativa, "Ãrea privativa");
    const quartos = parseNullableNumber(b.quartos, "Quartos", true);
    const suites = parseNullableNumber(b.suites, "SuÃ­tes", true);
    const banheiros = parseNullableNumber(b.banheiros, "Banheiros", true);
    const vagas = parseNullableNumber(b.vagas, "Vagas", true);
    const pavimentos = parseNullableNumber(b.pavimentos, "Pavimentos", true);
    const andar = parseNullableNumber(b.andar, "Andar", true);
    const valorVenda = parseNullableNumber(b.valor_venda, "Valor de venda");
    const valorLocacao = parseNullableNumber(b.valor_locacao, "Valor de locaÃ§Ã£o");
    const valorCondominio = parseNullableNumber(b.valor_condominio, "Valor de condomÃ­nio");
    const valorIptu = parseNullableNumber(b.valor_iptu, "Valor de IPTU");

    const numericResults = [areaTotal, areaPrivativa, quartos, suites, banheiros, vagas, pavimentos, andar, valorVenda, valorLocacao, valorCondominio, valorIptu];
    const numericError = numericResults.find((result) => result.error)?.error;
    if (numericError) {
      return res.status(400).json({ success: false, error: numericError });
    }

    const fotos = normalizeGalleryInput(b.galeria);
    const imagemCapa = normalizeOptionalText(b.imagem_capa) || fotos.find((foto) => foto.capa)?.url || fotos[0]?.url || null;
    const categoria = b.categoria;

    const [novo] = await db
      .insert(imoveis)
      .values({
        slug: toSlug(titulo),
        titulo,
        descricao,
        categoria,
        tipo: b.tipo,
        status: b.status || "disponivel",
        endereco,
        bairro: normalizeOptionalText(b.bairro),
        cidade,
        estado,
        cep,
        area_total: areaTotal.value,
        area_privativa: areaPrivativa.value,
        quartos: quartos.value,
        suites: suites.value,
        banheiros: banheiros.value,
        vagas: vagas.value,
        pavimentos: pavimentos.value,
        andar: andar.value,
        valor_venda: valorVenda.value,
        valor_locacao: valorLocacao.value,
        valor_condominio: valorCondominio.value,
        valor_iptu: valorIptu.value,
        construtora_parceira: categoria === "terceiros" ? normalizeOptionalText(b.construtora_parceira) : null,
        contato_parceiro: categoria === "terceiros" ? normalizeOptionalText(b.contato_parceiro) : null,
        imagem_capa: imagemCapa,
        tabela_precos_url: normalizeOptionalText(b.tabela_precos_url),
        destaque: b.destaque ?? false,
        publicado: b.publicado ?? false,
        corretor_id: b.corretor_id ? Number(b.corretor_id) : null,
      })
      .returning();

    await persistGallery(novo.id, novo.titulo, fotos);

    const data = await attachGalleryToOne(novo);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao criar imÃ³vel" });
  }
});

empreendimentosRouter.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: "ID invÃ¡lido" });
    }

    const b = req.body;
    const [existente] = await db.select().from(imoveis).where(eq(imoveis.id, id));

    if (!existente) {
      return res.status(404).json({ success: false, error: "ImÃ³vel nÃ£o encontrado" });
    }

    const u: any = { updated_at: new Date() };
    const fotos = b.galeria !== undefined ? normalizeGalleryInput(b.galeria) : undefined;
    const imagemCapa = b.imagem_capa !== undefined
      ? normalizeOptionalText(b.imagem_capa) || fotos?.find((foto) => foto.capa)?.url || fotos?.[0]?.url || null
      : undefined;

    if (b.titulo !== undefined) {
      const titulo = normalizeText(b.titulo);
      if (!titulo) return res.status(400).json({ success: false, error: "TÃ­tulo Ã© obrigatÃ³rio" });
      if (titulo.length < 4) return res.status(400).json({ success: false, error: "TÃ­tulo deve ter pelo menos 4 caracteres" });
      u.titulo = titulo;
      if (titulo !== existente.titulo) u.slug = toSlug(titulo);
    }

    if (b.descricao !== undefined) {
      const descricao = normalizeText(b.descricao);
      if (!descricao) return res.status(400).json({ success: false, error: "DescriÃ§Ã£o Ã© obrigatÃ³ria" });
      if (descricao.length < 20) return res.status(400).json({ success: false, error: "DescriÃ§Ã£o deve ter pelo menos 20 caracteres" });
      u.descricao = descricao;
    }

    if (b.categoria !== undefined) u.categoria = b.categoria;
    if (b.tipo !== undefined) u.tipo = b.tipo;
    if (b.status !== undefined) u.status = b.status;

    if (b.endereco !== undefined) {
      const endereco = normalizeText(b.endereco);
      if (!endereco) return res.status(400).json({ success: false, error: "EndereÃ§o Ã© obrigatÃ³rio" });
      u.endereco = endereco;
    }

    if (b.bairro !== undefined) u.bairro = normalizeOptionalText(b.bairro);

    if (b.cidade !== undefined) {
      const cidade = normalizeText(b.cidade);
      if (!cidade) return res.status(400).json({ success: false, error: "Cidade Ã© obrigatÃ³ria" });
      u.cidade = cidade;
    }

    if (b.estado !== undefined) {
      const estado = normalizeText(b.estado).toUpperCase();
      if (!estado || estado.length !== 2) return res.status(400).json({ success: false, error: "Estado deve ter 2 letras" });
      u.estado = estado;
    }

    if (b.cep !== undefined) {
      const cep = normalizeCep(b.cep);
      if (normalizeText(b.cep) && (!cep || !/^\d{5}-\d{3}$/.test(cep))) {
        return res.status(400).json({ success: false, error: "CEP invÃ¡lido" });
      }
      u.cep = cep;
    }

    const numericFields = [
      ["quartos", "Quartos", true],
      ["suites", "SuÃ­tes", true],
      ["banheiros", "Banheiros", true],
      ["vagas", "Vagas", true],
      ["pavimentos", "Pavimentos", true],
      ["andar", "Andar", true],
      ["valor_venda", "Valor de venda", false],
      ["valor_locacao", "Valor de locaÃ§Ã£o", false],
      ["valor_condominio", "Valor de condomÃ­nio", false],
      ["valor_iptu", "Valor de IPTU", false],
      ["area_privativa", "Ãrea privativa", false],
      ["area_total", "Ãrea total", false],
    ] as const;

    for (const [field, label, integer] of numericFields) {
      if (b[field] === undefined) continue;
      const result = parseNullableNumber(b[field], label, integer);
      if (result.error) return res.status(400).json({ success: false, error: result.error });
      u[field] = result.value;
    }

    const categoriaFinal = b.categoria !== undefined ? b.categoria : existente.categoria;
    if (categoriaFinal === "terceiros") {
      if (b.construtora_parceira !== undefined) u.construtora_parceira = normalizeOptionalText(b.construtora_parceira);
      if (b.contato_parceiro !== undefined) u.contato_parceiro = normalizeOptionalText(b.contato_parceiro);
    } else {
      u.construtora_parceira = null;
      u.contato_parceiro = null;
    }

    if (imagemCapa !== undefined) u.imagem_capa = imagemCapa;
    if (b.tabela_precos_url !== undefined) u.tabela_precos_url = normalizeOptionalText(b.tabela_precos_url);
    if (b.corretor_id !== undefined) u.corretor_id = b.corretor_id ? Number(b.corretor_id) : null;
    if (b.destaque !== undefined) u.destaque = Boolean(b.destaque);
    if (b.publicado !== undefined) u.publicado = Boolean(b.publicado);

    const [atualizado] = await db.update(imoveis).set(u).where(eq(imoveis.id, id)).returning();

    if (!atualizado) {
      return res.status(404).json({ success: false, error: "ImÃ³vel nÃ£o encontrado" });
    }

    if (fotos !== undefined) {
      await persistGallery(id, atualizado.titulo, fotos);
    }

    const data = await attachGalleryToOne(atualizado);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});

empreendimentosRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.delete(imoveis).where(eq(imoveis.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao excluir" });
  }
});

empreendimentosRouter.patch("/:id/toggle", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const campo = req.body.campo as "publicado" | "destaque";

    if (!["publicado", "destaque"].includes(campo)) {
      return res.status(400).json({ success: false, error: "Campo invÃ¡lido" });
    }

    const [atual] = await db.select().from(imoveis).where(eq(imoveis.id, id));
    if (!atual) {
      return res.status(404).json({ success: false, error: "NÃ£o encontrado" });
    }

    const [atualizado] = await db
      .update(imoveis)
      .set({ [campo]: !atual[campo], updated_at: new Date() })
      .where(eq(imoveis.id, id))
      .returning();

    const data = await attachGalleryToOne(atualizado);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: "Erro ao atualizar" });
  }
});
