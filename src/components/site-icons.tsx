import { useId, type SVGProps } from "react";
import { SITE_ICONS } from "@/icons/site";

// The website's own icons, drawn filled, from our icon set (the icons-website project).
// src/icons/site.ts holds only the icons listed below, pre-rendered: run `node scripts/gen-site-icons.mjs`
// after adding one. Registry components keep lucide-react, since that is what people install with them.

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "stroke"> {
  name: string;
  /** Stroke width on the 24px grid. */
  strokeWidth?: number;
  size?: number | string;
}

export function Icon({ name, strokeWidth = 2, size = "1em", ...props }: IconProps) {
  const id = `i${useId().replace(/[^\w-]/g, "")}`;
  const markup = SITE_ICONS[name];
  if (!markup) return null;
  let html = markup.replaceAll("__ID__", id);
  if (strokeWidth !== 2) html = html.replaceAll('stroke-width="2"', `stroke-width="${strokeWidth}"`);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      {...props}
      dangerouslySetInnerHTML={{ __html: html }}
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
export const Bell = named("bell");
export const BookOpen = named("book-open");
export const Box = named("package");
export const Check = named("check");
export const CheckCircle = named("check-circle");
export const ChevronDown = named("chevron-down");
export const Clock = named("clock");
export const Copy = named("copy");
export const FileCode2 = named("file-code");
export const Folder = named("folder");
export const Heart = named("heart");
export const Layers = named("layers");
export const LayoutGrid = named("grid");
export const Menu = named("menu");
export const Monitor = named("monitor");
export const Moon = named("moon");
export const Package = named("package");
export const Play = named("play");
export const MousePointerClick = named("cursor");
export const RotateCcw = named("rotate-ccw");
export const Search = named("search");
export const SlidersHorizontal = named("sliders");
export const Smile = named("smile");
export const Sparkles = named("sparkles");
export const Star = named("star");
export const Sun = named("sun");
export const Terminal = named("terminal");
export const Type = named("type");
export const Zap = named("lightning");

/**
 * Lime circle with an arrow. When its `group` parent is hovered or focused, the arrow slides out to the
 * right while a copy slides in from the left.
 */
export function ArrowDot({ className = "size-7", iconClassName = "size-3.5" }: { className?: string; iconClassName?: string }) {
  const slide = "transition-transform duration-300 ease-out motion-reduce:transition-none";
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#d9ff6b] text-[#141a0f] ${className}`}>
      <ArrowRight className={`${iconClassName} ${slide} group-hover:translate-x-[220%] group-focus-visible:translate-x-[220%]`} />
      <ArrowRight className={`absolute ${iconClassName} ${slide} -translate-x-[220%] group-hover:translate-x-0 group-focus-visible:translate-x-0`} />
    </span>
  );
}
