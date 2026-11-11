"use client";

import { Suspense } from "react";
import { demos } from "@/registry/generated/demos";
import { ErrorBoundary } from "./error-boundary";
import { Fit } from "./fit";

export function PreviewStage({ slug, defaults }: { slug: string; defaults: Record<string, unknown> }) {
  const Demo = demos[slug];
  return (
    <main className="dark relative grid min-h-dvh place-items-center overflow-hidden bg-[oklch(0.13_0.004_110)] p-8 text-foreground">
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Fit>
            <Demo {...defaults} />
          </Fit>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
