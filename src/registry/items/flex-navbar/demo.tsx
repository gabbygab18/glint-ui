"use client";

import { Bookmark, Compass, House, MessageCircle, User } from "lucide-react";
import { FlexNavbar } from "./flex-navbar";

const items = [
  { label: "Home", icon: <House />, color: "#a78bfa" },
  { label: "Explore", icon: <Compass />, color: "#22d3ee" },
  { label: "Saved", icon: <Bookmark />, color: "#fbbf24" },
  { label: "Messages", icon: <MessageCircle />, color: "#34d399" },
  { label: "Profile", icon: <User />, color: "#f472b6" },
];

export default function Demo(p: Record<string, unknown>) {
  return <FlexNavbar items={items} {...p} />;
}
