import { liteRegistry } from "@/registry";

// Search data, fetched by the header search the first time it opens. Static, so it is built once and cached.
export const dynamic = "force-static";

export function GET() {
  return Response.json(liteRegistry);
}
