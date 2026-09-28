import { bySlug } from "@/registry";
import { supabaseAdmin } from "@/lib/supabase-admin";

const EVENTS = new Set(["view", "copy"]);

// ponytail: no rate limiting; counters are vanity metrics. Put Vercel WAF rate
// rules on /api/stats/* if someone starts inflating them.
export async function POST(req: Request, ctx: RouteContext<"/api/stats/[slug]">) {
  const { slug } = await ctx.params;
  if (!bySlug.has(slug)) return new Response(null, { status: 404 });

  let event: unknown;
  try {
    event = JSON.parse(await req.text()).event;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof event !== "string" || !EVENTS.has(event)) return new Response(null, { status: 400 });

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.rpc("track_event", { p_slug: slug, p_event: event });
    if (error) console.error("track_event failed", error);
  }
  return new Response(null, { status: 204 });
}
