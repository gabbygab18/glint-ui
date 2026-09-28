"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const css = `
@keyframes ui-ar-shimmer{from{translate:-100% 0}to{translate:100% 0}}
.ui-ar-shimmer::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in oklab,currentColor 10%,transparent),transparent);animation:ui-ar-shimmer 1.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.ui-ar-shimmer::after{animation:none}}
`;

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width divided by height, e.g. 16 / 9. */
  ratio?: number;
  /** Image to render inside, covering the box. Omit to use children instead. */
  src?: string;
  alt?: string;
  /** Show an animated shimmer until the image has loaded. */
  shimmer?: boolean;
}

export function AspectRatio({
  ratio = 16 / 9,
  src,
  alt = "",
  shimmer = true,
  className,
  style,
  children,
  ...props
}: AspectRatioProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = !src || loadedSrc === src;

  return (
    <div
      {...props}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: String(ratio), ...style }}
    >
      {src && (
        <>
          <style href="ui-aspect-ratio" precedence="default">
            {css}
          </style>
          {shimmer && (
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 bg-muted text-foreground transition-opacity duration-500",
                !loaded && "ui-ar-shimmer",
                loaded && "opacity-0",
              )}
            />
          )}
          <img
            src={src}
            alt={alt}
            decoding="async"
            // A cached image can finish before hydration attaches onLoad, so check on mount too.
            ref={(img) => {
              if (img?.complete && img.naturalWidth) setLoadedSrc(src);
            }}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setLoadedSrc(src)}
            className={cn(
              "absolute inset-0 size-full object-cover transition-[opacity,scale,filter] duration-700 ease-out motion-reduce:transition-none",
              loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.04] opacity-0 blur-md",
            )}
          />
        </>
      )}
      {children}
    </div>
  );
}
