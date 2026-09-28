"use client";

import { demoImages } from "../../demo-kit";
import { FluidGlass } from "./fluid-glass";

const images = demoImages(3, 480, 360);

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="absolute inset-0">
      <FluidGlass className="h-full w-full" {...p}>
        <div className="grid h-full w-full place-items-center bg-background p-8">
          <div className="w-full max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Issue 07 / Optics</p>
            <h2 className="mt-3 text-5xl font-semibold leading-[0.95] tracking-tighter text-foreground sm:text-7xl">
              Bend the{" "}
              <span className="bg-gradient-to-r from-lime-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">light</span>.
            </h2>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              ))}
            </div>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Glass does not show you the world as it is. It gathers it, curves it and hands it back a little closer, a
              little stranger, with the edges split into color.
            </p>
          </div>
        </div>
      </FluidGlass>
    </div>
  );
}
