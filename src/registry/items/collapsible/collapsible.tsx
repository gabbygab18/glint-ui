"use client";

import { createContext, useContext, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Ctx = { open: boolean; toggle: () => void; disabled: boolean; contentId: string };
const CollapsibleContext = createContext<Ctx | null>(null);

function useCollapsible() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible parts must be rendered inside <Collapsible>.");
  return ctx;
}

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  ...props
}: CollapsibleProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const contentId = useId();
  const toggle = () => {
    if (openProp === undefined) setInner(!open);
    onOpenChange?.(!open);
  };
  return (
    <CollapsibleContext value={{ open, toggle, disabled, contentId }}>
      <div {...props} data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </CollapsibleContext>
  );
}

export function CollapsibleTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, toggle, disabled, contentId } = useCollapsible();
  return (
    <button
      type="button"
      {...props}
      aria-expanded={open}
      aria-controls={contentId}
      disabled={disabled}
      data-state={open ? "open" : "closed"}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggle();
      }}
      className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50", className)}
    />
  );
}

export function CollapsibleContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, contentId } = useCollapsible();
  return (
    // grid-template-rows 0fr -> 1fr animates to the content's natural height without measuring.
    <div
      {...props}
      id={contentId}
      inert={!open}
      data-state={open ? "open" : "closed"}
      className="grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "transition-[opacity,translate,filter] duration-350 ease-out motion-reduce:transition-none",
            open ? "translate-y-0 opacity-100 blur-0" : "-translate-y-2 opacity-0 blur-[2px]",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
