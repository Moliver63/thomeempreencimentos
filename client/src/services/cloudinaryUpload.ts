// client/src/services/cloudinaryUpload.ts
// Upload DIRETO para Cloudinary â€” sem passar pelo servidor, sem assinatura

const CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dzty82u60";
const PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "thome_unsigned";

async function doUpload(file: File, resourceType: "image" | "raw"): Promise<string> {
  const fd = new FormData();
  fd.append("file",          file);
  fd.append("upload_preset", PRESET);
  fd.append("folder",        resourceType === "raw" ? "thome-docs" : "thome-imoveis");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`;
  const res  = await fetch(url, { method: "POST", body: fd });
  const data = await res.json() as any;

  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (!data.secure_url) throw new Error("URL nao retornada");
  return data.secure_url;
}

export const uploadImage = (file: File)  => doUpload(file, "image");
export const uploadPdf   = (file: File)  => doUpload(file, "raw");

export async function uploadImages(files: File[]): Promise<{ url: string; name: string; ok: boolean; error?: string }[]> {
  return Promise.all(files.map(async file => {
    try {
      const url = await doUpload(file, "image");
      return { url, name: file.name, ok: true };
    } catch (e: any) {
      return { url: "", name: file.name, ok: false, error: e.message };
    }
  }));
}
