import { Box } from "lucide-react";
import type { CSSProperties } from "react";
import { STACK } from "./stack-logos";

type Logo = (typeof STACK)[number];

/** A brand mark + name that turns its brand color on hover. */
export function StackLogo({ logo }: { logo: Logo }) {
  return (
    <span
      className="flex items-center gap-3 text-muted-foreground transition-colors duration-300 hover:text-[var(--brand)]"
      style={{ "--brand": logo.color ?? "var(--foreground)" } as CSSProperties}
    >
      {logo.path ? (
        <svg viewBox="0 0 24 24" aria-hidden className="size-8 fill-current">
          <path d={logo.path} />
        </svg>
      ) : logo.name === "WebGL" ? (
        <Box aria-hidden className="size-8" strokeWidth={1.75} />
      ) : (
        <span aria-hidden className="grid size-8 place-items-center rounded-md bg-current">
          <span className="font-display text-sm font-black text-background">M</span>
        </span>
      )}
      <span className="font-display text-xl font-semibold whitespace-nowrap">{logo.name}</span>
    </span>
  );
}

export const stackLogos = STACK.map((logo) => <StackLogo key={logo.name} logo={logo} />);
