"use client";

import { Hyperlink } from "./hyperlink";

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="max-w-lg px-6 pt-40 text-lg leading-relaxed text-muted-foreground">
      <p>
        We built this site on{" "}
        <Hyperlink
          href="https://nextjs.org"
          previewTitle="Next.js by Vercel"
          previewDescription="The React framework for the web: routing, rendering and bundling out of the box."
          {...p}
        >
          Next.js
        </Hyperlink>
        , animate everything with{" "}
        <Hyperlink href="https://motion.dev" previewTitle="Motion" previewDescription="A production-ready animation library for React and JavaScript.">
          Motion
        </Hyperlink>{" "}
        and keep the rest in the{" "}
        <Hyperlink href="/docs" color="#a3e635">
          docs
        </Hyperlink>
        .
      </p>
    </div>
  );
}
