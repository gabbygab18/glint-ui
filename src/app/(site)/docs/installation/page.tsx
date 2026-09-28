import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Prose } from "@/components/prose";
import { PromoCard, RightRail } from "@/components/right-rail";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Installation" };

export default function InstallationPage() {
  return (
    <>
      <main className="min-w-0 flex-1 py-10">
        <h1 className="font-display text-5xl font-bold tracking-tight">Installation</h1>
        <p className="mb-10 mt-4 max-w-2xl text-lg text-muted-foreground">
          Works in any React 19 project with Tailwind CSS v4. Next.js is recommended.
        </p>
        <Prose>
          <h2>1. Set up shadcn (recommended)</h2>
          <p>
            This adds the theme tokens and the <code>cn</code> helper that some components use.
          </p>
        </Prose>
        <CodeBlock code="npx shadcn@latest init" lang="bash" />
        <Prose>
          <h2>2. Add a component</h2>
          <p>Every component page has its own command. For example:</p>
        </Prose>
        <CodeBlock code={`npx shadcn@latest add ${SITE_URL}/r/split-text.json`} lang="bash" />
        <Prose>
          <p>
            The file lands in <code>components/ui</code> and the CLI installs any npm dependencies it needs.
          </p>
          <h2>3. Or copy it by hand</h2>
          <p>
            Open the <strong>Manual</strong> tab on any component page, install the listed dependencies and paste the
            source. Components without dependencies need nothing else.
          </p>
          <h2>Dependencies you may see</h2>
          <ul>
            <li>
              <code>motion</code> for spring and layout animations
            </li>
            <li>
              <code>gsap</code> for timeline-heavy effects
            </li>
            <li>
              <code>ogl</code> or <code>three</code> for WebGL backgrounds
            </li>
            <li>
              <code>matter-js</code> for physics
            </li>
          </ul>
        </Prose>
      </main>
      <RightRail>
        <PromoCard />
      </RightRail>
    </>
  );
}
