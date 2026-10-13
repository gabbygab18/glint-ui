"use client";

import { BarChart3, Cloud, FileText, Heart, NotebookPen, Sparkles } from "lucide-react";
import { FrostTiles } from "./frost-tiles";

const items = [
  { icon: <FileText />, label: "Files", color: "#3b82f6" },
  { icon: <NotebookPen />, label: "Notes", color: "#a855f7" },
  { icon: <Heart />, label: "Health", color: "#f43f5e" },
  { icon: <Cloud />, label: "Weather", color: "#6366f1" },
  { icon: <Sparkles />, label: "Magic", color: "#f59e0b" },
  { icon: <BarChart3 />, label: "Stats", color: "#10b981" },
];

export default function Demo(p: Record<string, unknown>) {
  return <FrostTiles items={items} {...p} />;
}
