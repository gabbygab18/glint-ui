"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type AvatarStatus = "online" | "away" | "busy" | "offline";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Person's name: used for the accessible label and the fallback initials. */
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  status?: AvatarStatus;
}

const sizes = {
  sm: { box: "size-8 text-xs", dot: "size-2.5" },
  md: { box: "size-10 text-sm", dot: "size-3" },
  lg: { box: "size-14 text-base", dot: "size-3.5" },
  xl: { box: "size-20 text-xl", dot: "size-4.5" },
};

const dots: Record<AvatarStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  busy: "bg-red-500",
  offline: "bg-zinc-400",
};

function initials(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Stable hue per name so fallbacks are colorful but deterministic (no hydration mismatch). */
function hue(name = "") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function Avatar({ src, name, size = "md", shape = "circle", status, className, ...props }: AvatarProps) {
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [failedSrc, setFailedSrc] = useState<string>();
  const loaded = !!src && loadedSrc === src;
  const showImage = src && failedSrc !== src;
  const radius = shape === "circle" ? "rounded-full" : "rounded-[28%]";
  const h = hue(name);

  return (
    <span
      role="img"
      aria-label={[name ?? "Avatar", status].filter(Boolean).join(", ")}
      {...props}
      className={cn("relative inline-flex shrink-0 select-none", sizes[size].box, className)}
    >
      <span
        aria-hidden
        className={cn("grid size-full place-items-center overflow-hidden font-semibold ring-2 ring-background", radius)}
        style={{
          background: `linear-gradient(135deg, oklch(0.78 0.11 ${h}), oklch(0.62 0.14 ${(h + 40) % 360}))`,
          color: "oklch(0.22 0.05 " + h + ")",
        }}
      >
        <span
          className={cn(
            "col-start-1 row-start-1 transition-opacity duration-300",
            showImage && loaded && "opacity-0",
          )}
        >
          {initials(name)}
        </span>
        {showImage && (
          <img
            src={src}
            alt=""
            draggable={false}
            // Cached images can finish before hydration attaches onLoad.
            ref={(img) => {
              if (img?.complete && img.naturalWidth) setLoadedSrc(src);
            }}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setFailedSrc(src)}
            className={cn(
              "col-start-1 row-start-1 size-full object-cover transition-[opacity,scale] duration-500 ease-out motion-reduce:transition-none",
              loaded ? "scale-100 opacity-100" : "scale-110 opacity-0",
            )}
          />
        )}
      </span>
      {status && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
            shape === "square" && "-bottom-0.5 -right-0.5",
            sizes[size].dot,
            dots[status],
          )}
        >
          {status === "online" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
          )}
        </span>
      )}
    </span>
  );
}
