import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    setIndex(0);
  }, [validImages.length, title]);

  if (validImages.length <= 1) {
    return (
      <PropertyImage
        src={validImages[0]?.url || fallbackSrc}
        alt={validImages[0]?.alt || title}
        className={className}
        fallbackLogoClassName="h-28 w-auto opacity-15"
      />
    );
  }

  const current = validImages[index];

  const prev = () => setIndex((value) => (value === 0 ? validImages.length - 1 : value - 1));
  const next = () => setIndex((value) => (value === validImages.length - 1 ? 0 : value + 1));

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-[28px] border border-white/10 ${className}`}>
        <PropertyImage
          src={current.url}
          alt={current.alt || title}
          className="h-[320px] md:h-[520px]"
          fallbackLogoClassName="h-28 w-auto opacity-15"
        />

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
      </div>

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
  );
}
