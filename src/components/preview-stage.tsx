"use client";

import { Suspense } from "react";
import { bySlug, defaultProps } from "@/registry";
import { demos } from "@/registry/generated/demos";
import { ErrorBoundary } from "./error-boundary";
import { Fit } from "./fit";

export function PreviewStage({ slug }: { slug: string }) {
  const Demo = demos[slug];
  return (
    <main className="dark relative grid min-h-dvh place-items-center overflow-hidden bg-[oklch(0.13_0.004_110)] p-8 text-foreground">
      <ErrorBoundary>
        <Suspense fallback={null}>
          <Fit>
            <Demo {...defaultProps(bySlug.get(slug)!)} />
          </Fit>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
