# Authoring registry components

Each component lives in `src/registry/items/<slug>/` as exactly three files:

```
items/<slug>/
  <slug>.tsx   the component users copy (named export, PascalCase of slug)
  meta.ts      docs metadata + playground controls
  demo.tsx     live preview for the docs page
```

`scripts/gen-registry.mjs` picks up any folder with all three files and rebuilds
`src/registry/generated/*`. Never edit generated files by hand.

Study these existing items before writing: `split-text`, `dot-grid`, `particles`,
`magnet`, `dock`, `glow-border`, `calamansi`.

## Hard rules

1. **Original code only.** Do NOT open, fetch or copy source code from reactbits.dev,
   github.com/DavidHDev/react-bits, scrollxui.dev or github.com/Adityakishore0/ScrollX-UI.
   Their licenses forbid redistribution. Build every effect from scratch from the
   idea you are given. Exception: Calamansi UI (github.com/fujiDevv/calamansi-ui) is
   MIT; you may port its code if you keep an attribution comment and set `credit` in meta.
2. **Allowed imports only:** `react`, `motion/react` (Motion), `gsap`, `ogl`, `three`,
   `matter-js`, `lucide-react`, `figma-squircle`, `react-use-measure`, and
   `cn` from `@/lib/utils`. Nothing else. Do not run `npm install`.
   Prefer zero-dependency code (CSS, canvas 2D, raw WebGL) when it stays readable.
   List every npm package the component imports in `meta.dependencies`.
3. **Self-contained.** The component file must not import anything from this site
   (no `@/components`, no `@/registry`, no demo-kit). Only the allowed packages above.
4. **Theme tokens.** Use shadcn token classes (`bg-background`, `bg-card`, `text-foreground`,
   `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`,
   `bg-muted`, `ring-ring`) instead of hard-coded grays, so components work in light and
   dark themes. Color props with hex defaults are fine for effects.
   In inline styles / CSS use the shadcn variables (`var(--card)`, `var(--primary)`, `var(--foreground)`),
   never `var(--color-card)` etc.: with Tailwind v4 `@theme inline` those `--color-*` variables are not emitted.
   Text inputs draw their own focus state (ring on the field or its wrapper); do not rely on the browser outline.
5. **Client component:** first line `"use client";`.
6. **Keyframes/CSS:** inline styles, Tailwind classes, or a React 19 hoisted style tag:
   `<style href="<slug>" precedence="default">{css}</style>`. No global CSS files.
7. **Performance:** pause rAF/WebGL loops when offscreen (IntersectionObserver), cap
   devicePixelRatio at 2, clean up every listener/observer/timer/rAF on unmount, and for
   WebGL call `gl.getExtension("WEBGL_lose_context")?.loseContext()` on unmount. Avoid React
   state updates per animation frame; write to refs/DOM/CSS variables instead.
8. **Reduced motion:** respect `prefers-reduced-motion` (static frame or no animation).
9. **Accessibility:** animated text keeps the real text for screen readers (`sr-only` span +
   `aria-hidden` visual copy). Interactive widgets work with keyboard, have labels and
   visible focus. Decorative canvases get `aria-hidden`.
10. **Scoped effects.** Cursor effects and global listeners must be scoped to their container
    (the component's own box or its parent), never hijack the whole page cursor. Things that
    would normally be `position: fixed` (menus, sheets, toasts, islands) must accept a way to
    render inside a container (e.g. `position="absolute"` prop) so the demo stays in its stage.
    Scroll-driven effects must accept a scroll container (e.g. a `scrollContainerRef` prop) and
    the demo must provide a fixed-height scrolling box.
11. **SSR-safe:** no `window`/`document` access during render; only in effects/handlers.
    Randomness used in render must be deterministic (seeded) to avoid hydration mismatch.

## File templates

`<slug>.tsx`
```tsx
"use client";

import { useEffect, useRef } from "react";

export interface FancyThingProps {
  /** What this does, units if any. */
  speed?: number;
  className?: string;
}

export function FancyThing({ speed = 1, className }: FancyThingProps) {
  ...
}
```

`meta.ts`
```ts
import type { Meta } from "../../types";

export default {
  name: "Fancy Thing",
  category: "backgrounds", // text-animations | animations | backgrounds | components | buttons | micro-interactions | primitives | widgets
  description: "One sentence, what it looks like and does.",
  dependencies: ["ogl"], // omit if none
  props: [
    // Every prop the playground can tweak. Types: string | number (min,max,step) | boolean | color | select (options) | list (string[]) | node (docs only)
    { name: "speed", type: "number", min: 0, max: 5, step: 0.1, default: 1, description: "Animation speed multiplier." },
  ],
  usage: `<FancyThing speed={1} />`,
} satisfies Meta;
```
Defaults in meta must match the component's defaults. Keep control ranges sensible.

`demo.tsx`
```tsx
"use client";

import { Title } from "../../demo-kit";
import { FancyThing } from "./fancy-thing";

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <FancyThing {...p} />
      <Title>Fancy Thing</Title>
    </>
  );
}
```
The demo receives the playground values as props; always spread `{...p}` onto the component.
It renders inside a dark stage (`display: grid; place-items: center`, ~28rem tall, relative,
overflow hidden) and also full-viewport at `/preview/<slug>`. Backgrounds should fill it with
`absolute inset-0`. Demo-only helpers live in `src/registry/demo-kit.tsx`
(`Title`, `Card`, `demoImages(n, w, h)` for sample photos — use `crossOrigin="anonymous"` for WebGL textures).

## Workflow per component

1. Write the three files in `src/registry/_staging/<slug>/` (not scanned by the generator, so a
   half-written file cannot break the running dev server). Same relative imports work there.
2. Check it:
   ```bash
   npx tsc --noEmit 2>&1 | grep "_staging/<slug>"      # must print nothing
   npx eslint src/registry/_staging/<slug>              # must be clean
   ```
3. Move the folder to `src/registry/items/<slug>/` and run `node scripts/gen-registry.mjs`.
4. Look at it in a real browser (dev server runs at http://localhost:3000):
   ```bash
   node scripts/shot.mjs http://localhost:3000/preview/<slug> <scratch>/<slug>.png 1280 800 5000 640,400
   ```
   It prints console errors (must be none) and saves a screenshot. Open the PNG and check the
   effect actually renders and looks good. Fix and repeat until it does.
