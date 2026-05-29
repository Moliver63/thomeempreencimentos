import { ReactNode, useState } from "react";

interface PropertyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackLogoClassName?: string;
  children?: ReactNode;
}

export function PropertyImage({
  src,
  alt,
  className = "",
  imgClassName = "w-full h-full object-cover",
  fallbackLogoClassName = "h-16 w-auto opacity-10",
  children,
}: PropertyImageProps) {
  const [hasError, setHasError] = useState(false);
  const hasImage = Boolean(src) && !hasError;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] ${className}`}>
      {hasImage ? (
        <>
          <img
            src={src || undefined}
            alt={alt}
            className={imgClassName}
            onError={() => setHasError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo_symbol.png" alt="" className={fallbackLogoClassName} />
        </div>
      )}
      {children}
    </div>
  );
}
