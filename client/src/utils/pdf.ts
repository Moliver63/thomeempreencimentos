const PDF_DATA_URL_PREFIX = "data:application/pdf;base64,";

export function isPdfDataUrl(value?: string | null) {
  return typeof value === "string" && value.trim().toLowerCase().startsWith(PDF_DATA_URL_PREFIX);
}

export function isOpenablePdfUrl(value?: string | null) {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  if (!normalized) return false;
  return /^https?:\/\//i.test(normalized) || /^blob:/i.test(normalized) || isPdfDataUrl(normalized);
}

function dataUrlToPdfBlobUrl(dataUrl: string) {
  const [, base64] = dataUrl.split(",", 2);
  if (!base64) {
    throw new Error("PDF base64 inválido.");
  }

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

export function openPdfResource(url?: string | null) {
  if (!url || typeof window === "undefined") return false;

  const normalized = url.trim();
  if (!normalized) return false;

  try {
    if (isPdfDataUrl(normalized)) {
      const blobUrl = dataUrlToPdfBlobUrl(normalized);
      const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      return Boolean(newWindow);
    }

    const newWindow = window.open(normalized, "_blank", "noopener,noreferrer");
    return Boolean(newWindow);
  } catch {
    return false;
  }
}
