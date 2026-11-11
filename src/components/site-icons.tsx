import { useId, type SVGProps } from "react";
import { BY_NAME, renderInner, type Variant } from "@/icons/render";

// The website's own icons come from our icon set (src/icons, copied from the icons-website project),
// drawn filled. Registry components keep lucide-react, since that is what people install with them.

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "stroke"> {
  name: string;
  variant?: Variant;
  /** Stroke width on the 24px grid. */
  strokeWidth?: number;
  size?: number | string;
}

export function Icon({ name, variant = "solid", strokeWidth = 2, size = "1em", ...props }: IconProps) {
  const id = `i${useId().replace(/[^\w-]/g, "")}`;
  const def = BY_NAME.get(name);
  if (!def) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      {...props}
      dangerouslySetInnerHTML={{ __html: renderInner(def, { variant, stroke: strokeWidth, id }) }}
    />
  );
}

/** Same names as the lucide icons the site used, so swapping is just the import line. */
const named = (name: string) => {
  const C = (props: Omit<IconProps, "name">) => <Icon name={name} {...props} />;
  C.displayName = name;
  return C;
};

export const ArrowRight = named("arrow-right");
export const ArrowUpRight = named("arrow-up-right");
export const BookOpen = named("book-open");
export const Box = named("package");
export const Check = named("check");
export const ChevronDown = named("chevron-down");
export const Copy = named("copy");
export const FileCode2 = named("file-code");
export const Folder = named("folder");
export const Heart = named("heart");
export const Layers = named("layers");
export const LayoutGrid = named("grid");
export const Menu = named("menu");
export const Monitor = named("monitor");
export const Moon = named("moon");
export const MousePointerClick = named("cursor");
export const RotateCcw = named("rotate-ccw");
export const Search = named("search");
export const SlidersHorizontal = named("sliders");
export const Smile = named("smile");
export const Sparkles = named("sparkles");
export const Sun = named("sun");
export const Terminal = named("terminal");
export const Type = named("type");
export const Zap = named("lightning");
