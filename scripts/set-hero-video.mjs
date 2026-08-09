import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: banners, error: fetchErr } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
if (fetchErr) { console.error("Error leyendo banners:", fetchErr.message); process.exit(1); }

if (!banners || banners.length === 0) {
  console.log("No hay banners en la tabla.");
  process.exit(0);
}

const first = banners[0];
const { error: updateErr } = await supabase
  .from("banners")
  .update({ video_url: "/videos/hero-bg.mp4" })
  .eq("id", first.id);

if (updateErr) { console.error("Error actualizando:", updateErr.message); process.exit(1); }

console.log(`Banner "${first.title}" (id: ${first.id}) actualizado con video_url = /videos/hero-bg.mp4`);
