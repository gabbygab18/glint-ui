"use client";

import { demoImages } from "../../demo-kit";
import { PixelTransition } from "./pixel-transition";

const [img] = demoImages(1, 600, 800);

export default function Demo(p: Record<string, unknown>) {
  return (
    <PixelTransition
      {...p}
      className="h-96 w-72 shadow-2xl"
      back={
        <div className="flex size-full flex-col justify-between bg-card p-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cabin 04</span>
          <div>
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">Aurora Lodge</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Floor-to-ceiling glass, a wood stove and nothing but pines for twelve miles.
            </p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold text-foreground">
              $240<span className="text-sm font-normal text-muted-foreground"> / night</span>
            </span>
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Book</span>
          </div>
        </div>
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="size-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">Hover me</p>
        <h3 className="text-2xl font-semibold text-white">Aurora Lodge</h3>
      </div>
    </PixelTransition>
  );
}
