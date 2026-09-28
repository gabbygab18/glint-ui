import { supabaseAdmin } from "@/lib/supabase-admin";

// Aggregate counters for every component. Cached at the edge for a minute so
// read traffic scales with CDN capacity, not database connections.
export async function GET() {
  if (!supabaseAdmin) return Response.json({});

  const { data, error } = await supabaseAdmin.rpc("get_stats");
  if (error) {
    console.error("get_stats failed", error);
    return Response.json({}, { status: 502 });
  }

  const stats = Object.fromEntries(
    (data as { slug: string; views: number; copies: number; favorites: number }[]).map((r) => [
      r.slug,
      { views: Number(r.views), copies: Number(r.copies), favorites: Number(r.favorites) },
    ]),
  );
  return Response.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
  });
}
