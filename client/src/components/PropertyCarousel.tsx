import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { PropertyImage } from "./PropertyImage";

interface CarouselItem {
  url: string;
  alt?: string | null;
}

interface PropertyCarouselProps {
  images: CarouselItem[];
  fallbackSrc?: string | null;
  title: string;
  className?: string;
}

export function PropertyCarousel({ images, fallbackSrc, title, className = "" }: PropertyCarouselProps) {
  const validImages = useMemo(() => {
    const normalized = images
      .map((item) => ({ url: item.url?.trim(), alt: item.alt }))
      .filter((item) => Boolean(item.url)) as Array<{ url: string; alt?: string | null }>;

    if (normalized.length === 0 && fallbackSrc) {
      return [{ url: fallbackSrc, alt: title }];
    }

    return normalized;
  }, [fallbackSrc, images, title]);

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [validImages.length, title]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") {
        setIndex((value) => (value === 0 ? validImages.length - 1 : value - 1));
      }
      if (event.key === "ArrowRight") {
        setIndex((value) => (value === validImages.length - 1 ? 0 : value + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, validImages.length]);

  if (validImages.length === 0) {
    return (
      <PropertyImage
        src={fallbackSrc}
        alt={title}
        className={className}
        fallbackLogoClassName="h-28 w-auto opacity-15"
      />
    );
  }

  const current = validImages[index];

  const prev = () => setIndex((value) => (value === 0 ? validImages.length - 1 : value - 1));
  const next = () => setIndex((value) => (value === validImages.length - 1 ? 0 : value + 1));
  const openLightbox = (selectedIndex = index) => {
    setIndex(selectedIndex);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-5">
        <div className={`relative overflow-hidden rounded-[28px] border border-white/10 ${className}`}>
          <button
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative block w-full text-left"
            aria-label="Abrir foto ampliada"
          >
            <PropertyImage
              src={current.url}
              alt={current.alt || title}
              className="h-[320px] md:h-[520px]"
              fallbackLogoClassName="h-28 w-auto opacity-15"
            >
              <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/85 backdrop-blur-sm transition group-hover:border-[#c9a84c]/40 group-hover:text-[#c9a84c]">
                <Expand size={14} /> ampliar
              </div>
              <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
                Clique para abrir a galeria
              </div>
            </PropertyImage>
          </button>

          {validImages.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Foto anterior"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <button
                  type="button"
                  onClick={next}
                  aria-label="Próxima foto"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
                <span>{index + 1}</span>
                <span className="text-white/35">/</span>
                <span>{validImages.length}</span>
              </div>
            </>
          )}
        </div>

        {validImages.length > 1 && (
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Miniaturas</p>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-5 xl:grid-cols-6">
                {validImages.map((image, imageIndex) => (
                  <button
                    key={`${image.url}-${imageIndex}`}
                    type="button"
                    onClick={() => setIndex(imageIndex)}
                    className={`overflow-hidden rounded-2xl border transition ${
                      imageIndex === index
                        ? "border-[#c9a84c] ring-1 ring-[#c9a84c]/50"
                        : "border-white/10 hover:border-[#c9a84c]/35"
                    }`}
                  >
                    <img src={image.url} alt={image.alt || `${title} ${imageIndex + 1}`} className="h-20 w-full object-cover md:h-24" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Todas as fotos</p>
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="text-xs uppercase tracking-[0.25em] text-white/55 transition hover:text-[#c9a84c]"
                >
                  abrir galeria completa
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {validImages.map((image, imageIndex) => (
                  <button
                    key={`gallery-${image.url}-${imageIndex}`}
                    type="button"
                    onClick={() => openLightbox(imageIndex)}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111] text-left transition hover:border-[#c9a84c]/35"
                  >
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.alt || `${title} ${imageIndex + 1}`}
                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-white">
                        <span>Foto {imageIndex + 1}</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white/85 backdrop-blur-sm">
                          <Expand size={13} /> ampliar
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[80] bg-black/92 backdrop-blur-sm">
          <div className="flex h-full flex-col px-4 py-4 md:px-8 md:py-6">
            <div className="mb-4 flex items-center justify-between gap-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#c9a84c]">Galeria de fotos</p>
                <h3 className="mt-2 text-xl font-thin md:text-2xl">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                aria-label="Fechar galeria"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-[#050505]">
              <img
                src={current.url}
                alt={current.alt || title}
                className="max-h-full max-w-full object-contain"
              />

              {validImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Foto anterior"
                    className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    aria-label="Próxima foto"
                    className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-white/65">
              <p>
                Foto <span className="text-white">{index + 1}</span> de <span className="text-white">{validImages.length}</span>
              </p>
              <p className="hidden md:block">Use as setas do teclado para navegar e ESC para fechar</p>
            </div>

            {validImages.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3 overflow-y-auto md:grid-cols-6 xl:grid-cols-8">
                {validImages.map((image, imageIndex) => (
                  <button
                    key={`lightbox-${image.url}-${imageIndex}`}
                    type="button"
                    onClick={() => setIndex(imageIndex)}
                    className={`overflow-hidden rounded-2xl border transition ${
                      imageIndex === index
                        ? "border-[#c9a84c] ring-1 ring-[#c9a84c]/50"
                        : "border-white/10 hover:border-[#c9a84c]/35"
                    }`}
                  >
                    <img src={image.url} alt={image.alt || `${title} ${imageIndex + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
