"use client";

import { Settings2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60";

export default function Demo(p: Record<string, unknown>) {
  // Rendered open and contained so the preview stage shows it; users get a true modal by default.
  return (
    <Dialog {...p} defaultOpen position="absolute">
      <DialogTrigger>
        <Settings2 className="size-4" /> Workspace settings
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>Update how your workspace appears to teammates.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="grid gap-1.5 text-sm font-medium">
            Name
            <input className={field} defaultValue="Acme Design" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            URL
            <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring/60">
              <span className="pl-3 text-sm text-muted-foreground">acme.app/</span>
              <input className="h-10 w-full bg-transparent pr-3 text-sm outline-none" defaultValue="design" />
            </div>
          </label>
        </form>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose className="border-transparent bg-primary text-primary-foreground hover:bg-primary/90">Save changes</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
