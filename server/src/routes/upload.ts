// server/src/routes/upload.ts
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/auth";

export const uploadRouter = Router();

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;

async function uploadToCloudinary(file: string, folder: string, resourceType = "image") {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary nao configurado");
  }
  const crypto    = require("crypto");
  const timestamp = Math.round(Date.now() / 1000);
  const paramsStr = `folder=${folder}&resource_type=${resourceType}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha256").update(paramsStr + API_SECRET).digest("hex");

  const formData = new URLSearchParams();
  formData.append("file",          file);
  formData.append("api_key",       API_KEY);
  formData.append("timestamp",     String(timestamp));
  formData.append("signature",     signature);
  formData.append("folder",        folder);
  formData.append("resource_type", resourceType);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json() as any;
  if (!response.ok) throw new Error(data.error?.message || "Erro no upload");
  return { url: data.secure_url, public_id: data.public_id };
}

uploadRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { image, folder = "thome-imoveis", resource_type = "image" } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Arquivo nao fornecido" });
    const result = await uploadToCloudinary(image, folder, resource_type);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

uploadRouter.post("/multiple", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { images, folder = "thome-imoveis" } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: "Nenhuma imagem fornecida" });
    }
    const results = await Promise.all(
      images.map(async (image: string) => {
        try {
          const r = await uploadToCloudinary(image, folder, "image");
          return { success: true, ...r };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      })
    );
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
