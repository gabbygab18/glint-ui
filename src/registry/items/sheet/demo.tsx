"use client";

import { PanelRight } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/60";

export default function Demo(p: Record<string, unknown>) {
  const { side, ...rest } = p as { side?: "top" | "right" | "bottom" | "left" };
  // Rendered open and contained so the preview stage shows it; users get a true modal by default.
  return (
    <Sheet key={String(side)} {...rest} defaultOpen position="absolute">
      <SheetTrigger>
        <PanelRight className="size-4" /> Edit profile
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile. Save when you are done.</SheetDescription>
        </SheetHeader>
        <label className="grid gap-1.5 text-sm font-medium">
          Name
          <input className={field} defaultValue="Maya Chen" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Username
          <input className={field} defaultValue="@maya" />
        </label>
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
          <SheetClose className="border-transparent bg-primary text-primary-foreground hover:bg-primary/90">Save changes</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
