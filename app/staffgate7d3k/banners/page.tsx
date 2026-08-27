"use client";

import Image from "next/image";
import { useBanners, type Banner } from "@/lib/bannersStore";
import { fileToUploadedUrl, fileToUploadedVideoUrl } from "@/lib/image";
import SaveBar from "@/components/SaveBar";

export default function BannersPage() {
  const { banners, hydrated, saving, saveError, save, add, update, remove, moveUp, moveDown } = useBanners();

  if (!hydrated) {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Portadas del slider</h1>
      <p className="text-sm text-brand-textMuted mb-8">
        Estas son las imágenes que rotan en el carrusel de inicio (como el banner de "Robux al
        mejor precio"). Sube la imagen, escribe el título/subtítulo y el botón que quieres que
        vea el cliente — se actualiza en el sitio al instante. El orden aquí es el orden en el
        que aparecen en el slider.
      </p>

      {saveError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4">
          {saveError}
        </div>
      )}

      <div className="space-y-5">
        {banners.map((b, i) => (
          <BannerCard
            key={b.id}
            banner={b}
            index={i}
            total={banners.length}
            onUpdate={(patch) => update(b.id, patch)}
            onRemove={() => remove(b.id)}
            onMoveUp={() => moveUp(b.id)}
            onMoveDown={() => moveDown(b.id)}
          />
        ))}

        {banners.length === 0 && (
          <p className="text-sm text-brand-textMuted bg-brand-surface border border-brand-border rounded-2xl p-5">
            Todavía no hay portadas. Agrega la primera abajo.
          </p>
        )}
      </div>

      <button
        onClick={() =>
          add({
            imageUrl: "/hero/hero-visual.png",
            title: "Nueva portada",
            subtitle: "",
            ctaLabel: "Ver catálogo",
            ctaHref: "/#catalogo",
          })
        }
        className="mt-6 w-full border-2 border-dashed border-brand-border hover:border-brand-primary text-brand-textMuted hover:text-white rounded-2xl py-4 font-semibold text-sm transition-colors"
      >
        + Agregar portada
      </button>

      <SaveBar onSave={save} saving={saving} error={saveError} />
    </div>
  );
}

function BannerCard({
  banner,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  banner: Banner;
  index: number;
  total: number;
  onUpdate: (patch: Partial<Omit<Banner, "id">>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
      <div className="flex items-start gap-4 mb-4">
        <label className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden border border-brand-border cursor-pointer group bg-brand-surfaceLight">
          <Image src={banner.imageUrl} alt="" fill sizes="128px" className="object-cover" />
          <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
            Cambiar
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              // Las portadas son anchas (banners de header), no necesitan más
              // de ~1920px — comprimir evita llenar el localStorage.
              try {
                const url = await fileToUploadedUrl(file, {
                  maxWidth: 1920,
                  maxHeight: 960,
                  quality: 0.8,
                });
                onUpdate({ imageUrl: url });
              } catch (err) {
                alert(err instanceof Error ? err.message : "No se pudo subir la imagen.");
              }
            }}
          />
        </label>

        <div className="flex-1 grid sm:grid-cols-2 gap-3">
          <Field label="Título" value={banner.title} onChange={(v) => onUpdate({ title: v })} />
          <Field
            label="Subtítulo"
            value={banner.subtitle}
            onChange={(v) => onUpdate({ subtitle: v })}
          />
          <Field
            label="Texto del botón"
            value={banner.ctaLabel}
            onChange={(v) => onUpdate({ ctaLabel: v })}
          />
          <Field
            label="Link del botón"
            value={banner.ctaHref}
            onChange={(v) => onUpdate({ ctaHref: v })}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-brand-textMuted mb-1">
          Video de fondo (opcional)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={banner.videoUrl ?? ""}
            onChange={(e) => onUpdate({ videoUrl: e.target.value.trim() ? e.target.value : undefined })}
            placeholder="/videos/hero-bg.mp4"
            className="flex-1 bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2 shrink-0">
            <label className="cursor-pointer text-xs font-semibold text-brand-textMuted hover:text-white border border-brand-border hover:border-brand-primary rounded-lg px-3 py-2 transition-colors whitespace-nowrap">
              Subir video
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await fileToUploadedVideoUrl(file);
                    onUpdate({ videoUrl: url });
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "No se pudo subir el video.");
                  }
                }}
              />
            </label>
            {banner.videoUrl && (
              <button
                type="button"
                onClick={() => onUpdate({ videoUrl: undefined })}
                className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors whitespace-nowrap"
              >
                Quitar video
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-brand-textMuted mt-1">
          Si se define, este video reemplaza la imagen como fondo del banner (la imagen se sigue
          usando como portada mientras carga). Dejalo vacío para usar solo la imagen.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-textMuted">
          Portada {index + 1} de {total}
        </span>
        <div className="flex items-center gap-2">
          <IconButton label="Subir" disabled={index === 0} onClick={onMoveUp}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </IconButton>
          <IconButton label="Bajar" disabled={index === total - 1} onClick={onMoveDown}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </IconButton>
          <button
            onClick={onRemove}
            className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-8 h-8 rounded-lg border border-brand-border flex items-center justify-center text-brand-textMuted hover:text-white hover:border-brand-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-textMuted mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
