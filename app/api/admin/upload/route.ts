import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const IMAGE_BUCKET = "site-images";
const VIDEO_BUCKET = "site-videos";

const VIDEO_EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

// Sube una imagen o video (ícono de paquete, foto de producto, portada,
// video de fondo del hero) a Supabase Storage y devuelve su URL pública.
// Reemplaza el guardado anterior como base64 dentro de las tablas — eso
// hinchaba el payload del catálogo hasta pasar el límite de tamaño de
// request de Vercel (~4.5MB) apenas se acumulaban unos pocos íconos.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const bucket = isVideo ? VIDEO_BUCKET : IMAGE_BUCKET;
  const ext = isVideo
    ? VIDEO_EXT_BY_TYPE[file.type] ?? "mp4"
    : file.type === "image/png"
    ? "png"
    : file.type === "image/webp"
    ? "webp"
    : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
      // Sin esto, Supabase Storage sirve estos archivos con
      // cache-control: no-cache — cada visita a la web vuelve a descargar
      // la imagen entera desde Supabase en vez de usar la copia que ya
      // tiene el navegador, multiplicando el egress sin necesidad. Como
      // cada archivo vive en una ruta con UUID aleatorio que nunca se
      // reescribe (upsert:false), es seguro cachearlo por un año.
      cacheControl: "31536000",
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
