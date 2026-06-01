// server/src/routes/upload.ts
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/auth";

export const uploadRouter = Router();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const API_KEY = process.env.CLOUDINARY_API_KEY?.trim();
const API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim();

type CloudinaryResourceType = "image" | "raw";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  original_filename?: string;
};

function getCloudinaryAuthHeader() {
  if (!API_KEY || !API_SECRET) return null;
  const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return `Basic ${credentials}`;
}

async function uploadToCloudinary({
  file,
  folder,
  resourceType,
  publicId,
}: {
  file: string;
  folder: string;
  resourceType: CloudinaryResourceType;
  publicId?: string;
}) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error(
      "Cloudinary nao configurado. Adicione CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET nas variaveis de ambiente."
    );
  }

  const authHeader = getCloudinaryAuthHeader();
  if (!authHeader) {
    throw new Error("Credenciais do Cloudinary invalidas.");
  }

  const formData = new URLSearchParams();
  formData.append("file", file);
  formData.append("folder", folder.trim() || "thome-imoveis");

  if (publicId) {
    formData.append("public_id", publicId.replace(/\.[^.]+$/, ""));
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = (await response.json()) as CloudinaryUploadResult & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(data.error?.message || "Erro no upload para o Cloudinary");
  }

  return data;
}

// POST /api/upload — recebe base64 e envia ao Cloudinary
uploadRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { image, folder = "thome-imoveis" } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ success: false, error: "Imagem nao fornecida" });
    }

    const data = await uploadToCloudinary({
      file: image,
      folder,
      resourceType: "image",
    });

    res.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    });
  } catch (err: any) {
    console.error("Upload error:", err?.message || err);
    const status = String(err?.message || "").includes("Cloudinary nao configurado") ? 500 : 400;
    res.status(status).json({ success: false, error: err?.message || "Erro interno no upload" });
  }
});

// POST /api/upload/multiple — múltiplas imagens
uploadRouter.post("/multiple", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { images, folder = "thome-imoveis" } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: "Nenhuma imagem fornecida" });
    }

    const results = await Promise.all(
      images.map(async (image: string) => {
        try {
          const data = await uploadToCloudinary({
            file: image,
            folder,
            resourceType: "image",
          });

          return {
            success: true,
            url: data.secure_url,
            public_id: data.public_id,
          };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || "Erro no upload da imagem",
          };
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (err: any) {
    console.error("Upload multiple error:", err?.message || err);
    const status = String(err?.message || "").includes("Cloudinary nao configurado") ? 500 : 400;
    res.status(status).json({ success: false, error: err?.message || "Erro interno" });
  }
});

// POST /api/upload/file — upload de PDF/documento para tabela de preços
uploadRouter.post("/file", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { file, folder = "thome-documentos", filename } = req.body;

    if (!file || typeof file !== "string") {
      return res.status(400).json({ success: false, error: "Arquivo nao fornecido" });
    }

    const data = await uploadToCloudinary({
      file,
      folder,
      resourceType: "raw",
      publicId: filename,
    });

    res.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
      bytes: data.bytes,
      format: data.format,
      original_filename: data.original_filename,
    });
  } catch (err: any) {
    console.error("Upload file error:", err?.message || err);
    const status = String(err?.message || "").includes("Cloudinary nao configurado") ? 500 : 400;
    res.status(status).json({ success: false, error: err?.message || "Erro interno no upload do arquivo" });
  }
});
