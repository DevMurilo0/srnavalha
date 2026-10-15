import Image from "next/image";
import { cn } from "@/lib/utils";

export type PhotoAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  objectPosition?: string;
} | null;

export function PhotoFrame({
  photo = null,
  label,
  index,
  className,
  priority = false,
}: {
  photo?: PhotoAsset;
  label: string;
  index?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("photo-frame", photo && "has-photo", className)}>
      {photo ? (
        <div
          className="photo-media"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={photo.sizes}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="object-cover"
            style={{ objectPosition: photo.objectPosition ?? "center" }}
          />
        </div>
      ) : (
        <>
          <div className="photo-lines" aria-hidden="true" />
          <span className="photo-corner" aria-hidden="true">
            +
          </span>
          <span className="photo-monogram" aria-hidden="true">
            SR<span>.</span>
          </span>
          <span className="photo-placeholder-label">
            ESPAÇO PARA FOTOGRAFIA REAL
          </span>
        </>
      )}
      <figcaption className="photo-caption">
        <span>{label}</span>
        {index ? <span>{index}</span> : null}
      </figcaption>
    </figure>
  );
}
