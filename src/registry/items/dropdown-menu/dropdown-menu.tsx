"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type Dispatch,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Menus are native `popover="auto"` elements: top layer, light dismiss, and nested
// popovers (submenus live inside their parent in the DOM) stack correctly.
const css = `
.ui-menu{position:fixed;inset:auto;margin:0;overflow:visible;opacity:0;scale:.95;translate:var(--from,0 0);transition:opacity .12s ease-in,scale .12s ease-in,translate .12s ease-in,display .12s allow-discrete,overlay .12s allow-discrete}
.ui-menu:popover-open{opacity:1;scale:1;translate:0 0;transition-duration:.22s;transition-timing-function:cubic-bezier(.2,.9,.3,1.1)}
@starting-style{.ui-menu:popover-open{opacity:0;scale:.95;translate:var(--from,0 0)}}
.ui-menu[data-side=bottom]{--from:0 -6px;transform-origin:var(--origin) top}
.ui-menu[data-side=top]{--from:0 6px;transform-origin:var(--origin) bottom}
.ui-menu[data-side=right]{--from:-6px 0;transform-origin:left var(--origin)}
.ui-menu[data-side=left]{--from:6px 0;transform-origin:right var(--origin)}
@media (prefers-reduced-motion:reduce){.ui-menu{transition-duration:0s!important}}
`;

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type FocusIntent = "first" | "last" | "content" | null;
const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;

/** Position a fixed element beside an anchor: flip if the preferred side lacks room, then shift into the viewport. */
function place(anchor: DOMRect, el: HTMLElement, preferred: Side, align: Align, offset: number, alignOffset: number, pad = 8) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const room = { top: anchor.top, bottom: vh - anchor.bottom, left: anchor.left, right: vw - anchor.right };
  let side: Side = preferred;
  const v0 = side === "top" || side === "bottom";
  if (room[side] < (v0 ? h : w) + offset + pad && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];
  const vertical = side === "top" || side === "bottom";
  const along = (start: number, size: number, len: number) =>
    align === "start" ? start + alignOffset : align === "end" ? start + size - len - alignOffset : start + size / 2 - len / 2;
  let x = vertical ? along(anchor.left, anchor.width, w) : side === "right" ? anchor.right + offset : anchor.left - offset - w;
  let y = vertical ? (side === "bottom" ? anchor.bottom + offset : anchor.top - offset - h) : along(anchor.top, anchor.height, h);
  x = Math.min(Math.max(pad, x), vw - w - pad);
  y = Math.min(Math.max(pad, y), vh - h - pad);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.dataset.side = side;
  el.style.setProperty("--origin", `${vertical ? anchor.left + anchor.width / 2 - x : anchor.top + anchor.height / 2 - y}px`);
}

type RootCtx = {
  open: boolean;
  setOpen: (open: boolean, focus?: FocusIntent) => void;
  /** Close everything and put focus back on the trigger. */
  closeAll: () => void;
  /** Ids of open submenus, one per nesting level. */
  openPath: string[];
  setOpenPath: Dispatch<SetStateAction<string[]>>;
  /** Where focus should land when the next menu opens (consumed once). */
  setPendingFocus: (focus: FocusIntent) => void;
  takePendingFocus: () => FocusIntent;
  ids: { trigger: string; content: string };
};
type MenuCtx = {
  level: number;
  highlighted: string | null;
  setHighlighted: Dispatch<SetStateAction<string | null>>;
  layoutId: string;
  menuRef: RefObject<HTMLDivElement | null>;
};
type SubCtx = { id: string; level: number; open: boolean; contentId: string };
type RadioCtx = { value?: string; onValueChange?: (value: string) => void };

const RootContext = createContext<RootCtx | null>(null);
const MenuContext = createContext<MenuCtx | null>(null);
const SubContext = createContext<SubCtx | null>(null);
const RadioContext = createContext<RadioCtx | null>(null);

function useRoot() {
  const ctx = useContext(RootContext);
  if (!ctx) throw new Error("DropdownMenu parts must be rendered inside <DropdownMenu>.");
  return ctx;
}
function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu items must be rendered inside <DropdownMenuContent>.");
  return ctx;
}

const menuItems = (menu: HTMLElement) =>
  [...menu.querySelectorAll<HTMLElement>('[data-menu-item]:not([aria-disabled="true"])')].filter((el) => el.closest('[role="menu"]') === menu);

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function DropdownMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [inner, setInner] = useState(defaultOpen);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const open = openProp ?? inner;
  const pendingFocus = useRef<FocusIntent>(null);
  const id = useId();
  const ids = { trigger: `${id}-trigger`, content: `${id}-menu` };
  const setPendingFocus = (focus: FocusIntent) => {
    pendingFocus.current = focus;
  };
  const takePendingFocus = () => {
    const f = pendingFocus.current;
    pendingFocus.current = null;
    return f;
  };

  const setOpen = (next: boolean, focus: FocusIntent = null) => {
    setPendingFocus(focus);
    if (!next) setOpenPath([]);
    if (next === open) return;
    if (openProp === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const closeAll = () => {
    setOpen(false);
    document.getElementById(ids.trigger)?.focus({ preventScroll: true });
  };

  return (
    <RootContext value={{ open, setOpen, closeAll, openPath, setOpenPath, setPendingFocus, takePendingFocus, ids }}>
      {children}
    </RootContext>
  );
}

export function DropdownMenuTrigger({ className, onClick, onKeyDown, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, ids } = useRoot();
  return (
    <button
      type="button"
      id={ids.trigger}
      // Registered as the popover's invoker so light dismiss ignores it; the click itself is ours.
      popoverTarget={ids.content}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={ids.content}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        setOpen(!open, "content");
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true, "first");
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setOpen(true, "last");
        }
      }}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-[background-color,scale] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97] aria-expanded:bg-muted [&_svg]:size-4",
        className,
      )}
    />
  );
}

interface MenuSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  level: number;
  /** Id of the element the menu is anchored to. */
  anchorId: string;
  side: Side;
  align: Align;
  sideOffset: number;
  alignOffset: number;
  /** Native close (light dismiss) happened. */
  onDismiss: () => void;
  onEscape: () => void;
  onArrowLeft?: () => void;
}

function MenuSurface({
  open,
  level,
  anchorId,
  side,
  align,
  sideOffset,
  alignOffset,
  onDismiss,
  onEscape,
  onArrowLeft,
  className,
  children,
  ...props
}: MenuSurfaceProps) {
  const root = useRoot();
  const { takePendingFocus } = root;
  const take = useRef(takePendingFocus);
  const ref = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const layoutId = useId();
  const typeahead = useRef({ text: "", timer: 0 });
  const mounted = useRef(false);
  const wasOpen = useRef(false);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
    take.current = takePendingFocus;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") dismiss.current();
    };
    el.addEventListener("toggle", toggle);
    return () => el.removeEventListener("toggle", toggle);
  }, []);

  useEffect(() => {
    const el = ref.current;
    const firstRun = !mounted.current;
    const opening = open && !wasOpen.current;
    mounted.current = true;
    wasOpen.current = open;
    if (!el) return;
    const shown = el.matches(":popover-open");
    if (!open) {
      if (shown) el.hidePopover();
      return;
    }
    if (!shown) el.showPopover();
    const position = () => {
      const a = document.getElementById(anchorId);
      if (a) place(a.getBoundingClientRect(), el, side, align, sideOffset, alignOffset);
    };
    position();
    const intent = opening ? (take.current() ?? (level === 0 && !firstRun ? "content" : null)) : null;
    if (intent) {
      const list = menuItems(el);
      (intent === "first" ? list[0] : intent === "last" ? list[list.length - 1] : el)?.focus({ preventScroll: true });
    }
    window.addEventListener("scroll", position, { capture: true, passive: true });
    window.addEventListener("resize", position);
    return () => {
      window.removeEventListener("scroll", position, { capture: true });
      window.removeEventListener("resize", position);
    };
  }, [open, side, align, sideOffset, alignOffset, anchorId, level]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(e);
    const menu = e.currentTarget;
    if (e.defaultPrevented || (e.target as HTMLElement).closest('[role="menu"]') !== menu) return;
    const list = menuItems(menu);
    const i = list.indexOf(document.activeElement as HTMLElement);
    const n = list.length;
    const focus = (k: number) => list[((k % n) + n) % n]?.focus({ preventScroll: true });
    switch (e.key) {
      case "ArrowDown":
        focus(i < 0 ? 0 : i + 1);
        break;
      case "ArrowUp":
        focus(i < 0 ? n - 1 : i - 1);
        break;
      case "Home":
      case "PageUp":
        focus(0);
        break;
      case "End":
      case "PageDown":
        focus(n - 1);
        break;
      case "Escape":
        onEscape();
        break;
      case "ArrowLeft":
        if (!onArrowLeft) return;
        onArrowLeft();
        break;
      case "Tab":
        root.closeAll();
        break;
      default: {
        // Typeahead: jump to the next item whose label starts with what was typed.
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
        const t = typeahead.current;
        clearTimeout(t.timer);
        t.text += e.key.toLowerCase();
        t.timer = window.setTimeout(() => (t.text = ""), 500);
        const start = t.text.length === 1 ? i + 1 : Math.max(i, 0);
        const hit = [...list.slice(start), ...list.slice(0, start)].find((el) =>
          (el.dataset.text ?? el.textContent ?? "").trim().toLowerCase().startsWith(t.text),
        );
        hit?.focus({ preventScroll: true });
      }
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <MenuContext value={{ level, highlighted, setHighlighted, layoutId, menuRef: ref }}>
      <div
        {...props}
        ref={ref}
        popover="auto"
        role="menu"
        aria-orientation="vertical"
        tabIndex={-1}
        data-side={side}
        onKeyDown={onKey}
        onPointerLeave={(e) => {
          props.onPointerLeave?.(e);
          // Clear the highlight when the pointer leaves (unless a submenu owns it now).
          if (e.pointerType !== "touch" && ref.current?.contains(document.activeElement) && document.activeElement !== ref.current) {
            if (!root.openPath[level]) ref.current.focus({ preventScroll: true });
          }
        }}
        className={cn(
          "ui-menu z-50 min-w-56 rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-xl shadow-black/20 outline-none!",
          className,
        )}
      >
        <style href="ui-dropdown-menu" precedence="default">
          {css}
        </style>
        {children}
      </div>
    </MenuContext>
  );
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
}

export function DropdownMenuContent({ side = "bottom", align = "start", sideOffset = 6, alignOffset = 0, ...props }: DropdownMenuContentProps) {
  const root = useRoot();
  return (
    <MenuSurface
      {...props}
      id={root.ids.content}
      aria-labelledby={root.ids.trigger}
      open={root.open}
      level={0}
      anchorId={root.ids.trigger}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      onDismiss={() => root.setOpen(false)}
      onEscape={root.closeAll}
    />
  );
}

interface ItemBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  disabled?: boolean;
  closeOnSelect: boolean;
  onActivate?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Leading slot (icon or check indicator). */
  lead?: ReactNode;
  /** Trailing slot (shortcut or chevron). */
  trail?: ReactNode;
  destructive?: boolean;
  textValue?: string;
}

function ItemBase({
  role,
  disabled = false,
  closeOnSelect,
  onActivate,
  lead,
  trail,
  destructive = false,
  textValue,
  className,
  children,
  onFocus,
  onBlur,
  onPointerMove,
  onKeyDown,
  onClick,
  id: idProp,
  ...props
}: ItemBaseProps) {
  const root = useRoot();
  const menu = useMenu();
  const reduce = useReducedMotion();
  const auto = useId();
  const id = idProp ?? auto;
  const active = menu.highlighted === id;

  return (
    <div
      {...props}
      id={id}
      role={role}
      tabIndex={-1}
      data-menu-item=""
      data-text={textValue}
      data-highlighted={active || undefined}
      aria-disabled={disabled || undefined}
      onFocus={(e) => {
        onFocus?.(e);
        menu.setHighlighted(id);
        // Focusing a sibling closes any submenu opened from this level.
        root.setOpenPath((p) => (p.length > menu.level && p[menu.level] !== id ? p.slice(0, menu.level) : p));
      }}
      onBlur={(e) => {
        onBlur?.(e);
        menu.setHighlighted((h) => (h === id ? null : h));
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        if (e.pointerType === "touch" || disabled || document.activeElement === e.currentTarget) return;
        e.currentTarget.focus({ preventScroll: true });
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
      onClick={(e) => {
        onClick?.(e);
        if (disabled || e.defaultPrevented) return;
        onActivate?.(e);
        if (!e.defaultPrevented && closeOnSelect) root.closeAll();
      }}
      className={cn(
        "relative flex h-8 cursor-default items-center gap-2 rounded-md px-2 outline-none! select-none", // the gliding highlight is the focus indicator
        "aria-disabled:pointer-events-none aria-disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
        destructive ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {active && (
        <motion.span
          aria-hidden
          layoutId={menu.layoutId}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 700, damping: 45 }}
          className={cn("absolute inset-0 rounded-md", destructive ? "bg-destructive/12" : "bg-accent")}
        />
      )}
      {lead !== undefined && (
        <span aria-hidden className={cn("relative grid size-4 place-items-center", !destructive && "text-muted-foreground", active && !destructive && "text-accent-foreground")}>
          {lead}
        </span>
      )}
      <span className={cn("relative flex-1 truncate", active && !destructive && "text-accent-foreground")}>{children}</span>
      {trail !== undefined && <span className="relative ml-4 flex items-center text-xs tracking-widest text-muted-foreground">{trail}</span>}
    </div>
  );
}

export interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Called on click / Enter / Space. Call e.preventDefault() to keep the menu open. */
  onSelect?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  /** Keyboard shortcut hint shown on the right, e.g. "⌘S". */
  shortcut?: string;
  variant?: "default" | "destructive";
  /** Label used for typeahead when children are not plain text. */
  textValue?: string;
}

export function DropdownMenuItem({ onSelect, icon, shortcut, variant = "default", ...props }: DropdownMenuItemProps) {
  return (
    <ItemBase
      {...props}
      role="menuitem"
      closeOnSelect
      onActivate={onSelect}
      lead={icon}
      trail={shortcut ? <kbd className="font-sans">{shortcut}</kbd> : undefined}
      destructive={variant === "destructive"}
    />
  );
}

export interface DropdownMenuCheckboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  shortcut?: string;
  /** Close the menu after toggling. */
  closeOnSelect?: boolean;
  textValue?: string;
}

export function DropdownMenuCheckboxItem({ checked = false, onCheckedChange, shortcut, closeOnSelect = false, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <ItemBase
      {...props}
      role="menuitemcheckbox"
      aria-checked={checked}
      closeOnSelect={closeOnSelect}
      onActivate={() => onCheckedChange?.(!checked)}
      lead={
        <Check
          strokeWidth={2.75}
          className={cn(
            "text-foreground transition-[scale,opacity] duration-200 ease-[cubic-bezier(.3,1.7,.5,1)] motion-reduce:transition-none",
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      }
      trail={shortcut ? <kbd className="font-sans">{shortcut}</kbd> : undefined}
    />
  );
}

export interface DropdownMenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function DropdownMenuRadioGroup({ value, onValueChange, ...props }: DropdownMenuRadioGroupProps) {
  return (
    <RadioContext value={{ value, onValueChange }}>
      <div role="group" {...props} />
    </RadioContext>
  );
}

export interface DropdownMenuRadioItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  textValue?: string;
}

export function DropdownMenuRadioItem({ value, closeOnSelect = false, ...props }: DropdownMenuRadioItemProps) {
  const radio = useContext(RadioContext);
  const checked = radio?.value === value;
  return (
    <ItemBase
      {...props}
      role="menuitemradio"
      aria-checked={checked}
      closeOnSelect={closeOnSelect}
      onActivate={() => radio?.onValueChange?.(value)}
      lead={
        <span
          className={cn(
            "size-2 rounded-full bg-foreground transition-[scale] duration-300 ease-[cubic-bezier(.3,1.8,.5,1)] motion-reduce:transition-none",
            checked ? "scale-100" : "scale-0",
          )}
        />
      }
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="presentation" {...props} className={cn("px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground", className)} />;
}

export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" {...props} className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export function DropdownMenuSub({ children }: { children?: ReactNode }) {
  const root = useRoot();
  const menu = useMenu();
  const id = useId();
  const open = root.open && root.openPath[menu.level] === id;
  return <SubContext value={{ id, level: menu.level, open, contentId: `${id}-sub` }}>{children}</SubContext>;
}

function useSub() {
  const ctx = useContext(SubContext);
  if (!ctx) throw new Error("Submenu parts must be rendered inside <DropdownMenuSub>.");
  return ctx;
}

export interface DropdownMenuSubTriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  icon?: ReactNode;
  disabled?: boolean;
  textValue?: string;
}

export function DropdownMenuSubTrigger({ icon, className, onKeyDown, onPointerMove, ...props }: DropdownMenuSubTriggerProps) {
  const root = useRoot();
  const sub = useSub();
  const hoverTimer = useRef(0);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const openSub = (focus: FocusIntent) => {
    root.setPendingFocus(focus);
    root.setOpenPath((p) => [...p.slice(0, sub.level), sub.id]);
  };
  return (
      <ItemBase
        {...props}
        id={sub.id}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub.open}
        aria-controls={sub.contentId}
        closeOnSelect={false}
        onActivate={() => openSub("first")}
        lead={icon}
        trail={
          <ChevronRight
            className={cn("transition-transform duration-200 motion-reduce:transition-none", sub.open && "translate-x-0.5 text-foreground")}
          />
        }
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation();
            openSub("first");
          }
        }}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          if (e.pointerType === "touch" || sub.open) return;
          clearTimeout(hoverTimer.current);
          hoverTimer.current = window.setTimeout(() => openSub(null), 120);
        }}
        onPointerLeave={() => clearTimeout(hoverTimer.current)}
        className={cn(sub.open && "bg-accent/60", className)}
      />
  );
}

export interface DropdownMenuSubContentProps extends HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  alignOffset?: number;
}

export function DropdownMenuSubContent({ sideOffset = 6, alignOffset = -5, ...props }: DropdownMenuSubContentProps) {
  const root = useRoot();
  const sub = useSub();
  const back = () => {
    root.setOpenPath((p) => p.slice(0, sub.level));
    document.getElementById(sub.id)?.focus({ preventScroll: true });
  };
  return (
    <MenuSurface
      {...props}
      id={sub.contentId}
      aria-labelledby={sub.id}
      open={sub.open}
      level={sub.level + 1}
      anchorId={sub.id}
      side="right"
      align="start"
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      onDismiss={() => root.setOpenPath((p) => (p[sub.level] === sub.id ? p.slice(0, sub.level) : p))}
      onEscape={back}
      onArrowLeft={back}
    />
  );
}
