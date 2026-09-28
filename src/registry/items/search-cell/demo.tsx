"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Code2, CreditCard, FolderKanban, Keyboard, LayoutGrid, Moon, Plus, Rocket, Settings, UserPlus, Users } from "lucide-react";
import { SearchCell, type SearchItem } from "./search-cell";

const items: SearchItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Overview, usage and activity", group: "Pages", icon: <LayoutGrid />, shortcut: ["G", "D"] },
  { id: "projects", label: "Projects", description: "All 12 projects in Acme", group: "Pages", icon: <FolderKanban />, shortcut: ["G", "P"] },
  { id: "team", label: "Team members", description: "Roles, invites and access", group: "Pages", icon: <Users />, keywords: ["people"] },
  { id: "billing", label: "Billing", description: "Plan, invoices and payment method", group: "Pages", icon: <CreditCard />, keywords: ["invoice", "card"] },
  { id: "settings", label: "Settings", description: "Workspace preferences", group: "Pages", icon: <Settings />, shortcut: ["⌘", ","] },
  { id: "new", label: "Create new project", description: "Start from a template or a repo", group: "Actions", icon: <Plus />, shortcut: ["⌘", "N"] },
  { id: "invite", label: "Invite teammate", description: "Send an email invite", group: "Actions", icon: <UserPlus /> },
  { id: "deploy", label: "Deploy to production", description: "Promote the latest preview", group: "Actions", icon: <Rocket />, keywords: ["ship", "release"] },
  { id: "theme", label: "Toggle dark mode", group: "Actions", icon: <Moon />, keywords: ["theme", "light"] },
  { id: "start", label: "Getting started", description: "Install and ship in 5 minutes", group: "Docs", icon: <BookOpen /> },
  { id: "api", label: "API reference", description: "REST and SDK endpoints", group: "Docs", icon: <Code2 /> },
  { id: "keys", label: "Keyboard shortcuts", description: "Every shortcut in one place", group: "Docs", icon: <Keyboard /> },
];

export default function Demo(p: Record<string, unknown>) {
  const [picked, setPicked] = useState<SearchItem | null>(null);
  return (
    <div className="flex h-[30rem] w-full flex-col items-center px-4 pt-6">
      <SearchCell items={items} defaultOpen onSelect={setPicked} {...p} />
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2" aria-live="polite">
        <AnimatePresence>
          {picked && (
            <motion.div
              key={picked.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-lg"
            >
              Opened <span className="font-medium text-foreground">{picked.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
