export const CATEGORIES = [
  { id: "text-animations", label: "Text Animations", icon: "type" },
  { id: "animations", label: "Animations", icon: "sparkles" },
  { id: "backgrounds", label: "Backgrounds", icon: "layers" },
  { id: "components", label: "Components", icon: "layout" },
  { id: "buttons", label: "Buttons", icon: "pointer" },
  { id: "micro-interactions", label: "Micro Interactions", icon: "zap" },
  { id: "primitives", label: "UI Primitives", icon: "box" },
  { id: "widgets", label: "Widgets & Mascots", icon: "smile" },
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];

type Base = { name: string; description: string; control?: false };
export type PropDef = Base &
  (
    | { type: "string"; default?: string }
    | { type: "number"; default?: number; min: number; max: number; step?: number }
    | { type: "boolean"; default?: boolean }
    | { type: "color"; default?: string }
    | { type: "select"; default?: string; options: string[] }
    | { type: "list"; default?: string[] }
    | { type: "node"; default?: undefined }
  );

export interface Meta {
  name: string;
  category: Category;
  description: string;
  props: PropDef[];
  /** JSX snippet shown under "Usage" (import line is added automatically). */
  usage: string;
  /** npm packages the component imports, e.g. ["motion"]. */
  dependencies?: string[];
  /** Attribution: where the idea or code came from. */
  credit?: { label: string; url: string; license?: string };
  isNew?: boolean;
}

export type RegistryEntry = Meta & { slug: string };
