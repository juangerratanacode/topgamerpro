"use client";

import { adminFetch } from "./adminFetch";

// Las imágenes que se suben desde el admin (portadas, íconos de paquete,
// comprobantes) se guardan como dataURL en localStorage mientras no
// conectemos Supabase. localStorage tiene un límite chico (~5-10MB total en
// el navegador), así que subir una foto de cámara/celular sin comprimir
// puede llenarlo de una sola vez (QuotaExceededError). Esta función
// redimensiona y comprime la imagen en el navegador antes de guardarla.
// Revisa 1 de cada 97 píxeles buscando alpha < 255 — alcanza para detectar
// transparencia real sin tener que escanear la imagen entera (lento en
// fotos grandes). El 97 es a propósito un número raro (no múltiplo de
// anchos/altos comunes) para no pisar siempre la misma columna de píxeles.
function hasRealTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4 * 97) {
    if (data[i] < 255) return true;
  }
  return false;
}

export function fileToCompressedDataUrl(
  file: File,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.82 }: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(1, maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // si por lo que sea no hay canvas disponible, cae en el original
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Antes esto decidía PNG vs JPEG solo mirando el tipo de archivo
        // ORIGINAL — una captura de pantalla de un comprobante de pago o
        // una foto de banner guardada como PNG (muy común, sobre todo
        // capturas de apps bancarias en Android) se quedaba casi sin
        // comprimir (1-3MB+) aunque no tuviera ni un píxel transparente.
        // Con pocos pedidos eso igual alcanzó para pasarse el límite de
        // egress del plan gratis de Supabase. Ahora se revisa si la
        // imagen tiene transparencia DE VERDAD — si no la tiene, se
        // comprime como JPEG sin importar el formato original.
        const isPng = file.type === "image/png" && hasRealTransparency(ctx, width, height);
        resolve(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const contentType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: contentType });
}

// Comprime la imagen igual que fileToCompressedDataUrl, pero en vez de
// devolver un dataURL gigante para guardar en la fila del producto/banner
// (lo que hinchaba el payload de "Guardar cambios" hasta pasar el límite
// de tamaño de request de Vercel), la sube a Supabase Storage y devuelve
// solo la URL pública — igual de liviano sin importar cuántas imágenes ya
// tenga el catálogo.
export async function fileToUploadedUrl(
  file: File,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  const dataUrl = await fileToCompressedDataUrl(file, opts);
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const form = new FormData();
  form.append("file", blob, `upload.${ext}`);

  const res = await adminFetch("/api/admin/upload", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `No se pudo subir la imagen (error ${res.status}).`);
  }
  const data = await res.json();
  return data.url as string;
}

// Sube un video tal cual (sin comprimir con canvas — los videos no se
// procesan en el navegador) a Supabase Storage y devuelve la URL pública.
// Se usa para el video de fondo del hero.
export async function fileToUploadedVideoUrl(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await adminFetch("/api/admin/upload", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `No se pudo subir el video (error ${res.status}).`);
  }
  const data = await res.json();
  return data.url as string;
}

// Guarda en localStorage sin tumbar la app si se llena — devuelve true/false
// para que quien llama pueda avisarle al usuario.
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.error("localStorage lleno o bloqueado:", err);
    return false;
  }
}
