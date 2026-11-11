import { FavoritesView } from "@/components/favorites-view";
import { liteRegistry } from "@/registry";

// Without Supabase the page only shows "coming soon", so it doesn't need the component list.
const enabled = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function FavoritesPage() {
  return <FavoritesView entries={enabled ? liteRegistry : []} />;
}
