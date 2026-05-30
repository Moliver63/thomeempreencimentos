// server/src/routes/upload.ts
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/auth";

export const uploadRouter = Router();

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

function createCloudinarySignature(folder: string, timestamp: number) {
  const crypto = require("crypto");
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  return crypto
    .createHash("sha256")
    .update(paramsToSign + API_SECRET)
    .digest("hex");
}

// POST /api/upload — recebe base64 e envia ao Cloudinary
uploadRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Cloudinary nao configurado. Adicione CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET nas variaveis de ambiente.",
      });
    }

    const { image, folder = "thome-imoveis" } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: "Imagem nao fornecida" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = createCloudinarySignature(folder, timestamp);

    const formData = new URLSearchParams();
    formData.append("file", image);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      return res.status(400).json({ success: false, error: data.error?.message || "Erro no upload" });
    }

    res.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: "Erro interno no upload" });
  }
});

// POST /api/upload/multiple — múltiplas imagens
uploadRouter.post("/multiple", requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return res.status(500).json({ success: false, error: "Cloudinary nao configurado" });
    }

    const { images, folder = "thome-imoveis" } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: "Nenhuma imagem fornecida" });
    }

    const timestamp = Math.round(Date.now() / 1000);

    const results = await Promise.all(
      images.map(async (image: string) => {
        const signature = createCloudinarySignature(folder, timestamp);

        const formData = new URLSearchParams();
        formData.append("file", image);
        formData.append("api_key", API_KEY!);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        const data = await response.json() as any;
        return response.ok ? { success: true, url: data.secure_url, public_id: data.public_id } : { success: false, error: data.error?.message };
      })
    );

    res.json({ success: true, data: results });

  } catch (err: any) {
    console.error("Upload multiple error:", err);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

// POST /api/upload/file — upload de PDF/documento para tabela de preços
uploadRouter.post("/file", requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return res.status(500).json({ success: false, error: "Cloudinary nao configurado" });
    }

    const { file, folder = "thome-documentos", filename } = req.body;

    if (!file || typeof file !== "string") {
      return res.status(400).json({ success: false, error: "Arquivo nao fornecido" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = createCloudinarySignature(folder, timestamp);

    const formData = new URLSearchParams();
    formData.append("file", file);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);
    if (filename) formData.append("public_id", String(filename).replace(/\.[^.]+$/, ""));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      { method: "POST", body: formData }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      return res.status(400).json({ success: false, error: data.error?.message || "Erro no upload do arquivo" });
    }

    res.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
      bytes: data.bytes,
      format: data.format,
      original_filename: data.original_filename,
    });

  } catch (err: any) {
    console.error("Upload file error:", err);
    res.status(500).json({ success: false, error: "Erro interno no upload do arquivo" });
  }
});
