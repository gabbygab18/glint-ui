# Glint UI

Animated React components you copy, paste and ship. Built with Next.js 16, Supabase and Vercel.

Each component is a single self-contained file with no dependencies beyond React 19 and Tailwind. You can copy the source or install it with the shadcn CLI:

```bash
npx shadcn@latest add https://<your-domain>/r/split-text.json
```

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: the site runs without Supabase
npm run dev
```

Without Supabase env vars, everything works except sign-in, favorites and view/copy counters, which hide themselves.

## System architecture

```
                 ┌──────────────── Vercel CDN ────────────────┐
 Browser ──────► │ Static HTML/JS: /, /components, /components/*,│
   │             │ /favorites, /r/*.json (all built ahead)       │
   │             │ /api/stats  (GET, s-maxage=60, SWR 600)       │
   │             └───────────────────────────┬──────────────────┘
   │                                         │ cache miss / POST
   │                                         ▼
   │                            Vercel Functions (/api/stats*)
   │                                         │ secret key
   │                                         ▼
   └── supabase-js (publishable key) ──► Supabase Postgres + Auth
        auth (GitHub OAuth, PKCE)            RLS on every table
        favorites (read/write own rows)
```

The main design choice: **component content lives in the repo, not the database.** Docs pages, code, props and the registry JSON are generated at build time and served from the CDN, so page traffic never reaches a server or the database. The database only holds data that changes at runtime: counters and favorites.

| Concern | Where it runs | Why |
|---|---|---|
| Docs pages, source code, props | Built ahead (SSG), CDN | No server cost per view. Scales with the CDN. |
| Syntax highlighting | Shiki at build time | Sends no highlighter JS to the browser. |
| Auth + favorites | Browser → Supabase, protected by RLS | Pages stay static. No proxy or cookie handling needed. |
| View/copy counters | `POST /api/stats/[slug]` → `track_event()` | The secret key stays on the server. Slugs are checked against the registry. |
| Aggregate stats | `GET /api/stats` with edge caching | Millions of readers become about one DB query per minute. |

## File structure

```
src/
  app/
    layout.tsx                 root shell: header, skip link, footer
    page.tsx                   landing page (live component showcase)
    components/
      layout.tsx               sidebar + content
      page.tsx                 index: filter, sort by category or popularity
      [slug]/page.tsx          docs page: preview/code, install, usage, props
    favorites/page.tsx         saved components (client, RLS)
    api/stats/route.ts         GET aggregate counters (edge cached)
    api/stats/[slug]/route.ts  POST view/copy event
    r/[slug]/route.ts          shadcn registry item JSON (prerendered)
    sitemap.ts, not-found.tsx
  registry/
    items/<slug>/              one folder per component (355):
      <slug>.tsx                 the component users copy
      meta.ts                    docs metadata + playground controls
      demo.tsx                   live preview
    generated/                 index built by scripts/gen-registry.mjs (runs before dev/build)
    index.ts                   server-safe registry API
    AUTHORING.md               rules and workflow for writing components
  components/                  site UI: header, search, playground, tabs, code block
  lib/
    supabase.ts                browser client + useUser
    supabase-admin.ts          server-only client (secret key)
    favorites.ts               useFavorites: optimistic toggle with rollback
    stats.ts                   useStats (one shared fetch) + track (sendBeacon)
    source.ts                  build-time file read + Shiki
supabase/migrations/           schema, RLS policies, functions
```

### Adding a component

Create `src/registry/items/<slug>/` with `<slug>.tsx`, `meta.ts` and `demo.tsx`, following
`src/registry/AUTHORING.md`. The generator picks it up on the next `npm run dev` or `npm run build`
(or run `npm run gen`). Refresh card thumbnails with `npm run thumbs` while a server is running.

The sidebar, search, index, docs page, playground controls, props table, sitemap and shadcn endpoint all pick up the new component from those three files.

## Database schema

See `supabase/migrations/20260927000000_init.sql`.

```
component_stats                     favorites
───────────────                     ─────────
slug        text PK (checked)       user_id    uuid → auth.users (cascade)  ┐ PK
views       bigint                  slug       text (checked)                ┘
copies      bigint                  created_at timestamptz
updated_at  timestamptz             index on (slug) for counts
```

- **RLS is on for every table.** `favorites` has select/insert/delete policies scoped to `auth.uid() = user_id`. `component_stats` has no policies, so clients cannot touch it at all.
- `track_event(slug, event)` does an atomic upsert-increment. `get_stats()` joins counters with favorite counts. Only `service_role` can execute either function.

## API

| Method | Path | Body / response | Cache |
|---|---|---|---|
| GET | `/api/stats` | `{ [slug]: { views, copies, favorites } }` | `s-maxage=60, stale-while-revalidate=600` |
| POST | `/api/stats/:slug` | `{"event":"view"\|"copy"}` → 204. Returns 404 for an unknown slug and 400 for a bad event. | none |
| GET | `/r/:slug.json` | shadcn `registry-item` with the inlined source | static |

Favorites do not have an API route. The browser talks to Supabase directly, and Postgres RLS enforces access. That means one less hop and one less thing to secure.

## UI architecture

- **Server components by default.** Client components are only the interactive parts: playground, tabs, search, auth, favorites and copy.
- **Playground.** Controls are generated from each entry's `props` schema (number → slider, color → picker + text, select, boolean, list). Changing the preview's `key` replays it.
- **Search.** Opens with <kbd>Ctrl/⌘ K</kbd>. It uses the native `<dialog>` element, so focus trapping and Escape handling come free. It is a WAI-ARIA combobox with arrow-key navigation.
- **States.** Loading uses skeletons and spinners in Suspense. Empty states cover no favorites, no filter matches and missing config. On errors, the favorite write rolls back and the message is shown.
- **Accessibility.** Skip link, visible focus rings, ARIA tabs with arrow keys, and `aria-live` on copy/confirm labels. Animated text keeps the real text for screen readers (`sr-only`) and hides the animated copy. Hold To Confirm works with Space and Enter. `prefers-reduced-motion` is honored globally and in the canvas components.

## Performance notes

- **Per-component code splitting.** A docs page downloads only the component it shows (`React.lazy` per demo).
- **Canvas backgrounds.** They pause offscreen (IntersectionObserver), cap DPR at 2, and draw a single frame under reduced motion. Dot Grid redraws only when the pointer moves, so an idle grid costs nothing.
- **Pointer effects** (Magnet, Tilt, Spotlight, Dock, Shiny Button) write CSS variables or styles directly on the DOM node. They do not re-render React on each frame.
- **Count Up** writes `textContent` in rAF, so it causes zero React renders while animating.
- **Click Spark** runs its rAF loop only while sparks are alive.
- **Stats** are fetched once per page load and shared through a module-level promise. Views are deduped per tab session and sent with `sendBeacon`, so they never block navigation.

### Known ceilings

Each of these is marked with a `ponytail:` comment in the code.

- **Particles** link pass is O(n²). It is fine up to about 300 particles; beyond that, use a spatial grid.
- **Counters** use one row per slug, which means a row lock per increment. At very high write rates, buffer events and flush them in batches.
- **`/api/stats/*`** has no rate limit. If the counters get gamed, add Vercel WAF rate rules.

## Deploy

1. **Supabase.** Create a project and run the migration (`supabase db push`, or paste the SQL into the SQL editor). Enable **Auth → Providers → GitHub**. Under **Auth → URL Configuration**, add `http://localhost:3000/**` and `https://<your-domain>/**` to the redirect URLs.
2. **Vercel.** Import the repo and set the three Supabase env vars from `.env.example`. `NEXT_PUBLIC_SITE_URL` is optional because Vercel's production URL is detected automatically.
3. **Deploy.** Every page is prerendered, so the only functions are the two stats routes.

## Credits

The component ideas are inspired by [React Bits](https://reactbits.dev) and [ScrollX UI](https://scrollxui.dev). All implementations here are original.
# glint-ui
