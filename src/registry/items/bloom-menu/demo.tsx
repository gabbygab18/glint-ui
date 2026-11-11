"use client";

import { Copy, FilePlus2, FolderPlus, GitBranch, MoreHorizontal, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { BloomMenu } from "./bloom-menu";

export default function Demo(p: Record<string, unknown>) {
  const [last, setLast] = useState("Pick an action");
  const pick = (what: string) => () => setLast(what);

  return (
    <div className="flex h-80 w-[26rem] max-w-full flex-col rounded-2xl border border-border bg-background p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <BloomMenu
          {...p}
          label="New"
          icon={<Plus className="size-4" />}
          items={[
            { label: "New file", icon: <FilePlus2 />, hint: "N", onSelect: pick("New file") },
            { label: "New folder", icon: <FolderPlus />, hint: "⇧N", onSelect: pick("New folder") },
            { label: "Upload", icon: <Upload />, onSelect: pick("Upload") },
            { label: "Import from GitHub", icon: <GitBranch />, onSelect: pick("Import from GitHub") },
          ]}
        />
        <BloomMenu
          {...p}
          align="right"
          label="More"
          icon={<MoreHorizontal className="size-4" />}
          items={[
            { label: "Rename", icon: <Pencil />, onSelect: pick("Rename") },
            { label: "Duplicate", icon: <Copy />, onSelect: pick("Duplicate") },
            { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: pick("Delete") },
          ]}
        />
      </div>
      <p className="mt-auto text-center text-xs text-muted-foreground" aria-live="polite">
        {last}
      </p>
    </div>
  );
}
