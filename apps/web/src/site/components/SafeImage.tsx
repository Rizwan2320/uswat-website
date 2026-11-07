"use client";

/* components/SafeImage.tsx
   next/image with an on-brand fallback when `src` is empty or the image fails.
   For `fill` images the parent must be position: relative with a fixed size or aspect-ratio. */

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src"> & { src?: ImageProps["src"] | "" };

export default function SafeImage({ src, alt, className, onError, ...rest }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const cls = ["img-fallback", rest.fill ? "img-fallback--fill" : "", className ?? ""].join(" ").trim();
    return <div className={cls} role={alt ? "img" : undefined} aria-label={alt || undefined} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={(e) => { setFailed(true); onError?.(e); }}
      {...rest}
    />
  );
}
